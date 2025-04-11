'use client';

import { useState } from 'react';
import { WaitNode, DelayUnit } from '@/model/workflow';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Hourglass, Calendar, Clock } from 'lucide-react';

interface WaitNodeBuilderProps {
    node: WaitNode;
    onSubmit: (node: WaitNode) => void;
}

const WaitNodeBuilderComponent = ({ node, onSubmit }: WaitNodeBuilderProps) => {
    // Create a deep copy of the node to avoid mutation
    const cpNode = new WaitNode(
        node.id,
        node.data,
        node.position,
        node.duration || 1,
        node.unit || DelayUnit.DAYS,
        node.workingDaysOnly || false,
        node.exactDateTime,
        node.resumeOn || '',
        node.sourcePosition,
        node.targetPosition
    );

    const [newNode, setNewNode] = useState(cpNode);
    const [selectedTab, setSelectedTab] = useState<string>('duration');
    const [useExactDate, setUseExactDate] = useState<boolean>(!!node.exactDateTime);

    // Date-time string for input
    const getDateTimeString = (date?: Date): string => {
        if (!date) return '';
        date = new Date(date);
        return date.toISOString().slice(0, 16);
    };

    return (
        <div className='space-y-6'>
            <div className='flex items-center'>
                <div className='bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-full mr-3'>
                    <Clock className='h-5 w-5 text-cyan-500' />
                </div>
                <div>
                    <h2 className='font-bold text-lg'>Configure Wait Task</h2>
                    <p className='text-sm text-muted-foreground'>Set up timed delays in your workflow</p>
                </div>
            </div>

            <div className='space-y-4'>
                <div>
                    <Label htmlFor='label'>Node Label</Label>
                    <Input
                        id='label'
                        value={newNode.data.label}
                        onChange={(e) => setNewNode({ ...newNode, data: { ...newNode.data, label: e.target.value } })}
                        placeholder='e.g., Wait 3 Days'
                    />
                    <p className='text-xs text-muted-foreground mt-1'>This label will be displayed on the node in the workflow editor</p>
                </div>

                <Tabs value={selectedTab} onValueChange={setSelectedTab} className='w-full'>
                    <TabsList className='grid w-full grid-cols-2'>
                        <TabsTrigger value='duration'>
                            <Hourglass className='h-4 w-4 mr-2' />
                            Time Duration
                        </TabsTrigger>
                        <TabsTrigger value='settings'>
                            <Clock className='h-4 w-4 mr-2' />
                            Wait Settings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value='duration' className='space-y-3 mt-4'>
                        <div className='flex items-center space-x-2'>
                            <Switch
                                checked={useExactDate}
                                onCheckedChange={(checked) => {
                                    setUseExactDate(checked);
                                    if (checked && !newNode.exactDateTime) {
                                        // Set default to tomorrow
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
                                <Label>Wait until specific date/time</Label>
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
                            <>
                                <div>
                                    <Label>Wait Duration</Label>
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
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value='settings' className='space-y-3 mt-4'>
                        <div>
                            <Label>Resume on Node ID</Label>
                            <Input
                                value={newNode.resumeOn || ''}
                                onChange={(e) => setNewNode({ ...newNode, resumeOn: e.target.value })}
                                placeholder='ID of node to continue to after waiting'
                            />
                            <p className='text-xs text-muted-foreground mt-1'>After waiting, the workflow will continue to this node</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <Separator />

            <Button onClick={() => onSubmit(newNode)} className='w-full'>
                Save Wait Task Configuration
            </Button>
        </div>
    );
};

export default WaitNodeBuilderComponent;
