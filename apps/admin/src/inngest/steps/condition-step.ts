import type { ConditionNode } from '@jobify/domain/workflow';
import type { WorkflowRunContext } from './types';

/** Branching is handled in navigation via `resolveNextNodeId`; no side effects here. */
export async function runConditionStep(_ctx: WorkflowRunContext, _node: ConditionNode): Promise<void> {}
