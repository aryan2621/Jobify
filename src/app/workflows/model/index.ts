import { Position } from '@xyflow/react';

export enum NodeType {
    START = 'input',
    END = 'output',
    TASK = 'task',
}

export enum TaskType {
    NOTIFICATION = 'notification',
    ASSIGNMENT = 'assignment',
    INTERVIEW = 'interview',
}

export enum NotificationOption {
    EMAIL = 'email',
    SMS = 'sms',
    WHATSAPP = 'whatsapp',
}

export class WorkflowNode {
    id: string;
    type: NodeType;
    data: { label: string };
    position: { x: number; y: number };
    taskType?: TaskType;
    sourcePosition?: Position;
    targetPosition?: Position;

    constructor(id: string, data: { label: string }, position: { x: number; y: number }, sourcePosition?: Position, targetPosition?: Position) {
        this.id = id;
        this.data = data;
        this.position = position;
        this.sourcePosition = sourcePosition;
        this.targetPosition = targetPosition;
    }
}
export class StartNode extends WorkflowNode {
    type = NodeType.START;
    constructor(id: string, data: { label: string }, position: { x: number; y: number }, sourcePosition?: Position, targetPosition?: Position) {
        super(id, data, position, sourcePosition, targetPosition);
    }
}
export class EndNode extends WorkflowNode {
    type = NodeType.END;
    constructor(id: string, data: { label: string }, position: { x: number; y: number }, sourcePosition?: Position, targetPosition?: Position) {
        super(id, data, position, sourcePosition, targetPosition);
    }
}
export class TaskNode extends WorkflowNode {
    type = NodeType.TASK;
    taskType: TaskType;

    constructor(id: string, data: { label: string }, position: { x: number; y: number }, sourcePosition?: Position, targetPosition?: Position) {
        super(id, data, position, sourcePosition, targetPosition);
    }
}

export class NotificationNode extends TaskNode {
    taskType = TaskType.NOTIFICATION;
    notificationOptions: NotificationOption[] = [];

    constructor(
        id: string,
        data: { label: string },
        position: { x: number; y: number },
        notificationOptions: NotificationOption[],
        sourcePosition?: Position,
        targetPosition?: Position
    ) {
        super(id, data, position, sourcePosition, targetPosition);
        this.notificationOptions = notificationOptions;
    }
}
export class AssignmentNode extends TaskNode {
    taskType = TaskType.ASSIGNMENT;
    url: string;
    deadline: Date = new Date();
    description: string;
    attachments: string[] = [];

    constructor(
        id: string,
        data: { label: string },
        position: { x: number; y: number },
        url: string,
        deadline: Date,
        description: string,
        attachments: string[],
        sourcePosition?: Position,
        targetPosition?: Position
    ) {
        super(id, data, position, sourcePosition, targetPosition);
        this.url = url;
        this.deadline = deadline;
        this.description = description;
        this.attachments = attachments;
    }
}

export class InterviewNode extends TaskNode {
    taskType = TaskType.INTERVIEW;
    link: string;
    description: string;
    attachments: string[] = [];
    time: Date = new Date();

    constructor(
        id: string,
        data: { label: string },
        position: { x: number; y: number },
        link: string,
        description: string,
        attachments: string[],
        time: Date,
        sourcePosition?: Position,
        targetPosition?: Position
    ) {
        super(id, data, position, sourcePosition, targetPosition);
        this.link = link;
        this.description = description;
        this.attachments = attachments;
        this.time = time;
    }
}
