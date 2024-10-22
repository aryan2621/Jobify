'use client';

import { Label } from '@/components/ui/label';
import { NotificationNode, NotificationOption } from '../model';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface NotificationNodeBuilderProps {
    node: NotificationNode;
    onSubmit: (node: NotificationNode) => void;
}

const NotificationNodeBuilderComponent = ({ node, onSubmit }: NotificationNodeBuilderProps) => {
    const cpNode = new NotificationNode(node.id, node.data, node.position, node.notificationOptions, node.sourcePosition, node.targetPosition);
    const [newNode, setNewNode] = useState(cpNode);
    return (
        <div className='p-4'>
            <h2 className='font-bold text-lg mb-4'>Notification Task</h2>
            <div className='flex flex-col gap-4'>
                <div>
                    <Label>Label</Label>
                    <Input
                        value={node.data.label}
                        onChange={(e) => {
                            setNewNode({ ...newNode, data: { ...newNode.data, label: e.target.value } });
                        }}
                    />
                </div>
                <div>
                    <Label className='mb-2 block'>Notification Methods</Label>
                    <div className='flex flex-col gap-2'>
                        {Object.values(NotificationOption).map((option) => (
                            <div key={option} className='flex items-center gap-2'>
                                <Checkbox
                                    checked={newNode.notificationOptions?.includes(option)}
                                    onCheckedChange={(checked) => {
                                        setNewNode({
                                            ...newNode,
                                            notificationOptions: checked
                                                ? [...newNode.notificationOptions, option]
                                                : newNode.notificationOptions.filter((o) => o !== option),
                                        });
                                    }}
                                />
                                <Label>{option.charAt(0).toUpperCase() + option.slice(1)}</Label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Button onClick={() => onSubmit(newNode)} className='mt-4 w-full'>
                Submit
            </Button>
        </div>
    );
};

export default NotificationNodeBuilderComponent;
