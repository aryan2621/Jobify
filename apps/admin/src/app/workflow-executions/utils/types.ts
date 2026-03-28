export type WorkflowExecution = {
    id: string;
    applicationId: string;
    jobId: string;
    status: 'running' | 'waiting' | 'completed' | 'failed' | 'cancelled';
    currentNodeId?: string;
    workflowId: string;
    updatedAt: string;
    recruiterId?: string;
    stage?: string;
    nextRunAt?: string;
    error?: string;
    startedAt?: string;
    completedAt?: string;
};

export type WorkflowExecutionEvent = {
    id: string;
    nodeId: string;
    nodeType?: string;
    stepType: string;
    status: 'started' | 'completed' | 'failed';
    input?: string;
    output?: string;
    error?: string;
    createdAt: string;
    executionId?: string;
    applicationId?: string;
    jobId?: string;
    workflowId?: string;
    recruiterId?: string;
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
