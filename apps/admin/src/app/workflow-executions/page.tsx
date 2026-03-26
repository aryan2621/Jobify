'use client';

import { useEffect, useState } from 'react';
import ky from 'ky';
import NavbarLayout from '@/layouts/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@jobify/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@jobify/ui/table';
import { Badge } from '@jobify/ui/badge';
import { Button } from '@jobify/ui/button';
import { Skeleton } from '@jobify/ui/skeleton';
import { Sheet, SheetContent } from '@jobify/ui/sheet';
import { ScrollArea } from '@jobify/ui/scroll-area';
import { useToast } from '@jobify/ui/use-toast';

type WorkflowExecution = {
    id: string;
    applicationId: string;
    jobId: string;
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

function getRunTone(status: WorkflowExecutionEvent['status']): {
    dot: string;
    line: string;
    cardBorder: string;
    badgeTone: string;
    nodeRing: string;
} {
    if (status === 'failed') {
        return {
            dot: 'bg-red-500',
            line: 'bg-red-200 dark:bg-red-900/40',
            cardBorder: 'border-red-200 dark:border-red-900/40',
            badgeTone: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            nodeRing: 'ring-red-200 dark:ring-red-900/40',
        };
    }
    if (status === 'completed') {
        return {
            dot: 'bg-green-500',
            line: 'bg-green-200 dark:bg-green-900/40',
            cardBorder: 'border-green-200 dark:border-green-900/40',
            badgeTone: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            nodeRing: 'ring-green-200 dark:ring-green-900/40',
        };
    }
    return {
        dot: 'bg-blue-500',
        line: 'bg-blue-200 dark:bg-blue-900/40',
        cardBorder: 'border-blue-200 dark:border-blue-900/40',
        badgeTone: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        nodeRing: 'ring-blue-200 dark:ring-blue-900/40',
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

export default function WorkflowExecutionsPage() {
    const { toast } = useToast();
    const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
    const [isLoadingExecutions, setIsLoadingExecutions] = useState<boolean>(true);
    const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
    const [executionEvents, setExecutionEvents] = useState<WorkflowExecutionEvent[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
    const eventRuns = buildEventRuns(executionEvents);

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
        setIsLoadingEvents(true);
        try {
            const events = await ky.get(`/api/get-workflow-execution-events?executionId=${encodeURIComponent(execution.id)}`).json<any[]>();
            setExecutionEvents(
                events.map((e) => ({
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
        } catch (error) {
            console.error('Error loading execution events:', error);
            toast({
                title: 'Error',
                description: 'Could not load execution timeline.',
                variant: 'destructive',
            });
        } finally {
            setIsLoadingEvents(false);
        }
    };

    return (
        <NavbarLayout>
            <div className='container mx-auto p-4 max-w-7xl'>
                <Card>
                    <CardHeader>
                        <CardTitle>Workflow Executions</CardTitle>
                        <CardDescription>Recent workflow runs. Click to open timeline drawer.</CardDescription>
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

                <Sheet open={!!selectedExecution} onOpenChange={(open) => !open && setSelectedExecution(null)}>
                    <SheetContent side='right' className='w-full sm:max-w-2xl overflow-hidden'>
                        <div className='h-full min-h-0 flex flex-col space-y-4'>
                            <div className='shrink-0'>
                                <h3 className='text-lg font-semibold'>Execution Timeline</h3>
                                {selectedExecution && (
                                    <p className='text-sm text-muted-foreground'>
                                        Detailed step-by-step trace of this workflow run, including inputs, outputs, failures, and timestamps.
                                    </p>
                                )}
                            </div>
                            {isLoadingEvents ? (
                                <div className='space-y-2'>
                                    {[1, 2, 3].map((x) => (
                                        <Skeleton key={x} className='h-20 w-full' />
                                    ))}
                                </div>
                            ) : executionEvents.length === 0 ? (
                                <div className='text-sm text-muted-foreground'>No events captured yet.</div>
                            ) : (
                                <ScrollArea className='flex-1 min-h-0 pr-3'>
                                    <div className='space-y-6 px-2 pb-4'>
                                        {eventRuns.map((run, index) => (
                                            <div key={run.key} className='relative mx-auto max-w-xl'>
                                                {index !== eventRuns.length - 1 && (
                                                    <div
                                                        className={`absolute left-1/2 top-[100%] z-0 h-6 w-0.5 -translate-x-1/2 ${getRunTone(run.finalStatus).line}`}
                                                    />
                                                )}
                                                <div className='absolute left-1/2 top-[-10px] z-20 h-5 w-5 -translate-x-1/2 rounded-full border bg-background shadow-sm'>
                                                    <div className={`m-auto mt-[5px] h-2 w-2 rounded-full ${getRunTone(run.finalStatus).dot}`} />
                                                </div>
                                                <Card className={`relative z-10 border-2 shadow-md ${getRunTone(run.finalStatus).cardBorder} ${getRunTone(run.finalStatus).nodeRing} ring-1`}>
                                                    <CardHeader className='pb-2'>
                                                    <div className='flex items-center justify-between gap-2'>
                                                        <div className='text-sm font-medium'>
                                                            Step {index + 1}: {getStepDisplayName(run.stepType)}
                                                        </div>
                                                        <Badge variant='outline' className={getRunTone(run.finalStatus).badgeTone}>
                                                            {run.finalStatus}
                                                        </Badge>
                                                    </div>
                                                    <CardDescription>
                                                        {run.startedAt ? formatDateTime(run.startedAt) : formatDateTime(run.endedAt ?? '')}
                                                    </CardDescription>
                                                    </CardHeader>
                                                    <CardContent className='space-y-2 text-xs'>
                                                    <div>
                                                        <div className='font-medium mb-1'>What Happened</div>
                                                        <p className='text-muted-foreground'>
                                                            {describeEvent({
                                                                id: run.events[run.events.length - 1]?.id ?? '',
                                                                nodeId: run.nodeId,
                                                                stepType: run.stepType,
                                                                status: run.finalStatus,
                                                                createdAt: run.endedAt ?? run.startedAt ?? '',
                                                            })}
                                                        </p>
                                                    </div>
                                                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
                                                        <div className='rounded bg-muted/50 p-2'>
                                                            <div className='font-medium mb-1'>Step Type</div>
                                                            <div>{getStepDisplayName(run.stepType)}</div>
                                                        </div>
                                                        <div className='rounded bg-muted/50 p-2'>
                                                            <div className='font-medium mb-1'>Run Status</div>
                                                            <div>{run.finalStatus}</div>
                                                        </div>
                                                        <div className='rounded bg-muted/50 p-2'>
                                                            <div className='font-medium mb-1'>Duration</div>
                                                            <div>{formatDuration(run.startedAt, run.endedAt) ?? '-'}</div>
                                                        </div>
                                                    </div>
                                                    <div className='space-y-2 pt-1'>
                                                        {run.events.map((event) => (
                                                            <div key={event.id} className='rounded border bg-background p-2'>
                                                                <div className='mb-2 flex items-center justify-between gap-2'>
                                                                    <div className='font-medium'>Event: {event.status}</div>
                                                                    <div className='text-muted-foreground'>{formatDateTime(event.createdAt)}</div>
                                                                </div>
                                                                {hasUsefulPayload(event.input) && (
                                                                    <div className='mb-2'>
                                                                        <div className='font-medium mb-1'>Input</div>
                                                                        <pre className='bg-muted p-2 rounded overflow-auto whitespace-pre-wrap break-all'>
                                                                            {formatContent(JSON.stringify(parseContent(event.input)))}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                                {hasUsefulPayload(event.output) && (
                                                                    <div className='mb-2'>
                                                                        <div className='font-medium mb-1'>Output</div>
                                                                        <pre className='bg-muted p-2 rounded overflow-auto whitespace-pre-wrap break-all'>
                                                                            {formatContent(JSON.stringify(parseContent(event.output)))}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                                {event.error && (
                                                                    <div>
                                                                        <div className='font-medium mb-1 text-destructive'>Error</div>
                                                                        <pre className='bg-destructive/10 p-2 rounded overflow-auto whitespace-pre-wrap break-all'>
                                                                            {formatContent(event.error)}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    </CardContent>
                                                </Card>
                                                <div className='absolute bottom-[-10px] left-1/2 z-20 h-5 w-5 -translate-x-1/2 rounded-full border bg-background shadow-sm'>
                                                    <div className={`m-auto mt-[5px] h-2 w-2 rounded-full ${getRunTone(run.finalStatus).dot}`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </NavbarLayout>
    );
}
