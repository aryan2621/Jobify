import { ConditionOperator } from '@jobify/domain/workflow';
import type { WorkflowExecutionSnapshot } from './types';

const WORKFLOW_STATE_SUBMITTED_PREFIX = /^workflowState\.([^.\s]+)\.submitted$/;

function getFieldValue(field: string, execution: WorkflowExecutionSnapshot): unknown {
    if (field === 'application.stage') return execution.stage;
    if (field === 'application.status') return execution.status;
    const m = field.match(WORKFLOW_STATE_SUBMITTED_PREFIX);
    if (m) {
        const nodeId = m[1];
        const entry = execution.workflowState?.[nodeId];
        if (entry === undefined || entry === null) return undefined;
        if (typeof entry === 'object' && 'submitted' in entry) {
            return (entry as { submitted?: boolean }).submitted === true;
        }
        return undefined;
    }
    return undefined;
}

function compareEq(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === undefined || a === null || b === undefined || b === null) return false;
    return String(a) === String(b);
}

/** Negative if a < b, positive if a > b, 0 if equal (for ordering). */
function compareOrder(a: unknown, b: unknown): number | null {
    if (a === undefined || a === null || b === undefined || b === null) return null;
    const sa = String(a);
    const sb = String(b);
    const na = Number(sa);
    const nb = Number(sb);
    if (sa !== '' && sb !== '' && Number.isFinite(na) && Number.isFinite(nb)) {
        return na - nb;
    }
    return sa.localeCompare(sb, undefined, { numeric: true, sensitivity: 'base' });
}

export function evaluateConditionBranch(
    branch: { field: string; operator: ConditionOperator; value?: string | number | boolean },
    execution: WorkflowExecutionSnapshot
): boolean {
    const fieldVal = getFieldValue(branch.field, execution);
    switch (branch.operator) {
        case ConditionOperator.EQ:
            return compareEq(fieldVal, branch.value);
        case ConditionOperator.NE:
            return !compareEq(fieldVal, branch.value);
        case ConditionOperator.EXISTS:
            return Boolean(fieldVal);
        case ConditionOperator.NOT_EXISTS:
            return !fieldVal;
        case ConditionOperator.GT:
        case ConditionOperator.GTE:
        case ConditionOperator.LT:
        case ConditionOperator.LTE: {
            const ord = compareOrder(fieldVal, branch.value);
            if (ord === null) return false;
            if (branch.operator === ConditionOperator.GT) return ord > 0;
            if (branch.operator === ConditionOperator.GTE) return ord >= 0;
            if (branch.operator === ConditionOperator.LT) return ord < 0;
            return ord <= 0;
        }
        default:
            return false;
    }
}
