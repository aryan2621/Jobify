'use client';

import { useState } from 'react';
import {
    APPLICATION_STAGE_PIPELINE_ORDER,
    ApplicationStage,
    ApplicationStatus,
    parseApplicationStage,
    parseApplicationStatus,
} from '@jobify/domain/application';
import {
    ApplicationUpdateTarget,
    UpdateStatusNode,
    parseApplicationUpdateTarget,
} from '@jobify/domain/workflow';
import { Label } from '@jobify/ui/label';
import { Input } from '@jobify/ui/input';
import { Button } from '@jobify/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@jobify/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@jobify/ui/popover';
import { CircleHelp } from 'lucide-react';

interface UpdateStatusNodeBuilderProps {
    node: UpdateStatusNode;
    onSubmit: (node: UpdateStatusNode) => void;
}

function pipelineStageLabel(value: ApplicationStage): string {
    return value
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

const TARGET_OPTIONS: { value: ApplicationUpdateTarget; label: string }[] = [
    { value: ApplicationUpdateTarget.STATUS, label: 'Application status' },
    { value: ApplicationUpdateTarget.STAGE, label: 'Pipeline stage' },
];

const STATUS_OPTIONS = Object.values(ApplicationStatus).map((value) => ({ value, label: value }));

const PIPELINE_STAGE_OPTIONS = APPLICATION_STAGE_PIPELINE_ORDER.map((value) => ({
    value,
    label: pipelineStageLabel(value),
}));

const UpdateStatusNodeBuilderComponent = ({ node, onSubmit }: UpdateStatusNodeBuilderProps) => {
    const [newNode, setNewNode] = useState<UpdateStatusNode>(() => {
        const n = node as UpdateStatusNode;
        return new UpdateStatusNode(
            n.id,
            { ...n.data },
            { ...n.position },
            parseApplicationUpdateTarget(n.updateTarget),
            parseApplicationStatus(n.applicationStatus),
            parseApplicationStage(n.pipelineStage),
            n.sourcePosition,
            n.targetPosition
        );
    });

    const isStatus = newNode.updateTarget === ApplicationUpdateTarget.STATUS;

    return (
        <div className='p-4'>
            <div className='mb-4 flex items-center gap-1'>
                <h2 className='font-bold text-lg'>Update application</h2>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground'
                            aria-label='About updating application fields'
                        >
                            <CircleHelp className='h-4 w-4' aria-hidden />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align='start' className='w-80 text-sm text-muted-foreground' sideOffset={8}>
                        <p>
                            Choose whether this step updates <span className='font-medium text-foreground'>application status</span> (Applied / Rejected / Selected) or{' '}
                            <span className='font-medium text-foreground'>pipeline stage</span> (shortlisted, assignment submitted, …). Then pick the value. Conditions use{' '}
                            <code className='text-xs text-foreground'>application.status</code> and <code className='text-xs text-foreground'>application.stage</code>.
                        </p>
                    </PopoverContent>
                </Popover>
            </div>

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
                    <Label className='mb-2 block'>Node label</Label>
                    <Input
                        value={newNode.data.label}
                        onChange={(e) => setNewNode({ ...newNode, data: { ...newNode.data, label: e.target.value } })}
                        placeholder="e.g., Set status to Rejected"
                    />
                </div>
                <div>
                    <Label className='mb-2 block'>Update field</Label>
                    <Select
                        value={newNode.updateTarget}
                        onValueChange={(v) =>
                            setNewNode({
                                ...newNode,
                                updateTarget: v as ApplicationUpdateTarget,
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Choose status or stage" />
                        </SelectTrigger>
                        <SelectContent>
                            {TARGET_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {isStatus ? (
                    <div>
                        <Label className='mb-2 block'>New application status</Label>
                        <Select
                            value={newNode.applicationStatus}
                            onValueChange={(v) => setNewNode({ ...newNode, applicationStatus: v as ApplicationStatus })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ) : (
                    <div>
                        <Label className='mb-2 block'>New pipeline stage</Label>
                        <Select
                            value={newNode.pipelineStage}
                            onValueChange={(v) => setNewNode({ ...newNode, pipelineStage: v as ApplicationStage })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                            <SelectContent>
                                {PIPELINE_STAGE_OPTIONS.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            <Button onClick={() => onSubmit(newNode)} className="mt-4 w-full">
                Save configuration
            </Button>
        </div>
    );
};

export default UpdateStatusNodeBuilderComponent;
