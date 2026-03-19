export const LoadingApplyFormSkeleton = () => (
    <>
        <div className='col-span-1 rounded-lg w-full'>
            <div className='border'>
                <div className='flex flex-col space-y-1.5 p-6'>
                    <h3 className='leading-none tracking-tight'>
                        <Skeleton className='w-[160px] max-w-full' />
                    </h3>
                    <div>
                        <Skeleton className='w-[392px] max-w-full' />
                    </div>
                </div>
                <div className='p-6 pt-0'>
                    <div className='space-y-4 mb-6'>
                        <h2>
                            <Skeleton className='w-[200px] max-w-full' />
                        </h2>
                        <div>
                            <Skeleton className='w-[128px] max-w-full' />
                            <strong>
                                <Skeleton className='w-[64px] max-w-full' />
                            </strong>
                        </div>
                        <div>
                            <Skeleton className='w-[240px] max-w-full' />
                            <strong>
                                <Skeleton className='w-[72px] max-w-full' />
                            </strong>
                        </div>
                        <div>
                            <Skeleton className='w-[128px] max-w-full' />
                            <strong>
                                <Skeleton className='w-[40px] max-w-full' />
                            </strong>
                        </div>
                        <div>
                            <Skeleton className='w-[240px] max-w-full' />
                            <strong>
                                <Skeleton className='w-[152px] max-w-full' />
                            </strong>
                        </div>
                        <div>
                            <Skeleton className='w-[1232px] max-w-full' />
                            <strong>
                                <Skeleton className='w-[96px] max-w-full' />
                            </strong>
                        </div>
                        <div>
                            <strong>
                                <Skeleton className='w-[128px] max-w-full' />
                            </strong>
                            <ul className='pl-5'>
                                <li>
                                    <Skeleton className='w-[160px] max-w-full' />
                                </li>
                                <li>
                                    <Skeleton className='w-[120px] max-w-full' />
                                </li>
                                <li>
                                    <Skeleton className='w-[144px] max-w-full' />
                                </li>
                                <li>
                                    <Skeleton className='w-[96px] max-w-full' />
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className='col-span-2 w-full'>
            <div className='border'>
                <div className='flex flex-col space-y-1.5 p-6'>
                    <h3 className='leading-none tracking-tight'>
                        <Skeleton className='w-[160px] max-w-full' />
                    </h3>
                    <div>
                        <Skeleton className='w-[392px] max-w-full' />
                    </div>
                </div>
                <div className='p-6 pt-0'>
                    <form className='space-y-6'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <label className='leading-none'>
                                    <Skeleton className='w-[80px] max-w-full' />
                                </label>
                                <div className='flex h-9 w-full border border-input px-3 py-1 shadow-sm transition-colors file:border-0'>
                                    <Skeleton className='w-[80px] max-w-full' />
                                </div>
                            </div>
                            <div>
                                <label className='leading-none'>
                                    <Skeleton className='w-[72px] max-w-full' />
                                </label>
                                <div className='flex h-9 w-full border border-input px-3 py-1 shadow-sm transition-colors file:border-0'>
                                    <Skeleton className='w-[72px] max-w-full' />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className='leading-none'>
                                <Skeleton className='w-[104px] max-w-full' />
                            </label>
                            <div className='flex h-9 w-full border border-input px-3 py-1 shadow-sm transition-colors file:border-0'>
                                <Skeleton className='w-[104px] max-w-full' />
                            </div>
                        </div>
                        <div>
                            <label className='leading-none'>
                                <Skeleton className='w-[96px] max-w-full' />
                            </label>
                            <div className='flex gap-2'>
                                <div className='flex h-9 items-center justify-between border border-input px-3 py-2 shadow-sm [&>span]:line-clamp-1 w-[100px]'>
                                    <span>
                                        <Skeleton className='w-[64px] max-w-full' />
                                    </span>
                                    <SVGSkeleton className='w-[15px] h-[15px]' />
                                </div>
                                <div className='flex h-9 w-full border border-input px-3 py-1 shadow-sm transition-colors file:border-0 flex-grow'>
                                    <Skeleton className='w-[96px] max-w-full' />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className='leading-none'>
                                <Skeleton className='w-[120px] max-w-full' />
                            </label>
                            <div className='flex h-9 w-full border border-input px-3 py-1 shadow-sm transition-colors file:border-0'>
                                <Skeleton className='w-[120px] max-w-full' />
                            </div>
                        </div>
                        <div className='flex flex-wrap gap-4'>
                            <div className='grid gap-2 flex-1 min-w-[200px]'>
                                <label className='leading-none'>
                                    <Skeleton className='w-[48px] max-w-full' />
                                </label>
                                <div className='flex h-9 w-full items-center justify-between border border-input px-3 py-2 shadow-sm [&>span]:line-clamp-1'>
                                    <span>
                                        <Skeleton className='w-[32px] max-w-full' />
                                    </span>
                                    <SVGSkeleton className='w-[15px] h-[15px]' />
                                </div>
                            </div>
                            <div className='grid gap-2 flex-1 min-w-[200px]'>
                                <label className='leading-none'>
                                    <Skeleton className='w-[248px] max-w-full' />
                                </label>
                                <div className='flex h-9 w-full items-center justify-between border border-input px-3 py-2 shadow-sm [&>span]:line-clamp-1 max-w-xs'>
                                    <span>
                                        <Skeleton className='w-[80px] max-w-full' />
                                    </span>
                                    <SVGSkeleton className='w-[15px] h-[15px]' />
                                </div>
                            </div>
                        </div>
                        <div className='flex justify-between mt-6'>
                            <div className='inline-flex items-center justify-center transition-colors border border-input shadow-sm h-9 px-4 py-2'>
                                <Skeleton className='w-[64px] max-w-full' />
                            </div>
                            <div className='inline-flex items-center justify-center transition-colors h-9 px-4 py-2'>
                                <Skeleton className='w-[32px] max-w-full' />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </>
);

const Skeleton = ({ className }: { className: string }) => (
    <div aria-live='polite' aria-busy='true' className={className}>
        <span className='inline-flex w-full animate-pulse select-none rounded-md bg-gray-300 leading-none'>‌</span>
    </div>
);

const SVGSkeleton = ({ className }: { className: string }) => <svg className={className + ' animate-pulse rounded bg-gray-300'} />;
