import { Handle, Position } from '@xyflow/react';

export const CustomNode = ({ data }: { data: { label: string } }) => {
    return (
        <div className='shadow-md p-4 rounded-lg border-2 border-gray-200'>
            <Handle type='target' position={Position.Top} className='bg-blue-500 w-2 h-2' />
            <div className='text-center font-bold text-lg'>{data.label}</div>
            <Handle type='source' position={Position.Bottom} className='bg-blue-500 w-2 h-2' />
        </div>
    );
};
