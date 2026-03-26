export type WorkflowExecution = {
    id: string;
    applicationId: string;
    jobId: string;
    status: 'running' | 'waiting' | 'completed' | 'failed' | 'cancelled';
    currentNodeId?: string;
    updatedAt: string;
};

export type WorkflowExecutionEvent = {
    id: string;
    nodeId: string;
    stepType: string;
    status: 'started' | 'completed' | 'failed';
    input?: string;
    output?: string;
    error?: string;
    createdAt: string;
};

export type EventRun = {
    key: string;
    nodeId: string;
    stepType: string;
    startedAt?: string;
    endedAt?: string;
    finalStatus: WorkflowExecutionEvent['status'];
    events: WorkflowExecutionEvent[];
};
