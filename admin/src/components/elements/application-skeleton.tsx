export const LoadingApplicationSkeleton = () => (
    <div className='border h-full overflow-auto rounded-xl'>
        <div className='flex flex-col space-y-1.5 p-6'>
            <div className='tracking-tight'>
                <Skeleton className='w-[40px] max-w-full' />
            </div>
            <div className='flex items-center space-x-2'>
                <SVGSkeleton className='w-[24px] h-[24px]' />
                <div>
                    <Skeleton className='w-[48px] max-w-full' />
                </div>
                <div className='shrink-0 bg-border w-[1px] h-4'></div>
                <SVGSkeleton className='lucide-map-pin w-[24px] h-[24px]' />
                <div>
                    <Skeleton className='w-[72px] max-w-full' />
                </div>
            </div>
        </div>
        <div className='p-6 pt-0 space-y-6'>
            <div>
                <div className='mb-2'>
                    <Skeleton className='w-[120px] max-w-full' />
                </div>
                <div>
                    <Skeleton className='w-[1096px] max-w-full' />
                </div>
            </div>
            <div>
                <div className='mb-2'>
                    <Skeleton className='w-[120px] max-w-full' />
                </div>
                <div className='flex flex-wrap gap-2'>
                    <div className='inline-flex items-center border px-2.5 py-0.5 transition-colors border-transparent'>
                        <Skeleton className='w-[160px] max-w-full' />
                    </div>
                    <div className='inline-flex items-center border px-2.5 py-0.5 transition-colors border-transparent'>
                        <Skeleton className='w-[120px] max-w-full' />
                    </div>
                    <div className='inline-flex items-center border px-2.5 py-0.5 transition-colors border-transparent'>
                        <Skeleton className='w-[144px] max-w-full' />
                    </div>
                    <div className='inline-flex items-center border px-2.5 py-0.5 transition-colors border-transparent'>
                        <Skeleton className='w-[96px] max-w-full' />
                    </div>
                    <div className='inline-flex items-center border px-2.5 py-0.5 transition-colors border-transparent'>
                        <Skeleton className='w-[144px] max-w-full' />
                    </div>
                    <div className='inline-flex items-center border px-2.5 py-0.5 transition-colors border-transparent'>
                        <Skeleton className='w-[96px] max-w-full' />
                    </div>
                </div>
            </div>
            <div className='flex flex-col space-y-2'>
                <div className='flex items-center'>
                    <SVGSkeleton className='mr-2 w-[24px] h-[24px]' />
                    <div>
                        <Skeleton className='w-[200px] max-w-full' />
                    </div>
                </div>
                <div className='flex items-center'>
                    <SVGSkeleton className='mr-2 w-[24px] h-[24px]' />
                    <div>
                        <Skeleton className='w-[232px] max-w-full' />
                    </div>
                </div>
            </div>
        </div>
        <div className='flex items-center p-6 pt-0'>
            <div className='transition-colors h-9 px-4 py-2 w-full flex items-center justify-center'>
                <Skeleton className='w-[120px] max-w-full' />
                <SVGSkeleton className='mr-2 w-[24px] h-[24px]' />
            </div>
        </div>
    </div>
);

const Skeleton = ({ className }: { className: string }) => (
    <div aria-live='polite' aria-busy='true' className={className}>
        <span className='inline-flex w-full animate-pulse select-none rounded-md bg-gray-300 leading-none'>‌</span>
        <br />
    </div>
);
const SVGSkeleton = ({ className }: { className: string }) => <svg className={className + ' animate-pulse rounded bg-gray-300'} />;
