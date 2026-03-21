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
 * Full recruitment funnel on the canvas: every node type once, wired linearly,
 * with sensible defaults so validation passes (notify email, assignment, interview, wait).
 */
export function createDefaultRecruitmentWorkflow(): { nodes: WorkflowNode[]; edges: Edge[] } {
    const id = {
        start: crypto.randomUUID(),
        notify: crypto.randomUUID(),
        statusShortlist: crypto.randomUUID(),
        assignment: crypto.randomUUID(),
        wait: crypto.randomUUID(),
        condition: crypto.randomUUID(),
        interview: crypto.randomUUID(),
        statusInterview: crypto.randomUUID(),
        end: crypto.randomUUID(),
    };
    const branchId = crypto.randomUUID();
    const assignmentDeadline = new Date(Date.now() + 7 * 86400000).toISOString();
    const interviewTime = new Date(Date.now() + 14 * 86400000).toISOString();

    const plain: Record<string, unknown>[] = [
        {
            id: id.start,
            type: NodeType.START,
            data: {
                label: 'Application received',
                name: `start_${id.start.slice(0, 8)}`,
                trigger: 'application_received',
            },
            position: { x: 280, y: 0 },
        },
        {
            id: id.notify,
            type: NodeType.TASK,
            taskType: TaskType.NOTIFY,
            notificationOptions: [NotificationOption.EMAIL],
            data: {
                label: 'Acknowledge candidate',
                name: `notify_${id.notify.slice(0, 8)}`,
                emailConfig: {
                    to: '{{candidate.email}}',
                    subject: 'We received your application — {{job.title}}',
                    body: 'Hi {{candidate.name}},\n\nThank you for applying for {{job.title}} at {{job.company}}. We will review your profile and follow up soon.\n\n— The hiring team',
                },
            },
            position: { x: 280, y: 120 },
        },
        {
            id: id.statusShortlist,
            type: NodeType.TASK,
            taskType: TaskType.UPDATE_STATUS,
            data: {
                label: 'Mark shortlisted',
                name: `update_status_${id.statusShortlist.slice(0, 8)}`,
            },
            stage: ApplicationStage.SHORTLISTED,
            position: { x: 280, y: 240 },
        },
        {
            id: id.assignment,
            type: NodeType.TASK,
            taskType: TaskType.ASSIGNMENT,
            data: {
                label: 'Take-home assignment',
                name: `assignment_${id.assignment.slice(0, 8)}`,
            },
            url: 'https://example.com/assignment',
            deadline: assignmentDeadline,
            description: 'Complete the exercise and submit your solution before the deadline.',
            attachments: [] as string[],
            submissionTracking: 'link',
            position: { x: 280, y: 360 },
        },
        {
            id: id.wait,
            type: NodeType.TASK,
            taskType: TaskType.WAIT,
            data: {
                label: 'Pause before screening',
                name: `wait_${id.wait.slice(0, 8)}`,
            },
            duration: 2,
            unit: DelayUnit.DAYS,
            workingDaysOnly: true,
            position: { x: 280, y: 480 },
        },
        {
            id: id.condition,
            type: NodeType.TASK,
            taskType: TaskType.CONDITION,
            data: {
                label: 'Meets bar for interview?',
                name: `condition_${id.condition.slice(0, 8)}`,
            },
            conditions: [
                {
                    id: branchId,
                    field: 'stage',
                    operator: ConditionOperator.EQ,
                    value: ApplicationStage.SHORTLISTED,
                },
            ],
            position: { x: 280, y: 600 },
        },
        {
            id: id.interview,
            type: NodeType.TASK,
            taskType: TaskType.INTERVIEW,
            data: {
                label: 'Technical interview',
                name: `interview_${id.interview.slice(0, 8)}`,
            },
            link: 'https://meet.example.com/interview',
            description: '60-minute technical conversation with the engineering team.',
            attachments: [] as string[],
            time: interviewTime,
            duration: 60,
            participants: [] as string[],
            position: { x: 280, y: 720 },
        },
        {
            id: id.statusInterview,
            type: NodeType.TASK,
            taskType: TaskType.UPDATE_STATUS,
            data: {
                label: 'Interview scheduled',
                name: `update_status_${id.statusInterview.slice(0, 8)}`,
            },
            stage: ApplicationStage.INTERVIEW_SCHEDULED,
            position: { x: 280, y: 840 },
        },
        {
            id: id.end,
            type: NodeType.END,
            data: {
                label: 'Pipeline complete',
                name: `end_${id.end.slice(0, 8)}`,
                outcome: 'ongoing',
            },
            position: { x: 280, y: 960 },
        },
    ];

    const nodes = plain.map((n) => deserializeNode(n));
    const edges: Edge[] = [
        edge(id.start, id.notify),
        edge(id.notify, id.statusShortlist),
        edge(id.statusShortlist, id.assignment),
        edge(id.assignment, id.wait),
        edge(id.wait, id.condition),
        edge(id.condition, id.interview),
        edge(id.interview, id.statusInterview),
        edge(id.statusInterview, id.end),
    ];

    return { nodes, edges };
}
