import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ReactFlow,
    addEdge,
    useNodesState,
    useEdgesState,
    Background,
    BackgroundVariant,
    useReactFlow,
    Position,
    Edge,
    Panel,
    useKeyPress,
    ConnectionLineType,
} from '@xyflow/react';


import { AssignmentNode, ConditionNode, InterviewNode, NotificationNode, UpdateStatusNode, WaitNode, WorkflowNode } from '@jobify/domain/workflow';
import { useDnD } from '@/context/workflow';
import { CustomNode } from './customNode';
import { CustomEdge } from './customEdge';
import { NodeType, TaskType } from '@jobify/domain/workflow';


import NotificationNodeBuilderComponent from '../builder/notification';
import AssignmentNodeBuilderComponent from '../builder/assignment';
import InterviewNodeBuilderComponent from '../builder/interview';
import WaitNodeBuilderComponent from '../builder/wait';
import ConditionNodeBuilderComponent from '../builder/condition';
import UpdateStatusNodeBuilderComponent from '../builder/update-status';
import Sidebar from './siderbar';
import { nodeFactory } from '@/lib/utils/node-factory-utils';
import ky, { HTTPError } from 'ky';
import { nanoid } from 'nanoid';

import { Sheet, SheetContent } from '@jobify/ui/sheet';
import { Button } from '@jobify/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@jobify/ui/tooltip';
import { toast } from '@jobify/ui/use-toast';
import { Maximize, ZoomIn, ZoomOut, RotateCcw, Trash2, Undo2, Redo2, PanelLeft, Save } from 'lucide-react';
import { Loader2 } from 'lucide-react';


import '@xyflow/react/dist/style.css';
import { deserializeNode } from '@/lib/utils/workflow-utils';


type HistoryState = {
    nodes: WorkflowNode[];
    edges: Edge[];
};

type EditorProps = {
    workflowId?: string;
};

export const Editor = ({ workflowId }: EditorProps) => {
    const router = useRouter();
    const defaultTemplate = useMemo(() => ({
        nodes: [
            {
                id: 'start-1',
                type: NodeType.START,
                position: { x: 250, y: 50 },
                data: { label: 'Start' },
                sourcePosition: Position.Bottom,
            } as any,
            {
                id: 'end-1',
                type: NodeType.END,
                position: { x: 250, y: 300 },
                data: { label: 'End' },
                targetPosition: Position.Top,
            } as any,
        ],
        edges: [
           
        ],
    }), []);

    const [nodes, setNodes, onNodesChange] = useNodesState(defaultTemplate.nodes as any[]);
    const [edges, setEdges, onEdgesChange] = useEdgesState(defaultTemplate.edges as any[]);
    const { screenToFlowPosition, fitView, zoomIn, zoomOut } = useReactFlow();


    const [type] = useDnD();


    const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);


    const [history, setHistory] = useState<HistoryState[]>([{ nodes: defaultTemplate.nodes, edges: defaultTemplate.edges }]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const historyTimeoutRef = useRef<any>(null);


    const undoPressed = useKeyPress(['z']);
    const redoPressed = useKeyPress(['y']);
    const deletePressed = useKeyPress(['Delete', 'Backspace']);


    const [isModified, setIsModified] = useState(false);


    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [workflowName, setWorkflowName] = useState('New Workflow');
    const [isSaving, setIsSaving] = useState(false);

    const persistWorkflow = useCallback(
        async (status: 'draft' | 'active') => {
            const payload = {
                name: workflowName.trim() || 'New Workflow',
                description: '',
                nodes,
                edges,
                status,
            };
            if (workflowId) {
                await ky.post('/api/update-workflow', {
                    json: { id: workflowId, ...payload },
                });
                toast({
                    title: status === 'draft' ? 'Draft saved' : 'Workflow updated',
                    description:
                        status === 'draft'
                            ? 'You can continue editing or validate when ready to publish.'
                            : 'Your workflow has been saved successfully.',
                });
                return;
            }
            const newWorkflowId = nanoid();
            await ky.post('/api/create-workflow', {
                json: { id: newWorkflowId, ...payload },
            });
            toast({
                title: status === 'draft' ? 'Draft saved' : 'Workflow saved',
                description:
                    status === 'draft'
                        ? 'You can keep editing from here.'
                        : 'Your workflow has been saved successfully.',
            });
            if (status === 'draft') {
                router.replace(`/workflow/${newWorkflowId}`);
            } else {
                router.push('/workflows');
            }
        },
        [nodes, edges, workflowId, workflowName, router]
    );

    const handleSaveDraft = useCallback(async () => {
        setIsSaving(true);
        try {
            await persistWorkflow('draft');
        } catch (err: unknown) {
            let description = 'Failed to save draft';
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
            setIsSaving(false);
        }
    }, [persistWorkflow]);

    const persistActive = useCallback(() => persistWorkflow('active'), [persistWorkflow]);


    const nodeTypes = {
        [NodeType.START]: CustomNode,
        [NodeType.END]: CustomNode,
        [NodeType.TASK]: CustomNode,
        custom: CustomNode,
    };

    const edgeTypes = {
        default: CustomEdge,
        'custom-edge': CustomEdge,
    };


    const saveToHistory = useCallback(() => {

        if (historyTimeoutRef.current) {
            clearTimeout(historyTimeoutRef.current);
        }


        historyTimeoutRef.current = setTimeout(() => {
            setHistory((prev) => {

                const newHistory = prev.slice(0, historyIndex + 1);
                return [...newHistory, { nodes, edges }];
            });
            setHistoryIndex((prev) => prev + 1);
            setIsModified(true);
        }, 500);
    }, [nodes, edges, historyIndex]);


    useEffect(() => {
        if (nodes.length > 0 || edges.length > 0) {
            saveToHistory();
        }
    }, [nodes, edges, saveToHistory]);


    useEffect(() => {
        if (undoPressed) {
            handleUndo();
        }
    }, [undoPressed]);

    useEffect(() => {
        if (redoPressed) {
            handleRedo();
        }
    }, [redoPressed]);

    useEffect(() => {
        if (deletePressed) {
            handleDeleteSelected();
        }
    }, [deletePressed]);


    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isModified) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isModified]);


    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const prevState = history[newIndex];

            setNodes(prevState.nodes);
            setEdges(prevState.edges);
            setHistoryIndex(newIndex);
        }
    }, [history, historyIndex, setNodes, setEdges]);


    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const nextState = history[newIndex];

            setNodes(nextState.nodes);
            setEdges(nextState.edges);
            setHistoryIndex(newIndex);
        }
    }, [history, historyIndex, setNodes, setEdges]);


    const onConnect = useCallback(
        (connection: any) => {

            const edge = {
                ...connection,
                type: 'custom-edge',
                animated: true,
                style: { strokeWidth: 2 },
            };


            setEdges((eds) => addEdge(edge, eds));
        },
        [setEdges]
    );


    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);


    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            if (!type) return;


            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });


            const newNode = nodeFactory(type, { label: `${type.charAt(0).toUpperCase() + type.slice(1)}` }, position, Position.Bottom, Position.Top);


            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, type, setNodes]
    );


    const onNodeClick = useCallback((event: React.MouseEvent, node: WorkflowNode) => {
        const isStartOrEnd = node.type === NodeType.START || node.type === NodeType.END;
        if (isStartOrEnd) {
            return;
        }
        setSelectedNode(node);
        setSheetOpen(true);
    }, []);


    const onNodeSubmit = useCallback(
        (node: WorkflowNode) => {
            setNodes((nds) => nds.map((n) => (n.id === node.id ? node : n)));
            setSelectedNode(null);
            setSheetOpen(false);

            toast({
                title: 'Node Updated',
                description: 'Node configuration saved successfully',
            });
        },
        [setNodes]
    );


    const handleDeleteSelected = useCallback(() => {
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
    }, [setNodes, setEdges]);


    const handleClearAll = useCallback(() => {
        if (
            window.confirm(
                'Reset this workflow to the default recruitment template? All current nodes and edges will be replaced.'
            )
        ) {
            const fresh = {
                nodes: [
                    {
                        id: 'start-1',
                        type: NodeType.START,
                        position: { x: 250, y: 50 },
                        data: { label: 'Start' },
                        sourcePosition: Position.Bottom,
                    } as any,
                    {
                        id: 'end-1',
                        type: NodeType.END,
                        position: { x: 250, y: 300 },
                        data: { label: 'End' },
                        targetPosition: Position.Top,
                    } as any,
                ],
                edges: [
                ],
            };
            setNodes(fresh.nodes as any[]);
            setEdges(fresh.edges);
            setHistory([{ nodes: fresh.nodes, edges: fresh.edges }]);
            setHistoryIndex(0);
            setIsModified(true);
            toast({
                title: 'Workflow reset',
                description: 'Canvas restored to the default template (all node types, pre-wired).',
            });
        }
    }, [setNodes, setEdges]);

    const toggleSidebar = useCallback(() => {
        setIsSidebarVisible((prev) => !prev);
    }, []);


    useEffect(() => {
        if (workflowId) return;

        let cancelled = false;
        (async () => {
            try {
                const list = await ky.get('/api/get-workflows').json<{ id: string }[]>();
                if (cancelled || !list?.length) return;
                router.replace(`/workflow/${list[0].id}`);
            } catch {
                /* allow new workflow when none exist */
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [workflowId, router]);

    useEffect(() => {
        const fetchWorkflow = async () => {
            if (!workflowId) return;

            try {
                setIsLoading(true);

                const response = await ky.get(`/api/get-workflow?workflowId=${workflowId}`).json();
                const parsedNodes = JSON.parse((response as { nodes: string }).nodes);
                const parsedEdges = JSON.parse((response as { edges: string }).edges);
                const nodes = parsedNodes.map((node: any) => deserializeNode(node));

                console.log(nodes);

                setNodes(nodes);
                setEdges(parsedEdges);
                const name = (response as { name?: string }).name;
                setWorkflowName(typeof name === 'string' && name.trim() ? name : 'New Workflow');

                setIsModified(false);
            } catch (error) {
                console.error('Error loading workflow:', error);
                toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'Failed to load workflow',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorkflow();
    }, [workflowId]);

    return (
        <div className='flex h-full relative w-full'>
            <TooltipProvider>
                {isLoading ? (
                    <div className='absolute inset-0 flex items-center justify-center bg-background/80 z-50'>
                        <div className='flex flex-col items-center gap-2'>
                            <Loader2 className='h-8 w-8 animate-spin text-primary' />
                            <p className='text-sm text-muted-foreground'>Loading workflow...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                            onNodeClick={onNodeClick}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                            minZoom={0.1}
                            maxZoom={2}
                            fitView
                            fitViewOptions={{ padding: 0.2 }}
                            connectOnClick={false}
                            connectionLineType={ConnectionLineType.Bezier}
                            connectionLineStyle={{ stroke: '#9ca3af', strokeWidth: 2, strokeDasharray: '5,5' }}
                            deleteKeyCode={['Delete', 'Backspace']}
                            selectionKeyCode='Shift'
                            multiSelectionKeyCode='Control'
                            className={`${isDarkMode ? 'react-flow-dark' : ''}`}
                        >
                            <Background
                                variant={BackgroundVariant.Dots}
                                gap={12}
                                size={1}
                                color={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                            />
                            <Panel position='top-center' className='flex items-center bg-background border rounded-md shadow-sm overflow-hidden'>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            className='h-9 rounded-none border-0 border-r px-3 gap-1.5 shrink-0'
                                            onClick={handleSaveDraft}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? (
                                                <Loader2 className='h-4 w-4 animate-spin' />
                                            ) : (
                                                <Save className='h-4 w-4' />
                                            )}
                                            Save draft
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Save as draft without validating the graph</p>
                                    </TooltipContent>
                                </Tooltip>

                                <div className='h-6 w-px bg-border mx-1' />

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant='ghost' size='icon' onClick={handleUndo} disabled={historyIndex <= 0}>
                                            <Undo2 className='h-4 w-4' />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Undo (Ctrl+Z)</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant='ghost' size='icon' onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
                                            <Redo2 className='h-4 w-4' />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Redo (Ctrl+Y)</p>
                                    </TooltipContent>
                                </Tooltip>

                                <div className='h-6 w-px bg-border mx-1' />

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant='ghost' size='icon' onClick={() => zoomIn()}>
                                            <ZoomIn className='h-4 w-4' />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Zoom In</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant='ghost' size='icon' onClick={() => zoomOut()}>
                                            <ZoomOut className='h-4 w-4' />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Zoom Out</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant='ghost' size='icon' onClick={() => fitView()}>
                                            <Maximize className='h-4 w-4' />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Fit View</p>
                                    </TooltipContent>
                                </Tooltip>

                                <div className='h-6 w-px bg-border mx-1' />

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant='ghost' size='icon' onClick={handleDeleteSelected}>
                                            <Trash2 className='h-4 w-4' />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Delete Selected (Delete)</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant='ghost' size='icon' onClick={handleClearAll}>
                                            <RotateCcw className='h-4 w-4' />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Reset to default template</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant='ghost' size='icon' onClick={toggleSidebar}>
                                            <PanelLeft className='h-4 w-4' />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Panel>
                        </ReactFlow>
                        {isSidebarVisible && (
                            <Sidebar
                                nodes={nodes}
                                edges={edges}
                                workflowName={workflowName}
                                onWorkflowNameChange={setWorkflowName}
                                onPersistActive={persistActive}
                                isSaving={isSaving}
                                onSavingChange={setIsSaving}
                            />
                        )}
                        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                            <SheetContent>

                                {selectedNode && selectedNode.type === NodeType.TASK && selectedNode.taskType === TaskType.NOTIFY && (
                                    <NotificationNodeBuilderComponent node={selectedNode as NotificationNode} onSubmit={onNodeSubmit} />
                                )}

                                {selectedNode && selectedNode.type === NodeType.TASK && selectedNode.taskType === TaskType.ASSIGNMENT && (
                                    <AssignmentNodeBuilderComponent node={selectedNode as AssignmentNode} onSubmit={onNodeSubmit} />
                                )}

                                {selectedNode && selectedNode.type === NodeType.TASK && selectedNode.taskType === TaskType.INTERVIEW && (
                                    <InterviewNodeBuilderComponent node={selectedNode as InterviewNode} onSubmit={onNodeSubmit} />
                                )}
                                {selectedNode && selectedNode.type === NodeType.TASK && selectedNode.taskType === TaskType.WAIT && (
                                    <WaitNodeBuilderComponent node={selectedNode as WaitNode} onSubmit={onNodeSubmit} />
                                )}
                                {selectedNode && selectedNode.type === NodeType.TASK && selectedNode.taskType === TaskType.CONDITION && (
                                    <ConditionNodeBuilderComponent node={selectedNode as ConditionNode} onSubmit={onNodeSubmit} />
                                )}
                                {selectedNode && selectedNode.type === NodeType.TASK && selectedNode.taskType === TaskType.UPDATE_STATUS && (
                                    <UpdateStatusNodeBuilderComponent node={selectedNode as UpdateStatusNode} onSubmit={onNodeSubmit} />
                                )}
                            </SheetContent>
                        </Sheet>
                    </>
                )}
            </TooltipProvider>
        </div>
    );
};
