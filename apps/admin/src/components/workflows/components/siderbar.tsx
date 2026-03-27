'use client';

import { useState } from 'react';
import { Button, buttonVariants } from '@jobify/ui/button';
import { useDnD } from '@/context/workflow';
import { WorkflowNode } from '@jobify/domain/workflow';
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
} from '@jobify/ui/alert-dialog';
import { Input } from '@jobify/ui/input';
import { BellRing, FileText, GitBranch, Flag, Info, Video, Clock, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskType, NodeType } from '@jobify/domain/workflow';
import { toast } from '@jobify/ui/use-toast';
import { HTTPError } from 'ky';

interface SidebarProps {
    nodes: WorkflowNode[];
    edges: Edge[];
    workflowName: string;
    onWorkflowNameChange: (name: string) => void;
    onPersistActive: () => Promise<void>;
    isSaving: boolean;
    onSavingChange: (saving: boolean) => void;
}
export default function Sidebar({
    nodes,
    edges,
    workflowName,
    onWorkflowNameChange,
    onPersistActive,
    isSaving,
    onSavingChange,
}: SidebarProps) {
    const [, setType] = useDnD();

    const [isValidationOpen, setIsValidationOpen] = useState(false);
    const [validationResults, setValidationResults] = useState<{
        valid: boolean;
        messages: { type: 'error' | 'warning' | 'success'; message: string }[];
    }>({ valid: true, messages: [] });

    
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

        for (const sn of startNodes) {
            if (inDegree[sn.id] !== 0) {
                validationMessages.push({
                    type: 'error',
                    message: 'Start node(s) must not have incoming edges',
                });
                isValid = false;
                break;
            }
        }

        for (const en of endNodes) {
            if (outDegree[en.id] !== 0) {
                validationMessages.push({
                    type: 'error',
                    message: 'End node(s) must not have outgoing edges',
                });
                isValid = false;
                break;
            }
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
        onSavingChange(true);
        try {
            await onPersistActive();
        } catch (err: unknown) {
            let description = 'Failed to save workflow';
            if (err instanceof HTTPError) {
                try {
                    const body = (await err.response.json()) as { message?: string };
                    if (body?.message) description = body.message;
                    else if (err.message) description = err.message;
                } catch {
                    if (err.message) description = err.message;
                }
            } else if (err instanceof Error) {
                description = err.message;
            }
            toast({
                title: 'Save failed',
                description,
                variant: 'destructive',
            });
        } finally {
            onSavingChange(false);
        }
    };

    return (
        <aside className='h-full flex flex-col bg-background border rounded-md w-[30%]'>
            <div className='p-4 border-b'>
                <Input
                    value={workflowName}
                    onChange={(e) => onWorkflowNameChange(e.target.value)}
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

                <div className='pt-4 border-t'>
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
                                Validate and publish
                            </>
                        )}
                    </Button>
                </div>
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
