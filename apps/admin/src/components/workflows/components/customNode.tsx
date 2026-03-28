'use client';

import { Handle, Position, useReactFlow } from '@xyflow/react';
import type { ConditionBranch } from '@jobify/domain/workflow';
import { NodeType, TaskType } from '@jobify/domain/workflow';

type FlowNodeWithTask = {
    id: string;
    taskType?: TaskType;
    conditions?: ConditionBranch[];
};

export const CustomNode = ({ id, data, type }: { id: string; data: { label: string }; type?: string }) => {
    const { getNode } = useReactFlow();
    const full = getNode(id) as FlowNodeWithTask | undefined;
    const taskType = full?.taskType;
    const conditions = full?.conditions ?? [];
    const isConditionLayout =
        type === NodeType.TASK && taskType === TaskType.CONDITION && conditions.length > 0;
    const branchCount = conditions.length;
    const totalHandles = branchCount + 1;

    return (
        <div className='shadow-md p-4 rounded-lg border-2 border-gray-200 relative min-w-[160px]'>
            {type !== NodeType.START && (
                <Handle type='target' position={Position.Top} className='bg-blue-500 w-2 h-2' />
            )}
            <div className='text-center font-bold text-lg'>{data.label}</div>
            {type !== NodeType.END && !isConditionLayout && (
                <Handle type='source' position={Position.Bottom} className='bg-blue-500 w-2 h-2' />
            )}
            {type !== NodeType.END && isConditionLayout && (
                <div className='relative mt-3 h-9 w-full'>
                    {conditions.map((_, i) => (
                        <div
                            key={`branch-${i}`}
                            className='absolute bottom-0 flex flex-col items-center gap-0.5'
                            style={{ left: `${((i + 0.5) / totalHandles) * 100}%`, transform: 'translateX(-50%)' }}
                        >
                            <span className='text-[10px] text-muted-foreground whitespace-nowrap'>If {i + 1}</span>
                            <Handle
                                type='source'
                                position={Position.Bottom}
                                id={`branch-${i}`}
                                className='!static !transform-none bg-blue-500 w-2 h-2'
                            />
                        </div>
                    ))}
                    <div
                        className='absolute bottom-0 flex flex-col items-center gap-0.5'
                        style={{ left: `${((branchCount + 0.5) / totalHandles) * 100}%`, transform: 'translateX(-50%)' }}
                    >
                        <span className='text-[10px] text-muted-foreground whitespace-nowrap'>Else</span>
                        <Handle
                            type='source'
                            position={Position.Bottom}
                            id='branch-else'
                            className='!static !transform-none bg-amber-600 w-2 h-2'
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
