import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ReactFlow,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    BackgroundVariant,
    MiniMap,
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
import ky from 'ky';

import { Sheet, SheetContent } from '@jobify/ui/sheet';
import { Button } from '@jobify/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@jobify/ui/tooltip';
import { toast } from '@jobify/ui/use-toast';
import { Maximize, ZoomIn, ZoomOut, RotateCcw, Save, Trash2, FileDown, Undo2, Redo2, PanelLeft } from 'lucide-react';
import { Loader2 } from 'lucide-react';


import '@xyflow/react/dist/style.css';
import { createDefaultRecruitmentWorkflow, deserializeNode } from '@/lib/utils/workflow-utils';


type HistoryState = {
    nodes: WorkflowNode[];
    edges: Edge[];
};

type EditorProps = {
    workflowId?: string;
};

export const Editor = ({ workflowId }: EditorProps) => {
    const router = useRouter();
    const defaultTemplate = useMemo(() => createDefaultRecruitmentWorkflow(), []);

    const [nodes, setNodes, onNodesChange] = useNodesState(defaultTemplate.nodes as any[]);
    const [edges, setEdges, onEdgesChange] = useEdgesState(defaultTemplate.edges);
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
            const fresh = createDefaultRecruitmentWorkflow();
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


    const handleExportImage = useCallback(() => {
        const downloadImage = (dataUrl: string) => {
            const a = document.createElement('a');
            a.setAttribute('download', 'workflow.png');
            a.setAttribute('href', dataUrl);
            a.click();
        };



        toast({
            title: 'Export Image',
            description: 'Image export would happen here (placeholder)',
        });
    }, []);


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
                const parsedNodes = JSON.parse((response as any).nodes);
                const parsedEdges = JSON.parse((response as any).edges);
                const nodes = parsedNodes.map((node: any) => deserializeNode(node));

                console.log(nodes);

                setNodes(nodes);
                setEdges(parsedEdges);

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
                            { }
                            <Background
                                variant={BackgroundVariant.Dots}
                                gap={12}
                                size={1}
                                color={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                            />


                            <MiniMap
                                nodeStrokeWidth={3}
                                zoomable
                                pannable
                                position='bottom-right'
                                nodeColor={(node) => {
                                    switch (node.type) {
                                        case NodeType.START:
                                            return '#10b981';
                                        case NodeType.END:
                                            return '#ef4444';
                                        case NodeType.TASK:

                                            const taskNode = node as WorkflowNode;
                                            if (taskNode.taskType === TaskType.NOTIFY) {
                                                return '#3b82f6';
                                            } else if (taskNode.taskType === TaskType.ASSIGNMENT) {
                                                return '#f59e0b';
                                            } else if (taskNode.taskType === TaskType.INTERVIEW) {
                                                return '#8b5cf6';
                                            } else if (taskNode.taskType === TaskType.WAIT) {
                                                return '#36c2e3';
                                            } else if (taskNode.taskType === TaskType.CONDITION) {
                                                return '#0d9488';
                                            } else if (taskNode.taskType === TaskType.UPDATE_STATUS) {
                                                return '#ea580c';
                                            }
                                            return '#9ca3af';
                                        default:
                                            return '#9ca3af';
                                    }
                                }}
                                maskColor={isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.6)'}
                            />

                            { }
                            <Controls showInteractive={true} />


                            <Panel position='top-center' className='flex bg-background border rounded-md shadow-sm overflow-hidden'>
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

                                <div className='h-6 w-px bg-border mx-1' />

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant='ghost' size='icon' onClick={handleExportImage}>
                                            <FileDown className='h-4 w-4' />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Export as Image</p>
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

                        { }
                        {isSidebarVisible && <Sidebar nodes={nodes} edges={edges} workflowId={workflowId} />}


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
