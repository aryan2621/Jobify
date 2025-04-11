import { nanoid } from 'nanoid';
import { useCallback, useEffect, useRef, useState } from 'react';
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

// Local imports
import { AssignmentNode, ConditionalNode, InterviewNode, NotificationNode, WaitNode, WorkflowNode } from '@/model/workflow';
import { useDnD } from '@/context/workflow';
import { CustomNode } from './customNode';
import { CustomEdge } from './customEdge';
import { NodeType, TaskType } from '@/model/workflow';

// Builder components
import NotificationNodeBuilderComponent from '../builder/notification';
import AssignmentNodeBuilderComponent from '../builder/assignment';
import InterviewNodeBuilderComponent from '../builder/interview';
import StartNodeBuilderComponent from '../builder/start';
import EndNodeBuilderComponent from '../builder/end';
import ConditionalNodeBuilderComponent from '../builder/condition';
import WaitNodeBuilderComponent from '../builder/wait';
import Sidebar from './siderbar';
import { nodeFactory } from '@/lib/utils/node-factory-utils';
import ky from 'ky';
// UI components
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';
import { Maximize, ZoomIn, ZoomOut, RotateCcw, Save, Trash2, FileDown, Undo2, Redo2, PanelLeft } from 'lucide-react';
import { Loader2 } from 'lucide-react';

// Import styles
import '@xyflow/react/dist/style.css';
import { deserializeNode } from '@/lib/utils/workflow-utils';

// Type for undo/redo history
type HistoryState = {
    nodes: WorkflowNode[];
    edges: Edge[];
};

type EditorProps = {
    workflowId?: string;
};

export const Editor = ({ workflowId }: EditorProps) => {
    const initialNodes: WorkflowNode[] = [
        {
            id: nanoid(),
            type: NodeType.START,
            data: { label: 'Start' },
            position: { x: 250, y: 50 },
        },
        {
            id: nanoid(),
            type: NodeType.END,
            data: { label: 'End' },
            position: { x: 250, y: 350 },
        },
    ];

    const initialEdges: Edge[] = [];

    // React Flow state
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any[]);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { screenToFlowPosition, fitView, zoomIn, zoomOut } = useReactFlow();

    // Drag and drop state
    const [type] = useDnD();

    // UI state
    const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // History state for undo/redo
    const [history, setHistory] = useState<HistoryState[]>([{ nodes: initialNodes, edges: initialEdges }]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const historyTimeoutRef = useRef<any>(null);

    // Key press handlers
    const undoPressed = useKeyPress(['z']);
    const redoPressed = useKeyPress(['y']);
    const deletePressed = useKeyPress(['Delete', 'Backspace']);

    // Track if diagram is modified
    const [isModified, setIsModified] = useState(false);

    // Loading state
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Node and edge type definitions
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

    // Save current state to history
    const saveToHistory = useCallback(() => {
        // Clear any pending history saves
        if (historyTimeoutRef.current) {
            clearTimeout(historyTimeoutRef.current);
        }

        // Use timeout to avoid too many history entries
        historyTimeoutRef.current = setTimeout(() => {
            setHistory((prev) => {
                // Remove any future states if we've gone back in history
                const newHistory = prev.slice(0, historyIndex + 1);
                return [...newHistory, { nodes, edges }];
            });
            setHistoryIndex((prev) => prev + 1);
            setIsModified(true);
        }, 500);
    }, [nodes, edges, historyIndex]);

    // Update history when nodes or edges change
    useEffect(() => {
        if (nodes.length > 0 || edges.length > 0) {
            saveToHistory();
        }
    }, [nodes, edges, saveToHistory]);

    // Handle undo/redo keyboard shortcuts
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

    // Confirm navigation if workflow is modified
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

    // Handle undo
    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const prevState = history[newIndex];

            setNodes(prevState.nodes);
            setEdges(prevState.edges);
            setHistoryIndex(newIndex);
        }
    }, [history, historyIndex, setNodes, setEdges]);

    // Handle redo
    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const nextState = history[newIndex];

            setNodes(nextState.nodes);
            setEdges(nextState.edges);
            setHistoryIndex(newIndex);
        }
    }, [history, historyIndex, setNodes, setEdges]);

    // Handle connection events
    const onConnect = useCallback(
        (connection: any) => {
            // Create new connection with custom edge type
            const edge = {
                ...connection,
                type: 'custom-edge',
                animated: true,
                style: { strokeWidth: 2 },
            };

            // Add edge and update state
            setEdges((eds) => addEdge(edge, eds));
        },
        [setEdges]
    );

    // Handle drag over event for node creation
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // Handle drop event for node creation
    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            if (!type) return;

            // Calculate drop position
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            // Create new node based on type
            const newNode = nodeFactory(type, { label: `${type.charAt(0).toUpperCase() + type.slice(1)}` }, position, Position.Bottom, Position.Top);

            // Add node to diagram
            setNodes((nds) => nds.concat(newNode));

            // Show success message
            toast({
                title: 'Node Added',
                description: `Added new ${type} node to workflow`,
            });
        },
        [screenToFlowPosition, type, setNodes]
    );

    // Handle node selection
    const onNodeClick = useCallback((event: React.MouseEvent, node: WorkflowNode) => {
        setSelectedNode(node);
        setSheetOpen(true);
    }, []);

    // Handle node configuration submission
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

    // Handle node deletion
    const handleDeleteSelected = useCallback(() => {
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
    }, [setNodes, setEdges]);

    // Clear entire diagram
    const handleClearAll = useCallback(() => {
        if (window.confirm('Are you sure you want to clear the entire workflow?')) {
            setNodes([]);
            setEdges([]);

            toast({
                title: 'Workflow Cleared',
                description: 'All nodes and connections have been removed',
            });
        }
    }, [setNodes, setEdges]);

    // Export diagram as image
    const handleExportImage = useCallback(() => {
        const downloadImage = (dataUrl: string) => {
            const a = document.createElement('a');
            a.setAttribute('download', 'workflow.png');
            a.setAttribute('href', dataUrl);
            a.click();
        };

        // Use html2canvas or similar library here
        // For now, use a placeholder
        toast({
            title: 'Export Image',
            description: 'Image export would happen here (placeholder)',
        });
    }, []);

    // Toggle sidebar visibility
    const toggleSidebar = useCallback(() => {
        setIsSidebarVisible((prev) => !prev);
    }, []);

    // Load workflow data if workflowId is provided
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

                toast({
                    title: 'Workflow Loaded',
                    description: 'Workflow loaded successfully',
                });
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
                            {/* Background grid */}
                            <Background
                                variant={BackgroundVariant.Dots}
                                gap={12}
                                size={1}
                                color={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                            />

                            {/* Mini map for navigation */}
                            <MiniMap
                                nodeStrokeWidth={3}
                                zoomable
                                pannable
                                position='bottom-right'
                                nodeColor={(node) => {
                                    switch (node.type) {
                                        case NodeType.START:
                                            return '#10b981'; // green
                                        case NodeType.END:
                                            return '#ef4444'; // red
                                        case NodeType.TASK:
                                            // Different colors based on task type
                                            const taskNode = node as WorkflowNode;
                                            if (taskNode.taskType === TaskType.NOTIFICATION) {
                                                return '#3b82f6'; // blue
                                            } else if (taskNode.taskType === TaskType.ASSIGNMENT) {
                                                return '#f59e0b'; // amber
                                            } else if (taskNode.taskType === TaskType.INTERVIEW) {
                                                return '#8b5cf6'; // purple
                                            } else if (taskNode.taskType === TaskType.CONDITIONAL) {
                                                return '#3b564'; // purple
                                            } else if (taskNode.taskType === TaskType.WAIT) {
                                                return '#36c2e3'; // light blue
                                            }
                                            return '#9ca3af'; // gray
                                        default:
                                            return '#9ca3af'; // gray
                                    }
                                }}
                                maskColor={isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.6)'}
                            />

                            {/* Controls */}
                            <Controls showInteractive={true} />

                            {/* Top toolbar */}
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
                                        <p>Clear All</p>
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

                        {/* Sidebar */}
                        {isSidebarVisible && <Sidebar nodes={nodes} edges={edges} />}

                        {/* Node configuration sheet */}
                        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                            <SheetContent>
                                {/* Different builder components based on node type */}
                                {selectedNode && selectedNode.type === NodeType.START && (
                                    <StartNodeBuilderComponent node={selectedNode} onSubmit={onNodeSubmit} />
                                )}

                                {selectedNode && selectedNode.type === NodeType.END && (
                                    <EndNodeBuilderComponent node={selectedNode} onSubmit={onNodeSubmit} />
                                )}

                                {selectedNode && selectedNode.type === NodeType.TASK && selectedNode.taskType === TaskType.NOTIFICATION && (
                                    <NotificationNodeBuilderComponent node={selectedNode as NotificationNode} onSubmit={onNodeSubmit} />
                                )}

                                {selectedNode && selectedNode.type === NodeType.TASK && selectedNode.taskType === TaskType.ASSIGNMENT && (
                                    <AssignmentNodeBuilderComponent node={selectedNode as AssignmentNode} onSubmit={onNodeSubmit} />
                                )}

                                {selectedNode && selectedNode.type === NodeType.TASK && selectedNode.taskType === TaskType.INTERVIEW && (
                                    <InterviewNodeBuilderComponent node={selectedNode as InterviewNode} onSubmit={onNodeSubmit} />
                                )}
                                {selectedNode && selectedNode.type === NodeType.TASK && selectedNode.taskType === TaskType.CONDITIONAL && (
                                    <ConditionalNodeBuilderComponent node={selectedNode as ConditionalNode} onSubmit={onNodeSubmit} />
                                )}
                                {selectedNode && selectedNode.type === NodeType.TASK && selectedNode.taskType === TaskType.WAIT && (
                                    <WaitNodeBuilderComponent node={selectedNode as WaitNode} onSubmit={onNodeSubmit} />
                                )}
                            </SheetContent>
                        </Sheet>
                    </>
                )}
            </TooltipProvider>
        </div>
    );
};
