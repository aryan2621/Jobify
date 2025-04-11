'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import NavbarLayout from '@/layouts/navbar';
import { Job } from '@/model/job';
import Link from 'next/link';
import LoadingPostSkeleton from '@/components/elements/post-skeleton';
import { Briefcase, Building2, Clock, BookmarkPlus, RefreshCw } from 'lucide-react';

import { getDaysRemaining } from '@/lib/job-utils/utils';
import { FilterBar } from '@/components/elements/filter-bar';
import { useJobFetching } from '@/hooks/use-job-fetching';
import { JobDetail } from '@/components/elements/job-detail';

const JobCard = ({ job, isSelected, onClick }: { job: Job; isSelected: boolean; onClick: () => void }) => {
    const daysRemaining = getDaysRemaining(job.lastDateToApply);
    const isUrgent = daysRemaining <= 3 && daysRemaining > 0;
    const isExpired = daysRemaining <= 0;

    return (
        <Card
            onClick={onClick}
            className={`cursor-pointer mb-3 transition-all hover:shadow-md ${
                isSelected ? 'border-primary/50 shadow-sm bg-primary/5' : 'hover:border-muted-foreground/20'
            }`}
        >
            <CardContent className='p-4'>
                <div className='flex items-start justify-between'>
                    <div>
                        <h3 className='font-medium text-base'>{job.profile}</h3>
                        <p className='text-xs text-muted-foreground flex items-center mt-0.5'>
                            <Building2 className='h-3 w-3 mr-1' />
                            {job.company || 'Company Name'} • {job.location}
                        </p>
                    </div>

                    {isUrgent && !isExpired ? (
                        <Badge variant='destructive' className='text-xs'>
                            Urgent
                        </Badge>
                    ) : isExpired ? (
                        <Badge variant='outline' className='text-xs'>
                            Expired
                        </Badge>
                    ) : (
                        <Badge variant='outline' className='text-xs'>
                            {job.workplaceType}
                        </Badge>
                    )}
                </div>

                <div className='mt-3 grid grid-cols-2 gap-x-2 gap-y-1'>
                    <div className='flex items-center text-xs text-muted-foreground'>
                        <Briefcase className='h-3 w-3 mr-1 flex-shrink-0' />
                        <span>{job.type}</span>
                    </div>
                    <div className='flex items-center text-xs text-muted-foreground'>
                        <Clock className='h-3 w-3 mr-1 flex-shrink-0' />
                        <span>{daysRemaining > 0 ? `${daysRemaining} days left` : 'Application closed'}</span>
                    </div>
                </div>

                <div className='mt-3 flex flex-wrap gap-1.5'>
                    {job.skills.slice(0, 3).map((skill, i) => (
                        <Badge key={i} variant='secondary' className='text-xs py-0 h-5'>
                            {skill}
                        </Badge>
                    ))}
                    {job.skills.length > 3 && (
                        <Badge variant='secondary' className='text-xs py-0 h-5'>
                            +{job.skills.length - 3}
                        </Badge>
                    )}
                </div>

                <div className='mt-3 pt-2 border-t'>
                    <div className='text-xs text-muted-foreground flex justify-between'>
                        <span>Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
                        <span>{job.applications.length} applicants</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function JobListings() {
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    const {
        filteredJobs,
        loading,
        hasMore,
        observerRef,
        searchQuery,
        setSearchQuery,
        jobType,
        setJobType,
        workplaceType,
        setWorkplaceType,
        resetFilters,
    } = useJobFetching(10);

    const handleJobSelection = (job: Job) => {
        setSelectedJob(job);
    };

    if (filteredJobs.length > 0) {
        if (!selectedJob || !filteredJobs.some((job) => job.id === selectedJob.id)) {
            if (!selectedJob) {
                setSelectedJob(filteredJobs[0]);
            } else if (!filteredJobs.some((job) => job.id === selectedJob.id)) {
                setSelectedJob(filteredJobs[0]);
            }
        }
    }

    return (
        <NavbarLayout>
            <div className='px-4 sm:px-6 py-6'>
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
                    <div>
                        <h1 className='text-2xl font-bold mb-1'>Job Listings</h1>
                        <p className='text-muted-foreground text-sm'>
                            {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} available
                            {jobType !== 'all' || workplaceType !== 'all' ? ' (filtered)' : ''}
                        </p>
                    </div>

                    <div className='mt-3 sm:mt-0 flex gap-2'>
                        <Button variant='outline' size='sm' className='gap-2' asChild>
                            <Link href='/saved-jobs'>
                                <BookmarkPlus className='h-4 w-4' />
                                <span className='hidden sm:inline'>Saved Jobs</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    <div className='lg:col-span-1'>
                        <div className='rounded-lg border bg-card shadow-sm h-full'>
                            <FilterBar
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                jobType={jobType}
                                setJobType={setJobType}
                                workplaceType={workplaceType}
                                setWorkplaceType={setWorkplaceType}
                                resetFilters={resetFilters}
                                isAdmin={false}
                                compact={true}
                            />

                            <ScrollArea className='h-[calc(100vh-300px)]'>
                                <div className='p-3'>
                                    {loading && filteredJobs.length === 0 ? (
                                        [...Array(3)].map((_, index) => <LoadingPostSkeleton key={index} />)
                                    ) : filteredJobs.length === 0 ? (
                                        <Card className='p-6'>
                                            <CardContent className='flex flex-col items-center justify-center text-center py-6'>
                                                <Briefcase className='w-12 h-12 text-muted-foreground/40 mb-4' />
                                                <h2 className='text-lg font-semibold text-muted-foreground'>No Jobs Found</h2>
                                                <p className='text-sm text-muted-foreground text-center mt-2 mb-4'>
                                                    {searchQuery || jobType !== 'all' || workplaceType !== 'all'
                                                        ? 'No jobs match your current filters.'
                                                        : 'There are no job listings available at the moment.'}
                                                </p>
                                                {(searchQuery || jobType !== 'all' || workplaceType !== 'all') && (
                                                    <Button variant='outline' size='sm' onClick={resetFilters}>
                                                        <RefreshCw className='mr-2 h-4 w-4' />
                                                        Reset Filters
                                                    </Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <>
                                            {filteredJobs.map((job) => (
                                                <JobCard
                                                    key={job.id}
                                                    job={job}
                                                    isSelected={job.id === selectedJob?.id}
                                                    onClick={() => handleJobSelection(job)}
                                                />
                                            ))}
                                        </>
                                    )}
                                    <div ref={observerRef} className='h-10'>
                                        {loading && filteredJobs.length > 0 && (
                                            <div className='flex items-center justify-center py-3'>
                                                <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                                                <span className='ml-2 text-sm text-muted-foreground'>Loading more jobs...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </ScrollArea>
                        </div>
                    </div>

                    <div className='lg:col-span-2'>
                        <JobDetail job={selectedJob} />
                    </div>
                </div>
            </div>
        </NavbarLayout>
    );
}
