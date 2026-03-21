/** Handle side for workflow nodes; matches @xyflow/react `Position` string values. */
export type FlowHandlePosition = 'top' | 'right' | 'bottom' | 'left';

export interface EmailConfig {
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    body: string;
}


export interface MessageConfig {
    phoneNumber: string;
    body: string;
}


export const NOTIFY_TEMPLATE_VARS = ['candidate.name', 'candidate.email', 'job.title', 'job.company', 'assignment.deadline'] as const;


export interface Workflow {
    id: string;
    name: string;
    description?: string;
    nodes: WorkflowNode[];
    edges: any[];
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    status?: 'draft' | 'active' | 'archived';
}


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


export interface ConditionBranch {
    id: string;
    field: string;
    operator: ConditionOperator;
    value?: string | number | boolean;
}


export enum NotificationOption {
    EMAIL = 'email',
    SMS = 'sms',
    WHATSAPP = 'whatsapp',
}


export enum DelayUnit {
    MINUTES = 'minutes',
    HOURS = 'hours',
    DAYS = 'days',
    WEEKS = 'weeks',
}






export type StartTrigger = 'application_received';


export type EndOutcome = 'rejected' | 'hired' | 'withdrawn' | 'ongoing';


export type AssignmentSubmissionTracking = 'none' | 'link' | 'google_form';

export abstract class WorkflowNode {
    id: string;
    abstract readonly type: NodeType;
    data: {
        label: string;
        
        name?: string;
        emailConfig?: EmailConfig;
        messageConfig?: MessageConfig;
        
        trigger?: StartTrigger;
        
        outcome?: EndOutcome;
    };
    position: { x: number; y: number };
    taskType?: TaskType;
    sourcePosition?: FlowHandlePosition;
    targetPosition?: FlowHandlePosition;
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
        sourcePosition?: FlowHandlePosition,
        targetPosition?: FlowHandlePosition
    ) {
        this.id = id;
        this.data = data;
        this.position = position;
        this.sourcePosition = sourcePosition;
        this.targetPosition = targetPosition;
        this.selected = false;
    }
}


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
        sourcePosition?: FlowHandlePosition,
        targetPosition?: FlowHandlePosition
    ) {
        super(id, data, position, sourcePosition, targetPosition);
        this.duration = duration;
        this.unit = unit;
        this.workingDaysOnly = workingDaysOnly;
        this.exactDateTime = exactDateTime;
    }
}


export class StartNode extends WorkflowNode {
    type = NodeType.START;

    constructor(
        id: string,
        data: { label: string; trigger?: StartTrigger },
        position: { x: number; y: number },
        sourcePosition?: FlowHandlePosition,
        targetPosition?: FlowHandlePosition
    ) {
        super(id, data, position, sourcePosition, targetPosition);
    }
}


export class EndNode extends WorkflowNode {
    type = NodeType.END;

    constructor(
        id: string,
        data: { label: string; outcome?: EndOutcome },
        position: { x: number; y: number },
        sourcePosition?: FlowHandlePosition,
        targetPosition?: FlowHandlePosition
    ) {
        super(id, data, position, sourcePosition, targetPosition);
    }
}


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
        sourcePosition?: FlowHandlePosition,
        targetPosition?: FlowHandlePosition
    ) {
        super(id, data, position, sourcePosition, targetPosition);
        this.taskType = taskType;
    }
}


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
        sourcePosition?: FlowHandlePosition,
        targetPosition?: FlowHandlePosition
    ) {
        super(id, data, position, TaskType.NOTIFY, sourcePosition, targetPosition);
        this.notificationOptions = notificationOptions;
    }
}


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
        sourcePosition?: FlowHandlePosition,
        targetPosition?: FlowHandlePosition,
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



export class InterviewNode extends BaseTaskNode {
    link: string = '';
    description: string = '';
    attachments: string[] = [];
    time: Date = new Date();
    duration?: number; 
    participants?: string[]; 

    constructor(
        id: string,
        data: { label: string },
        position: { x: number; y: number },
        link: string = '',
        description: string = '',
        attachments: string[] = [],
        time?: Date,
        sourcePosition?: FlowHandlePosition,
        targetPosition?: FlowHandlePosition,
        duration?: number,
        participants?: string[]
    ) {
        super(id, data, position, TaskType.INTERVIEW, sourcePosition, targetPosition);
        this.link = link;
        this.description = description;
        this.attachments = attachments;
        this.time = time || new Date(Date.now() + 24 * 60 * 60 * 1000); 
        this.duration = duration;
        this.participants = participants;
    }
}


export class ConditionNode extends BaseTaskNode {
    conditions: ConditionBranch[] = [];

    constructor(
        id: string,
        data: { label: string; name?: string },
        position: { x: number; y: number },
        conditions: ConditionBranch[] = [],
        sourcePosition?: FlowHandlePosition,
        targetPosition?: FlowHandlePosition
    ) {
        super(id, data, position, TaskType.CONDITION, sourcePosition, targetPosition);
        this.conditions = conditions;
    }
}


export class UpdateStatusNode extends BaseTaskNode {
    stage: ApplicationStage;

    constructor(
        id: string,
        data: { label: string; name?: string },
        position: { x: number; y: number },
        stage: ApplicationStage,
        sourcePosition?: FlowHandlePosition,
        targetPosition?: FlowHandlePosition
    ) {
        super(id, data, position, TaskType.UPDATE_STATUS, sourcePosition, targetPosition);
        this.stage = stage;
    }
}
