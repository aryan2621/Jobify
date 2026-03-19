'use client';

import { useState } from 'react';
import { ConditionNode, ConditionBranch, ConditionOperator, ApplicationStage } from '@/model/workflow';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { GitBranch, Plus, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';

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

const ConditionNodeBuilderComponent = ({ node, onSubmit }: ConditionNodeBuilderProps) => {
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
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center">
                <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-full mr-3">
                    <GitBranch className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                    <h2 className="font-bold text-lg">Configure Condition</h2>
                    <p className="text-sm text-muted-foreground">Branch workflow based on application stage or assignment submission</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        value={newNode.data.name ?? `condition_${newNode.id.slice(0, 8)}`}
                        disabled
                        className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Unique identifier for this node (read-only)</p>
                </div>
                <div>
                    <Label htmlFor="label">Node Label</Label>
                    <Input
                        id="label"
                        value={newNode.data.label}
                        onChange={(e) => setNewNode({ ...newNode, data: { ...newNode.data, label: e.target.value } })}
                        placeholder="e.g., Assignment submitted?"
                    />
                </div>

                <Separator />

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <Label>Branch conditions</Label>
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
                        <div className="space-y-3">
                            {newNode.conditions.map((cond, index) => (
                                <div key={cond.id} className="border rounded-md p-3 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-medium text-muted-foreground">Condition {index + 1}</span>
                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeCondition(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <div>
                                            <Label className="text-xs">Field</Label>
                                            <Select
                                                value={cond.field}
                                                onValueChange={(v) => updateCondition(index, { field: v })}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CONDITION_FIELDS.map((f) => (
                                                        <SelectItem key={f.value} value={f.value}>
                                                            {f.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label className="text-xs">Operator</Label>
                                            <Select
                                                value={cond.operator}
                                                onValueChange={(v) => updateCondition(index, { operator: v as ConditionOperator })}
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
                                        {cond.operator !== ConditionOperator.EXISTS && cond.operator !== ConditionOperator.NOT_EXISTS && (
                                            <div>
                                                <Label className="text-xs">Value</Label>
                                                <Select
                                                    value={String(cond.value ?? '')}
                                                    onValueChange={(v) => updateCondition(index, { value: v === 'true' ? true : v === 'false' ? false : v })}
                                                >
                                                    <SelectTrigger className="h-9">
                                                        <SelectValue placeholder="Value" />
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
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Separator />
            <Button onClick={() => onSubmit(newNode)} className="w-full">
                Save Condition Configuration
            </Button>
        </div>
    );
};

export default ConditionNodeBuilderComponent;
