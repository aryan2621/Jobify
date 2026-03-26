import type { UpdateStatusNode } from '@jobify/domain/workflow';
import { updateWorkflowExecutionProgress } from '@jobify/appwrite-server/collections/workflow-collection';
import type { WorkflowRunContext } from './types';

export async function runUpdateStatusStep(ctx: WorkflowRunContext, node: UpdateStatusNode): Promise<void> {
    if (!node.stage) return;
    await updateWorkflowExecutionProgress(ctx.applicationId, { stage: node.stage });
    ctx.execution.stage = node.stage;
}
