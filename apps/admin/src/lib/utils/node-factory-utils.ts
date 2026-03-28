import {
    ApplicationStage,
    AssignmentNode,
    ConditionNode,
    EndNode,
    InterviewNode,
    NotificationNode,
    StartNode,
    UpdateStatusNode,
    WaitNode,
} from '@jobify/domain/workflow';
import { Position } from '@xyflow/react';
import { nanoid } from 'nanoid';
import { DelayUnit, NodeType, TaskType } from '@jobify/domain/workflow';

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


function buildNodeData(type: NodeType | TaskType, id: string, data: any): { label: string; name: string; [key: string]: any } {
    const name = `${getTypeLabel(type)}_${id.slice(0, 8)}`;
    return { label: data?.label ?? '', name, ...data };
}


export const nodeFactory = (
    type: NodeType | TaskType,
    data: any,
    position: { x: number; y: number },
    sourcePosition?: Position,
    targetPosition?: Position
) => {
    const id = nanoid();
    const nodeData = buildNodeData(type, id, data);
    switch (type) {
        case NodeType.START:
            return new StartNode(id, nodeData, position, sourcePosition, targetPosition);
        case NodeType.END:
            return new EndNode(id, nodeData, position, sourcePosition, targetPosition);
        case TaskType.NOTIFY:
            return new NotificationNode(id, nodeData, position, [], sourcePosition, targetPosition);
        case TaskType.ASSIGNMENT:
            return new AssignmentNode(id, nodeData, position, '', new Date(), '', [], sourcePosition, targetPosition, 'link');
        case TaskType.INTERVIEW:
            return new InterviewNode(id, nodeData, position, '', '', [], new Date(), sourcePosition, targetPosition);
        case TaskType.WAIT:
            return new WaitNode(id, nodeData, position, 0, DelayUnit.DAYS, false, undefined, sourcePosition, targetPosition);
        case TaskType.CONDITION:
            return new ConditionNode(id, nodeData, position, [], sourcePosition, targetPosition);
        case TaskType.UPDATE_STATUS:
            return new UpdateStatusNode(
                id,
                { ...nodeData, label: nodeData.label || 'Set stage' },
                position,
                ApplicationStage.APPLIED,
                sourcePosition,
                targetPosition
            );
        default:
            throw new Error(`Unsupported node type: ${type}`);
    }
};
