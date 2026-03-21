import { ConditionOperator } from '@jobify/domain/workflow';
import type { ApplicationSnapshot } from './types';

function getFieldValue(field: string, application: ApplicationSnapshot): unknown {
    if (field === 'application.stage') return application.stage;
    if (field === 'application.status') return application.status;
    if (field === 'workflowState.submitted') {
        const ws = application.workflowState ?? {};
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
    application: ApplicationSnapshot
): boolean {
    const fieldVal = getFieldValue(branch.field, application);
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
