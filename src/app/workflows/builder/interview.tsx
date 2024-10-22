'use client';

import { InterviewNode } from '../model';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface InterviewNodeBuilderProps {
    node: InterviewNode;
    onSubmit: (node: InterviewNode) => void;
}

const InterviewNodeBuilderComponent = ({ node, onSubmit }: InterviewNodeBuilderProps) => {
    const cpNode = new InterviewNode(
        node.id,
        node.data,
        node.position,
        node.link,
        node.description,
        node.attachments,
        node.time,
        node.sourcePosition,
        node.targetPosition
    );
    const [newNode, setNewNode] = useState(cpNode);
    return (
        <div className='p-4'>
            <h2 className='font-bold text-lg mb-4'>Interview Task</h2>
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
                    <Label>Meeting Link</Label>
                    <Input
                        value={node.link}
                        onChange={(e) => {
                            setNewNode({ ...newNode, link: e.target.value });
                        }}
                    />
                </div>
                <div>
                    <Label>Interview Time</Label>
                    <Input
                        type='datetime-local'
                        value={node.time?.toISOString().slice(0, 16)}
                        onChange={(e) => {
                            setNewNode({ ...newNode, time: new Date(e.target.value) });
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

export default InterviewNodeBuilderComponent;
