import { AssignmentNode, EndNode, InterviewNode, NodeType, NotificationNode, StartNode, TaskType, WorkflowNode } from '../model';
import { Position } from '@xyflow/react';
import { nanoid } from 'nanoid';

export const nodeFactory = (
    type: NodeType | TaskType,
    data: any,
    position: { x: number; y: number },
    sourcePosition?: Position,
    targetPosition?: Position
) => {
    const id = nanoid();
    switch (type) {
        case NodeType.START:
            return new StartNode(id, data, position, sourcePosition, targetPosition);
        case NodeType.END:
            return new EndNode(id, data, position, sourcePosition, targetPosition);
        case TaskType.NOTIFICATION:
            return new NotificationNode(id, data, position, [], sourcePosition, targetPosition);
        case TaskType.ASSIGNMENT:
            return new AssignmentNode(id, data, position, '', new Date(), '', [], sourcePosition, targetPosition);
        case TaskType.INTERVIEW:
            return new InterviewNode(id, data, position, '', '', [], new Date(), sourcePosition, targetPosition);
    }
};
