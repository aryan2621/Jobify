'use client';

import { useState } from 'react';
import { UpdateStatusNode, ApplicationStage } from '@/model/workflow';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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
        <div className="space-y-6">
            <div className="flex items-center">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full mr-3">
                    <Flag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                    <h2 className="font-bold text-lg">Configure Update Status</h2>
                    <p className="text-sm text-muted-foreground">Set application stage so workflow and UI stay in sync</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        value={newNode.data.name ?? `update_status_${newNode.id.slice(0, 8)}`}
                        disabled
                        className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Unique identifier for this node (read-only)</p>
                </div>
                <div>
                    <Label htmlFor="label">Node Label</Label>
                    <Input
                        id="label"
                        value={newNode.data.label}
                        onChange={(e) => setNewNode({ ...newNode, data: { ...newNode.data, label: e.target.value } })}
                        placeholder="e.g., Mark as shortlisted"
                    />
                </div>
                <div>
                    <Label>Stage</Label>
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
                    <p className="text-xs text-muted-foreground mt-1">This value is written to application.stage when the workflow runs</p>
                </div>
            </div>

            <Separator />
            <Button onClick={() => onSubmit(newNode)} className="w-full">
                Save Update Status Configuration
            </Button>
        </div>
    );
};

export default UpdateStatusNodeBuilderComponent;
