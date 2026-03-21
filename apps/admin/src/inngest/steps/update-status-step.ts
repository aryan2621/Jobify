import type { UpdateStatusNode } from '@jobify/domain/workflow';
import { updateApplicationWorkflowProgress } from '@jobify/appwrite-server/collections/application-collection';
import type { WorkflowRunContext } from './types';

export async function runUpdateStatusStep(ctx: WorkflowRunContext, node: UpdateStatusNode): Promise<void> {
    if (!node.stage) return;
    await updateApplicationWorkflowProgress(ctx.applicationId, { stage: node.stage });
}
