import type { EndNode } from '@jobify/domain/workflow';
import type { WorkflowRunContext } from './types';

/** End nodes terminate the chain; the orchestrator stops scheduling further steps. */
export async function runEndStep(_ctx: WorkflowRunContext, _node: EndNode): Promise<void> {}
