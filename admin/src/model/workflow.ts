import { Position } from '@xyflow/react';


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
 * Template variables for Notify node (resolved at execution).
 * Supported in body/subject: {{candidate.name}}, {{candidate.email}}, {{job.title}}, {{job.company}}, {{assignment.deadline}}, etc.
 */
export const NOTIFY_TEMPLATE_VARS = ['candidate.name', 'candidate.email', 'job.title', 'job.company', 'assignment.deadline'] as const;

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
 * Node type enumeration
 * Defines the basic types of nodes in the workflow
 */
export enum NodeType {
    START = 'input',
    END = 'output',
    TASK = 'task',
}

export enum TaskType {
    ASSIGNMENT = 'assignment',
    INTERVIEW = 'interview',
    NOTIFY = 'notify',
    WAIT = 'wait',
    CONDITION = 'condition',
    UPDATE_STATUS = 'update_status',
}

/**
 * Application stage values for workflow execution and Update Status node.
 */
export enum ApplicationStage {
    APPLIED = 'applied',
    REJECTED = 'rejected',
    SHORTLISTED = 'shortlisted',
    ASSIGNMENT_SENT = 'assignment_sent',
    ASSIGNMENT_SUBMITTED = 'assignment_submitted',
    INTERVIEW_SCHEDULED = 'interview_scheduled',
    INTERVIEW_DONE = 'interview_done',
    OFFER_SENT = 'offer_sent',
    HIRED = 'hired',
    WITHDRAWN = 'withdrawn',
}

/**
 * Condition operator for Condition node branching.
 */
export enum ConditionOperator {
    EQ = 'eq',
    NE = 'ne',
    GT = 'gt',
    GTE = 'gte',
    LT = 'lt',
    LTE = 'lte',
    EXISTS = 'exists',
    NOT_EXISTS = 'notExists',
}

/**
 * Single condition for a branch (e.g. workflowState.assignment_xyz.submitted eq true).
 */
export interface ConditionBranch {
    id: string;
    field: string;
    operator: ConditionOperator;
    value?: string | number | boolean;
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
/** Start node trigger type (default: application received) */
export type StartTrigger = 'application_received';

/** End node outcome for workflow completion */
export type EndOutcome = 'rejected' | 'hired' | 'withdrawn' | 'ongoing';

/** Assignment submission tracking method */
export type AssignmentSubmissionTracking = 'none' | 'link' | 'google_form';

export class WorkflowNode {
    id: string;
    type: NodeType;
    data: {
        label: string;
        /** Unique identifier for the node within a workflow: builder-level prefix + short hash. Read-only. */
        name?: string;
        emailConfig?: EmailConfig;
        messageConfig?: MessageConfig;
        /** Start only: when workflow is triggered (default application_received) */
        trigger?: StartTrigger;
        /** End only: final outcome for analytics */
        outcome?: EndOutcome;
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
            name?: string;
            emailConfig?: EmailConfig;
            messageConfig?: MessageConfig;
            trigger?: StartTrigger;
            outcome?: EndOutcome;
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

    constructor(
        id: string,
        data: { label: string },
        position: { x: number; y: number },
        duration: number = 1,
        unit: DelayUnit = DelayUnit.DAYS,
        workingDaysOnly: boolean = false,
        exactDateTime?: Date,
        sourcePosition?: Position,
        targetPosition?: Position
    ) {
        super(id, data, position, sourcePosition, targetPosition);
        this.duration = duration;
        this.unit = unit;
        this.workingDaysOnly = workingDaysOnly;
        this.exactDateTime = exactDateTime;
    }
}

/**
 * Start node class
 * Represents the beginning of a workflow (trigger: application submitted on job).
 */
export class StartNode extends WorkflowNode {
    type = NodeType.START;

    constructor(
        id: string,
        data: { label: string; trigger?: StartTrigger },
        position: { x: number; y: number },
        sourcePosition?: Position,
        targetPosition?: Position
    ) {
        super(id, data, position, sourcePosition, targetPosition);
    }
}

/**
 * End node class
 * Represents the end point of a workflow (optional outcome for analytics).
 */
export class EndNode extends WorkflowNode {
    type = NodeType.END;

    constructor(
        id: string,
        data: { label: string; outcome?: EndOutcome },
        position: { x: number; y: number },
        sourcePosition?: Position,
        targetPosition?: Position
    ) {
        super(id, data, position, sourcePosition, targetPosition);
    }
}

/**
 * Base task node class
 * Abstract class for all task type nodes
 */
export class BaseTaskNode extends WorkflowNode {
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
 * For sending notifications via email, SMS, WhatsApp
 */
export class NotificationNode extends BaseTaskNode {
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
        super(id, data, position, TaskType.NOTIFY, sourcePosition, targetPosition);
        this.notificationOptions = notificationOptions;
    }
}

/**
 * Assignment node class
 * For creating and tracking configurable assignments/tasks (e.g. Google Form link).
 * submissionTracking: how we know assignment is done (google_form = webhook from form submit).
 */
export class AssignmentNode extends BaseTaskNode {
    url: string = '';
    deadline: Date = new Date();
    description: string = '';
    attachments: string[] = [];
    submissionTracking: AssignmentSubmissionTracking = 'none';

    constructor(
        id: string,
        data: { label: string },
        position: { x: number; y: number },
        url: string = '',
        deadline?: Date,
        description: string = '',
        attachments: string[] = [],
        sourcePosition?: Position,
        targetPosition?: Position,
        submissionTracking: AssignmentSubmissionTracking = 'none'
    ) {
        super(id, data, position, TaskType.ASSIGNMENT, sourcePosition, targetPosition);
        this.url = url;
        this.deadline = deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        this.description = description;
        this.attachments = attachments;
        this.submissionTracking = submissionTracking;
    }
}


/**
 * Interview node class
 * For booking interview time slots between parties
 */
export class InterviewNode extends BaseTaskNode {
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

/**
 * Condition node class
 * Branches workflow based on application stage, workflowState (e.g. assignment submitted), or other fields.
 * Multiple outgoing edges; each edge can have conditionId matching one of conditions; one edge is default (else).
 */
export class ConditionNode extends BaseTaskNode {
    conditions: ConditionBranch[] = [];

    constructor(
        id: string,
        data: { label: string; name?: string },
        position: { x: number; y: number },
        conditions: ConditionBranch[] = [],
        sourcePosition?: Position,
        targetPosition?: Position
    ) {
        super(id, data, position, TaskType.CONDITION, sourcePosition, targetPosition);
        this.conditions = conditions;
    }
}

/**
 * Update status node class
 * Sets application.stage so Condition nodes and UI reflect current state (e.g. shortlisted, interview_scheduled).
 */
export class UpdateStatusNode extends BaseTaskNode {
    stage: ApplicationStage;

    constructor(
        id: string,
        data: { label: string; name?: string },
        position: { x: number; y: number },
        stage: ApplicationStage,
        sourcePosition?: Position,
        targetPosition?: Position
    ) {
        super(id, data, position, TaskType.UPDATE_STATUS, sourcePosition, targetPosition);
        this.stage = stage;
    }
}
