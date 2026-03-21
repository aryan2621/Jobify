import {
    ApplicationStage,
    AssignmentNode,
    ConditionNode,
    ConditionOperator,
    EndNode,
    InterviewNode,
    NotificationNode,
    NotificationOption,
    StartNode,
    UpdateStatusNode,
    WaitNode,
} from '@jobify/domain/workflow';
import type { Edge } from '@xyflow/react';
import { Position } from '@xyflow/react';
import { WorkflowNode, NodeType, TaskType, DelayUnit } from '@jobify/domain/workflow';

function getTypeLabel(type: NodeType | TaskType): string {
    if (type === NodeType.START) return 'start';
    if (type === NodeType.END) return 'end';
    if (type === TaskType.NOTIFY) return 'notify';
    if (type === TaskType.ASSIGNMENT) return 'assignment';
    if (type === TaskType.INTERVIEW) return 'interview';
    if (type === TaskType.WAIT) return 'wait';
    if (type === TaskType.CONDITION) return 'condition';
    if (type === TaskType.UPDATE_STATUS) return 'update_status';
    return 'node';
}

function ensureNodeName(data: any, type: NodeType | TaskType, id: string): any {
    const name = data?.name ?? `${getTypeLabel(type)}_${id.slice(0, 8)}`;
    return { ...data, label: data?.label ?? '', name };
}


export function createNode(
    type: NodeType | TaskType,
    data: any,
    position: { x: number; y: number },
    sourcePosition?: Position,
    targetPosition?: Position
): WorkflowNode {
    const id = crypto.randomUUID();
    const nodeData = ensureNodeName(data, type, id);
    switch (type) {
        case NodeType.START:
            return new StartNode(id, nodeData, position, sourcePosition, targetPosition);

        case NodeType.END:
            return new EndNode(id, nodeData, position, sourcePosition, targetPosition);

        case TaskType.NOTIFY:
            return new NotificationNode(id, nodeData, position, [], sourcePosition, targetPosition);

        case TaskType.ASSIGNMENT:
            return new AssignmentNode(id, nodeData, position, '', undefined, '', [], sourcePosition, targetPosition, 'none');

        case TaskType.INTERVIEW:
            return new InterviewNode(id, nodeData, position, '', '', [], undefined, sourcePosition, targetPosition);

        case TaskType.WAIT:
            return new WaitNode(id, nodeData, position, 0, DelayUnit.DAYS, false, undefined, sourcePosition, targetPosition);

        case TaskType.CONDITION:
            return new ConditionNode(id, nodeData, position, [], sourcePosition, targetPosition);

        case TaskType.UPDATE_STATUS:
            return new UpdateStatusNode(id, nodeData, position, ApplicationStage.APPLIED, sourcePosition, targetPosition);

        default:
            throw new Error(`Unknown node type: ${type}`);
    }
}


export function cloneNode(node: WorkflowNode): WorkflowNode {
    if (node.type === NodeType.START) {
        return new StartNode(node.id, { ...node.data }, { ...node.position }, node.sourcePosition, node.targetPosition);
    } else if (node.type === NodeType.END) {
        return new EndNode(node.id, { ...node.data }, { ...node.position }, node.sourcePosition, node.targetPosition);
    } else if (node.type === NodeType.TASK) {
        if (node.taskType === TaskType.NOTIFY) {
            const notificationNode = node as NotificationNode;
            return new NotificationNode(
                node.id,
                { ...node.data },
                { ...node.position },
                [...notificationNode.notificationOptions],
                node.sourcePosition,
                node.targetPosition
            );
        } else if (node.taskType === TaskType.ASSIGNMENT) {
            const assignmentNode = node as AssignmentNode;
            return new AssignmentNode(
                node.id,
                { ...node.data },
                { ...node.position },
                assignmentNode.url,
                assignmentNode.deadline ? new Date(assignmentNode.deadline.getTime()) : undefined,
                assignmentNode.description,
                [...assignmentNode.attachments],
                node.sourcePosition,
                node.targetPosition,
                assignmentNode.submissionTracking ?? 'none'
            );
        } else if (node.taskType === TaskType.INTERVIEW) {
            const interviewNode = node as InterviewNode;
            return new InterviewNode(
                node.id,
                { ...node.data },
                { ...node.position },
                interviewNode.link,
                interviewNode.description,
                [...interviewNode.attachments],
                interviewNode.time ? new Date(interviewNode.time.getTime()) : undefined,
                node.sourcePosition,
                node.targetPosition,
                interviewNode.duration,
                interviewNode.participants ? [...interviewNode.participants] : undefined
            );
        } else if (node.taskType === TaskType.WAIT) {
            const waitNode = node as WaitNode;
            return new WaitNode(
                node.id,
                { ...node.data },
                { ...node.position },
                waitNode.duration,
                waitNode.unit,
                waitNode.workingDaysOnly,
                waitNode.exactDateTime ? new Date(waitNode.exactDateTime.getTime()) : undefined,
                node.sourcePosition,
                node.targetPosition
            );
        } else if (node.taskType === TaskType.CONDITION) {
            const conditionNode = node as ConditionNode;
            return new ConditionNode(
                node.id,
                { ...node.data },
                { ...node.position },
                conditionNode.conditions?.length ? conditionNode.conditions.map((c) => ({ ...c })) : [],
                node.sourcePosition,
                node.targetPosition
            );
        } else if (node.taskType === TaskType.UPDATE_STATUS) {
            const updateNode = node as UpdateStatusNode;
            return new UpdateStatusNode(
                node.id,
                { ...node.data },
                { ...node.position },
                updateNode.stage ?? ApplicationStage.APPLIED,
                node.sourcePosition,
                node.targetPosition
            );
        }
    }

    return { ...node };
}

function getTypeLabelForNode(node: any): string {
    if (node.type === NodeType.START) return 'start';
    if (node.type === NodeType.END) return 'end';
    if (node.taskType === TaskType.NOTIFY) return 'notify';
    if (node.taskType === TaskType.ASSIGNMENT) return 'assignment';
    if (node.taskType === TaskType.INTERVIEW) return 'interview';
    if (node.taskType === TaskType.WAIT) return 'wait';
    if (node.taskType === TaskType.CONDITION) return 'condition';
    if (node.taskType === TaskType.UPDATE_STATUS) return 'update_status';
    return 'node';
}


export function deserializeNode(node: any): WorkflowNode {
    const name = node.data?.name ?? `${getTypeLabelForNode(node)}_${node.id.slice(0, 8)}`;
    const nodeData = { ...node.data, label: node.data?.label ?? '', name };
    if (node.type === NodeType.START) {
        return new StartNode(node.id, nodeData, node.position, node.sourcePosition, node.targetPosition);
    } else if (node.type === NodeType.END) {
        return new EndNode(node.id, nodeData, node.position, node.sourcePosition, node.targetPosition);
    } else if (node.type === NodeType.TASK) {
        if (node.taskType === TaskType.NOTIFY) {
            return new NotificationNode(node.id, nodeData, node.position, node.notificationOptions || [], node.sourcePosition, node.targetPosition);
        } else if (node.taskType === TaskType.ASSIGNMENT) {
            return new AssignmentNode(
                node.id,
                nodeData,
                node.position,
                node.url || '',
                node.deadline ? new Date(node.deadline) : undefined,
                node.description || '',
                node.attachments || [],
                node.sourcePosition,
                node.targetPosition,
                node.submissionTracking ?? 'none'
            );
        } else if (node.taskType === TaskType.INTERVIEW) {
            return new InterviewNode(
                node.id,
                nodeData,
                node.position,
                node.link || '',
                node.description || '',
                node.attachments || [],
                node.time ? new Date(node.time) : undefined,
                node.sourcePosition,
                node.targetPosition,
                node.duration,
                node.participants
            );
        } else if (node.taskType === TaskType.WAIT) {
            return new WaitNode(
                node.id,
                nodeData,
                node.position,
                node.duration ?? 0,
                node.unit ?? DelayUnit.DAYS,
                node.workingDaysOnly ?? false,
                node.exactDateTime ? new Date(node.exactDateTime) : undefined,
                node.sourcePosition,
                node.targetPosition
            );
        } else if (node.taskType === TaskType.CONDITION) {
            return new ConditionNode(
                node.id,
                nodeData,
                node.position,
                node.conditions || [],
                node.sourcePosition,
                node.targetPosition
            );
        } else if (node.taskType === TaskType.UPDATE_STATUS) {
            return new UpdateStatusNode(
                node.id,
                nodeData,
                node.position,
                node.stage ?? ApplicationStage.APPLIED,
                node.sourcePosition,
                node.targetPosition
            );
        }
    }

    return node;
}

const edge = (source: string, target: string): Edge => ({
    id: crypto.randomUUID(),
    source,
    target,
    type: 'custom-edge',
    animated: true,
    style: { strokeWidth: 2 },
});

/**
 * Default hiring pipeline: acknowledge → triage wait → shortlist → take-home → candidate wait →
 * branch on assignment submission → interview + stage update, or close as not selected.
 * Condition edges use target ids with interview < endRejected (lexicographic) so branch 0 maps to interview.
 */
export function createDefaultRecruitmentWorkflow(): { nodes: WorkflowNode[]; edges: Edge[] } {
    const id = {
        start: crypto.randomUUID(),
        notify: crypto.randomUUID(),
        updateApplied: crypto.randomUUID(),
        waitRecruiterReview: crypto.randomUUID(),
        updateShortlisted: crypto.randomUUID(),
        assignment: crypto.randomUUID(),
        waitCandidateWindow: crypto.randomUUID(),
        condition: crypto.randomUUID(),
        interview: '',
        endNotSelected: '',
        updateInterviewScheduled: crypto.randomUUID(),
        endPipeline: crypto.randomUUID(),
    };
    do {
        id.interview = crypto.randomUUID();
        id.endNotSelected = crypto.randomUUID();
    } while (id.interview >= id.endNotSelected);

    const conditionBranchId = crypto.randomUUID();
    const assignmentDeadline = new Date(Date.now() + 7 * 86400000).toISOString();
    const interviewTime = new Date(Date.now() + 10 * 86400000).toISOString();

    const plain: Record<string, unknown>[] = [
        {
            id: id.start,
            type: NodeType.START,
            data: {
                label: 'Application received',
                name: `start_${id.start.slice(0, 8)}`,
                trigger: 'application_received',
            },
            position: { x: 260, y: 0 },
        },
        {
            id: id.notify,
            type: NodeType.TASK,
            taskType: TaskType.NOTIFY,
            notificationOptions: [NotificationOption.EMAIL],
            data: {
                label: 'Email: application received',
                name: `notify_${id.notify.slice(0, 8)}`,
                emailConfig: {
                    to: '{{candidate.email}}',
                    subject: 'We received your application — {{job.title}} at {{job.company}}',
                    body: 'Hi {{candidate.name}},\n\nThanks for applying for {{job.title}} at {{job.company}}. Our team will review your profile. If there is a strong fit, we will invite you to the next step within a few business days.\n\nYou can track your status in your candidate portal.\n\nBest,\nThe hiring team',
                },
            },
            position: { x: 260, y: 110 },
        },
        {
            id: id.updateApplied,
            type: NodeType.TASK,
            taskType: TaskType.UPDATE_STATUS,
            data: {
                label: 'Stage: Applied (in review)',
                name: `update_status_${id.updateApplied.slice(0, 8)}`,
            },
            stage: ApplicationStage.APPLIED,
            position: { x: 260, y: 220 },
        },
        {
            id: id.waitRecruiterReview,
            type: NodeType.TASK,
            taskType: TaskType.WAIT,
            data: {
                label: 'Wait: recruiter review (2 weekdays)',
                name: `wait_${id.waitRecruiterReview.slice(0, 8)}`,
            },
            duration: 2,
            unit: DelayUnit.DAYS,
            workingDaysOnly: true,
            position: { x: 260, y: 330 },
        },
        {
            id: id.updateShortlisted,
            type: NodeType.TASK,
            taskType: TaskType.UPDATE_STATUS,
            data: {
                label: 'Stage: Shortlisted — send take-home',
                name: `update_status_${id.updateShortlisted.slice(0, 8)}`,
            },
            stage: ApplicationStage.SHORTLISTED,
            position: { x: 260, y: 440 },
        },
        {
            id: id.assignment,
            type: NodeType.TASK,
            taskType: TaskType.ASSIGNMENT,
            data: {
                label: 'Take-home assignment',
                name: `assignment_${id.assignment.slice(0, 8)}`,
            },
            url: 'https://example.com/replace-with-your-brief-notion-or-doc',
            deadline: assignmentDeadline,
            description:
                'Replace the URL above with your real brief (Notion, Google Doc, or repo). Candidates receive this link by email and submit work on the Jobify portal. Describe expectations, timebox, and how you will evaluate.',
            attachments: [] as string[],
            submissionTracking: 'link',
            position: { x: 260, y: 550 },
        },
        {
            id: id.waitCandidateWindow,
            type: NodeType.TASK,
            taskType: TaskType.WAIT,
            data: {
                label: 'Wait: candidate has 5 days to submit',
                name: `wait_${id.waitCandidateWindow.slice(0, 8)}`,
            },
            duration: 5,
            unit: DelayUnit.DAYS,
            workingDaysOnly: false,
            position: { x: 260, y: 660 },
        },
        {
            id: id.condition,
            type: NodeType.TASK,
            taskType: TaskType.CONDITION,
            data: {
                label: 'Assignment submitted on portal?',
                name: `condition_${id.condition.slice(0, 8)}`,
            },
            conditions: [
                {
                    id: conditionBranchId,
                    field: 'workflowState.submitted',
                    operator: ConditionOperator.EQ,
                    value: true,
                },
            ],
            position: { x: 260, y: 770 },
        },
        {
            id: id.interview,
            type: NodeType.TASK,
            taskType: TaskType.INTERVIEW,
            data: {
                label: 'Live interview (replace Meet link)',
                name: `interview_${id.interview.slice(0, 8)}`,
            },
            link: 'https://meet.google.com/replace-with-your-link',
            description:
                'Replace the meeting link and time. When this step runs, the candidate gets an email and (if you connected Google Calendar) a calendar invite.',
            attachments: [] as string[],
            time: interviewTime,
            duration: 60,
            participants: [] as string[],
            position: { x: 120, y: 900 },
        },
        {
            id: id.endNotSelected,
            type: NodeType.END,
            data: {
                label: 'End: no submission — close',
                name: `end_${id.endNotSelected.slice(0, 8)}`,
                outcome: 'rejected',
            },
            position: { x: 400, y: 900 },
        },
        {
            id: id.updateInterviewScheduled,
            type: NodeType.TASK,
            taskType: TaskType.UPDATE_STATUS,
            data: {
                label: 'Stage: Interview scheduled',
                name: `update_status_${id.updateInterviewScheduled.slice(0, 8)}`,
            },
            stage: ApplicationStage.INTERVIEW_SCHEDULED,
            position: { x: 120, y: 1020 },
        },
        {
            id: id.endPipeline,
            type: NodeType.END,
            data: {
                label: 'End: interview step done (extend if needed)',
                name: `end_${id.endPipeline.slice(0, 8)}`,
                outcome: 'ongoing',
            },
            position: { x: 120, y: 1130 },
        },
    ];

    const nodes = plain.map((n) => deserializeNode(n));
    const edges: Edge[] = [
        edge(id.start, id.notify),
        edge(id.notify, id.updateApplied),
        edge(id.updateApplied, id.waitRecruiterReview),
        edge(id.waitRecruiterReview, id.updateShortlisted),
        edge(id.updateShortlisted, id.assignment),
        edge(id.assignment, id.waitCandidateWindow),
        edge(id.waitCandidateWindow, id.condition),
        edge(id.condition, id.interview),
        edge(id.condition, id.endNotSelected),
        edge(id.interview, id.updateInterviewScheduled),
        edge(id.updateInterviewScheduled, id.endPipeline),
    ];

    return { nodes, edges };
}
