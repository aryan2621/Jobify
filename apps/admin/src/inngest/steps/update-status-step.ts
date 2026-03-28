import { ApplicationUpdateTarget, type UpdateStatusNode } from '@jobify/domain/workflow';
import { parseApplicationStage, parseApplicationStatus } from '@jobify/domain/application';
import { updateApplication } from '@jobify/appwrite-server/collections/application-collection';
import type { WorkflowRunContext } from './types';

export async function runUpdateStatusStep(ctx: WorkflowRunContext, node: UpdateStatusNode): Promise<void> {
    if (node.updateTarget === ApplicationUpdateTarget.STAGE) {
        const stage = parseApplicationStage(node.pipelineStage);
        await updateApplication(ctx.applicationId, { stage });
        ctx.execution.stage = stage;
        return;
    }
    const status = parseApplicationStatus(node.applicationStatus);
    await updateApplication(ctx.applicationId, { status });
    ctx.execution.status = status;
}
