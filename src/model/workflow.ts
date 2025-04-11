import { Position } from '@xyflow/react';

/**
 * Condition configuration interface
 */
export interface Condition {
    field: string;
    operator: ConditionOperator;
    value: string | number | boolean | Date;
    valueType: 'string' | 'number' | 'boolean' | 'date';
}

/**
 * Email configuration interface
 * Structure for email notification settings
 */
export interface EmailConfig {
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    body: string;
}

/**
 * Message configuration interface
 * Structure for SMS and WhatsApp notification settings
 */
export interface MessageConfig {
    phoneNumber: string;
    body: string;
}

/**
 * Workflow interface
 * Defines the structure of a complete workflow
 */
export interface Workflow {
    id: string;
    name: string;
    description?: string; // Optional description for the workflow
    nodes: WorkflowNode[];
    edges: any[]; // Using any for edges as the exact type from React Flow might vary
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    isTemplate?: boolean;
    templateCategory?: string;
    status?: 'draft' | 'active' | 'archived';
    tags?: string[];
}

/**
 * Condition operator types for conditional nodes
 */
export enum ConditionOperator {
    EQUALS = 'equals',
    NOT_EQUALS = 'notEquals',
    GREATER_THAN = 'greaterThan',
    LESS_THAN = 'lessThan',
    CONTAINS = 'contains',
    NOT_CONTAINS = 'notContains',
    STARTS_WITH = 'startsWith',
    ENDS_WITH = 'endsWith',
    IS_EMPTY = 'isEmpty',
    IS_NOT_EMPTY = 'isNotEmpty',
}

/**
 * Node type enumeration
 * Defines the basic types of nodes in the workflow
 */
export enum NodeType {
    START = 'input',
    END = 'output',
    TASK = 'task',
}

/**
 * Task type enumeration
 * Defines the specific types of task nodes
 */
export enum TaskType {
    NOTIFICATION = 'notification',
    ASSIGNMENT = 'assignment',
    INTERVIEW = 'interview',
    CONDITIONAL = 'conditional',
    WAIT = 'wait',
}

/**
 * Notification option enumeration
 * Defines the available notification methods
 */
export enum NotificationOption {
    EMAIL = 'email',
    SMS = 'sms',
    WHATSAPP = 'whatsapp',
}

/**
 * Delay unit types for wait nodes
 */
export enum DelayUnit {
    MINUTES = 'minutes',
    HOURS = 'hours',
    DAYS = 'days',
    WEEKS = 'weeks',
}

// import { NodeType, TaskType, DelayUnit, NotificationOption } from '../enums';
// import { EmailConfig, MessageConfig, Condition } from './interfaces';

/**
 * Base class for all workflow nodes
 * Contains common properties shared by all node types
 */
export class WorkflowNode {
    id: string;
    type: NodeType;
    data: {
        label: string;
        emailConfig?: EmailConfig;
        messageConfig?: MessageConfig;
    };
    position: { x: number; y: number };
    taskType?: TaskType;
    sourcePosition?: Position;
    targetPosition?: Position;
    selected?: boolean;

    constructor(
        id: string,
        data: {
            label: string;
            emailConfig?: EmailConfig;
            messageConfig?: MessageConfig;
        },
        position: { x: number; y: number },
        sourcePosition?: Position,
        targetPosition?: Position
    ) {
        this.id = id;
        this.data = data;
        this.position = position;
        this.sourcePosition = sourcePosition;
        this.targetPosition = targetPosition;
        this.selected = false;
    }
}

/**
 * Wait Node for pausing workflow execution
 */
export class WaitNode extends WorkflowNode {
    type = NodeType.TASK;
    taskType = TaskType.WAIT;
    duration: number;
    unit: DelayUnit;
    exactDateTime?: Date;
    workingDaysOnly: boolean;
    resumeOn?: string; // Node ID to continue to after wait

    constructor(
        id: string,
        data: { label: string },
        position: { x: number; y: number },
        duration: number = 1,
        unit: DelayUnit = DelayUnit.DAYS,
        workingDaysOnly: boolean = false,
        exactDateTime?: Date,
        resumeOn?: string,
        sourcePosition?: Position,
        targetPosition?: Position
    ) {
        super(id, data, position, sourcePosition, targetPosition);
        this.duration = duration;
        this.unit = unit;
        this.workingDaysOnly = workingDaysOnly;
        this.exactDateTime = exactDateTime;
        this.resumeOn = resumeOn;
    }
}

/**
 * Conditional Node for handling conditional logic
 */
export class ConditionalNode extends WorkflowNode {
    type = NodeType.TASK;
    taskType = TaskType.CONDITIONAL; // Add CONDITIONAL to the TaskType enum
    conditions: Condition[] = [];
    trueOutcome: string = ''; // Node ID to connect if condition is true
    falseOutcome: string = ''; // Node ID to connect if condition is false

    constructor(
        id: string,
        data: { label: string },
        position: { x: number; y: number },
        conditions: Condition[] = [],
        trueOutcome: string = '',
        falseOutcome: string = '',
        sourcePosition?: Position,
        targetPosition?: Position
    ) {
        super(id, data, position, sourcePosition, targetPosition);
        this.conditions = conditions;
        this.trueOutcome = trueOutcome;
        this.falseOutcome = falseOutcome;
        this.sourcePosition = sourcePosition;
        this.targetPosition = targetPosition;
    }
}

/**
 * Start node class
 * Represents the beginning of a workflow
 */
export class StartNode extends WorkflowNode {
    type = NodeType.START;

    constructor(id: string, data: { label: string }, position: { x: number; y: number }, sourcePosition?: Position, targetPosition?: Position) {
        super(id, data, position, sourcePosition, targetPosition);
    }
}

/**
 * End node class
 * Represents the end point of a workflow
 */
export class EndNode extends WorkflowNode {
    type = NodeType.END;

    constructor(id: string, data: { label: string }, position: { x: number; y: number }, sourcePosition?: Position, targetPosition?: Position) {
        super(id, data, position, sourcePosition, targetPosition);
    }
}

/**
 * Base task node class
 * Abstract class for all task type nodes
 */
export class TaskNode extends WorkflowNode {
    type = NodeType.TASK;
    taskType: TaskType;

    constructor(
        id: string,
        data: {
            label: string;
            emailConfig?: EmailConfig;
            messageConfig?: MessageConfig;
        },
        position: { x: number; y: number },
        taskType: TaskType,
        sourcePosition?: Position,
        targetPosition?: Position
    ) {
        super(id, data, position, sourcePosition, targetPosition);
        this.taskType = taskType;
    }
}

/**
 * Notification node class
 * For sending notifications via email, SMS, or WhatsApp
 */
export class NotificationNode extends TaskNode {
    notificationOptions: NotificationOption[] = [];

    constructor(
        id: string,
        data: {
            label: string;
            emailConfig?: EmailConfig;
            messageConfig?: MessageConfig;
        },
        position: { x: number; y: number },
        notificationOptions: NotificationOption[] = [],
        sourcePosition?: Position,
        targetPosition?: Position
    ) {
        super(id, data, position, TaskType.NOTIFICATION, sourcePosition, targetPosition);
        this.notificationOptions = notificationOptions;
    }
}

/**
 * Assignment node class
 * For creating and tracking assignments
 */
export class AssignmentNode extends TaskNode {
    url: string = '';
    deadline: Date = new Date();
    description: string = '';
    attachments: string[] = [];

    constructor(
        id: string,
        data: { label: string },
        position: { x: number; y: number },
        url: string = '',
        deadline?: Date,
        description: string = '',
        attachments: string[] = [],
        sourcePosition?: Position,
        targetPosition?: Position
    ) {
        super(id, data, position, TaskType.ASSIGNMENT, sourcePosition, targetPosition);
        this.url = url;
        this.deadline = deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default to 1 week from now
        this.description = description;
        this.attachments = attachments;
    }
}

/**
 * Interview node class
 * For scheduling and tracking interviews
 */
export class InterviewNode extends TaskNode {
    link: string = '';
    description: string = '';
    attachments: string[] = [];
    time: Date = new Date();
    duration?: number; // Duration in minutes
    participants?: string[]; // List of participant emails or IDs

    constructor(
        id: string,
        data: { label: string },
        position: { x: number; y: number },
        link: string = '',
        description: string = '',
        attachments: string[] = [],
        time?: Date,
        sourcePosition?: Position,
        targetPosition?: Position,
        duration?: number,
        participants?: string[]
    ) {
        super(id, data, position, TaskType.INTERVIEW, sourcePosition, targetPosition);
        this.link = link;
        this.description = description;
        this.attachments = attachments;
        this.time = time || new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to tomorrow
        this.duration = duration;
        this.participants = participants;
    }
}
