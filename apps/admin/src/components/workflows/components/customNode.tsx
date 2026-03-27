import { Handle, Position } from '@xyflow/react';
import { NodeType } from '@jobify/domain/workflow';

export const CustomNode = ({ data, type }: { data: { label: string }, type?: string }) => {
    return (
        <div className='shadow-md p-4 rounded-lg border-2 border-gray-200'>
            {/* Only show target handle for END and TASK nodes */}
            {type !== NodeType.START && (
                <Handle type='target' position={Position.Top} className='bg-blue-500 w-2 h-2' />
            )}
            <div className='text-center font-bold text-lg'>{data.label}</div>
            {/* Only show source handle for START and TASK nodes */}
            {type !== NodeType.END && (
                <Handle type='source' position={Position.Bottom} className='bg-blue-500 w-2 h-2' />
            )}
        </div>
    );
};
