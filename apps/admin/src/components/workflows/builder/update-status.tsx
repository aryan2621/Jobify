'use client';

import { useState } from 'react';
import {
    APPLICATION_STAGE_PIPELINE_ORDER,
    ApplicationStage,
    parseApplicationStage,
    UpdateStatusNode,
} from '@jobify/domain/workflow';
import { Label } from '@jobify/ui/label';
import { Input } from '@jobify/ui/input';
import { Button } from '@jobify/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@jobify/ui/select';

interface UpdateStatusNodeBuilderProps {
    node: UpdateStatusNode;
    onSubmit: (node: UpdateStatusNode) => void;
}

function stageOptionLabel(value: ApplicationStage): string {
    return value
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

const STAGE_OPTIONS = APPLICATION_STAGE_PIPELINE_ORDER.map((value) => ({
    value,
    label: stageOptionLabel(value),
}));

const UpdateStatusNodeBuilderComponent = ({ node, onSubmit }: UpdateStatusNodeBuilderProps) => {
    const [newNode, setNewNode] = useState<UpdateStatusNode>(() => {
        const n = node as UpdateStatusNode;
        return new UpdateStatusNode(
            n.id,
            { ...n.data },
            { ...n.position },
            parseApplicationStage(n.stage),
            n.sourcePosition,
            n.targetPosition
        );
    });

    return (
        <div className='p-4'>
            <h2 className='font-bold text-lg mb-4'>Set pipeline stage</h2>
            <p className='text-sm text-muted-foreground mb-4'>
                Writes the workflow <span className='font-medium text-foreground'>stage</span> on this application’s execution. Condition nodes use it as{' '}
                <span className='font-medium text-foreground'>Application stage</span> (<code className='text-xs'>application.stage</code>). That is separate from{' '}
                <span className='font-medium text-foreground'>Application status</span> on the candidate record (Applied / Rejected / Selected).
            </p>

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
                    <Label className='mb-2 block'>Pipeline stage</Label>
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
                Save configuration
            </Button>
        </div>
    );
};

export default UpdateStatusNodeBuilderComponent;
