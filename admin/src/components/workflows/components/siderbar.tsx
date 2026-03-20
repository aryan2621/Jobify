'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { useDnD } from '@/context/workflow';
import { WorkflowNode } from '@/model/workflow';
import { Edge } from '@xyflow/react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { BellRing, FileText, GitBranch, Flag, Info, Video, Clock, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskType, NodeType } from '@/model/workflow';
import { toast } from '@/components/ui/use-toast';
import ky from 'ky';
import { nanoid } from 'nanoid';

interface SidebarProps {
    nodes: WorkflowNode[];
    edges: Edge[];
    workflowId?: string;
}
export default function Sidebar({ nodes, edges, workflowId }: SidebarProps) {
    const [, setType] = useDnD();

    const router = useRouter();
    const [isValidationOpen, setIsValidationOpen] = useState(false);
    const [validationResults, setValidationResults] = useState<{
        valid: boolean;
        messages: { type: 'error' | 'warning' | 'success'; message: string }[];
    }>({ valid: true, messages: [] });
    const [workflowName, setWorkflowName] = useState<string>('New Workflow');
    const [isSaving, setIsSaving] = useState(false);

    
    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: NodeType | TaskType) => {
        setType(nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragEnd = () => {
        setType(null);
    };

    
    const getValidationResult = (): { valid: boolean; messages: { type: 'error' | 'warning' | 'success'; message: string }[] } => {
        const validationMessages: { type: 'error' | 'warning' | 'success'; message: string }[] = [];
        let isValid = true;

        
        const startNodes = nodes.filter((node) => node.type === NodeType.START);
        const endNodes = nodes.filter((node) => node.type === NodeType.END);

        if (startNodes.length === 0) {
            validationMessages.push({
                type: 'error',
                message: 'Workflow must have at least one Start node',
            });
            isValid = false;
        } else if (startNodes.length > 1) {
            validationMessages.push({
                type: 'error',
                message: `Found ${startNodes.length} Start nodes, but only one is allowed`,
            });
            isValid = false;
        }

        if (endNodes.length === 0) {
            validationMessages.push({
                type: 'error',
                message: 'Workflow must have at least one End node',
            });
            isValid = false;
        } else if (endNodes.length > 1) {
            validationMessages.push({
                type: 'warning',
                message: `Found ${endNodes.length} End nodes. Multiple end points are allowed but unusual.`,
            });
        }

        
        const inDegree: { [key: string]: number } = {};
        const outDegree: { [key: string]: number } = {};

        nodes.forEach((node) => {
            inDegree[node.id] = 0;
            outDegree[node.id] = 0;
        });

        edges.forEach((edge) => {
            inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
            outDegree[edge.source] = (outDegree[edge.source] || 0) + 1;
        });

        
        const isolatedNodes = nodes.filter((node) => {
            return inDegree[node.id] === 0 && outDegree[node.id] === 0 && node.type !== NodeType.START && node.type !== NodeType.END;
        });

        if (isolatedNodes.length > 0) {
            validationMessages.push({
                type: 'error',
                message: `Found ${isolatedNodes.length} isolated node(s). All nodes must be connected.`,
            });
            isValid = false;
        }

        
        const noIncomingNodes = nodes.filter((node) => {
            return inDegree[node.id] === 0 && node.type !== NodeType.START;
        });

        if (noIncomingNodes.length > 0) {
            validationMessages.push({
                type: 'error',
                message: `Found ${noIncomingNodes.length} node(s) without incoming connections.`,
            });
            isValid = false;
        }

        
        const noOutgoingNodes = nodes.filter((node) => {
            return outDegree[node.id] === 0 && node.type !== NodeType.END;
        });

        if (noOutgoingNodes.length > 0) {
            validationMessages.push({
                type: 'error',
                message: `Found ${noOutgoingNodes.length} node(s) without outgoing connections.`,
            });
            isValid = false;
        }

        
        const nodesWithMultipleIncoming = nodes.filter((node) => inDegree[node.id] > 1);

        const nodesWithMultipleOutgoing = nodes.filter((node) => {
            const out = outDegree[node.id];
            if (out > 1 && node.type === NodeType.TASK && (node as any).taskType === TaskType.CONDITION) return false; 
            return out > 1;
        });

        if (nodesWithMultipleIncoming.length > 0) {
            validationMessages.push({
                type: 'error',
                message: `Found ${nodesWithMultipleIncoming.length} node(s) with multiple incoming connections. Each node should have at most one incoming edge.`,
            });
            isValid = false;
        }

        if (nodesWithMultipleOutgoing.length > 0) {
            validationMessages.push({
                type: 'error',
                message: `Found ${nodesWithMultipleOutgoing.length} node(s) with multiple outgoing connections. Only Condition nodes may have multiple outgoing edges.`,
            });
            isValid = false;
        }

        
        if (startNodes.length === 1 && inDegree[startNodes[0].id] !== 0) {
            validationMessages.push({
                type: 'error',
                message: 'Start node should not have any incoming edges',
            });
            isValid = false;
        }

        
        if (endNodes.length === 1 && outDegree[endNodes[0].id] !== 0) {
            validationMessages.push({
                type: 'error',
                message: 'End node should not have any outgoing edges',
            });
            isValid = false;
        }

        
        const taskNodes = nodes.filter((node) => node.type === NodeType.TASK);
        const unconfiguredNodes = taskNodes.filter((node) => {
            
            if (node.taskType === TaskType.NOTIFY) {
                const notificationNode = node as any;
                const hasEmail = notificationNode.data?.emailConfig?.to;
                const hasMessage = notificationNode.data?.messageConfig?.phoneNumber;
                return !hasEmail && !hasMessage;
            } else if (node.taskType === TaskType.ASSIGNMENT) {
                const assignmentNode = node as any;
                return !assignmentNode.deadline || !assignmentNode.description;
            } else if (node.taskType === TaskType.INTERVIEW) {
                const interviewNode = node as any;
                return !interviewNode.time || !interviewNode.link;
            } else if (node.taskType === TaskType.WAIT) {
                const waitNode = node as any;
                const hasRelative = waitNode.duration != null && waitNode.duration > 0 && waitNode.unit;
                const hasExactDate = waitNode.exactDateTime;
                return !hasRelative && !hasExactDate;
            } else if (node.taskType === TaskType.CONDITION) {
                return false; 
            } else if (node.taskType === TaskType.UPDATE_STATUS) {
                const updateNode = node as any;
                return !updateNode.stage;
            }
            return false;
        });

        if (unconfiguredNodes.length > 0) {
            validationMessages.push({
                type: 'warning',
                message: `Found ${unconfiguredNodes.length} node(s) with incomplete configuration.`,
            });
        }

        return {
            valid: isValid,
            messages:
                validationMessages.length > 0
                    ? validationMessages
                    : [{ type: 'success', message: 'Workflow validation passed. All nodes are properly connected.' }],
        };
    };

    const handleSave = async () => {
        const result = getValidationResult();
        if (!result.valid) {
            setValidationResults(result);
            setIsValidationOpen(true);
            return;
        }
        setIsSaving(true);
        const payload = {
            name: workflowName.trim() || 'New Workflow',
            description: '',
            nodes,
            edges,
            status: 'draft' as const,
        };
        try {
            if (workflowId) {
                await ky.post('/api/update-workflow', {
                    json: { id: workflowId, ...payload },
                });
                toast({
                    title: 'Workflow updated',
                    description: 'Your workflow has been saved successfully.',
                });
            } else {
                const newWorkflowId = nanoid();
                await ky.post('/api/create-workflow', {
                    json: { id: newWorkflowId, ...payload },
                });
                toast({
                    title: 'Workflow saved',
                    description: 'Your workflow has been saved successfully.',
                });
                router.push('/workflows');
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save workflow';
            toast({
                title: 'Save failed',
                description: message,
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <aside className='h-full flex flex-col bg-background border rounded-md w-[30%]'>
            <div className='p-4 border-b'>
                <Input
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    className='font-medium text-base'
                    placeholder='Workflow Name'
                />
            </div>
            <div className='flex-1 p-4 overflow-y-auto space-y-4'>
                <h2 className='font-medium text-sm mb-2'>Add Nodes</h2>

                <div className='space-y-2'>
                    <div
                        className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-start cursor-grab')}
                        draggable
                        onDragStart={(event) => onDragStart(event, TaskType.NOTIFY)}
                        onDragEnd={onDragEnd}
                    >
                        <BellRing className='h-4 w-4 mr-2 text-blue-500' />
                        <span>Notification Task</span>
                    </div>

                    <div
                        className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-start cursor-grab')}
                        draggable
                        onDragStart={(event) => onDragStart(event, TaskType.ASSIGNMENT)}
                        onDragEnd={onDragEnd}
                    >
                        <FileText className='h-4 w-4 mr-2 text-amber-500' />
                        <span>Assignment Task</span>
                    </div>

                    <div
                        className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-start cursor-grab')}
                        draggable
                        onDragStart={(event) => onDragStart(event, TaskType.INTERVIEW)}
                        onDragEnd={onDragEnd}
                    >
                        <Video className='h-4 w-4 mr-2 text-purple-500' />
                        <span>Interview Task</span>
                    </div>
                    <div
                        className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-start cursor-grab')}
                        draggable
                        onDragStart={(event) => onDragStart(event, TaskType.WAIT)}
                        onDragEnd={onDragEnd}
                    >
                        <Clock className='h-4 w-4 mr-2 text-cyan-500' />
                        <span>Wait Task</span>
                    </div>
                    <div
                        className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-start cursor-grab')}
                        draggable
                        onDragStart={(event) => onDragStart(event, TaskType.CONDITION)}
                        onDragEnd={onDragEnd}
                    >
                        <GitBranch className='h-4 w-4 mr-2 text-teal-500' />
                        <span>Condition</span>
                    </div>
                    <div
                        className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-start cursor-grab')}
                        draggable
                        onDragStart={(event) => onDragStart(event, TaskType.UPDATE_STATUS)}
                        onDragEnd={onDragEnd}
                    >
                        <Flag className='h-4 w-4 mr-2 text-orange-500' />
                        <span>Update Status</span>
                    </div>
                </div>
            </div>
            <div className='p-4 border-t'>
                <Button
                    className='w-full'
                    variant='default'
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className='h-4 w-4 mr-2' />
                            Validate and Save
                        </>
                    )}
                </Button>
            </div>

            
            <AlertDialog open={isValidationOpen} onOpenChange={setIsValidationOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{validationResults.valid ? 'Workflow Validation Passed' : 'Workflow Validation Failed'}</AlertDialogTitle>
                        <AlertDialogDescription className='space-y-2'>
                            {validationResults.messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`
                    flex items-start p-2 rounded-md text-sm
                    ${
                        message.type === 'error'
                            ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                            : message.type === 'warning'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                              : 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                    }
                  `}
                                >
                                    <Info className='h-4 w-4 mr-2 mt-0.5 flex-shrink-0' />
                                    <span>{message.message}</span>
                                </div>
                            ))}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                        {!validationResults.valid && <AlertDialogAction>Fix Issues</AlertDialogAction>}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </aside>
    );
}
