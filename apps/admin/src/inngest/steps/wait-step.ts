import type { WaitNode } from '@jobify/domain/workflow';
import { DelayUnit } from '@jobify/domain/workflow';
import type { WorkflowRunContext } from './types';

const UNIT_MS: Record<DelayUnit, number> = {
    [DelayUnit.MINUTES]: 60_000,
    [DelayUnit.HOURS]: 3_600_000,
    [DelayUnit.DAYS]: 86_400_000,
    [DelayUnit.WEEKS]: 604_800_000,
};

export type WaitSchedulePlan =
    | { kind: 'exact'; ts: number }
    | { kind: 'relative'; sleepSeconds: number }
    | { kind: 'skip' };

/**
 * Delay is applied when the *next* node after the one just executed is a wait node.
 * If the pointer is already on a wait node, this plan is still used by the orchestrator
 * when the following node is wait (same as legacy behavior).
 */
export function planWaitSchedule(waitNode: WaitNode): WaitSchedulePlan {
    if (waitNode.exactDateTime) {
        const ts = new Date(waitNode.exactDateTime).getTime();
        if (!Number.isFinite(ts)) return { kind: 'skip' };
        return { kind: 'exact', ts };
    }
    if (waitNode.duration != null && waitNode.unit != null) {
        const ms = UNIT_MS[waitNode.unit] ?? 86_400_000;
        const totalMs = waitNode.duration * ms;
        return { kind: 'relative', sleepSeconds: Math.max(0, totalMs) / 1000 };
    }
    return { kind: 'skip' };
}

/** No-op when the runner visits a wait node directly (advancement timing is handled separately). */
export async function runWaitStep(_ctx: WorkflowRunContext, _node: WaitNode): Promise<void> {}
