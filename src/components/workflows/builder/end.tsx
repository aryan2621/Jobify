'use client';

import { useState } from 'react';
import { EndNode } from '@/model/workflow';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';

interface EndNodeBuilderComponentProps {
    node: EndNode;
    onSubmit: (node: EndNode) => void;
}

const EndNodeBuilderComponent = ({ node, onSubmit }: EndNodeBuilderComponentProps) => {
    const cpNode = new EndNode(node.id, node.data, node.position, node.sourcePosition, node.targetPosition);
    const [newNode, setNewNode] = useState(cpNode);

    return (
        <div className='space-y-6'>
            <div className='flex items-center'>
                <div className='bg-red-100 dark:bg-red-900/30 p-2 rounded-full mr-3'>
                    <X className='h-5 w-5 text-red-500' />
                </div>
                <div>
                    <h2 className='font-bold text-lg'>Configure End Node</h2>
                    <p className='text-sm text-muted-foreground'>Set the termination point of your workflow</p>
                </div>
            </div>

            <div className='space-y-4'>
                <div>
                    <Label htmlFor='label'>Node Label</Label>
                    <Input
                        id='label'
                        value={newNode.data.label}
                        onChange={(e) => {
                            setNewNode({ ...newNode, data: { ...newNode.data, label: e.target.value } });
                        }}
                        placeholder='e.g., End Workflow'
                    />
                    <p className='text-xs text-muted-foreground mt-1'>This label will be displayed on the node in the workflow editor</p>
                </div>
            </div>

            <Separator />

            <Button onClick={() => onSubmit(newNode)} className='w-full'>
                Save End Node Configuration
            </Button>
        </div>
    );
};

export default EndNodeBuilderComponent;
