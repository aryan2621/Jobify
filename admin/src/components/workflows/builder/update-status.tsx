'use client';

import { useState } from 'react';
import { UpdateStatusNode, ApplicationStage } from '@/model/workflow';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Flag } from 'lucide-react';

interface UpdateStatusNodeBuilderProps {
    node: UpdateStatusNode;
    onSubmit: (node: UpdateStatusNode) => void;
}

const STAGE_OPTIONS = Object.values(ApplicationStage).map((s) => ({
    value: s,
    label: s.replace(/_/g, ' '),
}));

const UpdateStatusNodeBuilderComponent = ({ node, onSubmit }: UpdateStatusNodeBuilderProps) => {
    const [newNode, setNewNode] = useState<UpdateStatusNode>(() => {
        const n = node as UpdateStatusNode;
        return new UpdateStatusNode(
            n.id,
            { ...n.data },
            { ...n.position },
            n.stage ?? ApplicationStage.APPLIED,
            n.sourcePosition,
            n.targetPosition
        );
    });

    return (
        <div className='p-4'>
            <h2 className='font-bold text-lg mb-4'>Configure Update Status</h2>

            <div className='flex flex-col gap-4'>
                <div>
                    <Label className='mb-2 block'>Name</Label>
                    <Input
                        value={newNode.data.name ?? `update_status_${newNode.id.slice(0, 8)}`}
                        disabled
                        className="bg-muted"
                    />
                </div>
                <div>
                    <Label className='mb-2 block'>Node Label</Label>
                    <Input
                        value={newNode.data.label}
                        onChange={(e) => setNewNode({ ...newNode, data: { ...newNode.data, label: e.target.value } })}
                        placeholder="e.g., Mark as shortlisted"
                    />
                </div>
                <div>
                    <Label className='mb-2 block'>Stage</Label>
                    <Select
                        value={newNode.stage}
                        onValueChange={(v) => setNewNode({ ...newNode, stage: v as ApplicationStage })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                            {STAGE_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Button onClick={() => onSubmit(newNode)} className="mt-4 w-full">
                Save Update Status Configuration
            </Button>
        </div>
    );
};

export default UpdateStatusNodeBuilderComponent;
