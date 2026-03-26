import { NodeType, TaskType, type ConditionNode, type WorkflowNode } from '@jobify/domain/workflow';
import { evaluateConditionBranch } from './evaluate-condition-branch';
import type { WorkflowExecutionSnapshot } from './types';

type Edge = { source: string; target: string };

function asEdges(edges: unknown[]): Edge[] {
    return edges.filter((e): e is Edge => {
        const x = e as Edge;
        return typeof x?.source === 'string' && typeof x?.target === 'string';
    });
}

/** Stable order so branch index maps to condition index. */
export function getSortedOutgoingEdges(edges: unknown[], sourceId: string): Edge[] {
    return asEdges(edges)
        .filter((e) => e.source === sourceId)
        .sort((a, b) => a.target.localeCompare(b.target));
}

export function getNextNodeIdLinear(edges: unknown[], currentNodeId: string): string | null {
    const outgoing = getSortedOutgoingEdges(edges, currentNodeId);
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
    const outgoing = getSortedOutgoingEdges(edges, conditionNodeId);
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
    return outgoing[0]?.target ?? null;
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
