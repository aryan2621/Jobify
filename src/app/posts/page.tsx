'use client';

import { use, useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NavbarLayout from '@/layouts/navbar';
import { Job } from '@/model/job';
import ky from 'ky';
import LoadingPostSkeleton from '@/elements/post-skeleton';
import Link from 'next/link';
import { Building2, CalendarCheck, Clock, MapPin, Send, SendIcon } from 'lucide-react';
import { User } from '@/model/user';
import FiltersPage from '@/elements/filters';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { userStore } from '@/store';

const useDebounce = (cb: () => void, delay: number) => {
    const handlerRef = useRef<number | null>(null);

    const debouncedFunction = useCallback(() => {
        if (handlerRef.current) clearTimeout(handlerRef.current);

        handlerRef.current = window.setTimeout(() => {
            cb();
            handlerRef.current = null;
        }, delay);
    }, [cb, delay]);

    return debouncedFunction;
};
const JobDetail = ({ job }: { job: Job | null }) => {
    if (!job) {
        return (
            <Card className='h-full flex items-center justify-center'>
                <CardContent>
                    <p className='text-center text-muted-foreground'>Select a job to see details</p>
                </CardContent>
            </Card>
        );
    }

    const formatDate = (date: string) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };
    const user = userStore(
        (state) =>
            new User(
                state.user?.id ?? '',
                state.user?.firstName ?? '',
                state.user?.lastName ?? '',
                state.user?.username ?? '',
                state.user?.email ?? '',
                state.user?.password ?? '',
                state.user?.confirmPassword ?? '',
                state.user?.createdAt ?? '',
                state.user?.jobs ?? [],
                state.user?.applications ?? [],
                state.user?.roles ?? [],
                state.user?.tnC ?? false
            )
    );

    const showJobs = user?.isSuperUser || user?.canAcessJobs;
    const showApplications = user?.isSuperUser || user?.canAccessApplications;
    const isAlreadyApplied = user?.applications.some((app) => job.applications.includes(app));
    const isOwner = job.createdBy === user.id;

    return (
        <Card className='h-full overflow-auto'>
            <CardHeader>
                <CardTitle className='text-2xl font-bold'>{job.profile}</CardTitle>
                <div className='flex items-center space-x-2 text-muted-foreground'>
                    <Building2 className='h-4 w-4' />
                    <span>{job.company ?? 'NA'}</span>
                    <Separator orientation='vertical' className='h-4' />
                    <MapPin className='h-4 w-4' />
                    <span>{job.location}</span>
                </div>
            </CardHeader>
            <CardContent className='space-y-6'>
                <div>
                    <h3 className='text-lg font-semibold mb-2'>Job Description</h3>
                    <p className='text-sm text-muted-foreground'>{job.description}</p>
                </div>
                <div>
                    <h3 className='text-lg font-semibold mb-2'>Skills Required</h3>
                    <div className='flex flex-wrap gap-2'>
                        {job.skills.map((skill, idx) => (
                            <Badge key={idx} variant='secondary' className='text-sm'>
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div className='flex flex-col space-y-2 text-sm text-muted-foreground'>
                    <div className='flex items-center'>
                        <Clock className='h-4 w-4 mr-2' />
                        <span>Apply by: {formatDate(job.lastDateToApply)}</span>
                    </div>
                    <div className='flex items-center'>
                        <CalendarCheck className='h-4 w-4 mr-2' />
                        <span>Posted on: {formatDate(job.createdAt)}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                {showApplications ? (
                    <>
                        <Button asChild className='w-full' disabled={isAlreadyApplied || isOwner}>
                            {isAlreadyApplied ? (
                                <span className='flex items-center justify-center'>
                                    <SendIcon className='h-5 w-5 mr-2' />
                                    Already Applied
                                </span>
                            ) : isOwner ? (
                                <span className='flex items-center justify-center'>
                                    <SendIcon className='h-5 w-5 mr-2' />
                                    You cannot apply to your own job
                                </span>
                            ) : (
                                <Link href={`/application/${job.id}`}>
                                    <SendIcon className='h-5 w-5 mr-2' />
                                    Apply Now
                                </Link>
                            )}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button asChild className='w-full' disabled={!isOwner}>
                            {isOwner ? (
                                <Link
                                    href={{
                                        pathname: `/posts/applications/${job.id}`,
                                    }}
                                >
                                    <SendIcon className='h-5 w-5 mr-2' />
                                    Go to Applications
                                </Link>
                            ) : (
                                <span className='flex items-center justify-center'>
                                    <SendIcon className='h-5 w-5 mr-2' />
                                    You cannot access applications
                                </span>
                            )}
                        </Button>
                    </>
                )}
            </CardFooter>
        </Card>
    );
};
export default function Component() {
    const limit = 10;
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastId, setLastId] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef<HTMLDivElement | null>(null);
    const loadingRef = useRef(false);

    const handleJobSelection = (job: Job) => {
        setSelectedJob(job);
    };

    const [jobs, setJobs] = useState<Job[]>([]);

    const fetchJobs = useCallback(async () => {
        if (loadingRef.current || !hasMore) return;

        setLoading(true);
        loadingRef.current = true;

        try {
            const url = '/api/posts?limit=' + limit + (lastId ? '&lastId=' + lastId : '');
            const res = (await ky.get(url).json()) as Job[];
            const fetchedJobs = (res ?? []).map(
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
            );

            setJobs((prevJobs) => [...prevJobs, ...fetchedJobs]);
            setLastId(fetchedJobs.length ? fetchedJobs[fetchedJobs.length - 1].id : null);
            setHasMore(fetchedJobs.length === limit);

            if (selectedJob === null && fetchedJobs.length > 0) {
                setSelectedJob(fetchedJobs[0]);
            }
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [lastId, hasMore, selectedJob]);

    const debouncedFetchJobs = useDebounce(fetchJobs, 300);

    useEffect(() => {
        debouncedFetchJobs();
    }, [debouncedFetchJobs]);

    useEffect(() => {
        if (!observerRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    debouncedFetchJobs();
                }
            },
            { threshold: 1.0 }
        );
        observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [debouncedFetchJobs, hasMore]);

    return (
        <NavbarLayout>
            <FiltersPage />
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-5'>
                <div className='col-span-1 md:col-span-1'>
                    {loading && jobs.length === 0 ? (
                        [...Array(3)].map((_, index) => <LoadingPostSkeleton key={index} />)
                    ) : jobs.length === 0 ? (
                        <div className='flex flex-col items-center justify-center'>
                            <h2 className='text-lg font-semibold text-muted-foreground'>No Jobs Found</h2>
                            <p className='text-sm text-muted-foreground'>
                                There are no job listings available at the moment. Please check back later.
                            </p>
                        </div>
                    ) : (
                        jobs.map((job: Job, index: number) => (
                            <Card
                                key={index}
                                onClick={() => handleJobSelection(job)}
                                className={`cursor-pointer mb-2 mt-2 transition-shadow ${selectedJob?.id === job.id ? 'border-2 border-blue-300' : ''}`}
                            >
                                <CardHeader>
                                    <CardTitle>{job.profile}</CardTitle>
                                    <CardDescription>
                                        {job.company ?? 'NA'} - {job.location}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className='flex space-x-2 mb-2'>
                                        <Badge variant='outline'>{job.type}</Badge>
                                        <Badge variant='outline'>{job.workplaceType}</Badge>
                                    </div>
                                    <p className='text-sm'>{job.description}</p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                    <div ref={observerRef} className='h-10'></div>
                </div>

                {selectedJob && jobs.length > 0 && (
                    <div className='col-span-1 md:col-span-2 border-l pl-6'>
                        <JobDetail job={selectedJob} />
                    </div>
                )}
            </div>
        </NavbarLayout>
    );
}
