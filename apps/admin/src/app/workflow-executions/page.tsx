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
                    <SheetContent side='right' className='w-full sm:max-w-2xl'>
                        <div className='space-y-4'>
                            <div>
                                <h3 className='text-lg font-semibold'>Execution Timeline</h3>
                                {selectedExecution && (
                                    <p className='text-sm text-muted-foreground'>
                                        Execution {selectedExecution.id} for application {selectedExecution.applicationId}
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
                                <ScrollArea className='h-[85vh] pr-3'>
                                    <div className='space-y-3'>
                                        {executionEvents.map((event) => (
                                            <Card key={event.id}>
                                                <CardHeader className='pb-2'>
                                                    <div className='flex items-center justify-between gap-2'>
                                                        <div className='text-sm font-medium'>
                                                            {event.stepType} ({event.nodeId})
                                                        </div>
                                                        <Badge variant='outline'>{event.status}</Badge>
                                                    </div>
                                                    <CardDescription>{formatDate(event.createdAt)}</CardDescription>
                                                </CardHeader>
                                                <CardContent className='space-y-2 text-xs'>
                                                    {event.input && (
                                                        <div>
                                                            <div className='font-medium mb-1'>Input</div>
                                                            <pre className='bg-muted p-2 rounded overflow-auto whitespace-pre-wrap break-all'>
                                                                {event.input}
                                                            </pre>
                                                        </div>
                                                    )}
                                                    {event.output && (
                                                        <div>
                                                            <div className='font-medium mb-1'>Output</div>
                                                            <pre className='bg-muted p-2 rounded overflow-auto whitespace-pre-wrap break-all'>
                                                                {event.output}
                                                            </pre>
                                                        </div>
                                                    )}
                                                    {event.error && (
                                                        <div>
                                                            <div className='font-medium mb-1 text-destructive'>Error</div>
                                                            <pre className='bg-destructive/10 p-2 rounded overflow-auto whitespace-pre-wrap break-all'>
                                                                {event.error}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
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
