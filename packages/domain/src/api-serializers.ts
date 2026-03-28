import { Job } from './job';
import type { ApplicationStage, ApplicationStatus, Gender, JobSource } from './application';
import { parseApplicationStage } from './application';

export type PublicJob = {
    id: string;
    profile: string;
    description: string;
    company: string;
    type: string;
    workplaceType: string;
    lastDateToApply: string;
    location: string;
    skills: string[];
    rejectionContent: string;
    selectionContent: string;
    createdAt: string;
    state: string;
    createdBy: string;
    workflowId?: string;
};

export type PublicApplication = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    currentLocation: string;
    gender: Gender;
    education: unknown[];
    experience: unknown[];
    skills: string[];
    source: JobSource;
    resume: string;
    socialLinks: string[];
    coverLetter: string;
    status: ApplicationStatus;
    stage: ApplicationStage;
    jobId: string;
    createdAt: string;
    createdBy: string;
};

export type PublicWorkflow = {
    id: string;
    name: string;
    description: string;
    nodes: string;
    edges: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    status?: 'draft' | 'active' | 'archived';
};

export type PublicWorkflowExecution = {
    id: string;
    applicationId: string;
    jobId: string;
    recruiterId: string;
    workflowId: string;
    status: string;
    currentNodeId?: string;
    stage?: string;
    nextRunAt?: string;
    error?: string;
    startedAt?: string;
    completedAt?: string;
    updatedAt?: string;
};

export type PublicWorkflowExecutionEvent = {
    id: string;
    executionId: string;
    applicationId: string;
    jobId: string;
    recruiterId: string;
    workflowId: string;
    nodeId: string;
    nodeType: string;
    stepType: string;
    status: string;
    input?: string;
    output?: string;
    error?: string;
    createdAt: string;
};

function docId(doc: Record<string, unknown>): string {
    return String(doc.id ?? doc.$id ?? '');
}

function str(doc: Record<string, unknown>, key: string, fallback = ''): string {
    const v = doc[key];
    return typeof v === 'string' ? v : v != null ? String(v) : fallback;
}

function strArr(doc: Record<string, unknown>, key: string): string[] {
    const v = doc[key];
    return Array.isArray(v) ? (v as unknown[]).map((x) => String(x)) : [];
}

function optionalStr(doc: Record<string, unknown>, key: string): string | undefined {
    const v = doc[key];
    if (v == null) return undefined;
    return typeof v === 'string' ? v : String(v);
}

function workflowNodesEdgesAsStrings(nodes: unknown, edges: unknown): { nodes: string; edges: string } {
    return {
        nodes: typeof nodes === 'string' ? nodes : JSON.stringify(nodes ?? []),
        edges: typeof edges === 'string' ? edges : JSON.stringify(edges ?? []),
    };
}

export function toPublicJob(doc: Record<string, unknown> | Job): PublicJob {
    if (doc instanceof Job) {
        const j = doc;
        const out: PublicJob = {
            id: j.id,
            profile: j.profile,
            description: j.description,
            company: j.company,
            type: j.type,
            workplaceType: j.workplaceType,
            lastDateToApply: j.lastDateToApply,
            location: j.location,
            skills: j.skills,
            rejectionContent: j.rejectionContent,
            selectionContent: j.selectionContent,
            createdAt: j.createdAt,
            state: j.state,
            createdBy: j.createdBy,
        };
        if (j.workflowId !== undefined) out.workflowId = j.workflowId;
        return out;
    }
    const d = doc;
    const wf = d.workflowId;
    const out: PublicJob = {
        id: docId(d),
        profile: str(d, 'profile'),
        description: str(d, 'description'),
        company: str(d, 'company'),
        type: str(d, 'type'),
        workplaceType: str(d, 'workplaceType'),
        lastDateToApply: str(d, 'lastDateToApply'),
        location: str(d, 'location'),
        skills: strArr(d, 'skills'),
        rejectionContent: str(d, 'rejectionContent'),
        selectionContent: str(d, 'selectionContent'),
        createdAt: str(d, 'createdAt'),
        state: str(d, 'state'),
        createdBy: str(d, 'createdBy'),
    };
    if (typeof wf === 'string' && wf.length > 0) out.workflowId = wf;
    return out;
}

export function toPublicApplication(doc: Record<string, unknown>): PublicApplication {
    const education = doc.education;
    const experience = doc.experience;
    return {
        id: docId(doc),
        firstName: str(doc, 'firstName'),
        lastName: str(doc, 'lastName'),
        email: str(doc, 'email'),
        phone: str(doc, 'phone'),
        currentLocation: str(doc, 'currentLocation'),
        gender: str(doc, 'gender') as Gender,
        education: Array.isArray(education) ? education : [],
        experience: Array.isArray(experience) ? experience : [],
        skills: strArr(doc, 'skills'),
        source: str(doc, 'source') as JobSource,
        resume: str(doc, 'resume'),
        socialLinks: strArr(doc, 'socialLinks'),
        coverLetter: str(doc, 'coverLetter'),
        status: str(doc, 'status') as ApplicationStatus,
        stage: parseApplicationStage(doc.stage),
        jobId: str(doc, 'jobId'),
        createdAt: str(doc, 'createdAt'),
        createdBy: str(doc, 'createdBy'),
    };
}

export function toPublicWorkflow(doc: Record<string, unknown>): PublicWorkflow {
    const { nodes, edges } = workflowNodesEdgesAsStrings(doc.nodes, doc.edges);
    const st = doc.status;
    const out: PublicWorkflow = {
        id: docId(doc),
        name: str(doc, 'name'),
        description: str(doc, 'description'),
        nodes,
        edges,
        createdAt: str(doc, 'createdAt'),
        updatedAt: str(doc, 'updatedAt'),
        createdBy: str(doc, 'createdBy'),
    };
    if (st === 'draft' || st === 'active' || st === 'archived') {
        out.status = st;
    }
    return out;
}

export function toPublicWorkflowExecution(doc: Record<string, unknown>): PublicWorkflowExecution {
    const out: PublicWorkflowExecution = {
        id: docId(doc),
        applicationId: str(doc, 'applicationId'),
        jobId: str(doc, 'jobId'),
        recruiterId: str(doc, 'recruiterId'),
        workflowId: str(doc, 'workflowId'),
        status: str(doc, 'status'),
    };
    const currentNodeId = optionalStr(doc, 'currentNodeId');
    if (currentNodeId) out.currentNodeId = currentNodeId;
    const stage = optionalStr(doc, 'stage');
    if (stage) out.stage = stage;
    const nextRunAt = optionalStr(doc, 'nextRunAt');
    if (nextRunAt) out.nextRunAt = nextRunAt;
    const error = optionalStr(doc, 'error');
    if (error) out.error = error;
    const startedAt = optionalStr(doc, 'startedAt');
    if (startedAt) out.startedAt = startedAt;
    const completedAt = optionalStr(doc, 'completedAt');
    if (completedAt) out.completedAt = completedAt;
    const updatedAt = optionalStr(doc, 'updatedAt');
    if (updatedAt) out.updatedAt = updatedAt;
    return out;
}

export function toPublicWorkflowExecutionEvent(doc: Record<string, unknown>): PublicWorkflowExecutionEvent {
    const input = doc.input;
    const output = doc.output;
    const inputStr =
        typeof input === 'string' ? input : input != null ? JSON.stringify(input) : undefined;
    const outputStr =
        typeof output === 'string' ? output : output != null ? JSON.stringify(output) : undefined;
    const out: PublicWorkflowExecutionEvent = {
        id: docId(doc),
        executionId: str(doc, 'executionId'),
        applicationId: str(doc, 'applicationId'),
        jobId: str(doc, 'jobId'),
        recruiterId: str(doc, 'recruiterId'),
        workflowId: str(doc, 'workflowId'),
        nodeId: str(doc, 'nodeId'),
        nodeType: str(doc, 'nodeType'),
        stepType: str(doc, 'stepType'),
        status: str(doc, 'status'),
        createdAt: str(doc, 'createdAt'),
    };
    if (inputStr !== undefined) out.input = inputStr;
    if (outputStr !== undefined) out.output = outputStr;
    const error = optionalStr(doc, 'error');
    if (error) out.error = error;
    return out;
}
