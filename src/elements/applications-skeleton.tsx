export const LoadingApplicationsSkeleton = () => (
    <div className='border rounded-xl'>
        <div className='flex flex-col space-y-1.5 p-6'>
            <h3 className='leading-none tracking-tight flex justify-between items-center'>
                <div className='flex justify-between mb-4'>
                    <div className='flex h-9 items-center justify-between border border-input px-3 py-2 shadow-sm rounded-md w-[180px]'>
                        <span>
                            <Skeleton className='w-[96px] max-w-full rounded' />
                        </span>
                        <SVGSkeleton className='w-[15px] h-[15px]' />
                    </div>
                </div>
                <div className='inline-flex items-center justify-center transition-colors h-9 px-4 py-2 rounded-md'>
                    <Skeleton className='w-[136px] max-w-full rounded' />
                </div>
            </h3>
        </div>
        <div className='p-6 pt-0'>
            <div className='relative w-full overflow-auto'>
                <table className='w-full caption-bottom'>
                    <thead className='border-b'>
                        <tr className='border-b transition-colors'>
                            <th className='h-12 px-4 text-left align-middle'>
                                <Skeleton className='w-[88px] max-w-full rounded' />
                            </th>
                            <th className='h-12 px-4 text-left align-middle'>
                                <Skeleton className='w-[80px] max-w-full rounded' />
                            </th>
                            <th className='h-12 px-4 text-left align-middle'>
                                <Skeleton className='w-[48px] max-w-full rounded' />
                            </th>
                            <th className='h-12 px-4 text-left align-middle'>
                                <Skeleton className='w-[56px] max-w-full rounded' />
                            </th>
                            <th className='h-12 px-4 text-left align-middle'>
                                <Skeleton className='w-[88px] max-w-full rounded' />
                                <SVGSkeleton className='ml-2 w-[24px] h-[24px]' />
                            </th>
                            <th className='h-12 px-4 text-left align-middle'>
                                <Skeleton className='w-[56px] max-w-full rounded' />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(3)].map((_, i) => (
                            <tr key={i} className='border-b transition-colors'>
                                <td className='p-4 align-middle'>
                                    <Skeleton className='w-[32px] max-w-full rounded' />
                                </td>
                                <td className='p-4 align-middle'>
                                    <Skeleton className='w-[40px] max-w-full rounded' />
                                </td>
                                <td className='p-4 align-middle'>
                                    <Skeleton className={`w-[${i === 0 ? '192px' : i === 1 ? '176px' : '160px'}] max-w-full rounded`} />
                                </td>
                                <td className='p-4 align-middle'>
                                    <div className='inline-flex items-center border px-2.5 py-0.5 transition-colors border-transparent rounded-md'>
                                        <Skeleton className='w-[64px] max-w-full rounded' />
                                    </div>
                                </td>
                                <td className='p-4 align-middle'>
                                    <Skeleton className='w-[80px] max-w-full rounded' />
                                </td>
                                <td className='p-4 align-middle'>
                                    <div className='inline-flex items-center justify-center transition-colors border border-input shadow-sm h-8 px-3 rounded-md'>
                                        <Skeleton className='w-[96px] max-w-full rounded' />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className='flex items-center justify-between mt-4'>
                <div className='flex items-center space-x-2'>
                    <span>
                        <Skeleton className='w-[216px] max-w-full rounded' />
                    </span>
                    <div className='flex h-9 items-center justify-between border border-input px-3 py-2 shadow-sm rounded-md w-[70px]'>
                        <span>
                            <Skeleton className='w-[16px] max-w-full rounded' />
                        </span>
                        <SVGSkeleton className='w-[15px] h-[15px]' />
                    </div>
                </div>
                <div className='flex items-center space-x-2'>
                    <div className='inline-flex items-center justify-center transition-colors border border-input shadow-sm h-8 px-3 rounded-md'>
                        <SVGSkeleton className='lucide-chevron-left w-[24px] h-[24px]' />
                    </div>
                    <div className='inline-flex items-center justify-center transition-colors h-8 px-3 rounded-md'>
                        <Skeleton className='w-[14px] max-w-full rounded' />
                    </div>
                    <div className='inline-flex items-center justify-center transition-colors border border-input shadow-sm h-8 px-3 rounded-md'>
                        <SVGSkeleton className='lucide-chevron-right w-[24px] h-[24px]' />
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

const SVGSkeleton = ({ className }: { className: string }) => <svg className={`${className} animate-pulse rounded bg-gray-300`} />;
