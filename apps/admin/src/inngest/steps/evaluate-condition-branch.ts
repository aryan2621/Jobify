import { ConditionOperator } from '@jobify/domain/workflow';
import type { WorkflowExecutionSnapshot } from './types';

function getFieldValue(field: string, execution: WorkflowExecutionSnapshot): unknown {
    if (field === 'application.stage') return execution.stage;
    if (field === 'application.status') return execution.status;
    if (field === 'workflowState.submitted') {
        const ws = execution.workflowState ?? {};
        return Object.values(ws).some(
            (s) => s && typeof s === 'object' && (s as { submitted?: boolean }).submitted === true
        );
    }
    return undefined;
}

function compareEq(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === undefined || a === null || b === undefined || b === null) return false;
    return String(a) === String(b);
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
        default:
            return false;
    }
}
