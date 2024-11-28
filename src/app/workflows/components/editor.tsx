import { nanoid } from 'nanoid';
import { AssignmentNode, InterviewNode, NodeType, NotificationNode, TaskType, WorkflowNode } from '../model';
import { ReactFlow, addEdge, useNodesState, useEdgesState, Controls, useReactFlow, Position, Edge } from '@xyflow/react';
import { useState, useCallback } from 'react';
import { Sidebar } from './siderbar';
import '@xyflow/react/dist/style.css';
import { useDnD } from '@/context/workflow';
import { nodeFactory } from '../utils/node-factory';
import { CustomNode } from './customNode';
import NotificationNodeBuilderComponent from '../builder/notification';
import AssignmentNodeBuilderComponent from '../builder/assignment';
import InterviewNodeBuilderComponent from '../builder/interview';
import StartNodeBuilderComponent from '../builder/start';
import EndNodeBuilderComponent from '../builder/end';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CustomEdge } from './customEdge';

const initialNodes: WorkflowNode[] = [
    {
        id: nanoid(),
        type: NodeType.START,
        data: { label: 'Input Node' },
        position: { x: 250, y: 5 },
    },
    {
        id: nanoid(),
        type: NodeType.END,
        data: { label: 'Output Node' },
        position: { x: 250, y: 250 },
    },
];
const initialEdges: Edge[] = [];

export const Editor = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any[]);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { screenToFlowPosition } = useReactFlow();
    const [type] = useDnD();
    const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
    const [isSheetOpen, setSheetOpen] = useState(false);

    const onConnect = useCallback(
        (connection: any) => {
            const edge = { ...connection, type: 'custom-edge' };
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
            const newNode = nodeFactory(
                type,
                { label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node` },
                position,
                Position.Bottom,
                Position.Top
            );
            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, type, setNodes]
    );
    const onNodeClick = useCallback((event: any, node: any) => {
        setSelectedNode(node);
        setSheetOpen(true);
    }, []);

    const onSubmit = (node: WorkflowNode) => {
        setNodes((nds) => nds.map((n) => (n.id === node.id ? node : n)));
        setSelectedNode(null);
        setSheetOpen(false);
    };
    return (
        <div className='flex h-full'>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                fitView
                nodeTypes={{
                    custom: CustomNode,
                }}
                edgeTypes={{
                    'custom-edge': CustomEdge,
                }}
                onNodeClick={onNodeClick}
            >
                <Controls />
            </ReactFlow>
            <Sidebar nodes={nodes} edges={edges} />
            <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Node Configuration</SheetTitle>
                    </SheetHeader>
                    {selectedNode && selectedNode.type === NodeType.START && <StartNodeBuilderComponent node={selectedNode} onSubmit={onSubmit} />}
                    {selectedNode && selectedNode.type === NodeType.END && <EndNodeBuilderComponent node={selectedNode} onSubmit={onSubmit} />}
                    {selectedNode && selectedNode.type === NodeType.TASK && selectedNode.taskType === TaskType.NOTIFICATION && (
                        <NotificationNodeBuilderComponent node={selectedNode as NotificationNode} onSubmit={onSubmit} />
                    )}
                    {selectedNode && selectedNode.type === NodeType.TASK && selectedNode.taskType === TaskType.ASSIGNMENT && (
                        <AssignmentNodeBuilderComponent node={selectedNode as AssignmentNode} onSubmit={onSubmit} />
                    )}
                    {selectedNode && selectedNode.type === NodeType.TASK && selectedNode.taskType === TaskType.INTERVIEW && (
                        <InterviewNodeBuilderComponent node={selectedNode as InterviewNode} onSubmit={onSubmit} />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};
