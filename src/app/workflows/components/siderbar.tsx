'use client';

import { Button } from '@/components/ui/button';
import { useDnD } from '@/context/workflow';
import { NodeType, TaskType, WorkflowNode } from '../model';
import { useToast } from '@/components/ui/use-toast';
import { Edge } from '@xyflow/react';

interface SideBarProps {
    nodes: WorkflowNode[];
    edges: Edge[];
}
export const Sidebar = ({ nodes, edges }: SideBarProps) => {
    const [, setType] = useDnD();
    const { toast } = useToast();

    const onDragStart = (event: React.DragEvent<HTMLButtonElement>, nodeType: NodeType | TaskType) => {
        setType(nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragEnd = () => {
        setType(null);
    };

    const validateWorkflow = () => {
        const startNodes = nodes.filter((node) => node.type === NodeType.START);
        const endNodes = nodes.filter((node) => node.type === NodeType.END);
        if (startNodes.length !== 1 || endNodes.length !== 1) {
            toast({
                title: 'Workflow Validation Failed',
                description: 'Workflow must have exactly one Start and one End node',
                variant: 'destructive',
            });
            return;
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
        const idleNodes = nodes.filter((node) => {
            if (node.type === NodeType.START) {
                return false;
            }
            if (node.type === NodeType.END) {
                return false;
            }
            return inDegree[node.id] === 0 || outDegree[node.id] === 0;
        });
        if (idleNodes.length > 0) {
            toast({
                title: 'Workflow Validation Failed',
                description: `Found ${idleNodes.length} disconnected node(s). All nodes must be connected.`,
                variant: 'destructive',
            });
            return;
        }
        const invalidInDegreeNodes = nodes.filter((node) => {
            if (node.type === NodeType.START) return false;
            if (node.type === NodeType.END) return false;
            return inDegree[node.id] !== 2;
        });

        if (invalidInDegreeNodes.length > 0) {
            toast({
                title: 'Workflow Validation Failed',
                description: `Found ${invalidInDegreeNodes.length} node(s) without exactly 2 incoming connections.`,
                variant: 'destructive',
            });
            return;
        }
        if (inDegree[startNodes[0].id] !== 0) {
            toast({
                title: 'Workflow Validation Failed',
                description: 'Start node should not have any incoming edges',
                variant: 'destructive',
            });
            return;
        }
        if (outDegree[endNodes[0].id] !== 0) {
            toast({
                title: 'Workflow Validation Failed',
                description: 'End node should not have any outgoing edges',
                variant: 'destructive',
            });
            return;
        }
        toast({
            title: 'Workflow Validation Passed',
            description: 'Workflow is valid! All nodes are properly connected.',
        });
    };

    return (
        <aside className='w-25 p-3 shadow-lg h-full border rounded-lg'>
            <h2 className='font-bold text-xl mb-4'>Add Nodes</h2>
            <Button className='w-full mb-2' variant={'outline'} onDragStart={(event) => onDragStart(event, TaskType.NOTIFICATION)} draggable>
                Notification Task
            </Button>
            <Button className='w-full mb-2' variant={'outline'} onDragStart={(event) => onDragStart(event, TaskType.ASSIGNMENT)} draggable>
                Assignment Task
            </Button>
            <Button className='w-full mb-2' variant={'outline'} onDragStart={(event) => onDragStart(event, TaskType.INTERVIEW)} draggable>
                Interview Task
            </Button>
            <Button className='w-full mt-10' onClick={validateWorkflow}>
                Validate Workflow
            </Button>
        </aside>
    );
};
