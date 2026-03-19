export const LoadingProfileSkeleton = () => (
    <>
        <div className='grid gap-8 md:grid-cols-3 rounded-xl'>
            <div className='border col-span-1 rounded-xl'>
                <div className='flex flex-col space-y-1.5 p-6'>
                    <h3 className='leading-none tracking-tight'>
                        <Skeleton className='w-[120px] max-w-full' />
                    </h3>
                </div>
                <div className='p-6 pt-0 flex flex-col items-center'>
                    <span className='relative flex shrink-0 w-32 h-32 mb-4'>
                        <SVGSkeleton className='aspect-square w-full h-full' />
                    </span>
                    <label className='leading-none'>
                        <div className='h-9 w-full border border-input px-3 py-1 shadow-sm transition-colors file:border-0 hidden'></div>
                        <div className='inline-flex rounded-md items-center justify-center transition-colors border border-input shadow-sm h-9 px-4 py-2 mt-2'>
                            <Skeleton className='w-[144px] max-w-full' />
                        </div>
                    </label>
                </div>
            </div>
            <div className='border col-span-2 rounded-xl'>
                <div className='flex flex-col space-y-1.5 p-6'>
                    <h3 className='leading-none tracking-tight'>
                        <Skeleton className='w-[128px] max-w-full' />
                    </h3>
                </div>
                <div className='p-6 pt-0'>
                    <form className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <label className='leading-none'>
                                    <Skeleton className='w-[80px] max-w-full' />
                                </label>
                                <div className='rounded-md flex h-9 w-full border border-input px-3 py-1 shadow-sm transition-colors file:border-0'></div>
                            </div>
                            <div className='space-y-2'>
                                <label className='leading-none'>
                                    <Skeleton className='w-[72px] max-w-full' />
                                </label>
                                <div className='rounded-md flex h-9 w-full border border-input px-3 py-1 shadow-sm transition-colors file:border-0'></div>
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <label className='leading-none'>
                                <Skeleton className='w-[64px] max-w-full' />
                            </label>
                            <div className='rounded-md flex h-9 w-full border border-input px-3 py-1 shadow-sm transition-colors file:border-0'></div>
                        </div>
                        <div className='space-y-2'>
                            <label className='leading-none'>
                                <Skeleton className='w-[40px] max-w-full' />
                            </label>
                            <div className='rounded-md flex h-9 w-full border border-input px-3 py-1 shadow-sm transition-colors file:border-0'></div>
                        </div>
                        <div className='space-y-2'>
                            <label className='leading-none'>
                                <Skeleton className='w-[96px] max-w-full' />
                            </label>
                            <div className='rounded-md flex h-9 w-full border border-input px-3 py-1 shadow-sm transition-colors file:border-0'></div>
                        </div>
                        <div className='space-y-2'>
                            <label className='leading-none'>
                                <Skeleton className='w-[160px] max-w-full' />
                            </label>
                            <div className='rounded-md flex h-9 w-full border border-input px-3 py-1 shadow-sm transition-colors file:border-0'></div>
                        </div>
                        <div className='rounded-md inline-flex items-center justify-center transition-colors h-9 px-4 py-2'>
                            <Skeleton className='w-[112px] max-w-full' />
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
        <br />
    </div>
);

const SVGSkeleton = ({ className }: { className: string }) => <svg className={className + ' animate-pulse rounded bg-gray-300'} />;
