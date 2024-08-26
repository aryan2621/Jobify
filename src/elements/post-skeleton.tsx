import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingSkeleton() {
    return (
        <div className='border rounded-lg overflow-hidden'>
            <div className='space-y-1.5 p-6 flex flex-row justify-between'>
                <div>
                    <h3 className='leading-none tracking-tight'>
                        <Skeleton className='w-[140px] h-6 rounded-md' />
                    </h3>
                    <div className='flex items-center mt-2'>
                        <Skeleton className='w-[72px] h-4 rounded-full' />
                    </div>
                    <div className='flex items-center ml-4 mt-2'>
                        <h4 className='mr-2'>
                            <Skeleton className='w-[80px] h-4 rounded-md' />
                        </h4>
                        <div className='inline-flex items-center border px-2.5 py-0.5 transition-colors rounded-full'>
                            <Skeleton className='w-[40px] h-4 rounded-full' />
                        </div>
                    </div>
                    <div className='flex space-x-4 mt-2'>
                        <div className='inline-flex items-center border px-2.5 py-0.5 transition-colors rounded-full'>
                            <Skeleton className='w-[72px] h-4 rounded-full' />
                        </div>
                        <div className='inline-flex items-center border px-2.5 py-0.5 transition-colors rounded-full'>
                            <Skeleton className='w-[48px] h-4 rounded-full' />
                        </div>
                    </div>
                </div>
                <div className='text-right'>
                    <h4>
                        <Skeleton className='w-[144px] h-6 rounded-md' />
                    </h4>
                    <div className='mt-2'>
                        <Skeleton className='w-[72px] h-4 rounded-md' />
                    </div>
                    <div className='mt-2'>
                        <Skeleton className='w-[160px] h-4 rounded-md' />
                    </div>
                </div>
            </div>
        </div>
    );
}
