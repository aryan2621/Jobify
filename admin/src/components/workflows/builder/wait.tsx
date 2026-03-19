'use client';

import { useState } from 'react';
import { WaitNode, DelayUnit } from '@/model/workflow';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Hourglass, Calendar, Clock } from 'lucide-react';

interface WaitNodeBuilderProps {
    node: WaitNode;
    onSubmit: (node: WaitNode) => void;
}

const WaitNodeBuilderComponent = ({ node, onSubmit }: WaitNodeBuilderProps) => {
    
    const cpNode = new WaitNode(
        node.id,
        node.data,
        node.position,
        node.duration || 1,
        node.unit || DelayUnit.DAYS,
        node.workingDaysOnly || false,
        node.exactDateTime,
        node.sourcePosition,
        node.targetPosition
    );

    const [newNode, setNewNode] = useState(cpNode);
    const [useExactDate, setUseExactDate] = useState<boolean>(!!node.exactDateTime);

    
    const getDateTimeString = (date?: Date): string => {
        if (!date) return '';
        date = new Date(date);
        return date.toISOString().slice(0, 16);
    };

    return (
        <div className='p-4'>
            <h2 className='font-bold text-lg mb-4'>Configure Wait Task</h2>

            <div className='flex flex-col gap-4'>
                <div>
                    <Label className='mb-2 block'>Name</Label>
                    <Input value={newNode.data.name ?? `wait_${newNode.id.slice(0, 8)}`} disabled className='bg-muted' />
                </div>
                <div>
                    <Label className='mb-2 block'>Node Label</Label>
                    <Input
                        value={newNode.data.label}
                        onChange={(e) => setNewNode({ ...newNode, data: { ...newNode.data, label: e.target.value } })}
                        placeholder='e.g., Wait 3 Days'
                    />
                </div>

                <div className='flex flex-col gap-3'>
                    <div className='flex items-center space-x-2'>
                        <Switch
                            checked={useExactDate}
                            onCheckedChange={(checked) => {
                                setUseExactDate(checked);
                                if (checked && !newNode.exactDateTime) {
                                    
                                    const tomorrow = new Date();
                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                    setNewNode({ ...newNode, exactDateTime: tomorrow });
                                }
                            }}
                        />
                        <Label>Use exact date and time</Label>
                    </div>

                    {useExactDate ? (
                        <div>
                            <Label className='mb-2 block'>Wait until specific date/time</Label>
                            <div className='relative'>
                                <Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                                <Input
                                    type='datetime-local'
                                    value={getDateTimeString(newNode.exactDateTime)}
                                    onChange={(e) => setNewNode({ ...newNode, exactDateTime: new Date(e.target.value) })}
                                    className='pl-9'
                                />
                            </div>
                        </div>
                    ) : (
                        <div className='flex flex-col gap-4'>
                            <div>
                                <Label className='mb-2 block'>Wait Duration</Label>
                                <div className='grid grid-cols-2 gap-2'>
                                    <Input
                                        type='number'
                                        value={newNode.duration}
                                        onChange={(e) => setNewNode({ ...newNode, duration: parseInt(e.target.value) || 1 })}
                                        min='1'
                                    />

                                    <Select value={newNode.unit} onValueChange={(value) => setNewNode({ ...newNode, unit: value as DelayUnit })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select unit' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={DelayUnit.MINUTES}>Minutes</SelectItem>
                                            <SelectItem value={DelayUnit.HOURS}>Hours</SelectItem>
                                            <SelectItem value={DelayUnit.DAYS}>Days</SelectItem>
                                            <SelectItem value={DelayUnit.WEEKS}>Weeks</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Switch
                                    checked={newNode.workingDaysOnly}
                                    onCheckedChange={(checked) => setNewNode({ ...newNode, workingDaysOnly: checked })}
                                />
                                <Label>Working days only (Mon-Fri)</Label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Button onClick={() => onSubmit(newNode)} className='mt-4 w-full'>
                Save Wait Task Configuration
            </Button>
        </div>
    );
};

export default WaitNodeBuilderComponent;
