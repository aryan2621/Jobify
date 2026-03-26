'use client';

import { useCallback, useMemo } from 'react';
import { 
    ReactFlow, 
    Controls, 
    Background, 
    BackgroundVariant, 
    ConnectionLineType, 
    Node, 
    Edge,
    ReactFlowProvider,
    useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { NodeType } from '@jobify/domain/workflow';
import { CustomNode } from '@/components/workflows/components/customNode';
import { CustomEdge } from '@/components/workflows/components/customEdge';
import { EventRun } from './utils/types';

const nodeTypesConfig = {
    [NodeType.START]: CustomNode,
    [NodeType.END]: CustomNode,
    [NodeType.TASK]: CustomNode,
    custom: CustomNode,
};

const edgeTypesConfig = {
    default: CustomEdge,
    'custom-edge': CustomEdge,
};

function WorkflowExecutionGraphInner({ 
    workflowNodes, 
    workflowEdges, 
    eventRuns, 
    selectedRunKey, 
    onSelectRun 
}: { 
    workflowNodes: Node[], 
    workflowEdges: Edge[], 
    eventRuns: EventRun[], 
    selectedRunKey: string, 
    onSelectRun: (run: EventRun) => void 
}) {
    const { fitView } = useReactFlow();

    const latestRunsMap = useMemo(() => {
        const map = new Map<string, EventRun>();
        eventRuns.forEach((run) => {
            map.set(run.nodeId, run);
        });
        return map;
    }, [eventRuns]);

    const displayNodes = useMemo(() => {
        return workflowNodes.map((node) => {
            const run = latestRunsMap.get(node.id);
            let shadow = 'none';

            if (run) {
                if (run.finalStatus === 'failed') {
                    shadow = '0 0 0 3px rgba(239, 68, 68, 0.5)';
                } else if (run.finalStatus === 'completed') {
                    shadow = '0 0 0 3px rgba(34, 197, 94, 0.5)';
                } else {
                    shadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
                }
            }

            const currentSelectedRun = eventRuns.find(r => r.key === selectedRunKey);
            const isSelected = currentSelectedRun?.nodeId === node.id;
            
            if (isSelected) {
                shadow = `0 0 0 5px ${run?.finalStatus === 'failed' ? '#ef4444' : run?.finalStatus === 'completed' ? '#22c55e' : '#3b82f6'}`;
            }

            return {
                ...node,
                style: {
                    ...node.style,
                    boxShadow: shadow !== 'none' ? shadow : undefined,
                    transition: 'all 0.2s ease',
                    borderRadius: '0.65rem',
                    cursor: run ? 'pointer' : 'default',
                },
                draggable: false,
            };
        });
    }, [workflowNodes, latestRunsMap, selectedRunKey, eventRuns]);

    const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        const run = Array.from(eventRuns).reverse().find(r => r.nodeId === node.id);
        if (run) {
            onSelectRun(run);
        }
    }, [eventRuns, onSelectRun]);


    return (
        <div className="w-full h-full relative">
            <ReactFlow
                nodes={displayNodes}
                edges={workflowEdges}
                nodeTypes={nodeTypesConfig}
                edgeTypes={edgeTypesConfig}
                onNodeClick={handleNodeClick}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                connectionLineType={ConnectionLineType.Bezier}
                className='react-flow-readonly'
            >
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} color='rgba(0, 0, 0, 0.1)' />
                <Controls showInteractive={false} />
            </ReactFlow>
        </div>
    );
}

export function WorkflowExecutionGraph(props: { 
    workflowNodes: Node[], 
    workflowEdges: Edge[], 
    eventRuns: EventRun[], 
    selectedRunKey: string, 
    onSelectRun: (run: EventRun) => void 
}) {
    return (
        <ReactFlowProvider>
            <WorkflowExecutionGraphInner {...props} />
        </ReactFlowProvider>
    );
}
