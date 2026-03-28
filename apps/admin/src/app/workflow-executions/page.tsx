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
import { Loader2 } from 'lucide-react';
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
    formatEventPayloadDisplay,
} from './utils/workflow-execution-utils';

export default function WorkflowExecutionsPage() {
    const { toast } = useToast();
    const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
    const [isLoadingExecutions, setIsLoadingExecutions] = useState(true);
    const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
    const [executionEvents, setExecutionEvents] = useState<WorkflowExecutionEvent[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [selectedRunKey, setSelectedRunKey] = useState('');

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

    const openExecution = async (execution: WorkflowExecution) => {
        setSelectedExecution(execution);
        setExecutionEvents([]);
        setWorkflowNodes([]);
        setWorkflowEdges([]);
        setIsLoadingEvents(true);
        setIsWorkflowLoading(true);
        setSelectedRunKey('');

        try {
            const [eventsResp, workflowResp] = await Promise.allSettled([
                ky.get(`/api/get-workflow-execution-events?executionId=${encodeURIComponent(execution.id)}`).json<any[]>(),
                ky.get(`/api/get-workflow?workflowId=${encodeURIComponent(execution.workflowId)}`).json<any>(),
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

        } catch (error) {
            toast({ title: 'Error', description: 'Could not load execution timeline fully.', variant: 'destructive' });
        } finally {
            setIsLoadingEvents(false);
            setIsWorkflowLoading(false);
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
                            setExecutionEvents([]);
                            setSelectedRunKey('');
                        }
                    }}
                >
                    <DialogContent className='max-w-7xl w-[95vw] h-[92vh] p-0 overflow-hidden flex flex-col'>
                        <DialogHeader className='px-6 pt-6 pb-4 border-b shrink-0'>
                            <div className='flex items-center justify-between gap-4'>
                                <div>
                                    <DialogTitle className='text-xl'>Workflow Execution</DialogTitle>
                                    <p className='text-xs text-muted-foreground mt-1'>
                                        Flow graph and step timeline for this run.
                                    </p>
                                </div>
                                {selectedExecution && (
                                    <div className='flex items-center gap-3 shrink-0'>
                                        <ExecutionStatusBadge status={selectedExecution.status} />
                                        <span className='text-xs text-muted-foreground hidden sm:inline'>
                                            Updated {formatDateTime(selectedExecution.updatedAt)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </DialogHeader>

                        {selectedExecution?.error && (
                            <div className='bg-destructive/10 border-b border-destructive/20 px-6 py-2 text-xs text-destructive flex items-center gap-2 font-medium'>
                                <span className='shrink-0 p-0.5 bg-destructive text-white rounded-full'>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </span>
                                <div>
                                    <span className='font-bold uppercase tracking-tight mr-1'>Runner error:</span>
                                    {selectedExecution.error}
                                </div>
                            </div>
                        )}

                        <div className='flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 divide-x'>
                            <div className='lg:col-span-7 flex flex-col h-full min-h-0 bg-muted/5'>
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

                            <div className='lg:col-span-5 flex flex-col h-full min-h-0 bg-background'>
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
                                                <p className='text-sm font-medium'>Select a node from the graph to see details</p>
                                            </div>
                                        ) : (
                                            <div className='p-5 space-y-5'>
                                                <div className='flex items-center justify-between border-b pb-4 mb-2'>
                                                    <h3 className='font-semibold text-sm'>Step Details</h3>
                                                    <Badge variant='outline' className={getRunTone(selectedRun.finalStatus)}>
                                                        {selectedRun.finalStatus}
                                                    </Badge>
                                                </div>
                                                <div className='space-y-4'>
                                                    <div>
                                                        <h4 className='text-lg font-bold text-foreground'>
                                                            {getStepDisplayName(selectedRun.stepType)}
                                                        </h4>
                                                    </div>

                                                    <div className='grid grid-cols-2 gap-3'>
                                                        <div className='bg-muted/30 rounded-lg p-2.5 space-y-1'>
                                                            <div className='text-[10px] uppercase font-bold tracking-tight text-muted-foreground'>Time</div>
                                                            <p className='text-xs font-medium'>
                                                                {selectedRun.startedAt
                                                                    ? formatDateTime(selectedRun.startedAt)
                                                                    : formatDateTime(selectedRun.endedAt ?? '')}
                                                            </p>
                                                        </div>
                                                        <div className='bg-muted/30 rounded-lg p-2.5 space-y-1'>
                                                            <div className='text-[10px] uppercase font-bold tracking-tight text-muted-foreground'>Duration</div>
                                                            <p className='text-xs font-medium'>
                                                                {formatDuration(selectedRun.startedAt, selectedRun.endedAt) ?? '-'}
                                                            </p>
                                                        </div>
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

                                                            {event.input && (
                                                                <div className='space-y-1.5'>
                                                                    <span className='text-[9px] font-bold uppercase tracking-wider text-muted-foreground'>
                                                                        Input
                                                                    </span>
                                                                    <pre className='bg-muted/50 p-3 rounded-lg overflow-auto text-[11px] font-mono whitespace-pre-wrap break-all border max-h-40'>
                                                                        {formatEventPayloadDisplay(event.input)}
                                                                    </pre>
                                                                </div>
                                                            )}

                                                            {event.output && (
                                                                <div className='space-y-1.5'>
                                                                    <span className='text-[9px] font-bold uppercase tracking-wider text-muted-foreground'>
                                                                        Output
                                                                    </span>
                                                                    <pre className='bg-muted/50 p-3 rounded-lg overflow-auto text-[11px] font-mono whitespace-pre-wrap break-all border max-h-40'>
                                                                        {formatEventPayloadDisplay(event.output)}
                                                                    </pre>
                                                                </div>
                                                            )}

                                                            {event.error && (
                                                                <div className='space-y-1.5'>
                                                                    <span className='text-[9px] font-bold uppercase tracking-wider text-red-600'>
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
