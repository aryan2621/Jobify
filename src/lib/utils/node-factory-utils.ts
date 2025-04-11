import { AssignmentNode, ConditionalNode, EndNode, InterviewNode, NotificationNode, StartNode, WaitNode } from '@/model/workflow';
import { Position } from '@xyflow/react';
import { nanoid } from 'nanoid';
import { DelayUnit, NodeType, TaskType } from '@/model/workflow';

/**
 *   Factory function to create nodes based on type
 * @param type  The type of node to create
 * @param data  The node data
 * @param position  The position coordinates
 * @param sourcePosition       
 * @param targetPosition 
 * @returns A new node of the specified type
 */


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
        case TaskType.CONDITIONAL:
            return new ConditionalNode(id, data, position, [], '', '', sourcePosition, targetPosition);
        case TaskType.WAIT:
            return new WaitNode(id, data, position, 0, DelayUnit.DAYS, false, new Date(), '', sourcePosition, targetPosition);
    }
};
