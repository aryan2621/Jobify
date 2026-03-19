'use client';

import { useState } from 'react';
import { EndNode } from '@/model/workflow';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface EndNodeBuilderComponentProps {
    node: EndNode;
    onSubmit: (node: EndNode) => void;
}

const EndNodeBuilderComponent = ({ node, onSubmit }: EndNodeBuilderComponentProps) => {
    const cpNode = new EndNode(node.id, node.data, node.position, node.sourcePosition, node.targetPosition);
    const [newNode, setNewNode] = useState(cpNode);

    return (
        <div className='p-4'>
            <h2 className='font-bold text-lg mb-4'>Configure End Node</h2>

            <div className='flex flex-col gap-4'>
                <div>
                    <Label className='mb-2 block'>Name</Label>
                    <Input value={newNode.data.name ?? `end_${newNode.id.slice(0, 8)}`} disabled className='bg-muted' />
                </div>
                <div>
                    <Label className='mb-2 block'>Node Label</Label>
                    <Input
                        value={newNode.data.label}
                        onChange={(e) => {
                            setNewNode({ ...newNode, data: { ...newNode.data, label: e.target.value } });
                        }}
                        placeholder='e.g., End Workflow'
                    />
                </div>
            </div>

            <Button onClick={() => onSubmit(newNode)} className='mt-4 w-full'>
                Save End Node Configuration
            </Button>
        </div>
    );
};

export default EndNodeBuilderComponent;
