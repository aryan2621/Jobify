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

import { WorkflowExecutionGraph } from './WorkflowExecutionGraph';
import { ExecutionStatusBadge } from './components/ExecutionStatusBadge';
import { WorkflowExecution, WorkflowExecutionEvent } from './utils/types';
import {
    formatDate,
    formatDateTime,
    formatContent,
    parseContent,
    getStepDisplayName,
    describeEvent,
    formatDuration,
    hasUsefulPayload,
    buildEventRuns,
    getRunTone
} from './utils/workflow-execution-utils';

export default function WorkflowExecutionsPage() {
    const { toast } = useToast();
    const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
    const [isLoadingExecutions, setIsLoadingExecutions] = useState(true);
    const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
    const [executionEvents, setExecutionEvents] = useState<WorkflowExecutionEvent[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [selectedRunKey, setSelectedRunKey] = useState('');

    const eventRuns = buildEventRuns(executionEvents);
    const selectedRun = eventRuns.find((r) => r.key === selectedRunKey) ?? null;

    useEffect(() => {
        const load = async () => {
            setIsLoadingExecutions(true);
            try {
                const response = await ky.get('/api/get-workflow-executions').json<any[]>();
                setExecutions(response.map((x) => ({
                    id: String(x.id ?? x.$id ?? ''),
                    applicationId: String(x.applicationId ?? ''),
                    jobId: String(x.jobId ?? ''),
                    status: x.status as WorkflowExecution['status'],
                    currentNodeId: x.currentNodeId as string | undefined,
                    updatedAt: String(x.updatedAt ?? ''),
                })));
            } catch {
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
        setIsLoadingEvents(true);
        setSelectedRunKey('');
        try {
            const events = await ky
                .get(`/api/get-workflow-execution-events?executionId=${encodeURIComponent(execution.id)}`)
                .json<any[]>();
            setExecutionEvents(events.map((e) => ({
                id: String(e.id ?? e.$id ?? ''),
                nodeId: String(e.nodeId ?? ''),
                stepType: String(e.stepType ?? ''),
                status: e.status as WorkflowExecutionEvent['status'],
                input: e.input as string | undefined,
                output: e.output as string | undefined,
                error: e.error as string | undefined,
                createdAt: String(e.createdAt ?? ''),
            })));
        } catch {
            toast({ title: 'Error', description: 'Could not load execution timeline.', variant: 'destructive' });
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
                                            <TableCell className='font-medium'>{execution.applicationId.slice(0, 8)}</TableCell>
                                            <TableCell>{execution.jobId.slice(0, 8)}</TableCell>
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
                                        <span className='text-xs text-muted-foreground'>
                                            Updated {formatDateTime(selectedExecution.updatedAt)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </DialogHeader>

                        <div className='flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 divide-x'>
                            <div className='lg:col-span-3 flex flex-col h-full min-h-0'>
                                <div className='p-4 border-b bg-muted/10 flex items-center justify-between shrink-0'>
                                    <h3 className='font-medium text-sm'>Execution Path</h3>
                                    <span className='text-[10px] uppercase tracking-wider text-muted-foreground font-bold'>
                                        Read-only · Click nodes for details
                                    </span>
                                </div>

                                <div className='flex-1 relative overflow-hidden'>
                                    {isLoadingEvents ? (
                                        <div className='absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10'>
                                            <div className='flex flex-col items-center gap-2'>
                                                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary' />
                                                <p className='text-sm text-muted-foreground font-medium'>Loading timeline…</p>
                                            </div>
                                        </div>
                                    ) : executionEvents.length === 0 ? (
                                        <div className='h-full flex items-center justify-center p-8 text-center'>
                                            <div className='max-w-xs space-y-2'>
                                                <p className='text-sm font-medium'>No events available</p>
                                                <p className='text-xs text-muted-foreground'>
                                                    This execution hasn&apos;t recorded any steps yet.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <WorkflowExecutionGraph
                                            runs={eventRuns}
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
                                                <p className='text-xs mt-1'>Click any execution step to view detailed input, output, and logs.</p>
                                            </div>
                                        ) : (
                                            <div className='p-6 space-y-6'>
                                                <div className='space-y-4'>
                                                    <div className='flex items-start justify-between'>
                                                        <div>
                                                            <h4 className='text-lg font-bold text-foreground'>
                                                                {getStepDisplayName(selectedRun.stepType)}
                                                            </h4>
                                                            <p className='text-xs text-muted-foreground font-mono mt-0.5'>
                                                                Node ID: {selectedRun.nodeId}
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
                                                            id: selectedRun.events[selectedRun.events.length - 1]?.id ?? '',
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
                                                            className={`rounded-xl border p-4 space-y-4 ${event.status === 'failed'
                                                                    ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20'
                                                                    : 'bg-background'
                                                                }`}
                                                        >
                                                            <div className='flex items-center justify-between'>
                                                                <Badge className={
                                                                    event.status === 'started' ? 'bg-blue-100 text-blue-800' :
                                                                        event.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                            'bg-red-100 text-red-800'
                                                                }>
                                                                    {event.status.toUpperCase()}
                                                                </Badge>
                                                                <span className='text-[10px] text-muted-foreground font-mono'>
                                                                    {formatDateTime(event.createdAt)}
                                                                </span>
                                                            </div>

                                                            {hasUsefulPayload(event.input) && (
                                                                <div className='space-y-1.5'>
                                                                    <span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>Input</span>
                                                                    <pre className='bg-muted/50 p-3 rounded-lg overflow-auto text-[11px] font-mono whitespace-pre-wrap break-all border'>
                                                                        {formatContent(JSON.stringify(parseContent(event.input)))}
                                                                    </pre>
                                                                </div>
                                                            )}

                                                            {hasUsefulPayload(event.output) && (
                                                                <div className='space-y-1.5'>
                                                                    <span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>Output</span>
                                                                    <pre className='bg-muted/50 p-3 rounded-lg overflow-auto text-[11px] font-mono whitespace-pre-wrap break-all border'>
                                                                        {formatContent(JSON.stringify(parseContent(event.output)))}
                                                                    </pre>
                                                                </div>
                                                            )}

                                                            {event.error && (
                                                                <div className='space-y-1.5'>
                                                                    <span className='text-[10px] font-bold uppercase tracking-wider text-red-600'>Error</span>
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
