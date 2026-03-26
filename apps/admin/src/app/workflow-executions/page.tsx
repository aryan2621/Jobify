'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import ky from 'ky';
import NavbarLayout from '@/layouts/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@jobify/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@jobify/ui/table';
import { Badge } from '@jobify/ui/badge';
import { Button } from '@jobify/ui/button';
import { Skeleton } from '@jobify/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@jobify/ui/dialog';
import { ScrollArea } from '@jobify/ui/scroll-area';
import { useToast } from '@jobify/ui/use-toast';
import { TooltipProvider } from '@jobify/ui/tooltip';
import { Loader2 } from 'lucide-react';

import { ReactFlow, Controls, Background, BackgroundVariant, MiniMap, ConnectionLineType, Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { NodeType, TaskType, WorkflowNode } from '@jobify/domain/workflow';
import { CustomNode } from '@/components/workflows/components/customNode';
import { CustomEdge } from '@/components/workflows/components/customEdge';
import { deserializeNode } from '@/lib/utils/workflow-utils';

type WorkflowExecution = {
    id: string;
    applicationId: string;
    jobId: string;
    workflowId: string;
    status: 'running' | 'waiting' | 'completed' | 'failed' | 'cancelled';
    currentNodeId?: string;
    updatedAt: string;
};

type WorkflowExecutionEvent = {
    id: string;
    nodeId: string;
    stepType: string;
    status: 'started' | 'completed' | 'failed';
    input?: string;
    output?: string;
    error?: string;
    createdAt: string;
};

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function formatContent(value?: string): string {
    if (!value) return '';
    try {
        return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
        return value;
    }
}

function parseContent(value?: string): unknown {
    if (!value) return null;
    try {
        return JSON.parse(value) as unknown;
    } catch {
        return value;
    }
}

function getStepDisplayName(stepType: string): string {
    const normalized = stepType.trim().toLowerCase().replace(/[\s-]+/g, '_');
    const knownLabels: Record<string, string> = {
        start: 'Workflow Started',
        end: 'Workflow Completed',
        notify: 'Candidate Notification',
        update_status: 'Application Status Update',
        assignment: 'Assignment Email',
        interview: 'Interview Scheduling',
        wait: 'Wait Timer',
        condition: 'Condition Check',
    };
    if (knownLabels[normalized]) return knownLabels[normalized];
    return stepType
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function describeEvent(event: WorkflowExecutionEvent): string {
    const stepName = getStepDisplayName(event.stepType);
    if (event.status === 'failed') {
        return `${stepName} failed while processing this workflow step.`;
    }
    if (event.status === 'completed') {
        return `${stepName} completed successfully and produced the output below.`;
    }
    return `${stepName} started and is currently processing.`;
}

type EventRun = {
    key: string;
    nodeId: string;
    stepType: string;
    startedAt?: string;
    endedAt?: string;
    finalStatus: WorkflowExecutionEvent['status'];
    events: WorkflowExecutionEvent[];
};

function buildEventRuns(events: WorkflowExecutionEvent[]): EventRun[] {
    const sorted = [...events].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const runs: EventRun[] = [];
    const openRunsByNode = new Map<string, EventRun>();

    for (const event of sorted) {
        if (event.status === 'started') {
            const run: EventRun = {
                key: `${event.nodeId}-${event.createdAt}-${event.id}`,
                nodeId: event.nodeId,
                stepType: event.stepType,
                startedAt: event.createdAt,
                endedAt: undefined,
                finalStatus: 'started',
                events: [event],
            };
            runs.push(run);
            openRunsByNode.set(event.nodeId, run);
            continue;
        }

        const activeRun = openRunsByNode.get(event.nodeId);
        if (activeRun) {
            activeRun.events.push(event);
            activeRun.finalStatus = event.status;
            activeRun.endedAt = event.createdAt;
            openRunsByNode.delete(event.nodeId);
            continue;
        }

        runs.push({
            key: `${event.nodeId}-${event.createdAt}-${event.id}`,
            nodeId: event.nodeId,
            stepType: event.stepType,
            startedAt: undefined,
            endedAt: event.createdAt,
            finalStatus: event.status,
            events: [event],
        });
    }

    return runs;
}

function formatDuration(startedAt?: string, endedAt?: string): string | null {
    if (!startedAt || !endedAt) return null;
    const durationMs = new Date(endedAt).getTime() - new Date(startedAt).getTime();
    if (!Number.isFinite(durationMs) || durationMs < 0) return null;
    const totalSeconds = Math.round(durationMs / 1000);
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
}

function hasUsefulPayload(value?: string): boolean {
    const parsed = parseContent(value);
    if (parsed == null) return false;
    if (typeof parsed === 'string') return parsed.trim().length > 0 && parsed.trim() !== '{}';
    if (typeof parsed === 'object') return JSON.stringify(parsed) !== '{}';
    return true;
}

function getRunTone(status: WorkflowExecutionEvent['status']): { cardBorder: string; badgeTone: string } {
    if (status === 'failed') {
        return {
            cardBorder: 'border-red-200 dark:border-red-900/40',
            badgeTone: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
    }
    if (status === 'completed') {
        return {
            cardBorder: 'border-green-200 dark:border-green-900/40',
            badgeTone: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        };
    }
    return {
        cardBorder: 'border-blue-200 dark:border-blue-900/40',
        badgeTone: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    };
}

function ExecutionStatusBadge({ status }: { status: WorkflowExecution['status'] }) {
    const variantClass =
        status === 'completed'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : status === 'failed'
              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              : status === 'waiting'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    return (
        <Badge variant='outline' className={variantClass}>
            {status}
        </Badge>
    );
}

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

export default function WorkflowExecutionsPage() {
    const { toast } = useToast();
    const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
    const [isLoadingExecutions, setIsLoadingExecutions] = useState<boolean>(true);
    const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
    const [executionEvents, setExecutionEvents] = useState<WorkflowExecutionEvent[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
    const [isWorkflowLoading, setIsWorkflowLoading] = useState<boolean>(false);

    const [workflowNodes, setWorkflowNodes] = useState<Node[]>([]);
    const [workflowEdges, setWorkflowEdges] = useState<Edge[]>([]);

    const eventRuns = buildEventRuns(executionEvents);
    const [selectedGraphNodeId, setSelectedGraphNodeId] = useState<string>('');

    // Sort active runs to extract the latest outcome per node ID for rendering graph node colors
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
            let borderColor = 'transparent';
            let shadow = 'none';

            if (run) {
                if (run.finalStatus === 'failed') {
                    borderColor = '#ef4444';
                    shadow = '0 0 0 3px rgba(239, 68, 68, 0.5)';
                } else if (run.finalStatus === 'completed') {
                    borderColor = '#22c55e';
                    shadow = '0 0 0 3px rgba(34, 197, 94, 0.5)';
                } else {
                    borderColor = '#3b82f6';
                    shadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
                }
            }

            const isSelected = selectedGraphNodeId === node.id;
            if (isSelected) {
                // Thicker shadow if selected
                shadow = `0 0 0 5px ${borderColor === 'transparent' ? '#64748b' : borderColor}`;
            }

            return {
                ...node,
                style: {
                    ...node.style,
                    boxShadow: shadow !== 'none' ? shadow : undefined,
                    transition: 'all 0.2s ease',
                    borderRadius: '0.65rem', // Match CustomNode slightly outer
                    cursor: 'pointer',
                },
            };
        });
    }, [workflowNodes, latestRunsMap, selectedGraphNodeId]);

    const selectedRun = eventRuns.findLast((r) => r.nodeId === selectedGraphNodeId) ?? null;

    useEffect(() => {
        const loadExecutions = async () => {
            setIsLoadingExecutions(true);
            try {
                const response = await ky.get('/api/get-workflow-executions').json<any[]>();
                setExecutions(
                    response.map((x) => ({
                        id: String(x.id ?? x.$id ?? ''),
                        applicationId: String(x.applicationId ?? ''),
                        jobId: String(x.jobId ?? ''),
                        workflowId: String(x.workflowId ?? ''),
                        status: x.status as WorkflowExecution['status'],
                        currentNodeId: x.currentNodeId as string | undefined,
                        updatedAt: String(x.updatedAt ?? ''),
                    }))
                );
            } catch (error) {
                console.error('Error loading workflow executions:', error);
                toast({
                    title: 'Error',
                    description: 'Could not load workflow executions.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoadingExecutions(false);
            }
        };

        loadExecutions();
    }, [toast]);

    const openExecution = async (execution: WorkflowExecution) => {
        setSelectedExecution(execution);
        setExecutionEvents([]);
        setWorkflowNodes([]);
        setWorkflowEdges([]);
        setIsLoadingEvents(true);
        setIsWorkflowLoading(true);
        setSelectedGraphNodeId('');
        
        try {
            const [eventsResp, workflowResp] = await Promise.allSettled([
                ky.get(`/api/get-workflow-execution-events?executionId=${encodeURIComponent(execution.id)}`).json<any[]>(),
                ky.get(`/api/get-workflow?workflowId=${encodeURIComponent(execution.workflowId)}`).json<any>()
            ]);

            if (eventsResp.status === 'fulfilled') {
                setExecutionEvents(
                    eventsResp.value.map((e: any) => ({
                        id: String(e.id ?? e.$id ?? ''),
                        nodeId: String(e.nodeId ?? ''),
                        stepType: String(e.stepType ?? ''),
                        status: e.status as WorkflowExecutionEvent['status'],
                        input: e.input as string | undefined,
                        output: e.output as string | undefined,
                        error: e.error as string | undefined,
                        createdAt: String(e.createdAt ?? ''),
                    }))
                );
            }

            if (workflowResp.status === 'fulfilled' && workflowResp.value) {
                const parsedNodes = JSON.parse(workflowResp.value.nodes).map(deserializeNode);
                const parsedEdges = JSON.parse(workflowResp.value.edges);
                setWorkflowNodes(parsedNodes);
                setWorkflowEdges(parsedEdges);
            }

        } catch (error) {
            console.error('Error loading execution timeline or workflow:', error);
            toast({
                title: 'Error',
                description: 'Could not load execution timeline fully.',
                variant: 'destructive',
            });
        } finally {
            setIsLoadingEvents(false);
            setIsWorkflowLoading(false);
        }
    };

    const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedGraphNodeId(node.id);
    }, []);

    const getNodeColorForMinimap = (node: Node) => {
        switch (node.type) {
            case NodeType.START:
                return '#10b981';
            case NodeType.END:
                return '#ef4444';
            case NodeType.TASK:
                const taskNode = node as WorkflowNode;
                if (taskNode.taskType === TaskType.NOTIFY) return '#3b82f6';
                if (taskNode.taskType === TaskType.ASSIGNMENT) return '#f59e0b';
                if (taskNode.taskType === TaskType.INTERVIEW) return '#8b5cf6';
                if (taskNode.taskType === TaskType.WAIT) return '#36c2e3';
                if (taskNode.taskType === TaskType.CONDITION) return '#0d9488';
                if (taskNode.taskType === TaskType.UPDATE_STATUS) return '#ea580c';
                return '#9ca3af';
            default:
                return '#9ca3af';
        }
    };

    return (
        <NavbarLayout>
            <div className='container mx-auto p-4 max-w-7xl'>
                <Card>
                    <CardHeader>
                        <CardTitle>Workflow Executions</CardTitle>
                        <CardDescription>Recent workflow runs. Click to view execution details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingExecutions ? (
                            <div className='space-y-2'>
                                {[1, 2, 3, 4].map((x) => (
                                    <Skeleton key={x} className='h-10 w-full' />
                                ))}
                            </div>
                        ) : executions.length === 0 ? (
                            <div className='text-sm text-muted-foreground'>No workflow executions yet.</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Application</TableHead>
                                        <TableHead>Job</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Current Node</TableHead>
                                        <TableHead>Updated</TableHead>
                                        <TableHead className='text-right'>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {executions.map((execution) => (
                                        <TableRow key={execution.id}>
                                            <TableCell className='font-medium'>{execution.applicationId.slice(0, 8)}</TableCell>
                                            <TableCell>{execution.jobId.slice(0, 8)}</TableCell>
                                            <TableCell>
                                                <ExecutionStatusBadge status={execution.status} />
                                            </TableCell>
                                            <TableCell className='max-w-[220px] truncate'>{execution.currentNodeId ?? '-'}</TableCell>
                                            <TableCell>{formatDate(execution.updatedAt)}</TableCell>
                                            <TableCell className='text-right'>
                                                <Button variant='outline' size='sm' onClick={() => openExecution(execution)}>
                                                    Open
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={!!selectedExecution} onOpenChange={(open) => !open && setSelectedExecution(null)}>
                    <DialogContent className='max-w-6xl w-[90vw] h-[85vh] p-0 overflow-hidden flex flex-col'>
                        <DialogHeader className='px-6 pt-6 pb-4 border-b shrink-0'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <DialogTitle className='text-xl'>Workflow Execution Detail</DialogTitle>
                                    <p className='text-sm text-muted-foreground mt-1'>
                                        Execution ID: <span className='font-mono'>{selectedExecution?.id}</span>
                                    </p>
                                </div>
                                {selectedExecution && (
                                    <div className='flex items-center gap-3'>
                                        <ExecutionStatusBadge status={selectedExecution.status} />
                                        <span className='text-xs text-muted-foreground'>Updated {formatDateTime(selectedExecution.updatedAt)}</span>
                                    </div>
                                )}
                            </div>
                        </DialogHeader>
                        
                        <div className='flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 divide-x'>
                            {/* Left Column: Workflow Tree (3/5 width) */}
                            <div className='lg:col-span-3 flex flex-col h-full min-h-0 bg-muted/5'>
                                <div className='p-4 border-b bg-muted/10 flex items-center justify-between'>
                                    <h3 className='font-medium text-sm'>Execution Graph</h3>
                                    <span className='text-[10px] uppercase tracking-wider text-muted-foreground font-bold'>Read-only View</span>
                                </div>
                                
                                <div className='flex-1 relative overflow-hidden'>
                                    <TooltipProvider>
                                        {(isLoadingEvents || isWorkflowLoading) && (
                                            <div className='absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50'>
                                                <div className='flex flex-col items-center gap-2'>
                                                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                                                    <p className='text-sm text-muted-foreground font-medium'>Loading workflow graph...</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {!isWorkflowLoading && workflowNodes.length === 0 ? (
                                            <div className='h-full flex items-center justify-center p-8 text-center'>
                                                <div className='max-w-xs space-y-2'>
                                                    <p className='text-sm font-medium text-destructive'>Graph not found</p>
                                                    <p className='text-xs text-muted-foreground'>Unable to load the workflow definition that created this execution.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <ReactFlow
                                                nodes={displayNodes}
                                                edges={workflowEdges}
                                                nodeTypes={nodeTypesConfig}
                                                edgeTypes={edgeTypesConfig}
                                                defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                                                minZoom={0.1}
                                                maxZoom={2}
                                                fitView
                                                fitViewOptions={{ padding: 0.2 }}
                                                nodesDraggable={false}
                                                nodesConnectable={false}
                                                elementsSelectable={true}
                                                onNodeClick={handleNodeClick}
                                                connectionLineType={ConnectionLineType.Bezier}
                                                className='react-flow-readonly'
                                            >
                                                <Background
                                                    variant={BackgroundVariant.Dots}
                                                    gap={12}
                                                    size={1}
                                                    color='rgba(0, 0, 0, 0.1)'
                                                />
                                                <MiniMap
                                                    nodeStrokeWidth={3}
                                                    zoomable
                                                    pannable
                                                    position='bottom-right'
                                                    nodeColor={getNodeColorForMinimap}
                                                    maskColor='rgba(255, 255, 255, 0.6)'
                                                />
                                                <Controls showInteractive={false} />
                                            </ReactFlow>
                                        )}
                                    </TooltipProvider>
                                </div>
                            </div>

                            {/* Right Column: Node Details (2/5 width) */}
                            <div className='lg:col-span-2 flex flex-col h-full min-h-0 bg-background'>
                                <div className='p-4 border-b bg-muted/10 flex items-center justify-between'>
                                    <h3 className='font-medium text-sm'>Step Details</h3>
                                    {selectedRun && (
                                        <Badge variant='outline' className={getRunTone(selectedRun.finalStatus).badgeTone}>
                                            {selectedRun.finalStatus}
                                        </Badge>
                                    )}
                                </div>
                                
                                <div className='flex-1 min-h-0'>
                                    <ScrollArea className='h-full'>
                                        {!selectedRun ? (
                                            <div className='h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground opacity-60'>
                                                <div className='mb-4 p-4 rounded-full bg-muted'>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                                                </div>
                                                <p className='text-sm font-medium'>Select a node from the graph</p>
                                                <p className='text-xs mt-1'>Click any execution step to view detailed input, output, and logs.</p>
                                            </div>
                                        ) : (
                                            <div className='p-6 space-y-6'>
                                                <div className='space-y-4'>
                                                    <div className='flex items-start justify-between'>
                                                        <div>
                                                            <h4 className='text-lg font-bold text-foreground'>{getStepDisplayName(selectedRun.stepType)}</h4>
                                                            <p className='text-xs text-muted-foreground font-mono mt-0.5'>Node ID: {selectedRun.nodeId}</p>
                                                        </div>
                                                    </div>

                                                    <div className='grid grid-cols-2 gap-4'>
                                                        <Card className='bg-muted/30 border-none shadow-none'>
                                                            <CardHeader className='p-3 pb-0'>
                                                                <CardDescription className='text-[10px] uppercase font-bold tracking-tight'>Time</CardDescription>
                                                            </CardHeader>
                                                            <CardContent className='p-3 pt-1'>
                                                                <p className='text-sm font-medium'>{selectedRun.startedAt ? formatDateTime(selectedRun.startedAt) : formatDateTime(selectedRun.endedAt ?? '')}</p>
                                                            </CardContent>
                                                        </Card>
                                                        <Card className='bg-muted/30 border-none shadow-none'>
                                                            <CardHeader className='p-3 pb-0'>
                                                                <CardDescription className='text-[10px] uppercase font-bold tracking-tight'>Duration</CardDescription>
                                                            </CardHeader>
                                                            <CardContent className='p-3 pt-1'>
                                                                <p className='text-sm font-medium'>{formatDuration(selectedRun.startedAt, selectedRun.endedAt) ?? '-'}</p>
                                                            </CardContent>
                                                        </Card>
                                                    </div>

                                                    <div>
                                                        <p className='text-sm leading-relaxed text-muted-foreground'>
                                                            {describeEvent({
                                                                id: selectedRun.events[selectedRun.events.length - 1]?.id ?? '',
                                                                nodeId: selectedRun.nodeId,
                                                                stepType: selectedRun.stepType,
                                                                status: selectedRun.finalStatus,
                                                                createdAt: selectedRun.endedAt ?? selectedRun.startedAt ?? '',
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className='space-y-4'>
                                                    {selectedRun.events.map((event, idx) => (
                                                        <div key={event.id} className={`rounded-xl border p-4 space-y-4 ${event.status === 'failed' ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20' : 'bg-background'}`}>
                                                            <div className='flex items-center justify-between'>
                                                                <Badge className={
                                                                    event.status === 'started' ? 'bg-blue-100 text-blue-800' :
                                                                    event.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }>
                                                                    {event.status.toUpperCase()}
                                                                </Badge>
                                                                <span className='text-[10px] text-muted-foreground font-mono'>{formatDateTime(event.createdAt)}</span>
                                                            </div>

                                                            {hasUsefulPayload(event.input) && (
                                                                <div className='space-y-1.5'>
                                                                    <div className='flex items-center gap-2'>
                                                                        <span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>Input</span>
                                                                    </div>
                                                                    <pre className='bg-muted/50 p-3 rounded-lg overflow-auto text-[11px] font-mono whitespace-pre-wrap break-all border group relative'>
                                                                        {formatContent(JSON.stringify(parseContent(event.input)))}
                                                                    </pre>
                                                                </div>
                                                            )}

                                                            {hasUsefulPayload(event.output) && (
                                                                <div className='space-y-1.5'>
                                                                    <div className='flex items-center gap-2'>
                                                                        <span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>Output</span>
                                                                    </div>
                                                                    <pre className='bg-muted/50 p-3 rounded-lg overflow-auto text-[11px] font-mono whitespace-pre-wrap break-all border'>
                                                                        {formatContent(JSON.stringify(parseContent(event.output)))}
                                                                    </pre>
                                                                </div>
                                                            )}

                                                            {event.error && (
                                                                <div className='space-y-1.5'>
                                                                    <div className='flex items-center gap-2'>
                                                                        <span className='text-[10px] font-bold uppercase tracking-wider text-red-600'>Error</span>
                                                                    </div>
                                                                    <pre className='bg-red-50 p-3 rounded-lg overflow-auto text-[11px] font-mono whitespace-pre-wrap break-all border border-red-100 text-red-700'>
                                                                        {event.error}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </NavbarLayout>
    );
}
