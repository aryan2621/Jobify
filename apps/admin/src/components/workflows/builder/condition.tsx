'use client';

import { useState } from 'react';
import { ConditionNode, ConditionBranch, ConditionOperator, ApplicationStage } from '@jobify/domain/workflow';
import { Label } from '@jobify/ui/label';
import { Input } from '@jobify/ui/input';
import { Button } from '@jobify/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@jobify/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useToast } from '@jobify/ui/use-toast';
import { cn } from '@/lib/utils';

interface ConditionNodeBuilderProps {
    node: ConditionNode;
    onSubmit: (node: ConditionNode) => void;
}

const CONDITION_FIELDS = [
    { value: 'application.stage', label: 'Application stage' },
    { value: 'workflowState.submitted', label: 'Assignment submitted' },
    { value: 'application.status', label: 'Application status' },
];

const OPERATOR_OPTIONS: { value: ConditionOperator; label: string }[] = [
    { value: ConditionOperator.EQ, label: 'equals' },
    { value: ConditionOperator.NE, label: 'not equals' },
    { value: ConditionOperator.EXISTS, label: 'exists' },
    { value: ConditionOperator.NOT_EXISTS, label: 'not exists' },
];

const ALLOWED_CONDITION_FIELDS = new Set(CONDITION_FIELDS.map((f) => f.value));

function isAllowedConditionField(field: string | undefined): boolean {
    return Boolean(field && ALLOWED_CONDITION_FIELDS.has(field));
}

function operatorNeedsValue(op: ConditionOperator): boolean {
    return op !== ConditionOperator.EXISTS && op !== ConditionOperator.NOT_EXISTS;
}

const ALLOWED_VALUE_STRINGS = new Set<string>([...Object.values(ApplicationStage), 'true', 'false']);

function conditionValueToSelectString(value: ConditionBranch['value']): string {
    if (value === true || value === false) return String(value);
    if (value === undefined || value === null) return '';
    return String(value);
}

function isAllowedConditionValue(value: ConditionBranch['value']): boolean {
    if (value === true || value === false) return true;
    if (typeof value === 'string' && ALLOWED_VALUE_STRINGS.has(value)) return true;
    return false;
}

type ConditionRowErrors = { field?: string; value?: string };

const ConditionNodeBuilderComponent = ({ node, onSubmit }: ConditionNodeBuilderProps) => {
    const { toast } = useToast();
    const [newNode, setNewNode] = useState<ConditionNode>(() => {
        const n = node as ConditionNode;
        return new ConditionNode(
            n.id,
            { ...n.data },
            { ...n.position },
            n.conditions?.length ? n.conditions.map((c) => ({ ...c })) : [],
            n.sourcePosition,
            n.targetPosition
        );
    });

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [rowErrors, setRowErrors] = useState<Record<number, ConditionRowErrors>>({});

    const addCondition = () => {
        setNewNode((prev) => ({
            ...prev,
            conditions: [
                ...prev.conditions,
                { id: nanoid(), field: 'application.stage', operator: ConditionOperator.EQ, value: ApplicationStage.ASSIGNMENT_SUBMITTED },
            ],
        }));
    };

    const updateCondition = (index: number, updates: Partial<ConditionBranch>) => {
        setNewNode((prev) => {
            const next = [...prev.conditions];
            next[index] = { ...next[index], ...updates };
            return { ...prev, conditions: next };
        });
    };

    const removeCondition = (index: number) => {
        setNewNode((prev) => ({
            ...prev,
            conditions: prev.conditions.filter((_, i) => i !== index),
        }));
        setRowErrors((prev) => {
            const next: Record<number, ConditionRowErrors> = {};
            for (const [key, err] of Object.entries(prev)) {
                const i = Number(key);
                if (i === index) continue;
                next[i > index ? i - 1 : i] = err;
            }
            return next;
        });
    };

    const clearRowFieldError = (index: number, key: keyof ConditionRowErrors) => {
        setRowErrors((prev) => {
            const row = prev[index];
            if (!row?.[key]) return prev;
            const nextRow = { ...row };
            delete nextRow[key];
            const next = { ...prev };
            if (Object.keys(nextRow).length === 0) delete next[index];
            else next[index] = nextRow;
            return next;
        });
    };

    const validateConditions = (): boolean => {
        const errors: Record<number, ConditionRowErrors> = {};
        newNode.conditions.forEach((cond, index) => {
            if (!isAllowedConditionField(cond.field)) {
                errors[index] = { ...errors[index], field: 'Select a field' };
            }
            if (operatorNeedsValue(cond.operator) && !isAllowedConditionValue(cond.value)) {
                errors[index] = { ...errors[index], value: 'Select a value' };
            }
        });
        setRowErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = () => {
        setFormSubmitted(true);
        if (newNode.conditions.length === 0) {
            toast({
                title: 'Validation Error',
                description: 'Add at least one branch condition.',
                variant: 'destructive',
            });
            return;
        }
        if (!validateConditions()) {
            toast({
                title: 'Validation Error',
                description: 'Please fix the highlighted condition rows.',
                variant: 'destructive',
            });
            return;
        }
        onSubmit(newNode);
    };

    return (
        <div className='p-4'>
            <h2 className="font-bold text-lg mb-4">Configure Condition</h2>

            <div className="flex flex-col gap-4">
                <div>
                    <Label className='mb-2 block'>Name</Label>
                    <Input
                        value={newNode.data.name ?? `condition_${newNode.id.slice(0, 8)}`}
                        disabled
                        className="bg-muted"
                    />
                </div>
                <div>
                    <Label className='mb-2 block'>Node Label</Label>
                    <Input
                        value={newNode.data.label}
                        onChange={(e) => setNewNode({ ...newNode, data: { ...newNode.data, label: e.target.value } })}
                        placeholder="e.g., Assignment submitted?"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <Label className='mb-2 block'>Branch conditions</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addCondition}>
                            <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                        First matching condition wins. Connect each branch to a different next node. One edge can be the default (no condition).
                    </p>
                    {newNode.conditions.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 border border-dashed rounded-md text-center">
                            No conditions yet. Add one to branch (e.g. workflowState.[nodeName].submitted equals true).
                        </p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {newNode.conditions.map((cond, index) => {
                                const fieldError = formSubmitted && rowErrors[index]?.field;
                                const valueError = formSubmitted && rowErrors[index]?.value;
                                const fieldSelectValue = isAllowedConditionField(cond.field) ? cond.field : undefined;
                                const valueStr = conditionValueToSelectString(cond.value);
                                const valueSelectValue =
                                    operatorNeedsValue(cond.operator) && ALLOWED_VALUE_STRINGS.has(valueStr) ? valueStr : undefined;

                                return (
                                <div key={cond.id} className="border rounded-md p-3 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-medium text-muted-foreground">Condition {index + 1}</span>
                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeCondition(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div>
                                            <Label
                                                className={cn('text-xs mb-1.5 block', fieldError && 'text-destructive')}
                                            >
                                                Field
                                                <span className="text-destructive ml-0.5">*</span>
                                            </Label>
                                            <Select
                                                value={fieldSelectValue}
                                                onValueChange={(v) => {
                                                    updateCondition(index, { field: v });
                                                    clearRowFieldError(index, 'field');
                                                }}
                                            >
                                                <SelectTrigger className={cn('h-9', fieldError && 'border-destructive')}>
                                                    <SelectValue placeholder="Select field" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CONDITION_FIELDS.map((f) => (
                                                        <SelectItem key={f.value} value={f.value}>
                                                            {f.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldError ? (
                                                <p className="text-destructive text-xs mt-1">{fieldError}</p>
                                            ) : null}
                                        </div>
                                        <div>
                                            <Label className="text-xs mb-1.5 block">
                                                Operator
                                                <span className="text-destructive ml-0.5">*</span>
                                            </Label>
                                            <Select
                                                value={cond.operator}
                                                onValueChange={(v) => {
                                                    const op = v as ConditionOperator;
                                                    updateCondition(index, { operator: op });
                                                    if (!operatorNeedsValue(op)) {
                                                        clearRowFieldError(index, 'value');
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {OPERATOR_OPTIONS.map((o) => (
                                                        <SelectItem key={o.value} value={o.value}>
                                                            {o.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {operatorNeedsValue(cond.operator) && (
                                            <div>
                                                <Label
                                                    className={cn('text-xs mb-1.5 block', valueError && 'text-destructive')}
                                                >
                                                    Value
                                                    <span className="text-destructive ml-0.5">*</span>
                                                </Label>
                                                <Select
                                                    value={valueSelectValue}
                                                    onValueChange={(v) => {
                                                        updateCondition(index, {
                                                            value: v === 'true' ? true : v === 'false' ? false : v,
                                                        });
                                                        clearRowFieldError(index, 'value');
                                                    }}
                                                >
                                                    <SelectTrigger className={cn('h-9', valueError && 'border-destructive')}>
                                                        <SelectValue placeholder="Select value" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(ApplicationStage).map((s) => (
                                                            <SelectItem key={s} value={s}>
                                                                {s}
                                                            </SelectItem>
                                                        ))}
                                                        <SelectItem value="true">true</SelectItem>
                                                        <SelectItem value="false">false</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {valueError ? (
                                                    <p className="text-destructive text-xs mt-1">{valueError}</p>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <Button type="button" onClick={handleSave} className="mt-4 w-full">
                Save Condition Configuration
            </Button>
        </div>
    );
};

export default ConditionNodeBuilderComponent;
