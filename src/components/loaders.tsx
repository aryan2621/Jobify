'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type SkeletonVariant = 'card' | 'list-item' | 'profile' | 'table-row' | 'text-block' | 'image' | 'avatar' | 'form' | 'stats' | 'custom';

type SkeletonSizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface SkeletonLoaderProps {
    variant?: SkeletonVariant;
    count?: number;
    className?: string;
    size?: SkeletonSizes;
    height?: string | number;
    width?: string | number;
    rounded?: boolean | string;
    animate?: boolean;
    isLoading?: boolean;
    children?: React.ReactNode;
    customPattern?: {
        className?: string;
        rows?: Array<{ width?: string; height?: string; className?: string }>;
    };
}

const sizeToHeightMap = {
    xs: 'h-4',
    sm: 'h-6',
    md: 'h-10',
    lg: 'h-16',
    xl: 'h-24',
};

const sizeToWidthMap = {
    xs: 'w-16',
    sm: 'w-24',
    md: 'w-32',
    lg: 'w-48',
    xl: 'w-64',
};

const SkeletonLoader = ({
    variant = 'text-block',
    count = 1,
    className = '',
    size = 'md',
    height,
    width,
    rounded = true,
    animate = true,
    isLoading = true,
    children,
    customPattern,
}: SkeletonLoaderProps) => {
    if (!isLoading) {
        return <>{children}</>;
    }

    // Helper to generate skeleton with the appropriate size/dimensions
    const generateBaseSkeleton = (key: number | string, customClass?: string, customHeight?: string | number, customWidth?: string | number) => {
        const heightClass = customHeight ? (typeof customHeight === 'number' ? `h-[${customHeight}px]` : customHeight) : sizeToHeightMap[size];

        const widthClass = customWidth ? (typeof customWidth === 'number' ? `w-[${customWidth}px]` : customWidth) : sizeToWidthMap[size];

        const roundedClass = rounded ? (typeof rounded === 'string' ? rounded : 'rounded-md') : '';

        return <Skeleton key={key} className={cn(heightClass, widthClass, roundedClass, animate ? 'animate-pulse' : '', customClass)} />;
    };

    // For custom pattern rendering
    if (variant === 'custom' && customPattern) {
        return (
            <div className={cn('space-y-2', customPattern.className)}>
                {customPattern.rows?.map((row, rowIndex) => (
                    <Skeleton
                        key={rowIndex}
                        className={cn(
                            row.height || sizeToHeightMap[size],
                            row.width || 'w-full',
                            rounded ? 'rounded-md' : '',
                            animate ? 'animate-pulse' : '',
                            row.className
                        )}
                    />
                ))}
            </div>
        );
    }

    // For various predefined variants
    switch (variant) {
        case 'card':
            return (
                <div className={cn('space-y-5 p-4 border rounded-lg', className)}>
                    <div className='flex items-center space-x-4'>
                        <Skeleton className={cn('h-12 w-12 rounded-full', animate ? 'animate-pulse' : '')} />
                        <div className='space-y-2'>
                            <Skeleton className={cn('h-4 w-[200px]', animate ? 'animate-pulse' : '')} />
                            <Skeleton className={cn('h-4 w-[160px]', animate ? 'animate-pulse' : '')} />
                        </div>
                    </div>
                    <Skeleton className={cn('h-4 w-full', animate ? 'animate-pulse' : '')} />
                    <Skeleton className={cn('h-4 w-full', animate ? 'animate-pulse' : '')} />
                    <Skeleton className={cn('h-4 w-2/3', animate ? 'animate-pulse' : '')} />
                </div>
            );

        case 'list-item':
            return (
                <div className={cn('space-y-3', className)}>
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className='flex items-center space-x-4 py-2'>
                            <Skeleton className={cn('h-10 w-10 rounded-full', animate ? 'animate-pulse' : '')} />
                            <div className='space-y-2 flex-1'>
                                <Skeleton className={cn('h-4 w-full max-w-[200px]', animate ? 'animate-pulse' : '')} />
                                <Skeleton className={cn('h-3 w-full max-w-[160px]', animate ? 'animate-pulse' : '')} />
                            </div>
                            <Skeleton className={cn('h-8 w-16', animate ? 'animate-pulse' : '')} />
                        </div>
                    ))}
                </div>
            );

        case 'profile':
            return (
                <div className={cn('space-y-6', className)}>
                    <div className='flex flex-col items-center space-y-4'>
                        <Skeleton className={cn('h-24 w-24 rounded-full', animate ? 'animate-pulse' : '')} />
                        <Skeleton className={cn('h-6 w-48', animate ? 'animate-pulse' : '')} />
                        <Skeleton className={cn('h-4 w-32', animate ? 'animate-pulse' : '')} />
                    </div>
                    <div className='space-y-4'>
                        <Skeleton className={cn('h-4 w-full', animate ? 'animate-pulse' : '')} />
                        <Skeleton className={cn('h-4 w-full', animate ? 'animate-pulse' : '')} />
                        <Skeleton className={cn('h-4 w-3/4', animate ? 'animate-pulse' : '')} />
                    </div>
                    <div className='grid grid-cols-3 gap-4'>
                        <Skeleton className={cn('h-20 w-full', animate ? 'animate-pulse' : '')} />
                        <Skeleton className={cn('h-20 w-full', animate ? 'animate-pulse' : '')} />
                        <Skeleton className={cn('h-20 w-full', animate ? 'animate-pulse' : '')} />
                    </div>
                </div>
            );

        case 'table-row':
            return (
                <div className={cn('space-y-4', className)}>
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className='flex space-x-4'>
                            <Skeleton className={cn('h-8 w-8', animate ? 'animate-pulse' : '')} />
                            <Skeleton className={cn('h-8 w-full max-w-[150px]', animate ? 'animate-pulse' : '')} />
                            <Skeleton className={cn('h-8 w-full', animate ? 'animate-pulse' : '')} />
                            <Skeleton className={cn('h-8 w-24', animate ? 'animate-pulse' : '')} />
                            <Skeleton className={cn('h-8 w-24', animate ? 'animate-pulse' : '')} />
                        </div>
                    ))}
                </div>
            );

        case 'image':
            return (
                <Skeleton
                    className={cn(
                        height ? (typeof height === 'number' ? `h-[${height}px]` : height) : 'h-48',
                        width ? (typeof width === 'number' ? `w-[${width}px]` : width) : 'w-full',
                        rounded ? 'rounded-md' : '',
                        animate ? 'animate-pulse' : '',
                        className
                    )}
                />
            );

        case 'avatar':
            return (
                <Skeleton
                    className={cn(
                        height ? (typeof height === 'number' ? `h-[${height}px]` : height) : 'h-12',
                        width ? (typeof width === 'number' ? `w-[${width}px]` : width) : 'w-12',
                        'rounded-full',
                        animate ? 'animate-pulse' : '',
                        className
                    )}
                />
            );

        case 'form':
            return (
                <div className={cn('space-y-6', className)}>
                    <div className='space-y-2'>
                        <Skeleton className={cn('h-4 w-32', animate ? 'animate-pulse' : '')} />
                        <Skeleton className={cn('h-10 w-full', animate ? 'animate-pulse' : '')} />
                    </div>
                    <div className='space-y-2'>
                        <Skeleton className={cn('h-4 w-32', animate ? 'animate-pulse' : '')} />
                        <Skeleton className={cn('h-10 w-full', animate ? 'animate-pulse' : '')} />
                    </div>
                    <div className='space-y-2'>
                        <Skeleton className={cn('h-4 w-32', animate ? 'animate-pulse' : '')} />
                        <Skeleton className={cn('h-28 w-full', animate ? 'animate-pulse' : '')} />
                    </div>
                    <Skeleton className={cn('h-10 w-32', animate ? 'animate-pulse' : '')} />
                </div>
            );

        case 'stats':
            return (
                <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className='p-4 border rounded-lg space-y-3'>
                            <Skeleton className={cn('h-6 w-12', animate ? 'animate-pulse' : '')} />
                            <Skeleton className={cn('h-8 w-20', animate ? 'animate-pulse' : '')} />
                            <Skeleton className={cn('h-2 w-full', animate ? 'animate-pulse' : '')} />
                        </div>
                    ))}
                </div>
            );

        // Default text block
        case 'text-block':
        default:
            return (
                <div className={cn('space-y-2', className)}>
                    {Array.from({ length: count }).map((_, i) => generateBaseSkeleton(i, undefined, height, width))}
                </div>
            );
    }
};

// Example usage components for different content types
export const CardSkeleton = (props: Omit<SkeletonLoaderProps, 'variant'>) => <SkeletonLoader variant='card' {...props} />;

export const ListItemSkeleton = (props: Omit<SkeletonLoaderProps, 'variant'>) => <SkeletonLoader variant='list-item' {...props} />;

export const ProfileSkeleton = (props: Omit<SkeletonLoaderProps, 'variant'>) => <SkeletonLoader variant='profile' {...props} />;

export const TableRowSkeleton = (props: Omit<SkeletonLoaderProps, 'variant'>) => <SkeletonLoader variant='table-row' {...props} />;

export const ImageSkeleton = (props: Omit<SkeletonLoaderProps, 'variant'>) => <SkeletonLoader variant='image' {...props} />;

export const AvatarSkeleton = (props: Omit<SkeletonLoaderProps, 'variant'>) => <SkeletonLoader variant='avatar' {...props} />;

export const FormSkeleton = (props: Omit<SkeletonLoaderProps, 'variant'>) => <SkeletonLoader variant='form' {...props} />;

export const StatsSkeleton = (props: Omit<SkeletonLoaderProps, 'variant'>) => <SkeletonLoader variant='stats' {...props} />;

export default SkeletonLoader;
