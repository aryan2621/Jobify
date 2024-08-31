'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NavbarLayout from '@/layouts/navbar';
import { Job } from '@/model/job';
import ky from 'ky';
import Application from '@/components/ui/application';
import LoadingPostSkeleton from '@/elements/post-skeleton';
import Link from 'next/link';
import { SendIcon } from 'lucide-react';
import { User } from '@/model/user';
import FiltersPage from '@/elements/filters';

export default function Component() {
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    const handleJobSelection = (job: Job) => {
        if (selectedJob !== job) {
            setSelectedJob(job);
        } else {
            setSelectedJob(null);
        }
    };

    const [jobs, setJobs] = useState<Job[]>([]);
    useEffect(() => {
        const fetchJobs = async () => {
            const res = (await ky.get('/api/posts').json()) as Job[];
            setJobs(
                (res ?? []).map(
                    (job: Job) =>
                        new Job(
                            job.id,
                            job.profile,
                            job.description,
                            job.company,
                            job.type,
                            job.workplaceType,
                            job.lastDateToApply,
                            job.location,
                            job.skills,
                            job.rejectionContent,
                            job.selectionContent,
                            job.createdAt,
                            job.createdBy,
                            job.applications
                        )
                )
            );
            setLoading(false);
        };
        fetchJobs();
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            const res = (await ky.get('/api/me').json()) as User;
            setUser(res);
        };
        fetchUser();
    }, []);

    const formatDate = (date: string) => {
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    };

    return (
        <NavbarLayout>
            <FiltersPage />
            {loading ? (
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3 mt-5'>
                    <div className='col-span-2 space-y-6'>
                        {[...Array(3)].map((_, index) => (
                            <LoadingPostSkeleton key={index} />
                        ))}
                    </div>
                    <div className='hidden md:block'></div>
                </div>
            ) : jobs.length === 0 ? (
                <div className='col-span-full text-center'>
                    <h2 className='text-lg font-semibold text-muted-foreground'>No Jobs Found</h2>
                    <p className='text-sm text-muted-foreground'>There are no job listings available at the moment. Please check back later.</p>
                </div>
            ) : (
                <>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-3 mt-5'>
                        {jobs.length === 0 ? (
                            <div className='col-span-full text-center'>
                                <h2 className='text-lg font-semibold text-muted-foreground'>No Jobs Found</h2>
                                <p className='text-sm text-muted-foreground'>
                                    There are no job listings available at the moment. Please check back later.
                                </p>
                            </div>
                        ) : (
                            <div className='col-span-2 space-y-6'>
                                {(jobs ?? []).map((job: Job, index: number) => (
                                    <Card key={index} onClick={() => handleJobSelection(job)} className='cursor-pointer'>
                                        <CardHeader className='flex flex-row justify-between'>
                                            <div>
                                                <CardTitle>{job.profile}</CardTitle>
                                                <div className='flex items-center'>
                                                    <CardDescription>
                                                        {job.company ?? 'NA'} - {job.location}
                                                    </CardDescription>
                                                    <div className='flex items-center ml-4'>
                                                        <h4 className='text-sm font-medium mr-2'>Applicants</h4>
                                                        <span className='text-sm text-muted-foreground'>{job.applications.length}</span>
                                                    </div>
                                                </div>
                                                <div className='flex space-x-4 mt-2'>
                                                    <Badge variant='outline'>{job.type}</Badge>
                                                    <Badge variant='outline'>{job.workplaceType}</Badge>
                                                </div>
                                            </div>
                                            <div className='text-right'>
                                                <h4 className='text-sm font-medium'>Last Date to Apply</h4>
                                                <p className='text-xs text-muted-foreground'>{formatDate(job.lastDateToApply)}</p>
                                                <p className='text-xs text-muted-foreground'>Posted on: {formatDate(job.createdAt)}</p>
                                            </div>
                                        </CardHeader>
                                        {selectedJob === job && (
                                            <CardContent className='flex items-start justify-between space-x-4'>
                                                <div className='flex-1'>
                                                    <h4 className='text-lg font-semibold mb-2'>About the Role</h4>
                                                    <p className='text-sm text-muted-foreground'>{job.description}</p>
                                                    <div className='flex flex-wrap gap-2 mt-2'>
                                                        {job.skills.map((skill, idx) => (
                                                            <Badge key={idx} variant='secondary' className='text-sm'>
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className='flex-shrink-0 flex items-end'>
                                                    <Link
                                                        href={`/application/${job.id}`}
                                                        className='bg-black text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-gray-800 transition-colors'
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <SendIcon className='h-5 w-5' />
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        )}
                        {selectedJob && user && selectedJob.createdBy === user.id && <Application job={selectedJob} />}
                    </div>
                </>
            )}
        </NavbarLayout>
    );
}
