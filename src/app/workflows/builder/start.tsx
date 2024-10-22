'use client';

import { StartNode } from '../model';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface StartNodeBuilderComponentProps {
    node: StartNode;
    onSubmit: (node: StartNode) => void;
}
const StartNodeBuilderComponent = ({ node, onSubmit }: StartNodeBuilderComponentProps) => {
    const cpNode = new StartNode(node.id, node.data, node.position, node.sourcePosition, node.targetPosition);
    const [newNode, setNewNode] = useState(cpNode);
    return (
        <div className='p-4'>
            <h2 className='font-bold text-lg'>Start Node</h2>
            <div className='flex flex-col gap-2'>
                <Label>Label</Label>
                <Input
                    value={node.data.label}
                    onChange={(e) => {
                        setNewNode({ ...newNode, data: { ...newNode.data, label: e.target.value } });
                    }}
                />
            </div>
            <Button onClick={() => onSubmit(newNode)} className='mt-4 w-full'>
                Submit
            </Button>
        </div>
    );
};

export default StartNodeBuilderComponent;
