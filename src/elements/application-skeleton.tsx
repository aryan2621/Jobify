export const LoadingApplicationSkeleton = () => (
    <div className='space-y-4 rounded-lg'>
        <div className='border p-4'>
            <div className='flex items-center justify-between'>
                <div>
                    <h4>
                        <Skeleton className='w-[56px] max-w-full' />
                    </h4>
                    <div>
                        <Skeleton className='w-[152px] max-w-full' />
                    </div>
                </div>
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