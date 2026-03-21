import {
    NodeType,
    TaskType,
    type AssignmentNode,
    type ConditionNode,
    type EndNode,
    type InterviewNode,
    type NotificationNode,
    type StartNode,
    type UpdateStatusNode,
    type WaitNode,
    type WorkflowNode,
} from '@jobify/domain/workflow';
import { runAssignmentStep } from './assignment-step';
import { runConditionStep } from './condition-step';
import { runEndStep } from './end-step';
import { runInterviewStep } from './interview-step';
import { runNotifyStep } from './notify-step';
import { runStartStep } from './start-step';
import { runUpdateStatusStep } from './update-status-step';
import { runWaitStep } from './wait-step';
import type { WorkflowRunContext } from './types';

/**
 * Dispatches execution to the step module for the node type defined in the persisted workflow.
 * Graph shape and node definitions are loaded each run, so workflow edits change which step runs next.
 */
export async function runNodeStep(ctx: WorkflowRunContext, node: WorkflowNode): Promise<void> {
    if (node.type === NodeType.START) {
        await runStartStep(ctx, node);
        return;
    }
    if (node.type === NodeType.END) {
        await runEndStep(ctx, node);
        return;
    }
    if (node.type !== NodeType.TASK) return;

    switch (node.taskType) {
        case TaskType.NOTIFY:
            await runNotifyStep(ctx, node as NotificationNode);
            return;
        case TaskType.UPDATE_STATUS:
            await runUpdateStatusStep(ctx, node as UpdateStatusNode);
            return;
        case TaskType.ASSIGNMENT:
            await runAssignmentStep(ctx, node as AssignmentNode);
            return;
        case TaskType.INTERVIEW:
            await runInterviewStep(ctx, node as InterviewNode);
            return;
        case TaskType.WAIT:
            await runWaitStep(ctx, node as WaitNode);
            return;
        case TaskType.CONDITION:
            await runConditionStep(ctx, node as ConditionNode);
            return;
        default:
            return;
    }
}
