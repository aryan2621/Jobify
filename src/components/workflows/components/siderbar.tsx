'use client';

import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useDnD } from '@/context/workflow';
import { WorkflowNode } from '@/model/workflow';
import { useToast } from '@/components/ui/use-toast';
import { Edge, useReactFlow } from '@xyflow/react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    BellRing,
    Download,
    FileText,
    GitBranch,
    Info,
    LayoutGrid,
    MessageSquare,
    Play,
    Save,
    Settings,
    Upload,
    Video,
    X,
    Zap,
    Clock,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a utils file with cn function
import { TaskType, NodeType } from '@/model/workflow';
import ky from 'ky';

// Template interface
interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    nodes: WorkflowNode[];
    edges: Edge[];
}

// Example workflow templates
const workflowTemplates: WorkflowTemplate[] = [
    {
        id: 'onboarding',
        name: 'Employee Onboarding',
        description: 'Standard workflow for onboarding new employees',
        nodes: [], // You'd pre-define nodes here
        edges: [], // You'd pre-define edges here
    },
    {
        id: 'application',
        name: 'Job Application',
        description: 'Workflow for handling new job applications',
        nodes: [],
        edges: [],
    },
    {
        id: 'interview',
        name: 'Interview Process',
        description: 'Multi-stage interview workflow',
        nodes: [],
        edges: [],
    },
];

interface SidebarProps {
    nodes: WorkflowNode[];
    edges: Edge[];
}
export default function Sidebar({ nodes, edges }: SidebarProps) {
    const workflowId = crypto.randomUUID();
    const [, setType] = useDnD();
    const { toast } = useToast();
    const { setNodes, setEdges } = useReactFlow();

    // State for sidebar features
    const [activeTab, setActiveTab] = useState<string>('nodes');
    const [isValidationOpen, setIsValidationOpen] = useState(false);
    const [validationResults, setValidationResults] = useState<{
        valid: boolean;
        messages: { type: 'error' | 'warning' | 'success'; message: string }[];
    }>({ valid: true, messages: [] });
    const [autoLayout, setAutoLayout] = useState<boolean>(false);
    const [workflowName, setWorkflowName] = useState<string>('New Workflow');
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Drag and drop handlers
    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: NodeType | TaskType) => {
        setType(nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragEnd = () => {
        setType(null);
    };

    // Workflow save/export function
    const saveWorkflow = async () => {
        try {
            setIsSaving(true);
            const workflowData = {
                id: workflowId,
                name: workflowName,
                description: '', // You could add a description field to the UI
                nodes,
                edges,
                status: 'draft',
            };

            await ky.post('/api/create-workflow', {
                json: workflowData,
            });
            toast({
                title: 'Workflow Saved',
                description: 'Your workflow has been saved to the database.',
            });
        } catch (error) {
            console.error('Error saving workflow:', error);
            toast({
                title: 'Save Failed',
                description: error instanceof Error ? error.message : 'There was an error saving your workflow.',
                variant: 'destructive',
            });
        }
    };

    const exportWorkflow = () => {
        const workflowData = {
            id: workflowId,
            name: workflowName,
            description: '',
            nodes,
            edges,
        };
        const dataStr = JSON.stringify(workflowData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `${workflowName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    // Workflow import function
    const importWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsedWorkflow = JSON.parse(content);

                if (!parsedWorkflow.nodes || !parsedWorkflow.edges) {
                    throw new Error('Invalid workflow file format');
                }

                setNodes(parsedWorkflow.nodes);
                setEdges(parsedWorkflow.edges);

                if (parsedWorkflow.name) {
                    setWorkflowName(parsedWorkflow.name);
                }

                toast({
                    title: 'Workflow Imported',
                    description: 'The workflow has been successfully imported.',
                });
            } catch (error) {
                console.error('Error importing workflow:', error);
                toast({
                    title: 'Import Failed',
                    description: 'There was an error importing the workflow.',
                    variant: 'destructive',
                });
            }
        };
        reader.readAsText(file);
        // Reset the input
        event.target.value = '';
    };

    // Load template function
    const loadTemplate = (template: WorkflowTemplate) => {
        setNodes(template.nodes);
        setEdges(template.edges);
        setWorkflowName(template.name);

        toast({
            title: 'Template Loaded',
            description: `${template.name} template has been loaded.`,
        });
    };

    // Enhanced validation with detailed feedback
    const validateWorkflow = () => {
        const validationMessages: { type: 'error' | 'warning' | 'success'; message: string }[] = [];
        let isValid = true;

        // Check for start and end nodes
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

        // Check connectivity
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

        // Find isolated nodes
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

        // Find nodes without incoming connections (except START)
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

        // Find nodes without outgoing connections (except END)
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

        // Check that each node has at most one incoming and one outgoing edge
        const nodesWithMultipleIncoming = nodes.filter((node) => inDegree[node.id] > 1);

        const nodesWithMultipleOutgoing = nodes.filter((node) => outDegree[node.id] > 1);

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
                message: `Found ${nodesWithMultipleOutgoing.length} node(s) with multiple outgoing connections. Each node should have at most one outgoing edge.`,
            });
            isValid = false;
        }

        // Check that Start node has no incoming edges
        if (startNodes.length === 1 && inDegree[startNodes[0].id] !== 0) {
            validationMessages.push({
                type: 'error',
                message: 'Start node should not have any incoming edges',
            });
            isValid = false;
        }

        // Check that End node has no outgoing edges
        if (endNodes.length === 1 && outDegree[endNodes[0].id] !== 0) {
            validationMessages.push({
                type: 'error',
                message: 'End node should not have any outgoing edges',
            });
            isValid = false;
        }

        // Check for task configuration
        const taskNodes = nodes.filter((node) => node.type === NodeType.TASK);
        const unconfiguredNodes = taskNodes.filter((node) => {
            // Check based on task type
            if (node.taskType === TaskType.NOTIFICATION) {
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
                return !waitNode.duration || !waitNode.unit;
            } else if (node.taskType === TaskType.CONDITIONAL) {
                const conditionalNode = node as any;
                return !conditionalNode.condition;
            }
            return false;
        });

        if (unconfiguredNodes.length > 0) {
            validationMessages.push({
                type: 'warning',
                message: `Found ${unconfiguredNodes.length} node(s) with incomplete configuration.`,
            });
        }

        // Results and UI feedback
        setValidationResults({
            valid: isValid,
            messages:
                validationMessages.length > 0
                    ? validationMessages
                    : [{ type: 'success', message: 'Workflow validation passed. All nodes are properly connected.' }],
        });

        setIsValidationOpen(true);
        return isValid;
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
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className='flex-1 flex flex-col'>
                <div className='border-b'>
                    <TabsList className='w-full rounded-none'>
                        <TabsTrigger value='nodes' className='flex-1'>
                            <LayoutGrid className='h-4 w-4 mr-2' />
                            Nodes
                        </TabsTrigger>
                        <TabsTrigger value='templates' className='flex-1'>
                            <Zap className='h-4 w-4 mr-2' />
                            Templates
                        </TabsTrigger>
                        <TabsTrigger value='settings' className='flex-1'>
                            <Settings className='h-4 w-4 mr-2' />
                            Settings
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value='nodes' className='flex-1 p-4 overflow-y-auto space-y-4'>
                    <h2 className='font-medium text-sm mb-2'>Add Nodes</h2>

                    <div className='space-y-2'>
                        <div
                            className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-start cursor-grab')}
                            draggable
                            onDragStart={(event) => onDragStart(event, TaskType.NOTIFICATION)}
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
                            onDragStart={(event) => onDragStart(event, TaskType.CONDITIONAL)}
                            onDragEnd={onDragEnd}
                        >
                            <GitBranch className='h-4 w-4 mr-2 text-purple-500' />
                            <span>Conditional Task</span>
                        </div>
                        <div
                            className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-start cursor-grab')}
                            draggable
                            onDragStart={(event) => onDragStart(event, TaskType.WAIT)}
                            onDragEnd={onDragEnd}
                        >
                            <Clock className='h-4 w-4 mr-2 text-purple-500' />
                            <span>Wait Task</span>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value='templates' className='flex-1 p-4 overflow-y-auto space-y-4'>
                    <h2 className='font-medium text-sm mb-2'>Workflow Templates</h2>

                    <div className='space-y-2'>
                        {workflowTemplates.map((template) => (
                            <div
                                key={template.id}
                                className='border rounded-md p-3 hover:bg-accent cursor-pointer transition-colors'
                                onClick={() => loadTemplate(template)}
                            >
                                <div className='flex items-center justify-between mb-1'>
                                    <h3 className='font-medium'>{template.name}</h3>
                                    <Zap className='h-4 w-4 text-primary' />
                                </div>
                                <p className='text-xs text-muted-foreground'>{template.description}</p>
                            </div>
                        ))}
                    </div>

                    <Separator />

                    <div className='space-y-2'>
                        <h3 className='text-sm font-medium'>Save/Load Workflow</h3>

                        <Button variant='outline' className='w-full justify-start' onClick={saveWorkflow} disabled={isSaving}>
                            {isSaving ? <Loader2 className='h-4 w-4 mr-2 animate-spin' /> : <Save className='h-4 w-4 mr-2' />}
                            <span>Save Workflow</span>
                        </Button>
                        <Button variant='outline' className='w-full justify-start' onClick={exportWorkflow}>
                            <Download className='h-4 w-4 mr-2' />
                            <span>Export Workflow</span>
                        </Button>

                        <div className='relative'>
                            <Button variant='outline' className='w-full justify-start'>
                                <Upload className='h-4 w-4 mr-2' />
                                <span>Import Workflow</span>
                            </Button>
                            <input type='file' accept='.json' className='absolute inset-0 opacity-0 cursor-pointer' onChange={importWorkflow} />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value='settings' className='flex-1 p-4 overflow-y-auto space-y-4'>
                    <h2 className='font-medium text-sm mb-2'>Workflow Settings</h2>

                    <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                            <div className='space-y-0.5'>
                                <Label htmlFor='auto-layout'>Auto Layout</Label>
                                <p className='text-xs text-muted-foreground'>Automatically arrange nodes</p>
                            </div>
                            <Switch id='auto-layout' checked={autoLayout} onCheckedChange={setAutoLayout} />
                        </div>

                        <Separator />

                        <div className='space-y-2'>
                            <h3 className='text-sm font-medium'>Workflow Stats</h3>
                            <div className='bg-muted rounded-md p-3 space-y-2 text-sm'>
                                <div className='flex justify-between'>
                                    <span className='text-muted-foreground'>Total Nodes:</span>
                                    <span className='font-medium'>{nodes.length}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-muted-foreground'>Total Connections:</span>
                                    <span className='font-medium'>{edges.length}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-muted-foreground'>Task Nodes:</span>
                                    <span className='font-medium'>{nodes.filter((node) => node.type === NodeType.TASK).length}</span>
                                </div>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <h3 className='text-sm font-medium'>Display Options</h3>
                            <div className='space-y-3'>
                                <div className='flex items-center justify-between'>
                                    <div className='space-y-0.5'>
                                        <Label htmlFor='snap-grid'>Snap to Grid</Label>
                                        <p className='text-xs text-muted-foreground'>Align nodes to a grid when moving</p>
                                    </div>
                                    <Switch id='snap-grid' checked={true} onCheckedChange={() => {}} />
                                </div>

                                <div className='flex items-center justify-between'>
                                    <div className='space-y-0.5'>
                                        <Label htmlFor='show-minimap'>Show Minimap</Label>
                                        <p className='text-xs text-muted-foreground'>Display navigation minimap</p>
                                    </div>
                                    <Switch id='show-minimap' checked={true} onCheckedChange={() => {}} />
                                </div>

                                <div className='flex items-center justify-between'>
                                    <div className='space-y-0.5'>
                                        <Label htmlFor='dark-mode'>Dark Mode</Label>
                                        <p className='text-xs text-muted-foreground'>Switch to dark theme</p>
                                    </div>
                                    <Switch id='dark-mode' checked={false} onCheckedChange={() => {}} />
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
            <div className='p-4 border-t'>
                <Button className='w-full' onClick={validateWorkflow}>
                    Validate Workflow
                </Button>
            </div>

            {/* Validation Dialog */}
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
