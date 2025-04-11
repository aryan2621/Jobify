'use client';

import { useState } from 'react';
import { ConditionalNode, Condition, ConditionOperator } from '@/model/workflow';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { GitBranch, GitFork } from 'lucide-react';

interface ConditionalNodeBuilderProps {
    node: ConditionalNode;
    onSubmit: (node: ConditionalNode) => void;
}

interface ConditionFieldProps {
    condition: Condition;
    index: number;
    updateCondition: (index: number, updatedCondition: Partial<Condition>) => void;
    removeCondition: (index: number) => void;
}

const ConditionField = ({ condition, index, updateCondition, removeCondition }: ConditionFieldProps) => (
    <div className='border rounded-md p-3 mb-3'>
        <div className='flex justify-between items-center mb-2'>
            <Label>Condition {index + 1}</Label>
            <Button variant='ghost' size='sm' onClick={() => removeCondition(index)}>
                ×
            </Button>
        </div>

        <div className='grid gap-3'>
            <div>
                <Label>Field</Label>
                <Input value={condition.field} onChange={(e) => updateCondition(index, { field: e.target.value })} placeholder='Field name' />
            </div>

            <div>
                <Label>Operator</Label>
                <Select value={condition.operator} onValueChange={(value) => updateCondition(index, { operator: value as ConditionOperator })}>
                    <SelectTrigger>
                        <SelectValue placeholder='Select operator' />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(ConditionOperator).map((op) => (
                            <SelectItem key={op} value={op}>
                                {op.charAt(0).toUpperCase() + op.slice(1).replace(/([A-Z])/g, ' $1')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label>Value</Label>
                <Input value={String(condition.value)} onChange={(e) => updateCondition(index, { value: e.target.value })} placeholder='Value' />
            </div>

            <div>
                <Label>Value Type</Label>
                <Select value={condition.valueType} onValueChange={(value) => updateCondition(index, { valueType: value as any })}>
                    <SelectTrigger>
                        <SelectValue placeholder='Select value type' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='string'>String</SelectItem>
                        <SelectItem value='number'>Number</SelectItem>
                        <SelectItem value='boolean'>Boolean</SelectItem>
                        <SelectItem value='date'>Date</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    </div>
);

const ConditionalNodeBuilderComponent = ({ node, onSubmit }: ConditionalNodeBuilderProps) => {
    const cpNode = new ConditionalNode(
        node.id,
        node.data,
        node.position,
        node.conditions || [],
        node.trueOutcome || '',
        node.falseOutcome || '',
        node.sourcePosition,
        node.targetPosition
    );

    const [newNode, setNewNode] = useState(cpNode);
    const [selectedTab, setSelectedTab] = useState<string>('conditions');

    const addCondition = () => {
        setNewNode({
            ...newNode,
            conditions: [
                ...newNode.conditions,
                {
                    field: '',
                    operator: ConditionOperator.EQUALS,
                    value: '',
                    valueType: 'string',
                },
            ],
        });
    };

    const removeCondition = (index: number) => {
        setNewNode({
            ...newNode,
            conditions: newNode.conditions.filter((_, i) => i !== index),
        });
    };

    const updateCondition = (index: number, updatedCondition: Partial<Condition>) => {
        const newConditions = [...newNode.conditions];
        newConditions[index] = {
            ...newConditions[index],
            ...updatedCondition,
        };

        setNewNode({
            ...newNode,
            conditions: newConditions,
        });
    };

    return (
        <div className='space-y-6'>
            <div className='flex items-center'>
                <div className='bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full mr-3'>
                    <GitBranch className='h-5 w-5 text-indigo-500' />
                </div>
                <div>
                    <h2 className='font-bold text-lg'>Configure Conditional Task</h2>
                    <p className='text-sm text-muted-foreground'>Set up branching logic in your workflow</p>
                </div>
            </div>

            <div className='space-y-4'>
                <div>
                    <Label htmlFor='label'>Node Label</Label>
                    <Input
                        id='label'
                        value={newNode.data.label}
                        onChange={(e) => setNewNode({ ...newNode, data: { ...newNode.data, label: e.target.value } })}
                        placeholder='Node label'
                    />
                    <p className='text-xs text-muted-foreground mt-1'>This label will be displayed on the node in the workflow editor</p>
                </div>

                <Tabs value={selectedTab} onValueChange={setSelectedTab} className='w-full'>
                    <TabsList className='grid w-full grid-cols-2'>
                        <TabsTrigger value='conditions'>Conditions</TabsTrigger>
                        <TabsTrigger value='outcomes'>Outcomes</TabsTrigger>
                    </TabsList>

                    <TabsContent value='conditions' className='space-y-3 mt-4'>
                        {newNode.conditions.length === 0 ? (
                            <div className='text-center p-4 border border-dashed rounded-md'>
                                <GitFork className='h-8 w-8 mx-auto mb-2 text-muted-foreground' />
                                <p className='text-sm text-muted-foreground'>No conditions added yet</p>
                            </div>
                        ) : (
                            newNode.conditions.map((condition, index) => (
                                <ConditionField
                                    key={index}
                                    condition={condition}
                                    index={index}
                                    updateCondition={updateCondition}
                                    removeCondition={removeCondition}
                                />
                            ))
                        )}

                        <Button variant='outline' onClick={addCondition} className='w-full'>
                            Add Condition
                        </Button>
                    </TabsContent>

                    <TabsContent value='outcomes' className='space-y-3 mt-4'>
                        <div>
                            <Label>True Outcome (Node ID)</Label>
                            <Input
                                value={newNode.trueOutcome}
                                onChange={(e) => setNewNode({ ...newNode, trueOutcome: e.target.value })}
                                placeholder='Node ID for true outcome'
                            />
                            <p className='text-xs text-muted-foreground mt-1'>The workflow will proceed to this node if condition is true</p>
                        </div>

                        <div>
                            <Label>False Outcome (Node ID)</Label>
                            <Input
                                value={newNode.falseOutcome}
                                onChange={(e) => setNewNode({ ...newNode, falseOutcome: e.target.value })}
                                placeholder='Node ID for false outcome'
                            />
                            <p className='text-xs text-muted-foreground mt-1'>The workflow will proceed to this node if condition is false</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <Separator />

            <Button onClick={() => onSubmit(newNode)} className='w-full'>
                Save Conditional Task Configuration
            </Button>
        </div>
    );
};

export default ConditionalNodeBuilderComponent;
