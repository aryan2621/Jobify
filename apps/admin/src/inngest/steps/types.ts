import type { ApplicationWorkflowState } from '@jobify/domain/application';

/** Application fields used when executing workflow steps (parsed from Appwrite doc). */
export type ApplicationSnapshot = {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    workflowId?: string;
    stage?: string;
    status?: string;
    currentNodeId?: string;
    workflowState?: ApplicationWorkflowState;
};

export type JobSnapshot = {
    id: string;
    profile?: string;
    company?: string;
    createdBy?: string;
};

export type WorkflowRunContext = {
    applicationId: string;
    jobId: string;
    application: ApplicationSnapshot;
    job: JobSnapshot;
};

/** Raw graph from persisted workflow (before deserialize). */
export type WorkflowGraph = {
    nodes: unknown[];
    edges: unknown[];
};

export function applicationFromDocument(doc: Record<string, unknown>): ApplicationSnapshot {
    let workflowState: ApplicationWorkflowState | undefined;
    const raw = doc.workflowState;
    if (typeof raw === 'string' && raw.length > 0) {
        try {
            workflowState = JSON.parse(raw) as ApplicationWorkflowState;
        } catch {
            workflowState = undefined;
        }
    } else if (raw && typeof raw === 'object') {
        workflowState = raw as ApplicationWorkflowState;
    }
    return {
        id: String(doc.$id ?? doc.id ?? ''),
        email: doc.email as string | undefined,
        firstName: doc.firstName as string | undefined,
        lastName: doc.lastName as string | undefined,
        workflowId: doc.workflowId as string | undefined,
        stage: doc.stage as string | undefined,
        status: doc.status as string | undefined,
        currentNodeId: doc.currentNodeId as string | undefined,
        workflowState,
    };
}

export function jobFromDocument(doc: Record<string, unknown>): JobSnapshot {
    return {
        id: String(doc.$id ?? doc.id ?? ''),
        profile: doc.profile as string | undefined,
        company: doc.company as string | undefined,
        createdBy: doc.createdBy as string | undefined,
    };
}
