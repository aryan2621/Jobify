'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type JobSkeletonVariant =
    | 'job-card'
    | 'application-card'
    | 'candidate-profile'
    | 'job-post-detail'
    | 'resume'
    | 'search-results'
    | 'dashboard-stats'
    | 'custom';

interface JobSkeletonLoaderProps {
    variant?: JobSkeletonVariant;
    count?: number;
    className?: string;
    isLoading?: boolean;
    children?: React.ReactNode;
    includeFilters?: boolean;
    animate?: boolean;
    customPattern?: {
        className?: string;
        rows?: Array<{ width?: string; height?: string; className?: string }>;
    };
}

/**
 * JobSkeletonLoader - A specialized skeleton loader for job-related content
 *
 * Provides pre-designed loading states specifically for job application interfaces,
 * hiring dashboards, and recruitment platforms.
 */
const JobSkeletonLoader = ({
    variant = 'job-card',
    count = 1,
    className = '',
    isLoading = true,
    children,
    includeFilters = false,
    animate = true,
    customPattern,
}: JobSkeletonLoaderProps) => {
    if (!isLoading) {
        return <>{children}</>;
    }

    const animateClass = animate ? 'animate-pulse' : '';

    // For custom pattern rendering
    if (variant === 'custom' && customPattern) {
        return (
            <div className={cn('space-y-2', customPattern.className)}>
                {customPattern.rows?.map((row, rowIndex) => (
                    <Skeleton key={rowIndex} className={cn(row.height || 'h-4', row.width || 'w-full', 'rounded-md', animateClass, row.className)} />
                ))}
            </div>
        );
    }

    // Optional filters section for search results and job listings
    const FiltersSection = () => (
        <div className='flex flex-wrap gap-2 items-center mb-4 px-2'>
            <Skeleton className={cn('h-9 w-36 rounded-md', animateClass)} />
            <Skeleton className={cn('h-9 w-36 rounded-md', animateClass)} />
            <Skeleton className={cn('h-9 w-48 ml-auto rounded-md', animateClass)} />
        </div>
    );

    // For various predefined job-related variants
    switch (variant) {
        case 'job-card':
            return (
                <div className={cn('space-y-3', className)}>
                    {includeFilters && <FiltersSection />}

                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className='border rounded-lg p-4 space-y-3'>
                            <div className='flex justify-between'>
                                <div className='space-y-2'>
                                    <Skeleton className={cn('h-5 w-48', animateClass)} />
                                    <Skeleton className={cn('h-4 w-36', animateClass)} />
                                </div>
                                <Skeleton className={cn('h-10 w-10 rounded-full', animateClass)} />
                            </div>

                            <div className='pt-2 space-y-2'>
                                <Skeleton className={cn('h-3 w-full', animateClass)} />
                                <Skeleton className={cn('h-3 w-full', animateClass)} />
                                <Skeleton className={cn('h-3 w-2/3', animateClass)} />
                            </div>

                            <div className='flex flex-wrap gap-2 pt-2'>
                                <Skeleton className={cn('h-6 w-16 rounded-full', animateClass)} />
                                <Skeleton className={cn('h-6 w-20 rounded-full', animateClass)} />
                                <Skeleton className={cn('h-6 w-24 rounded-full', animateClass)} />
                            </div>

                            <div className='flex justify-between items-center pt-2'>
                                <Skeleton className={cn('h-8 w-24 rounded-md', animateClass)} />
                                <div className='flex space-x-2'>
                                    <Skeleton className={cn('h-4 w-24', animateClass)} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );

        case 'application-card':
            return (
                <div className={cn('space-y-3', className)}>
                    {includeFilters && <FiltersSection />}

                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className='border rounded-lg p-4'>
                            <div className='flex items-start gap-4'>
                                <Skeleton className={cn('h-10 w-10 rounded-full', animateClass)} />
                                <div className='flex-1 space-y-2'>
                                    <Skeleton className={cn('h-5 w-40', animateClass)} />
                                    <Skeleton className={cn('h-4 w-60', animateClass)} />

                                    <div className='grid grid-cols-2 gap-2 mt-3'>
                                        <div className='flex items-center gap-2'>
                                            <Skeleton className={cn('h-4 w-4', animateClass)} />
                                            <Skeleton className={cn('h-4 w-24', animateClass)} />
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <Skeleton className={cn('h-4 w-4', animateClass)} />
                                            <Skeleton className={cn('h-4 w-28', animateClass)} />
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <Skeleton className={cn('h-4 w-4', animateClass)} />
                                            <Skeleton className={cn('h-4 w-20', animateClass)} />
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <Skeleton className={cn('h-4 w-4', animateClass)} />
                                            <Skeleton className={cn('h-4 w-32', animateClass)} />
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-col items-end gap-2'>
                                    <Skeleton className={cn('h-6 w-20 rounded-full', animateClass)} />
                                    <Skeleton className={cn('h-6 w-16', animateClass)} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );

        case 'candidate-profile':
            return (
                <div className={cn('border rounded-lg', className)}>
                    <div className='p-4 border-b space-y-4'>
                        <div className='flex items-center gap-4'>
                            <Skeleton className={cn('h-16 w-16 rounded-full', animateClass)} />
                            <div className='space-y-2'>
                                <Skeleton className={cn('h-6 w-48', animateClass)} />
                                <Skeleton className={cn('h-4 w-32', animateClass)} />
                            </div>
                            <div className='flex items-center gap-2 ml-auto'>
                                <Skeleton className={cn('h-8 w-24 rounded-md', animateClass)} />
                                <Skeleton className={cn('h-8 w-8 rounded-md', animateClass)} />
                            </div>
                        </div>

                        <div className='flex gap-2'>
                            <Skeleton className={cn('h-8 w-20 rounded-md', animateClass)} />
                            <Skeleton className={cn('h-8 w-20 rounded-md', animateClass)} />
                            <Skeleton className={cn('h-8 w-20 rounded-md', animateClass)} />
                        </div>
                    </div>

                    <div className='p-4 space-y-6'>
                        <div className='space-y-3'>
                            <div className='flex items-center gap-2'>
                                <Skeleton className={cn('h-5 w-5', animateClass)} />
                                <Skeleton className={cn('h-5 w-32', animateClass)} />
                            </div>
                            <div className='ml-7 space-y-2'>
                                <Skeleton className={cn('h-4 w-full', animateClass)} />
                                <Skeleton className={cn('h-4 w-full', animateClass)} />
                                <Skeleton className={cn('h-4 w-2/3', animateClass)} />
                            </div>
                        </div>

                        <div className='space-y-3'>
                            <div className='flex items-center gap-2'>
                                <Skeleton className={cn('h-5 w-5', animateClass)} />
                                <Skeleton className={cn('h-5 w-32', animateClass)} />
                            </div>
                            <div className='ml-7 space-y-2'>
                                <Skeleton className={cn('h-16 w-full rounded-md', animateClass)} />
                            </div>
                        </div>

                        <div className='space-y-3'>
                            <div className='flex items-center gap-2'>
                                <Skeleton className={cn('h-5 w-5', animateClass)} />
                                <Skeleton className={cn('h-5 w-32', animateClass)} />
                            </div>
                            <div className='ml-7 flex flex-wrap gap-2'>
                                <Skeleton className={cn('h-6 w-16 rounded-full', animateClass)} />
                                <Skeleton className={cn('h-6 w-20 rounded-full', animateClass)} />
                                <Skeleton className={cn('h-6 w-24 rounded-full', animateClass)} />
                                <Skeleton className={cn('h-6 w-16 rounded-full', animateClass)} />
                                <Skeleton className={cn('h-6 w-28 rounded-full', animateClass)} />
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'job-post-detail':
            return (
                <div className={cn('border rounded-lg', className)}>
                    <div className='p-4 border-b'>
                        <div className='flex justify-between'>
                            <div className='space-y-3'>
                                <Skeleton className={cn('h-7 w-64', animateClass)} />
                                <Skeleton className={cn('h-5 w-48', animateClass)} />
                            </div>
                            <div className='space-y-2 text-right'>
                                <Skeleton className={cn('h-10 w-10 rounded-full ml-auto', animateClass)} />
                                <Skeleton className={cn('h-4 w-24 ml-auto', animateClass)} />
                            </div>
                        </div>

                        <div className='flex flex-wrap gap-3 mt-4'>
                            <Skeleton className={cn('h-7 w-24 rounded-md', animateClass)} />
                            <Skeleton className={cn('h-7 w-28 rounded-md', animateClass)} />
                            <Skeleton className={cn('h-7 w-32 rounded-md', animateClass)} />
                        </div>
                    </div>

                    <div className='p-4 space-y-6'>
                        <div className='space-y-2'>
                            <Skeleton className={cn('h-6 w-48', animateClass)} />
                            <Skeleton className={cn('h-4 w-full', animateClass)} />
                            <Skeleton className={cn('h-4 w-full', animateClass)} />
                            <Skeleton className={cn('h-4 w-3/4', animateClass)} />
                        </div>

                        <div className='space-y-2'>
                            <Skeleton className={cn('h-6 w-48', animateClass)} />
                            <div className='space-y-2 ml-4'>
                                <div className='flex gap-2 items-center'>
                                    <Skeleton className={cn('h-3 w-3 rounded-full', animateClass)} />
                                    <Skeleton className={cn('h-4 w-64', animateClass)} />
                                </div>
                                <div className='flex gap-2 items-center'>
                                    <Skeleton className={cn('h-3 w-3 rounded-full', animateClass)} />
                                    <Skeleton className={cn('h-4 w-56', animateClass)} />
                                </div>
                                <div className='flex gap-2 items-center'>
                                    <Skeleton className={cn('h-3 w-3 rounded-full', animateClass)} />
                                    <Skeleton className={cn('h-4 w-72', animateClass)} />
                                </div>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Skeleton className={cn('h-6 w-32', animateClass)} />
                            <div className='flex flex-wrap gap-2'>
                                <Skeleton className={cn('h-7 w-20 rounded-full', animateClass)} />
                                <Skeleton className={cn('h-7 w-24 rounded-full', animateClass)} />
                                <Skeleton className={cn('h-7 w-16 rounded-full', animateClass)} />
                                <Skeleton className={cn('h-7 w-28 rounded-full', animateClass)} />
                            </div>
                        </div>

                        <Skeleton className={cn('h-12 w-full rounded-md', animateClass)} />
                    </div>
                </div>
            );

        case 'resume':
            return (
                <div className={cn('border rounded-lg p-6', className)}>
                    <div className='flex items-center gap-4 mb-6 pb-6 border-b'>
                        <Skeleton className={cn('h-20 w-20 rounded-full', animateClass)} />
                        <div className='space-y-2'>
                            <Skeleton className={cn('h-6 w-48', animateClass)} />
                            <Skeleton className={cn('h-4 w-36', animateClass)} />
                            <Skeleton className={cn('h-4 w-56', animateClass)} />
                        </div>
                    </div>

                    <div className='space-y-6'>
                        <div className='space-y-3'>
                            <div className='flex items-center gap-2'>
                                <Skeleton className={cn('h-5 w-5', animateClass)} />
                                <Skeleton className={cn('h-5 w-24', animateClass)} />
                            </div>
                            <div className='space-y-3 ml-7'>
                                <div className='space-y-1 pb-3 border-b'>
                                    <Skeleton className={cn('h-5 w-48', animateClass)} />
                                    <Skeleton className={cn('h-4 w-32', animateClass)} />
                                    <Skeleton className={cn('h-3 w-24', animateClass)} />
                                </div>
                                <div className='space-y-1'>
                                    <Skeleton className={cn('h-5 w-40', animateClass)} />
                                    <Skeleton className={cn('h-4 w-32', animateClass)} />
                                    <Skeleton className={cn('h-3 w-24', animateClass)} />
                                </div>
                            </div>
                        </div>

                        <div className='space-y-3'>
                            <div className='flex items-center gap-2'>
                                <Skeleton className={cn('h-5 w-5', animateClass)} />
                                <Skeleton className={cn('h-5 w-32', animateClass)} />
                            </div>
                            <div className='space-y-3 ml-7'>
                                <div className='space-y-1 pb-3 border-b'>
                                    <Skeleton className={cn('h-5 w-52', animateClass)} />
                                    <Skeleton className={cn('h-4 w-40', animateClass)} />
                                    <Skeleton className={cn('h-3 w-32', animateClass)} />
                                    <div className='mt-2'>
                                        <Skeleton className={cn('h-4 w-full', animateClass)} />
                                        <Skeleton className={cn('h-4 w-full', animateClass)} />
                                        <Skeleton className={cn('h-4 w-2/3', animateClass)} />
                                    </div>
                                </div>
                                <div className='space-y-1'>
                                    <Skeleton className={cn('h-5 w-48', animateClass)} />
                                    <Skeleton className={cn('h-4 w-36', animateClass)} />
                                    <Skeleton className={cn('h-3 w-28', animateClass)} />
                                </div>
                            </div>
                        </div>

                        <div className='space-y-3'>
                            <div className='flex items-center gap-2'>
                                <Skeleton className={cn('h-5 w-5', animateClass)} />
                                <Skeleton className={cn('h-5 w-16', animateClass)} />
                            </div>
                            <div className='ml-7 flex flex-wrap gap-2'>
                                <Skeleton className={cn('h-7 w-16 rounded-full', animateClass)} />
                                <Skeleton className={cn('h-7 w-24 rounded-full', animateClass)} />
                                <Skeleton className={cn('h-7 w-20 rounded-full', animateClass)} />
                                <Skeleton className={cn('h-7 w-28 rounded-full', animateClass)} />
                                <Skeleton className={cn('h-7 w-16 rounded-full', animateClass)} />
                                <Skeleton className={cn('h-7 w-24 rounded-full', animateClass)} />
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'search-results':
            return (
                <div className={cn('space-y-4', className)}>
                    {includeFilters && (
                        <div className='border rounded-lg p-4 space-y-4'>
                            <div className='flex items-center gap-2'>
                                <Skeleton className={cn('h-5 w-5', animateClass)} />
                                <Skeleton className={cn('h-5 w-32', animateClass)} />
                            </div>

                            <Skeleton className={cn('h-9 w-full rounded-md', animateClass)} />

                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Skeleton className={cn('h-4 w-24', animateClass)} />
                                    <Skeleton className={cn('h-9 w-full rounded-md', animateClass)} />
                                </div>
                                <div className='space-y-2'>
                                    <Skeleton className={cn('h-4 w-20', animateClass)} />
                                    <Skeleton className={cn('h-9 w-full rounded-md', animateClass)} />
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <Skeleton className={cn('h-4 w-28', animateClass)} />
                                <div className='flex flex-wrap gap-2'>
                                    <Skeleton className={cn('h-7 w-16 rounded-full', animateClass)} />
                                    <Skeleton className={cn('h-7 w-24 rounded-full', animateClass)} />
                                    <Skeleton className={cn('h-7 w-20 rounded-full', animateClass)} />
                                    <Skeleton className={cn('h-7 w-16 rounded-full', animateClass)} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className='flex items-center justify-between mb-4'>
                        <Skeleton className={cn('h-5 w-48', animateClass)} />
                        <Skeleton className={cn('h-9 w-32 rounded-md', animateClass)} />
                    </div>

                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className='border rounded-lg p-5 space-y-4'>
                            <div className='flex justify-between'>
                                <div className='space-y-2'>
                                    <Skeleton className={cn('h-6 w-64', animateClass)} />
                                    <Skeleton className={cn('h-4 w-40', animateClass)} />
                                </div>
                                <Skeleton className={cn('h-12 w-12 rounded-md', animateClass)} />
                            </div>

                            <div className='flex flex-wrap gap-3'>
                                <div className='flex items-center gap-1'>
                                    <Skeleton className={cn('h-4 w-4', animateClass)} />
                                    <Skeleton className={cn('h-4 w-20', animateClass)} />
                                </div>
                                <div className='flex items-center gap-1'>
                                    <Skeleton className={cn('h-4 w-4', animateClass)} />
                                    <Skeleton className={cn('h-4 w-28', animateClass)} />
                                </div>
                                <div className='flex items-center gap-1'>
                                    <Skeleton className={cn('h-4 w-4', animateClass)} />
                                    <Skeleton className={cn('h-4 w-32', animateClass)} />
                                </div>
                            </div>

                            <Skeleton className={cn('h-4 w-full', animateClass)} />
                            <Skeleton className={cn('h-4 w-full', animateClass)} />
                            <Skeleton className={cn('h-4 w-3/4', animateClass)} />

                            <div className='flex flex-wrap gap-2 pt-1'>
                                <Skeleton className={cn('h-7 w-16 rounded-full', animateClass)} />
                                <Skeleton className={cn('h-7 w-20 rounded-full', animateClass)} />
                                <Skeleton className={cn('h-7 w-24 rounded-full', animateClass)} />
                            </div>

                            <div className='flex justify-between items-center pt-2'>
                                <Skeleton className={cn('h-4 w-36', animateClass)} />
                                <Skeleton className={cn('h-9 w-28 rounded-md', animateClass)} />
                            </div>
                        </div>
                    ))}
                </div>
            );

        case 'dashboard-stats':
            return (
                <div className={cn('space-y-6', className)}>
                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className='border rounded-lg p-4 space-y-3'>
                                <div className='flex justify-between items-start'>
                                    <Skeleton className={cn('h-5 w-24', animateClass)} />
                                    <Skeleton className={cn('h-8 w-8 rounded-md', animateClass)} />
                                </div>
                                <Skeleton className={cn('h-8 w-20', animateClass)} />
                                <div className='flex items-center gap-2'>
                                    <Skeleton className={cn('h-4 w-16', animateClass)} />
                                    <Skeleton className={cn('h-4 w-4', animateClass)} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='border rounded-lg p-4 space-y-4'>
                            <div className='flex justify-between items-center'>
                                <Skeleton className={cn('h-5 w-48', animateClass)} />
                                <Skeleton className={cn('h-8 w-24 rounded-md', animateClass)} />
                            </div>
                            <div className='h-56 flex items-center justify-center'>
                                <Skeleton className={cn('h-full w-full rounded-md', animateClass)} />
                            </div>
                        </div>

                        <div className='border rounded-lg p-4 space-y-4'>
                            <div className='flex justify-between items-center'>
                                <Skeleton className={cn('h-5 w-40', animateClass)} />
                                <Skeleton className={cn('h-8 w-24 rounded-md', animateClass)} />
                            </div>
                            <div className='space-y-3'>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className='flex justify-between items-center'>
                                        <div className='flex items-center gap-2'>
                                            <Skeleton className={cn('h-8 w-8 rounded-md', animateClass)} />
                                            <div className='space-y-1'>
                                                <Skeleton className={cn('h-4 w-24', animateClass)} />
                                                <Skeleton className={cn('h-3 w-16', animateClass)} />
                                            </div>
                                        </div>
                                        <Skeleton className={cn('h-5 w-16', animateClass)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );

        default:
            return (
                <div className={cn('space-y-4', className)}>
                    {Array.from({ length: count }).map((_, i) => (
                        <Skeleton key={i} className={cn('h-24 w-full rounded-md', animateClass)} />
                    ))}
                </div>
            );
    }
};

// Example usage components for job-specific content types
export const JobCardSkeleton = (props: Omit<JobSkeletonLoaderProps, 'variant'>) => <JobSkeletonLoader variant='job-card' {...props} />;

export const ApplicationCardSkeleton = (props: Omit<JobSkeletonLoaderProps, 'variant'>) => (
    <JobSkeletonLoader variant='application-card' {...props} />
);

export const CandidateProfileSkeleton = (props: Omit<JobSkeletonLoaderProps, 'variant'>) => (
    <JobSkeletonLoader variant='candidate-profile' {...props} />
);

export const JobPostDetailSkeleton = (props: Omit<JobSkeletonLoaderProps, 'variant'>) => <JobSkeletonLoader variant='job-post-detail' {...props} />;

export const ResumeSkeleton = (props: Omit<JobSkeletonLoaderProps, 'variant'>) => <JobSkeletonLoader variant='resume' {...props} />;

export const SearchResultsSkeleton = (props: Omit<JobSkeletonLoaderProps, 'variant'>) => <JobSkeletonLoader variant='search-results' {...props} />;

export const DashboardStatsSkeleton = (props: Omit<JobSkeletonLoaderProps, 'variant'>) => <JobSkeletonLoader variant='dashboard-stats' {...props} />;

export default JobSkeletonLoader;
