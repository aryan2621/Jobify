import { AssignmentNode, ConditionalNode, EndNode, InterviewNode, NotificationNode, StartNode, WaitNode } from '@/model/workflow';
import { Position } from '@xyflow/react';
import { WorkflowNode, NodeType, TaskType, DelayUnit } from '@/model/workflow';

/**
 * Factory function to create nodes based on type
 * @param type The type of node to create
 * @param data The node data
 * @param position The position coordinates
 * @param sourcePosition Optional source position
 * @param targetPosition Optional target position
 * @returns A new node of the specified type
 */
export function createNode(
    type: NodeType | TaskType,
    data: any,
    position: { x: number; y: number },
    sourcePosition?: Position,
    targetPosition?: Position
): WorkflowNode {
    switch (type) {
        case NodeType.START:
            return new StartNode(crypto.randomUUID(), data, position, sourcePosition, targetPosition);

        case NodeType.END:
            return new EndNode(crypto.randomUUID(), data, position, sourcePosition, targetPosition);

        case TaskType.NOTIFICATION:
            return new NotificationNode(crypto.randomUUID(), data, position, [], sourcePosition, targetPosition);

        case TaskType.ASSIGNMENT:
            return new AssignmentNode(crypto.randomUUID(), data, position, '', undefined, '', [], sourcePosition, targetPosition);

        case TaskType.INTERVIEW:
            return new InterviewNode(crypto.randomUUID(), data, position, '', '', [], undefined, sourcePosition, targetPosition);

        case TaskType.CONDITIONAL:
            return new ConditionalNode(crypto.randomUUID(), data, position, [], '', '', sourcePosition, targetPosition);

        case TaskType.WAIT:
            return new WaitNode(crypto.randomUUID(), data, position, 0, DelayUnit.DAYS, false, undefined, sourcePosition, targetPosition);

        default:
            throw new Error(`Unknown node type: ${type}`);
    }
}

/**
 * Create a deep clone of a node
 * @param node The node to clone
 * @returns A new node with the same properties
 */
export function cloneNode(node: WorkflowNode): WorkflowNode {
    if (node.type === NodeType.START) {
        return new StartNode(node.id, { ...node.data }, { ...node.position }, node.sourcePosition, node.targetPosition);
    } else if (node.type === NodeType.END) {
        return new EndNode(node.id, { ...node.data }, { ...node.position }, node.sourcePosition, node.targetPosition);
    } else if (node.type === NodeType.TASK) {
        if (node.taskType === TaskType.NOTIFICATION) {
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
                node.targetPosition
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
        } else if (node.taskType === TaskType.CONDITIONAL) {
            const conditionalNode = node as ConditionalNode;
            return new ConditionalNode(
                node.id,
                { ...node.data },
                { ...node.position },
                [...conditionalNode.conditions],
                conditionalNode.trueOutcome,
                conditionalNode.falseOutcome,
                node.sourcePosition,
                node.targetPosition
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
                waitNode.resumeOn,
                node.sourcePosition,
                node.targetPosition
            );
        }
    }

    return { ...node };
}

/**
 * Deserialize a workflow node from JSON
 * @param node The serialized node object
 * @returns A properly instantiated node object
 */
export function deserializeNode(node: any): WorkflowNode {
    if (node.type === NodeType.START) {
        return new StartNode(node.id, node.data, node.position, node.sourcePosition, node.targetPosition);
    } else if (node.type === NodeType.END) {
        return new EndNode(node.id, node.data, node.position, node.sourcePosition, node.targetPosition);
    } else if (node.type === NodeType.TASK) {
        if (node.taskType === TaskType.NOTIFICATION) {
            return new NotificationNode(node.id, node.data, node.position, node.notificationOptions || [], node.sourcePosition, node.targetPosition);
        } else if (node.taskType === TaskType.ASSIGNMENT) {
            return new AssignmentNode(
                node.id,
                node.data,
                node.position,
                node.url || '',
                node.deadline ? new Date(node.deadline) : undefined,
                node.description || '',
                node.attachments || [],
                node.sourcePosition,
                node.targetPosition
            );
        } else if (node.taskType === TaskType.INTERVIEW) {
            return new InterviewNode(
                node.id,
                node.data,
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
        } else if (node.taskType === TaskType.CONDITIONAL) {
            return new ConditionalNode(
                node.id,
                node.data,
                node.position,
                node.conditions,
                node.trueOutcome,
                node.falseOutcome,
                node.sourcePosition,
                node.targetPosition
            );
        } else if (node.taskType === TaskType.WAIT) {
            return new WaitNode(
                node.id,
                node.data,
                node.position,
                node.duration,
                node.unit,
                node.workingDaysOnly,
                node.exactDateTime,
                node.resumeOn,
                node.sourcePosition,
                node.targetPosition
            );
        }
    }

    // Fallback: return as-is if type is unknown
    return node;
}
