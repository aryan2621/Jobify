'use client';

import { useState } from 'react';
import { StartNode } from '@jobify/domain/workflow';
import { Label } from '@jobify/ui/label';
import { Input } from '@jobify/ui/input';
import { Button } from '@jobify/ui/button';
import { Play } from 'lucide-react';

interface StartNodeBuilderComponentProps {
    node: StartNode;
    onSubmit: (node: StartNode) => void;
}

const StartNodeBuilderComponent = ({ node, onSubmit }: StartNodeBuilderComponentProps) => {
    const cpNode = new StartNode(node.id, node.data, node.position, node.sourcePosition, node.targetPosition);
    const [newNode, setNewNode] = useState(cpNode);

    return (
        <div className='p-4'>
            <h2 className='font-bold text-lg mb-4'>Configure Start Node</h2>

            <div className='flex flex-col gap-4'>
                <div>
                    <Label className='mb-2 block'>Name</Label>
                    <Input value={newNode.data.name ?? `start_${newNode.id.slice(0, 8)}`} disabled className='bg-muted' />
                </div>
                <div>
                    <Label className='mb-2 block'>Node Label</Label>
                    <Input
                        value={newNode.data.label}
                        onChange={(e) => {
                            setNewNode({ ...newNode, data: { ...newNode.data, label: e.target.value } });
                        }}
                        placeholder='e.g., Start Workflow'
                    />
                </div>
            </div>

            <Button onClick={() => onSubmit(newNode)} className='mt-4 w-full'>
                Save Start Node Configuration
            </Button>
        </div>
    );
};

export default StartNodeBuilderComponent;
