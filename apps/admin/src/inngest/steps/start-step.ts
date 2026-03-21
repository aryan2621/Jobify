import type { StartNode } from '@jobify/domain/workflow';
import type { WorkflowRunContext } from './types';

/** Start nodes only mark graph entry; progression uses edges from the persisted workflow. */
export async function runStartStep(_ctx: WorkflowRunContext, _node: StartNode): Promise<void> {}
