// Enhanced customEdge.tsx - Improved edge styling with better delete controls

import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, useReactFlow } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const CustomEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    selected,
    animated = false,
    data,
    style = {},
    markerEnd,
}: EdgeProps) => {
    const { setEdges } = useReactFlow();

    // Get the bezier path properties based on the source and target coordinates
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    // Edge deletion handler
    const onDelete = () => {
        setEdges((edges) => edges.filter((edge) => edge.id !== id));
    };

    // Default styles for the edge
    const defaultStyle = {
        strokeWidth: 2,
        stroke: selected ? '#3b82f6' : '#64748b',
        ...style,
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={defaultStyle} className={animated ? 'react-flow__edge-path-animated' : ''} />

            <EdgeLabelRenderer>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                style={{
                                    transform: `translate(${labelX}px, ${labelY}px)`,
                                    pointerEvents: 'all',
                                }}
                                className='absolute -translate-x-1/2 -translate-y-1/2'
                            >
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={onDelete}
                                    className={`
                    h-6 w-6 rounded-full bg-white/90 dark:bg-gray-800/90 
                    shadow-md border border-gray-200 dark:border-gray-700
                    hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400
                    transition-all scale-0 opacity-0 group-hover:opacity-100 group-hover:scale-100 
                    ${selected ? 'opacity-100 scale-100' : ''}
                  `}
                                >
                                    <Trash2 className='h-3 w-3' />
                                </Button>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className='text-xs'>Remove connection</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </EdgeLabelRenderer>
        </>
    );
};
