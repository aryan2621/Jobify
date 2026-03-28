import { NodeType, TaskType, type ConditionNode, type WorkflowNode } from '@jobify/domain/workflow';
import { evaluateConditionBranch } from './evaluate-condition-branch';
import type { WorkflowExecutionSnapshot } from './types';

type Edge = { source: string; target: string; sourceHandle?: string | null };

function asEdges(edges: unknown[]): Edge[] {
    return edges.filter((e): e is Edge => {
        const x = e as Edge;
        return typeof x?.source === 'string' && typeof x?.target === 'string';
    });
}

const BRANCH_HANDLE = /^branch-(\d+)$/;
const ELSE_HANDLE = /^branch-else$/;

function branchHandleSortKey(handle: string | null | undefined): number | null {
    if (!handle) return null;
    if (ELSE_HANDLE.test(handle)) return Number.MAX_SAFE_INTEGER;
    const m = handle.match(BRANCH_HANDLE);
    if (m) return Number(m[1]);
    return null;
}

/** First outgoing edge in persisted graph order (non-condition nodes). */
export function getOutgoingEdgesInDocumentOrder(edges: unknown[], sourceId: string): Edge[] {
    return asEdges(edges).filter((e) => e.source === sourceId);
}

/**
 * Outgoing edges from a condition node: every edge must use `branch-{i}` or `branch-else` handles.
 * Sorted by branch index, else last.
 */
export function getConditionOutgoingEdges(edges: unknown[], conditionNodeId: string): Edge[] {
    const list = asEdges(edges).filter((e) => e.source === conditionNodeId);
    if (list.length === 0) return [];

    for (const e of list) {
        if (branchHandleSortKey(e.sourceHandle ?? null) === null) {
            throw new Error(
                'Condition node edges must use If/Else branch handles from the workflow editor (branch-0, branch-1, …, branch-else).'
            );
        }
    }

    return [...list].sort((a, b) => {
        const ka = branchHandleSortKey(a.sourceHandle ?? null) ?? 0;
        const kb = branchHandleSortKey(b.sourceHandle ?? null) ?? 0;
        return ka - kb;
    });
}

export function getNextNodeIdLinear(edges: unknown[], currentNodeId: string): string | null {
    const outgoing = getOutgoingEdgesInDocumentOrder(edges, currentNodeId);
    return outgoing[0]?.target ?? null;
}

export function getFirstNodeAfterStart(nodes: unknown[], edges: unknown[]): string | null {
    const start = (nodes as { type?: string; id?: string }[]).find((n) => n.type === NodeType.START);
    if (!start?.id) return null;
    return getNextNodeIdLinear(edges, start.id);
}

function resolveConditionNext(
    conditionNode: ConditionNode,
    edges: unknown[],
    conditionNodeId: string,
    execution: WorkflowExecutionSnapshot
): string | null {
    const outgoing = getConditionOutgoingEdges(edges, conditionNodeId);
    if (outgoing.length === 0) return null;

    const branches = conditionNode.conditions ?? [];
    for (let i = 0; i < branches.length; i++) {
        if (evaluateConditionBranch(branches[i], execution)) {
            return outgoing[i]?.target ?? null;
        }
    }
    if (outgoing.length > branches.length) {
        return outgoing[branches.length]?.target ?? null;
    }
    return null;
}

/**
 * Next node from the current node, using the live workflow graph.
 * Condition nodes evaluate branches against the application; other nodes use the first outgoing edge (linear).
 */
export function resolveNextNodeId(
    edges: unknown[],
    currentNodeId: string,
    currentNode: WorkflowNode,
    execution: WorkflowExecutionSnapshot
): string | null {
    if (currentNode.type === NodeType.TASK && currentNode.taskType === TaskType.CONDITION) {
        return resolveConditionNext(currentNode as ConditionNode, edges, currentNodeId, execution);
    }
    return getNextNodeIdLinear(edges, currentNodeId);
}
