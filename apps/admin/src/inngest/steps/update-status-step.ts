import { parseApplicationStage, type UpdateStatusNode } from '@jobify/domain/workflow';
import { updateWorkflowExecutionProgress } from '@jobify/appwrite-server/collections/workflow-collection';
import type { WorkflowRunContext } from './types';

export async function runUpdateStatusStep(ctx: WorkflowRunContext, node: UpdateStatusNode): Promise<void> {
    const stage = parseApplicationStage(node.stage);
    await updateWorkflowExecutionProgress(ctx.applicationId, { stage });
    ctx.execution.stage = stage;
}
