export const LoadingAnalyticsSkeleton = () => (
    <>
        <div className='border rounded-xl space-y-6'>
            <div className='flex flex-col space-y-1.5 p-6'>
                <h3 className='leading-none tracking-tight'>
                    <Skeleton className='w-[168px] max-w-full' />
                </h3>
                <div>
                    <Skeleton className='w-[336px] max-w-full' />
                </div>
            </div>
            <div className='flex flex-col space-y-0'>
                <div className='flex flex-wrap gap-4'>
                    <div className='flex-1 min-w-[300px]'>
                        <div className='p-6 pt-0'>
                            <div className="flex aspect-video justify-center [&amp;_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&amp;_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&amp;_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&amp;_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&amp;_.recharts-reference-line_[stroke='#ccc']]:stroke-border">
                                <style>
                                    <Skeleton className='w-[2448px] max-w-full' />
                                </style>
                                <div className='recharts-responsive-container'>
                                    <div>
                                        <SVGSkeleton className='w-[519px] h-[292px]' />
                                        <div className='recharts-tooltip-wrapper recharts-tooltip-wrapper-right recharts-tooltip-wrapper-bottom'></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='flex-1 min-w-[300px]'>
                        <div className='p-6 pt-0 flex-1 pb-0'>
                            <div className="flex justify-center [&amp;_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&amp;_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&amp;_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&amp;_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&amp;_.recharts-reference-line_[stroke='#ccc']]:stroke-border mx-auto aspect-square max-h-[500px]">
                                <style>
                                    <Skeleton className='w-[2448px] max-w-full' />
                                </style>
                                <div className='recharts-responsive-container'>
                                    <div>
                                        <SVGSkeleton className='w-[500px] h-[500px]' />
                                        <div className='recharts-tooltip-wrapper recharts-tooltip-wrapper-right recharts-tooltip-wrapper-bottom'></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col space-y-4'>
                    <div className='flex-col p-6 flex items-center gap-2 space-y-0 py-5 sm:flex-row'>
                        <div className='grid flex-1 gap-1 sm:text-left'>
                            <h3 className='leading-none tracking-tight'>
                                <Skeleton className='w-[224px] max-w-full' />
                            </h3>
                            <p>
                                <Skeleton className='w-[432px] max-w-full' />
                            </p>
                        </div>
                    </div>
                    <div className='p-6 px-2 pt-4 sm:px-6 sm:pt-6'>
                        <div className="flex justify-center [&amp;_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&amp;_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&amp;_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&amp;_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&amp;_.recharts-reference-line_[stroke='#ccc']]:stroke-border aspect-auto h-[250px] w-full">
                            <style>
                                <Skeleton className='w-[2448px] max-w-full' />
                            </style>
                            <div className='recharts-responsive-container'>
                                <div>
                                    <SVGSkeleton className='w-[1102px] h-[250px]' />
                                    <div>
                                        <div className='flex items-center justify-center gap-4 pt-3'>
                                            <div className='flex items-center gap-1.5 [&amp;>svg]:h-3 [&amp;>svg]:w-3'>
                                                <Skeleton className='w-[64px] max-w-full' />
                                                <div className='h-2 w-2 shrink-0'></div>
                                            </div>
                                            <div className='flex items-center gap-1.5 [&amp;>svg]:h-3 [&amp;>svg]:w-3'>
                                                <Skeleton className='w-[64px] max-w-full' />
                                                <div className='h-2 w-2 shrink-0'></div>
                                            </div>
                                            <div className='flex items-center gap-1.5 [&amp;>svg]:h-3 [&amp;>svg]:w-3'>
                                                <Skeleton className='w-[56px] max-w-full' />
                                                <div className='h-2 w-2 shrink-0'></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='recharts-tooltip-wrapper recharts-tooltip-wrapper-left recharts-tooltip-wrapper-top'></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex items-center p-6 pt-0 flex-col gap-2'>
                <div className='flex items-center gap-2 leading-none'>
                    <Skeleton className='w-[232px] max-w-full' />
                    <SVGSkeleton className='w-[24px] h-[24px]' />
                </div>
            </div>
        </div>
    </>
);

const Skeleton = ({ className }: { className: string }) => (
    <div aria-live='polite' aria-busy='true' className={className}>
        <span className='inline-flex w-full animate-pulse select-none rounded-md bg-gray-300 leading-none'>‌</span>
        <br />
    </div>
);

const SVGSkeleton = ({ className }: { className: string }) => <svg className={className + ' animate-pulse rounded bg-gray-300'} />;
