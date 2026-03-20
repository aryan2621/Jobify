'use client';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Application, ApplicationStatus } from '@/model/application';
interface UserSummaryProps {
    applications: Application[];
    loading: boolean;
}
export function UserSummary({ applications, loading }: UserSummaryProps) {
    const inProgressCount = applications.filter((app) => app.status === ApplicationStatus.APPLIED).length;
    const successRate =
        applications.length > 0
            ? Math.round((applications.filter((app) => app.status === ApplicationStatus.SELECTED).length / applications.length) * 100)
            : 0;
    return (
        <>
            <div className='space-y-4'>
                <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Applications Submitted</span>
                    <span className='text-sm font-medium'>{loading ? '—' : applications.length}</span>
                </div>

                <Separator />

                <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>In Progress</span>
                    <span className='text-sm font-medium'>{loading ? '—' : inProgressCount}</span>
                </div>

                <Separator />

                <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Success Rate</span>
                    <span className='text-sm font-medium'>{loading ? '—' : `${successRate}%`}</span>
                </div>
            </div>
            <Button variant='outline' size='sm' className='w-full mt-4' asChild>
                <Link href='/analytics' prefetch={false}>
                    View full analytics
                </Link>
            </Button>
        </>
    );
}
