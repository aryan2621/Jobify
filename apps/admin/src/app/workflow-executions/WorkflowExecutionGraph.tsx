'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
    const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

    useEffect(() => {
        const run = eventRuns.find((r) => r.key === selectedRunKey);
        if (run) {
            setFocusedNodeId(run.nodeId);
        }
    }, [selectedRunKey, eventRuns]);

    const latestRunsMap = useMemo(() => {
        const map = new Map<string, EventRun>();
        eventRuns.forEach((run) => {
            map.set(run.nodeId, run);
        });
        return map;
    }, [eventRuns]);

    const displayNodes = useMemo(() => {
        return workflowNodes.map((node) => {
            const isStartOrEnd = node.type === NodeType.START || node.type === NodeType.END;
            const run = latestRunsMap.get(node.id);
            let shadow = 'none';

            if (run && !isStartOrEnd) {
                if (run.finalStatus === 'failed') {
                    shadow = '0 0 0 3px rgba(239, 68, 68, 0.5)';
                } else if (run.finalStatus === 'completed') {
                    shadow = '0 0 0 3px rgba(34, 197, 94, 0.5)';
                } else {
                    shadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
                }
            }

            const currentSelectedRun = eventRuns.find((r) => r.key === selectedRunKey);
            const isRunSelected = currentSelectedRun?.nodeId === node.id && !isStartOrEnd;

            if (isRunSelected) {
            }

            return {
                ...node,
                selected: false,
                selectable: false,
                style: {
                    ...node.style,
                    border: 'none',
                    background: 'transparent',
                    boxShadow: shadow !== 'none' ? shadow : undefined,
                    transition: 'all 0.2s ease',
                    borderRadius: '0.65rem',
                    cursor: isStartOrEnd ? 'default' : 'pointer',
                },
                draggable: false,
            };
        });
    }, [workflowNodes, latestRunsMap, selectedRunKey, eventRuns, focusedNodeId]);

    const handleNodeClick = useCallback(
        (_: React.MouseEvent, node: Node) => {
            if (node.type === NodeType.START || node.type === NodeType.END) {
                return;
            }
            setFocusedNodeId(node.id);
            const run = Array.from(eventRuns)
                .reverse()
                .find((r) => r.nodeId === node.id);
            if (run) {
                onSelectRun(run);
            }
        },
        [eventRuns, onSelectRun]
    );

    const handlePaneClick = useCallback(() => {
        setFocusedNodeId(null);
    }, []);

    return (
        <div className="w-full h-full relative">
            <ReactFlow
                nodes={displayNodes}
                edges={workflowEdges}
                nodeTypes={nodeTypesConfig}
                edgeTypes={edgeTypesConfig}
                onNodeClick={handleNodeClick}
                onPaneClick={handlePaneClick}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
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
