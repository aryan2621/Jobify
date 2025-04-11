'use client';

import { useState } from 'react';
import { StartNode } from '@/model/workflow';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Play } from 'lucide-react';

interface StartNodeBuilderComponentProps {
    node: StartNode;
    onSubmit: (node: StartNode) => void;
}

const StartNodeBuilderComponent = ({ node, onSubmit }: StartNodeBuilderComponentProps) => {
    const cpNode = new StartNode(node.id, node.data, node.position, node.sourcePosition, node.targetPosition);
    const [newNode, setNewNode] = useState(cpNode);

    return (
        <div className='space-y-6'>
            <div className='flex items-center'>
                <div className='bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3'>
                    <Play className='h-5 w-5 text-green-500' />
                </div>
                <div>
                    <h2 className='font-bold text-lg'>Configure Start Node</h2>
                    <p className='text-sm text-muted-foreground'>Set the starting point of your workflow</p>
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
                        placeholder='e.g., Start Workflow'
                    />
                    <p className='text-xs text-muted-foreground mt-1'>This label will be displayed on the node in the workflow editor</p>
                </div>
            </div>

            <Separator />

            <Button onClick={() => onSubmit(newNode)} className='w-full'>
                Save Start Node Configuration
            </Button>
        </div>
    );
};

export default StartNodeBuilderComponent;
