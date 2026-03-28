import { Workflow } from '@jobify/domain/workflow';
import { database } from '../config';
import {
    DB_NAME,
    WORKFLOW_COLLECTION,
    WORKFLOW_EXECUTION_EVENTS_COLLECTION,
    WORKFLOW_EXECUTIONS_COLLECTION,
} from '../name';
import { Query } from 'appwrite';

export async function createWorkflow(workflow: Workflow) {
    try {
        
        if (!workflow.createdAt) {
            workflow.createdAt = new Date().toISOString();
        }

        
        workflow.updatedAt = new Date().toISOString();

        return await database.createDocument(DB_NAME, WORKFLOW_COLLECTION, workflow.id, {
            id: workflow.id,
            name: workflow.name,
            description: workflow.description || '',
            nodes: JSON.stringify(workflow.nodes),
            edges: JSON.stringify(workflow.edges),
            createdAt: workflow.createdAt,
            updatedAt: workflow.updatedAt,
            createdBy: workflow.createdBy,
            status: workflow.status || 'draft',
        });
    } catch (error) {
        console.log('Error creating workflow document', error);
        throw error;
    }
}


export async function updateWorkflow(workflow: Workflow) {
    try {
        
        workflow.updatedAt = new Date().toISOString();

        return await database.updateDocument(DB_NAME, WORKFLOW_COLLECTION, workflow.id, {
            name: workflow.name,
            description: workflow.description || '',
            nodes: JSON.stringify(workflow.nodes),
            edges: JSON.stringify(workflow.edges),
            updatedAt: workflow.updatedAt,
            status: workflow.status || 'draft',
        });
    } catch (error) {
        console.log('Error updating workflow document', error);
        throw error;
    }
}


export async function getWorkflowById(id: string) {
    try {
        return await database.getDocument(DB_NAME, WORKFLOW_COLLECTION, id);
    } catch (error) {
        console.log('Error fetching workflow by id', error);
        throw error;
    }
}


export async function getWorkflowsByUserId(userId: string) {
    try {
        const workflows = await database.listDocuments(DB_NAME, WORKFLOW_COLLECTION, [
            Query.equal('createdBy', userId),
            Query.orderDesc('updatedAt'),
        ]);
        return workflows.documents;
    } catch (error) {
        console.log('Error fetching workflows by user id', error);
        throw error;
    }
}

/** Most recently updated workflow for this recruiter with `status: active`. */
export async function getActiveWorkflowForRecruiter(userId: string) {
    try {
        const res = await database.listDocuments(DB_NAME, WORKFLOW_COLLECTION, [
            Query.equal('createdBy', userId),
            Query.equal('status', 'active'),
            Query.orderDesc('updatedAt'),
            Query.limit(1),
        ]);
        return res.documents[0] ?? null;
    } catch (error) {
        console.log('Error fetching active workflow for recruiter', error);
        throw error;
    }
}

export async function countWorkflowsByUserId(userId: string): Promise<number> {
    try {
        const workflows = await database.listDocuments(DB_NAME, WORKFLOW_COLLECTION, [
            Query.equal('createdBy', userId),
            Query.limit(1),
        ]);
        return typeof workflows.total === 'number' ? workflows.total : workflows.documents.length;
    } catch (error) {
        console.log('Error counting workflows by user', error);
        throw error;
    }
}

export async function deleteWorkflow(id: string) {
    try {
        return await database.deleteDocument(DB_NAME, WORKFLOW_COLLECTION, id);
    } catch (error) {
        console.log('Error deleting workflow', error);
        throw error;
    }
}

type WorkflowExecutionStatus = 'running' | 'waiting' | 'completed' | 'failed' | 'cancelled';

type WorkflowExecutionRecord = {
    id: string;
    applicationId: string;
    jobId: string;
    recruiterId: string;
    workflowId: string;
    status: WorkflowExecutionStatus;
    currentNodeId?: string;
    stage?: string;
    state?: Record<string, unknown>;
    nextRunAt?: string;
    error?: string;
    startedAt?: string;
    completedAt?: string;
    updatedAt?: string;
};

function parseExecutionState(raw: unknown): Record<string, unknown> {
    if (typeof raw === 'string' && raw.length > 0) {
        try {
            return JSON.parse(raw) as Record<string, unknown>;
        } catch {
            return {};
        }
    }
    if (raw && typeof raw === 'object') return raw as Record<string, unknown>;
    return {};
}

export async function getWorkflowExecutionByApplicationId(applicationId: string) {
    try {
        const records = await database.listDocuments(DB_NAME, WORKFLOW_EXECUTIONS_COLLECTION, [
            Query.equal('applicationId', applicationId),
            Query.limit(1),
        ]);
        return records.documents[0] ?? null;
    } catch (error) {
        console.log('Error fetching workflow execution by application id', error);
        throw error;
    }
}
export async function getWorkflowExecutionByExecutionKey(executionKey: string) {
    try {
        return await database.getDocument(DB_NAME, WORKFLOW_EXECUTIONS_COLLECTION, executionKey);
    } catch (error) {
        const code = (error as { code?: number })?.code;
        if (code !== 404) {
            console.log('Error fetching workflow execution by id', error);
            throw error;
        }
    }
    return await getWorkflowExecutionByApplicationId(executionKey);
}

export async function upsertWorkflowExecution(record: WorkflowExecutionRecord) {
    const now = new Date().toISOString();
    try {
        const existing = await getWorkflowExecutionByApplicationId(record.applicationId);
        const existingState = existing ? parseExecutionState(existing.state) : {};
        const payload = {
            id: record.id,
            applicationId: record.applicationId,
            jobId: record.jobId,
            recruiterId: record.recruiterId,
            workflowId: record.workflowId,
            status: record.status,
            currentNodeId: record.currentNodeId ?? null,
            stage: record.stage ?? null,
            state: JSON.stringify(record.state ?? existingState),
            nextRunAt: record.nextRunAt ?? null,
            error: record.error ?? null,
            startedAt: record.startedAt ?? (existing?.startedAt as string | undefined) ?? now,
            completedAt: record.completedAt ?? null,
            updatedAt: now,
        };
        if (!existing) {
            return await database.createDocument(DB_NAME, WORKFLOW_EXECUTIONS_COLLECTION, record.id, payload);
        }
        return await database.updateDocument(DB_NAME, WORKFLOW_EXECUTIONS_COLLECTION, (existing.$id ?? existing.id) as string, payload);
    } catch (error) {
        console.log('Error upserting workflow execution', error);
        throw error;
    }
}

export async function updateWorkflowExecutionProgress(
    applicationId: string,
    updates: {
        currentNodeId?: string;
        stage?: string;
        status?: WorkflowExecutionStatus;
        nextRunAt?: string | null;
        completedAt?: string | null;
        error?: string | null;
    }
) {
    try {
        const existing = await getWorkflowExecutionByApplicationId(applicationId);
        if (!existing) return null;
        const payload: Record<string, unknown> = { updatedAt: new Date().toISOString() };
        if (updates.currentNodeId !== undefined) payload.currentNodeId = updates.currentNodeId;
        if (updates.stage !== undefined) payload.stage = updates.stage;
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.nextRunAt !== undefined) payload.nextRunAt = updates.nextRunAt;
        if (updates.completedAt !== undefined) payload.completedAt = updates.completedAt;
        if (updates.error !== undefined) payload.error = updates.error;
        return await database.updateDocument(DB_NAME, WORKFLOW_EXECUTIONS_COLLECTION, (existing.$id ?? existing.id) as string, payload);
    } catch (error) {
        console.log('Error updating workflow execution progress', error);
        throw error;
    }
}

export async function updateWorkflowExecutionState(
    applicationId: string,
    nodeId: string,
    payload: { submitted: boolean; submittedAt?: string }
) {
    try {
        const existing = await getWorkflowExecutionByApplicationId(applicationId);
        if (!existing) return null;
        const state = parseExecutionState(existing.state);
        const workflowState = (state.workflowState as Record<string, { submitted?: boolean; submittedAt?: string }> | undefined) ?? {};
        workflowState[nodeId] = { ...workflowState[nodeId], ...payload };
        return await database.updateDocument(DB_NAME, WORKFLOW_EXECUTIONS_COLLECTION, (existing.$id ?? existing.id) as string, {
            state: JSON.stringify({ ...state, workflowState }),
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.log('Error updating workflow execution state', error);
        throw error;
    }
}

export async function createWorkflowExecutionEvent(event: {
    executionId: string;
    applicationId: string;
    jobId: string;
    recruiterId: string;
    workflowId: string;
    nodeId: string;
    nodeType: string;
    stepType: string;
    status: 'started' | 'completed' | 'failed';
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    error?: string;
}) {
    try {
        const now = new Date().toISOString();
        const eventId = `${Date.now()}${Math.random().toString(36).slice(2, 8)}`.slice(0, 50);
        return await database.createDocument(DB_NAME, WORKFLOW_EXECUTION_EVENTS_COLLECTION, eventId, {
            id: eventId,
            executionId: event.executionId,
            applicationId: event.applicationId,
            jobId: event.jobId,
            recruiterId: event.recruiterId,
            workflowId: event.workflowId,
            nodeId: event.nodeId,
            nodeType: event.nodeType,
            stepType: event.stepType,
            status: event.status,
            input: JSON.stringify(event.input ?? {}),
            output: JSON.stringify(event.output ?? {}),
            error: event.error ?? null,
            createdAt: now,
        });
    } catch (error) {
        console.log('Error creating workflow execution event', error);
        throw error;
    }
}

export async function getWorkflowExecutionsByRecruiterId(recruiterId: string) {
    try {
        const records = await database.listDocuments(DB_NAME, WORKFLOW_EXECUTIONS_COLLECTION, [
            Query.equal('recruiterId', recruiterId),
            Query.orderDesc('updatedAt'),
            Query.limit(200),
        ]);
        return records.documents;
    } catch (error) {
        console.log('Error fetching workflow executions by recruiter id', error);
        throw error;
    }
}

export async function getWorkflowExecutionEventsByExecutionId(executionId: string) {
    try {
        const records = await database.listDocuments(DB_NAME, WORKFLOW_EXECUTION_EVENTS_COLLECTION, [
            Query.equal('executionId', executionId),
            Query.orderDesc('createdAt'),
            Query.limit(500),
        ]);
        return records.documents;
    } catch (error) {
        console.log('Error fetching workflow execution events by execution id', error);
        throw error;
    }
}
