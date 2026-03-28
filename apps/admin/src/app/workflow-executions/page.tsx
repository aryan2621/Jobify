'use client';

import { useEffect, useState } from 'react';
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
import { Loader2, Copy, Check } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';

import { WorkflowExecutionGraph } from './WorkflowExecutionGraph';
import { ExecutionStatusBadge } from './components/ExecutionStatusBadge';
import { WorkflowExecution, WorkflowExecutionEvent } from './utils/types';
import { deserializeNode } from '@/lib/utils/workflow-utils';
import {
    formatDate,
    formatDateTime,
    getStepDisplayName,
    describeEvent,
    formatDuration,
    buildEventRuns,
    getRunTone,
    formatJsonValue,
    formatEventPayloadDisplay,
} from './utils/workflow-execution-utils';

export default function WorkflowExecutionsPage() {
    const { toast } = useToast();
    const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
    const [isLoadingExecutions, setIsLoadingExecutions] = useState(true);
    const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
    const [executionDetail, setExecutionDetail] = useState<WorkflowExecution | null>(null);
    const [executionEvents, setExecutionEvents] = useState<WorkflowExecutionEvent[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [isLoadingExecutionDetail, setIsLoadingExecutionDetail] = useState(false);
    const [selectedRunKey, setSelectedRunKey] = useState('');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const [workflowNodes, setWorkflowNodes] = useState<Node[]>([]);
    const [workflowEdges, setWorkflowEdges] = useState<Edge[]>([]);
    const [isWorkflowLoading, setIsWorkflowLoading] = useState(false);

    const eventRuns = buildEventRuns(executionEvents);
    const selectedRun = eventRuns.find((r) => r.key === selectedRunKey) ?? null;

    useEffect(() => {
        const load = async () => {
            setIsLoadingExecutions(true);
            try {
                const response = await ky.get('/api/get-workflow-executions').json<any[]>();
                setExecutions(
                    response.map(
                        (x) =>
                            ({
                                id: String(x.id ?? x.$id ?? ''),
                                applicationId: String(x.applicationId ?? ''),
                                jobId: String(x.jobId ?? ''),
                                status: x.status as WorkflowExecution['status'],
                                currentNodeId: x.currentNodeId as string | undefined,
                                workflowId: String(x.workflowId ?? ''),
                                updatedAt: String(x.updatedAt ?? ''),
                                recruiterId: x.recruiterId != null ? String(x.recruiterId) : undefined,
                                stage: x.stage != null ? String(x.stage) : undefined,
                                nextRunAt: x.nextRunAt != null ? String(x.nextRunAt) : undefined,
                                error: x.error != null ? String(x.error) : undefined,
                                startedAt: x.startedAt != null ? String(x.startedAt) : undefined,
                                completedAt: x.completedAt != null ? String(x.completedAt) : undefined,
                            }) satisfies WorkflowExecution
                    )
                );
            } catch (error) {
                toast({ title: 'Error', description: 'Could not load workflow executions.', variant: 'destructive' });
            } finally {
                setIsLoadingExecutions(false);
            }
        };
        load();
    }, [toast]);

    const copyToClipboard = async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 2000);
            toast({ title: 'Copied', description: 'Value copied to clipboard.' });
        } catch {
            toast({ title: 'Copy failed', variant: 'destructive' });
        }
    };

    const openExecution = async (execution: WorkflowExecution) => {
        setSelectedExecution(execution);
        setExecutionDetail(null);
        setExecutionEvents([]);
        setWorkflowNodes([]);
        setWorkflowEdges([]);
        setIsLoadingEvents(true);
        setIsLoadingExecutionDetail(true);
        setIsWorkflowLoading(true);
        setSelectedRunKey('');

        try {
            const [eventsResp, workflowResp, detailResp] = await Promise.allSettled([
                ky.get(`/api/get-workflow-execution-events?executionId=${encodeURIComponent(execution.id)}`).json<any[]>(),
                ky.get(`/api/get-workflow?workflowId=${encodeURIComponent(execution.workflowId)}`).json<any>(),
                ky.get(`/api/get-workflow-execution?executionId=${encodeURIComponent(execution.id)}`).json<any>(),
            ]);

            if (eventsResp.status === 'fulfilled') {
                setExecutionEvents(
                    eventsResp.value.map((e: any) => ({
                        id: String(e.id ?? e.$id ?? ''),
                        nodeId: String(e.nodeId ?? ''),
                        nodeType: e.nodeType != null ? String(e.nodeType) : undefined,
                        stepType: String(e.stepType ?? ''),
                        status: e.status as WorkflowExecutionEvent['status'],
                        input: e.input as string | undefined,
                        output: e.output as string | undefined,
                        error: e.error as string | undefined,
                        createdAt: String(e.createdAt ?? ''),
                        executionId: e.executionId != null ? String(e.executionId) : undefined,
                        applicationId: e.applicationId != null ? String(e.applicationId) : undefined,
                        jobId: e.jobId != null ? String(e.jobId) : undefined,
                        workflowId: e.workflowId != null ? String(e.workflowId) : undefined,
                        recruiterId: e.recruiterId != null ? String(e.recruiterId) : undefined,
                    }))
                );
            }

            if (workflowResp.status === 'fulfilled' && workflowResp.value) {
                const parsedNodes = JSON.parse(workflowResp.value.nodes).map(deserializeNode);
                const parsedEdges = JSON.parse(workflowResp.value.edges);
                setWorkflowNodes(parsedNodes);
                setWorkflowEdges(parsedEdges);
            }

            if (detailResp.status === 'fulfilled' && detailResp.value) {
                const d = detailResp.value;
                setExecutionDetail({
                    id: String(d.id ?? ''),
                    applicationId: String(d.applicationId ?? ''),
                    jobId: String(d.jobId ?? ''),
                    status: d.status as WorkflowExecution['status'],
                    currentNodeId: d.currentNodeId as string | undefined,
                    workflowId: String(d.workflowId ?? ''),
                    updatedAt: String(d.updatedAt ?? ''),
                    recruiterId: d.recruiterId != null ? String(d.recruiterId) : undefined,
                    stage: d.stage != null ? String(d.stage) : undefined,
                    nextRunAt: d.nextRunAt != null ? String(d.nextRunAt) : undefined,
                    error: d.error != null ? String(d.error) : undefined,
                    startedAt: d.startedAt != null ? String(d.startedAt) : undefined,
                    completedAt: d.completedAt != null ? String(d.completedAt) : undefined,
                    state: d.state && typeof d.state === 'object' && !Array.isArray(d.state) ? d.state : undefined,
                });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Could not load execution timeline fully.', variant: 'destructive' });
        } finally {
            setIsLoadingEvents(false);
            setIsLoadingExecutionDetail(false);
            setIsWorkflowLoading(false);
        }
    };

    const debugExecution = executionDetail ?? selectedExecution;

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
                                {[1, 2, 3, 4].map((x) => <Skeleton key={x} className='h-10 w-full' />)}
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
                                        <TableHead>Updated</TableHead>
                                        <TableHead className='text-right'>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {executions.map((execution) => (
                                        <TableRow key={execution.id}>
                                            <TableCell
                                                className='font-medium max-w-[140px] truncate'
                                                title={execution.applicationId}
                                            >
                                                {execution.applicationId}
                                            </TableCell>
                                            <TableCell className='max-w-[120px] truncate' title={execution.jobId}>
                                                {execution.jobId}
                                            </TableCell>
                                            <TableCell><ExecutionStatusBadge status={execution.status} /></TableCell>
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

                <Dialog
                    open={!!selectedExecution}
                    onOpenChange={(open) => {
                        if (!open) {
                            setSelectedExecution(null);
                            setExecutionDetail(null);
                            setExecutionEvents([]);
                            setSelectedRunKey('');
                        }
                    }}
                >
                    <DialogContent className='max-w-6xl w-[90vw] h-[90vh] p-0 overflow-hidden flex flex-col'>
                        <DialogHeader className='px-6 pt-6 pb-4 border-b shrink-0'>
                            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                                <div>
                                    <DialogTitle className='text-xl'>Workflow Execution Detail</DialogTitle>
                                    <p className='text-xs text-muted-foreground mt-1'>
                                        IDs, persisted state, and step payloads for debugging (no need to dig in logs).
                                    </p>
                                </div>
                                {selectedExecution && (
                                    <div className='flex items-center gap-3 shrink-0'>
                                        <ExecutionStatusBadge status={selectedExecution.status} />
                                        <span className='text-xs text-muted-foreground'>
                                            Updated {formatDateTime(selectedExecution.updatedAt)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </DialogHeader>

                        {selectedExecution && (
                            <div className='shrink-0 border-b bg-muted/20 px-6 py-4 max-h-[38vh] overflow-y-auto space-y-4'>
                                <div className='flex items-center justify-between gap-2'>
                                    <h4 className='text-sm font-semibold'>Execution record</h4>
                                    {isLoadingExecutionDetail && (
                                        <span className='text-xs text-muted-foreground flex items-center gap-1'>
                                            <Loader2 className='h-3 w-3 animate-spin' />
                                            Loading full record…
                                        </span>
                                    )}
                                </div>
                                {debugExecution?.error && (
                                    <div className='rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
                                        <span className='font-medium'>Runner error: </span>
                                        {debugExecution.error}
                                    </div>
                                )}
                                <div className='grid gap-2 text-xs sm:grid-cols-2'>
                                    {(
                                        [
                                            ['Execution id', debugExecution?.id],
                                            ['Application id', debugExecution?.applicationId],
                                            ['Job id', debugExecution?.jobId],
                                            ['Workflow id', debugExecution?.workflowId],
                                            ['Recruiter id', debugExecution?.recruiterId],
                                            ['Status', debugExecution?.status],
                                            ['Stage', debugExecution?.stage],
                                            ['Current node id', debugExecution?.currentNodeId],
                                            ['Next run at', debugExecution?.nextRunAt],
                                            ['Started', debugExecution?.startedAt],
                                            ['Completed', debugExecution?.completedAt],
                                        ] as const
                                    ).map(([label, val]) => {
                                        const text = val != null && String(val).length > 0 ? String(val) : '—';
                                        const ck = `${label}-${text}`;
                                        return (
                                            <div
                                                key={label}
                                                className='flex items-start gap-2 rounded-md border bg-background/80 p-2'
                                            >
                                                <div className='min-w-0 flex-1'>
                                                    <div className='text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>
                                                        {label}
                                                    </div>
                                                    <div className='mt-0.5 break-all font-mono text-[11px]'>{text}</div>
                                                </div>
                                                {text !== '—' && (
                                                    <Button
                                                        type='button'
                                                        variant='ghost'
                                                        size='icon'
                                                        className='h-7 w-7 shrink-0'
                                                        onClick={() => copyToClipboard(String(val), ck)}
                                                        title='Copy'
                                                    >
                                                        {copiedKey === ck ? (
                                                            <Check className='h-3.5 w-3.5 text-green-600' />
                                                        ) : (
                                                            <Copy className='h-3.5 w-3.5' />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <details className='group rounded-md border bg-background/80'>
                                    <summary className='cursor-pointer select-none px-3 py-2 text-xs font-semibold'>
                                        Persisted state (workflowState, etc.){' '}
                                        <span className='font-normal text-muted-foreground'>
                                            — open for condition / assignment submit debugging
                                        </span>
                                    </summary>
                                    <div className='border-t p-3'>
                                        {debugExecution?.state && Object.keys(debugExecution.state).length > 0 ? (
                                            <pre className='max-h-48 overflow-auto rounded-md bg-muted/50 p-3 text-[11px] leading-relaxed'>
                                                {formatJsonValue(debugExecution.state)}
                                            </pre>
                                        ) : (
                                            <p className='text-xs text-muted-foreground'>
                                                {isLoadingExecutionDetail
                                                    ? 'Loading…'
                                                    : 'No state object on this execution (or empty).'}
                                            </p>
                                        )}
                                    </div>
                                </details>
                                <p className='text-[11px] text-muted-foreground'>
                                    Event count: {executionEvents.length}. Tip: use{' '}
                                    <span className='font-mono'>workflowState.&lt;assignmentNodeId&gt;</span> in conditions;
                                    values appear here after candidate submit.
                                </p>
                            </div>
                        )}

                        <div className='flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 divide-x'>
                            <div className='lg:col-span-3 flex flex-col h-full min-h-0 bg-muted/5'>
                                <div className='p-4 border-b bg-muted/10 flex items-center justify-between shrink-0'>
                                    <h3 className='font-medium text-sm'>Execution Graph</h3>
                                    <span className='text-[10px] uppercase tracking-wider text-muted-foreground font-bold'>
                                        Read-only · XYFlow
                                    </span>
                                </div>

                                <div className='flex-1 relative overflow-hidden'>
                                    {(isLoadingEvents || isWorkflowLoading) ? (
                                        <div className='absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10'>
                                            <div className='flex flex-col items-center gap-2'>
                                                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                                                <p className='text-sm text-muted-foreground font-medium'>Loading workflow graph…</p>
                                            </div>
                                        </div>
                                    ) : !isWorkflowLoading && workflowNodes.length === 0 ? (
                                        <div className='h-full flex items-center justify-center p-8 text-center'>
                                            <div className='max-w-xs space-y-2'>
                                                <p className='text-sm font-medium text-destructive'>Graph not found</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <WorkflowExecutionGraph
                                            workflowNodes={workflowNodes}
                                            workflowEdges={workflowEdges}
                                            eventRuns={eventRuns}
                                            selectedRunKey={selectedRunKey}
                                            onSelectRun={(run) => setSelectedRunKey(run.key)}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className='lg:col-span-2 flex flex-col h-full min-h-0 bg-background'>
                                <div className='p-4 border-b bg-muted/10 flex items-center justify-between shrink-0'>
                                    <h3 className='font-medium text-sm'>Step Details</h3>
                                    {selectedRun && (
                                        <Badge variant='outline' className={getRunTone(selectedRun.finalStatus)}>
                                            {selectedRun.finalStatus}
                                        </Badge>
                                    )}
                                </div>

                                <div className='flex-1 min-h-0'>
                                    <ScrollArea className='h-full'>
                                        {!selectedRun ? (
                                            <div className='h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground opacity-60'>
                                                <div className='mb-4 p-4 rounded-full bg-muted'>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <path d="M12 16v-4" />
                                                        <path d="M12 8h.01" />
                                                    </svg>
                                                </div>
                                                <p className='text-sm font-medium'>Select a node from the graph</p>
                                            </div>
                                        ) : (
                                            <div className='p-6 space-y-6'>
                                                <div className='space-y-4'>
                                                    <div className='flex items-start justify-between gap-2'>
                                                        <div>
                                                            <h4 className='text-lg font-bold text-foreground'>
                                                                {getStepDisplayName(selectedRun.stepType)}
                                                            </h4>
                                                            <p className='mt-1 text-xs font-mono text-muted-foreground break-all'>
                                                                nodeId: {selectedRun.nodeId}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className='grid grid-cols-2 gap-4'>
                                                        <Card className='bg-muted/30 border-none shadow-none'>
                                                            <CardHeader className='p-3 pb-0'>
                                                                <CardDescription className='text-[10px] uppercase font-bold tracking-tight'>Time</CardDescription>
                                                            </CardHeader>
                                                            <CardContent className='p-3 pt-1'>
                                                                <p className='text-sm font-medium'>
                                                                    {selectedRun.startedAt
                                                                        ? formatDateTime(selectedRun.startedAt)
                                                                        : formatDateTime(selectedRun.endedAt ?? '')}
                                                                </p>
                                                            </CardContent>
                                                        </Card>
                                                        <Card className='bg-muted/30 border-none shadow-none'>
                                                            <CardHeader className='p-3 pb-0'>
                                                                <CardDescription className='text-[10px] uppercase font-bold tracking-tight'>Duration</CardDescription>
                                                            </CardHeader>
                                                            <CardContent className='p-3 pt-1'>
                                                                <p className='text-sm font-medium'>
                                                                    {formatDuration(selectedRun.startedAt, selectedRun.endedAt) ?? '-'}
                                                                </p>
                                                            </CardContent>
                                                        </Card>
                                                    </div>

                                                    <p className='text-sm leading-relaxed text-muted-foreground'>
                                                        {describeEvent({
                                                            id: '',
                                                            nodeId: selectedRun.nodeId,
                                                            stepType: selectedRun.stepType,
                                                            status: selectedRun.finalStatus,
                                                            createdAt: selectedRun.endedAt ?? selectedRun.startedAt ?? '',
                                                        })}
                                                    </p>
                                                </div>

                                                <div className='space-y-4'>
                                                    {selectedRun.events.map((event) => (
                                                        <div
                                                            key={event.id}
                                                            className={`rounded-xl border p-4 space-y-3 ${event.status === 'failed'
                                                                    ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20'
                                                                    : 'bg-background'
                                                                }`}
                                                        >
                                                            <div className='flex flex-wrap items-center justify-between gap-2'>
                                                                <Badge
                                                                    className={
                                                                        event.status === 'started'
                                                                            ? 'bg-blue-100 text-blue-800'
                                                                            : event.status === 'completed'
                                                                              ? 'bg-green-100 text-green-800'
                                                                              : 'bg-red-100 text-red-800'
                                                                    }
                                                                >
                                                                    {event.status.toUpperCase()}
                                                                </Badge>
                                                                <span className='text-[10px] text-muted-foreground font-mono'>
                                                                    {formatDateTime(event.createdAt)}
                                                                </span>
                                                            </div>
                                                            <div className='grid gap-1 text-[10px] text-muted-foreground font-mono'>
                                                                <div>
                                                                    <span className='font-semibold text-foreground'>Event id: </span>
                                                                    {event.id}
                                                                </div>
                                                                <div>
                                                                    <span className='font-semibold text-foreground'>Node id: </span>
                                                                    {event.nodeId}
                                                                </div>
                                                                {event.nodeType && (
                                                                    <div>
                                                                        <span className='font-semibold text-foreground'>Node type: </span>
                                                                        {event.nodeType}
                                                                    </div>
                                                                )}
                                                                {event.executionId && (
                                                                    <div>
                                                                        <span className='font-semibold text-foreground'>Execution id: </span>
                                                                        {event.executionId}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className='space-y-1.5'>
                                                                <span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
                                                                    Input
                                                                </span>
                                                                <pre className='bg-muted/50 p-3 rounded-lg overflow-auto text-[11px] font-mono whitespace-pre-wrap break-all border max-h-40'>
                                                                    {formatEventPayloadDisplay(event.input)}
                                                                </pre>
                                                            </div>

                                                            <div className='space-y-1.5'>
                                                                <span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
                                                                    Output
                                                                </span>
                                                                <pre className='bg-muted/50 p-3 rounded-lg overflow-auto text-[11px] font-mono whitespace-pre-wrap break-all border max-h-40'>
                                                                    {formatEventPayloadDisplay(event.output)}
                                                                </pre>
                                                            </div>

                                                            {event.error && (
                                                                <div className='space-y-1.5'>
                                                                    <span className='text-[10px] font-bold uppercase tracking-wider text-red-600'>
                                                                        Error
                                                                    </span>
                                                                    <pre className='bg-red-50 dark:bg-red-950/30 p-3 rounded-lg overflow-auto text-[11px] font-mono whitespace-pre-wrap break-all border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-300'>
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
