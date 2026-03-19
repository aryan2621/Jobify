'use client';

import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Job } from '@/model/job';
import { Application, ApplicationStatus } from '@/model/application';
import { CardFooter } from '@/components/ui/card';

interface AdminSummaryProps {
    jobs: Job[];
}

export function AdminSummary({ jobs }: AdminSummaryProps) {
    const activeJobs = jobs.filter((job) => new Date(job.lastDateToApply) > new Date()).length;
    const totalApplicants = jobs.reduce((total, job) => total + job.applications.length, 0);

    return (
        <>
            <div className='space-y-4'>
                <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Jobs Posted</span>
                    <span className='text-sm font-medium'>{jobs.length}</span>
                </div>

                <Separator />

                <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Total Applicants</span>
                    <span className='text-sm font-medium'>{totalApplicants}</span>
                </div>

                <Separator />

                <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Active Jobs</span>
                    <span className='text-sm font-medium'>{activeJobs}</span>
                </div>
            </div>

            <CardFooter className='border-t px-6 py-4 bg-muted/20 mt-4'>
                <Link href='/analytics' className='text-sm text-primary hover:underline w-full text-center'>
                    View Full Analytics →
                </Link>
            </CardFooter>
        </>
    );
}

interface UserSummaryProps {
    applications: Application[];
}

export function UserSummary({ applications }: UserSummaryProps) {
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
                    <span className='text-sm font-medium'>{applications.length}</span>
                </div>

                <Separator />

                <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>In Progress</span>
                    <span className='text-sm font-medium'>{inProgressCount}</span>
                </div>

                <Separator />

                <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Success Rate</span>
                    <span className='text-sm font-medium'>{successRate}%</span>
                </div>
            </div>

            <CardFooter className='border-t px-6 py-4 bg-muted/20 mt-4'>
                <Link href='/saved-jobs' className='text-sm text-primary hover:underline w-full text-center'>
                    View Saved Jobs →
                </Link>
            </CardFooter>
        </>
    );
}
