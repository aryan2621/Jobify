'use client';

import { Label } from '@/components/ui/label';
import { AssignmentNode } from '../model';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface AssignmentNodeBuilderProps {
    node: AssignmentNode;
    onSubmit: (node: AssignmentNode) => void;
}

const AssignmentNodeBuilderComponent = ({ node, onSubmit }: AssignmentNodeBuilderProps) => {
    const cpNode = new AssignmentNode(
        node.id,
        node.data,
        node.position,
        node.url,
        node.deadline,
        node.description,
        node.attachments,
        node.sourcePosition,
        node.targetPosition
    );
    const [newNode, setNewNode] = useState(cpNode);
    return (
        <div className='p-4'>
            <h2 className='font-bold text-lg mb-4'>Assignment Task</h2>
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
                    <Label>URL</Label>
                    <Input
                        value={node.url}
                        onChange={(e) => {
                            setNewNode({ ...newNode, url: e.target.value });
                        }}
                    />
                </div>
                <div>
                    <Label>Deadline</Label>
                    <Input
                        type='datetime-local'
                        value={node.deadline?.toISOString().slice(0, 16)}
                        onChange={(e) => {
                            setNewNode({ ...newNode, deadline: new Date(e.target.value) });
                        }}
                    />
                </div>
                <div>
                    <Label>Description</Label>
                    <Input
                        value={node.description}
                        onChange={(e) => {
                            setNewNode({ ...newNode, description: e.target.value });
                        }}
                    />
                </div>
            </div>
            <Button onClick={() => onSubmit(newNode)} className='mt-4 w-full'>
                Submit
            </Button>
        </div>
    );
};

export default AssignmentNodeBuilderComponent;
