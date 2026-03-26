'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { EventRun, WorkflowExecutionEvent } from './utils/types';
import { getStepDisplayName, formatDuration } from './utils/workflow-execution-utils';

function getTaskTypeFromStepType(stepType: string): string {
    const normalized = stepType.trim().toLowerCase().replace(/[\s-]+/g, '_');
    const map: Record<string, string> = {
        start: 'start',
        end: 'end',
        notify: 'notify',
        update_status: 'update_status',
        assignment: 'assignment',
        interview: 'interview',
        wait: 'wait',
        condition: 'condition',
    };
    return map[normalized] ?? 'task';
}

type NodeVisual = {
    icon: string;
    bg: string;
    iconColor: string;
    border: string;
};

const STATUS_RING: Record<string, string> = {
    completed: '#22c55e',
    failed:    '#ef4444',
    started:   '#3b82f6',
};

function getNodeVisual(taskType: string): NodeVisual {
    const visuals: Record<string, NodeVisual> = {
        start: {
            icon: `<circle cx="10" cy="10" r="4" fill="currentColor"/>`,
            bg: '#f0fdf4',
            iconColor: '#16a34a',
            border: '#bbf7d0',
        },
        end: {
            icon: `<rect x="6" y="6" width="8" height="8" rx="1" fill="currentColor"/>`,
            bg: '#faf5ff',
            iconColor: '#9333ea',
            border: '#e9d5ff',
        },
        notify: {
            icon: `<path d="M10 2C6.686 2 4 4.686 4 8v4l-1.5 1.5V15h15v-1.5L16 12V8c0-3.314-2.686-6-6-6zm0 16c1.1 0 2-.9 2-2H8c0 1.1.9 2 2 2z" fill="currentColor"/>`,
            bg: '#eff6ff',
            iconColor: '#2563eb',
            border: '#bfdbfe',
        },
        update_status: {
            icon: `<path d="M17 3H7c-1.1 0-2 .9-2 2v14l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="currentColor"/>`,
            bg: '#f0f9ff',
            iconColor: '#0ea5e9',
            border: '#bae6fd',
        },
        assignment: {
            icon: `<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM9 17l-3-3 1.41-1.41L9 14.17l5.59-5.58L16 10l-7 7z" fill="currentColor"/>`,
            bg: '#fff7ed',
            iconColor: '#ea580c',
            border: '#fed7aa',
        },
        interview: {
            icon: `<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-9 11H7v-2h4v2zm6-4H7V7h10v2z" fill="currentColor"/>`,
            bg: '#fdf4ff',
            iconColor: '#c026d3',
            border: '#f5d0fe',
        },
        wait: {
            icon: `<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" fill="currentColor"/>`,
            bg: '#fefce8',
            iconColor: '#ca8a04',
            border: '#fde68a',
        },
        condition: {
            icon: `<path d="M12 2L2 19h20L12 2zm0 3.5L19.5 17h-15L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" fill="currentColor"/>`,
            bg: '#fff1f2',
            iconColor: '#e11d48',
            border: '#fecdd3',
        },
        task: {
            icon: `<circle cx="10" cy="10" r="6" stroke="currentColor" stroke-width="2" fill="none"/>`,
            bg: '#f8fafc',
            iconColor: '#64748b',
            border: '#e2e8f0',
        },
    };

    return visuals[taskType] ?? visuals.task;
}

const NODE_WIDTH  = 220;
const NODE_HEIGHT = 64;
const H_GAP       = 80;  
const CANVAS_PAD  = 40;

type LayoutNode = {
    id: string;
    x: number;
    y: number;
    label: string;
    taskType: string;
    status: 'started' | 'completed' | 'failed' | 'pending';
    duration: string | null;
    run: EventRun | null;
};

type LayoutEdge = {
    fromId: string;
    toId: string;
};

function buildLayout(runs: EventRun[]): { nodes: LayoutNode[]; edges: LayoutEdge[]; totalHeight: number } {
    const allNodes: LayoutNode[] = [];
    const edges: LayoutEdge[] = [];
    const cx = CANVAS_PAD + NODE_WIDTH / 2;

    allNodes.push({
        id: 'start',
        x: cx,
        y: CANVAS_PAD,
        label: 'Workflow Started',
        taskType: 'start',
        status: 'completed',
        duration: null,
        run: null,
    });

    runs.forEach((run, i) => {
        const id = `step-${i + 1}`;
        const prevId = i === 0 ? 'start' : `step-${i}`;
        allNodes.push({
            id,
            x: cx,
            y: CANVAS_PAD + (i + 1) * (NODE_HEIGHT + H_GAP),
            label: getStepDisplayName(run.stepType),
            taskType: getTaskTypeFromStepType(run.stepType),
            status: run.finalStatus,
            duration: formatDuration(run.startedAt, run.endedAt),
            run,
        });
        edges.push({ fromId: prevId, toId: id });
    });

    if (runs.length > 0) {
        const lastId = `step-${runs.length}`;
        const lastRun = runs[runs.length - 1];
        const endStatus = lastRun.finalStatus === 'completed' ? 'completed' : lastRun.finalStatus === 'failed' ? 'failed' : 'started';
        allNodes.push({
            id: 'end',
            x: cx,
            y: CANVAS_PAD + (runs.length + 1) * (NODE_HEIGHT + H_GAP),
            label: 'Workflow Completed',
            taskType: 'end',
            status: endStatus,
            duration: null,
            run: null,
        });
        edges.push({ fromId: lastId, toId: 'end' });
    }

    const totalHeight = CANVAS_PAD * 2 + (allNodes.length) * (NODE_HEIGHT + H_GAP) + 100;
    return { nodes: allNodes, edges, totalHeight };
}

function WorkflowNodeSVG({
    node,
    selected,
    onClick,
}: {
    node: LayoutNode;
    selected: boolean;
    onClick: (node: LayoutNode) => void;
}) {
    const visual = getNodeVisual(node.taskType);
    const ringColor = node.status !== 'pending' ? STATUS_RING[node.status] : '#cbd5e1';
    const nx = node.x - NODE_WIDTH / 2;
    const ny = node.y - NODE_HEIGHT / 2;

    return (
        <g
            style={{ cursor: node.run ? 'pointer' : 'default' }}
            onClick={() => node.run && onClick(node)}
        >
            {selected && (
                <rect
                    x={nx - 3} y={ny - 3}
                    width={NODE_WIDTH + 6} height={NODE_HEIGHT + 6}
                    rx={14} ry={14}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth={2.5}
                    opacity={0.5}
                />
            )}

            <rect
                x={nx + 2} y={ny + 3}
                width={NODE_WIDTH} height={NODE_HEIGHT}
                rx={12} ry={12}
                fill="rgba(0,0,0,0.06)"
            />

            <rect
                x={nx} y={ny}
                width={NODE_WIDTH} height={NODE_HEIGHT}
                rx={12} ry={12}
                fill={visual.bg}
                stroke={selected ? ringColor : visual.border}
                strokeWidth={selected ? 2 : 1.5}
            />

            <rect
                x={nx} y={ny + 12}
                width={4} height={NODE_HEIGHT - 24}
                rx={2}
                fill={ringColor}
            />

            <circle cx={nx + 28} cy={ny + NODE_HEIGHT / 2} r={14} fill={visual.iconColor} opacity={0.12} />

            <g
                transform={`translate(${nx + 28 - 10}, ${ny + NODE_HEIGHT / 2 - 10})`}
                fill={visual.iconColor}
                style={{ pointerEvents: 'none' }}
            >
                <svg viewBox="0 0 20 20" width="20" height="20">
                    <g dangerouslySetInnerHTML={{ __html: visual.icon }} />
                </svg>
            </g>

            <text
                x={nx + 52}
                y={ny + NODE_HEIGHT / 2 - (node.duration ? 7 : 0)}
                fontSize={12.5}
                fontWeight="600"
                fontFamily="'Inter', system-ui, sans-serif"
                fill="#1e293b"
                dominantBaseline="middle"
            >
                {node.label}
            </text>

            {node.duration && (
                <>
                    <rect
                        x={nx + 52} y={ny + NODE_HEIGHT / 2 + 5}
                        width={node.duration.length * 7 + 10} height={14}
                        rx={7}
                        fill={ringColor}
                        opacity={0.15}
                    />
                    <text
                        x={nx + 57}
                        y={ny + NODE_HEIGHT / 2 + 12}
                        fontSize={9.5}
                        fontWeight="500"
                        fontFamily="monospace"
                        fill={ringColor}
                        dominantBaseline="middle"
                    >
                        {node.duration}
                    </text>
                </>
            )}

            <circle
                cx={nx + NODE_WIDTH - 16}
                cy={ny + NODE_HEIGHT / 2}
                r={5}
                fill={ringColor}
            />
            {node.status === 'started' && (
                <circle
                    cx={nx + NODE_WIDTH - 16}
                    cy={ny + NODE_HEIGHT / 2}
                    r={8}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth={1.5}
                    opacity={0.4}
                />
            )}
        </g>
    );
}

function EdgeSVG({ from, to, status }: { from: LayoutNode; to: LayoutNode; status: string }) {
    const x = from.x;
    const y1 = from.y + NODE_HEIGHT / 2;
    const y2 = to.y - NODE_HEIGHT / 2;
    const midY = (y1 + y2) / 2;
    const color = status === 'completed' ? '#22c55e' : status === 'failed' ? '#ef4444' : '#94a3b8';
    const d = `M ${x} ${y1} C ${x} ${midY}, ${x} ${midY}, ${x} ${y2}`;

    return (
        <g>
            <path d={d} fill="none" stroke={color} strokeWidth={2} strokeOpacity={0.35} />
            <polygon
                points={`${x},${y2} ${x - 5},${y2 - 8} ${x + 5},${y2 - 8}`}
                fill={color}
                opacity={0.5}
            />
        </g>
    );
}

interface WorkflowExecutionGraphProps {
    runs: EventRun[];
    selectedRunKey: string;
    onSelectRun: (run: EventRun) => void;
}

export function WorkflowExecutionGraph({ runs, selectedRunKey, onSelectRun }: WorkflowExecutionGraphProps) {
    const { nodes, edges, totalHeight } = buildLayout(runs);
    const canvasWidth = NODE_WIDTH + CANVAS_PAD * 2;

    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const isPanning = useRef(false);
    const lastPos  = useRef({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const clampZoom = (z: number) => Math.min(2, Math.max(0.4, z));

    const handleWheel = useCallback((e: WheelEvent) => {
        if (!e.ctrlKey && !e.metaKey) return; 
        e.preventDefault();
        setZoom((z) => clampZoom(z - e.deltaY * 0.001));
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    const onMouseDown = (e: React.MouseEvent) => {
        isPanning.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isPanning.current) return;
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        lastPos.current = { x: e.clientX, y: e.clientY };
        setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    };

    const onMouseUp = () => { isPanning.current = false; };

    return (
        <div className="relative w-full h-full flex flex-col" ref={containerRef}>
            <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1 rounded-xl shadow-lg border bg-white overflow-hidden p-1">
                <button
                    onClick={() => setZoom((z) => clampZoom(z + 0.15))}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors text-lg font-bold"
                >
                    +
                </button>
                <button
                    onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors text-[10px] font-bold"
                >
                    FIT
                </button>
                <button
                    onClick={() => setZoom((z) => clampZoom(z - 0.15))}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors text-lg font-bold"
                >
                    −
                </button>
            </div>

            <div
                className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing select-none relative bg-slate-50/50"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
            >
                <div
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: 'top center',
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '40px'
                    }}
                >
                    <svg
                        width={canvasWidth}
                        height={totalHeight}
                        viewBox={`0 0 ${canvasWidth} ${totalHeight}`}
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ overflow: 'visible' }}
                    >
                        {edges.map((edge) => {
                            const fromNode = nodes.find((n) => n.id === edge.fromId)!;
                            const toNode   = nodes.find((n) => n.id === edge.toId)!;
                            return <EdgeSVG key={`${edge.fromId}-${edge.toId}`} from={fromNode} to={toNode} status={fromNode.status} />;
                        })}

                        {nodes.map((node) => (
                            <WorkflowNodeSVG
                                key={node.id}
                                node={node}
                                selected={node.run?.key === selectedRunKey}
                                onClick={(n) => n.run && onSelectRun(n.run)}
                            />
                        ))}
                    </svg>
                </div>
            </div>
        </div>
    );
}
