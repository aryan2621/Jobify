'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ky from 'ky';

import NavbarLayout from '@/layouts/navbar';
import { Briefcase, Edit, Eye, MoreHorizontal, Plus, Trash2, Users, RefreshCw, Clock } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

import { Job, JobState } from '@/model/job';
import { useJobFetching } from '@/hooks/use-job-fetching';
import { FilterBar } from '@/components/elements/filter-bar';
import { getDaysRemaining } from '@/lib/job-utils/utils';

const JobCard = ({ job, onEdit, onView, onDelete }: { job: Job; onEdit: () => void; onView: () => void; onDelete: () => void }) => {
    const daysRemaining = getDaysRemaining(job.lastDateToApply);
    const isExpired = daysRemaining <= 0;
    const applicationsCount = job.applications.length;

    return (
        <Card className='mb-4 hover:shadow-md transition-all'>
            <CardContent className='p-4'>
                <div className='flex justify-between items-start'>
                    <div>
                        <h3 className='font-medium text-base'>{job.profile}</h3>
                        <p className='text-xs text-muted-foreground flex items-center mt-0.5'>
                            <Briefcase className='h-3 w-3 mr-1' />
                            {job.company || 'Company Name'} • {job.location}
                        </p>
                    </div>

                    <div className='flex items-center space-x-2'>
                        <Badge variant={isExpired ? 'outline' : 'secondary'} className='text-xs'>
                            {isExpired ? 'Expired' : `${daysRemaining} days left`}
                        </Badge>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='icon'>
                                    <MoreHorizontal className='h-4 w-4' />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                                <DropdownMenuItem onClick={onView} className='flex items-center'>
                                    <Eye className='mr-2 h-4 w-4' />
                                    View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onEdit} className='flex items-center'>
                                    <Edit className='mr-2 h-4 w-4' />
                                    Edit Job
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={onView} className='flex items-center'>
                                    <Users className='mr-2 h-4 w-4' />
                                    View Applications ({applicationsCount})
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={onDelete} className='text-destructive flex items-center'>
                                    <Trash2 className='mr-2 h-4 w-4' />
                                    Delete Job
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className='mt-3 grid grid-cols-2 gap-x-2 gap-y-1'>
                    <div className='flex items-center text-xs text-muted-foreground'>
                        <Badge variant='outline' className='text-xs mr-2'>
                            {job.type}
                        </Badge>
                        <Badge variant='outline' className='text-xs'>
                            {job.workplaceType}
                        </Badge>
                    </div>
                    <div className='flex items-center text-xs text-muted-foreground justify-end'>
                        <Clock className='h-3 w-3 mr-1 flex-shrink-0' />
                        <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
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
                    <div className='text-xs flex justify-between items-center'>
                        <div className='flex items-center gap-2'>
                            <Button variant='outline' size='sm' onClick={onView} className='h-7 text-xs'>
                                <Users className='h-3 w-3 mr-1' />
                                {applicationsCount} {applicationsCount === 1 ? 'Application' : 'Applications'}
                            </Button>

                            {job.state && (
                                <Badge
                                    variant={job.state === JobState.PUBLISHED ? 'default' : job.state === JobState.DRAFT ? 'outline' : 'secondary'}
                                    className='text-xs'
                                >
                                    {job.state}
                                </Badge>
                            )}
                        </div>

                        <div className='flex gap-2'>
                            <Button variant='ghost' size='sm' onClick={onEdit} className='h-7 text-xs'>
                                <Edit className='h-3 w-3 mr-1' />
                                Edit
                            </Button>
                            <Button variant='ghost' size='sm' onClick={onView} className='h-7 text-xs'>
                                <Eye className='h-3 w-3 mr-1' />
                                View
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function AdminPostsPage() {
    const router = useRouter();
    const [deleteJob, setDeleteJob] = useState<Job | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const {
        jobs,
        setJobs,
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
        jobState,
        setJobState,
        sortBy,
        setSortBy,
        resetFilters,
    } = useJobFetching(10);

    const handleEditJob = (jobId: string) => {
        router.push(`/admin/posts/${jobId}`);
    };

    const handleViewJob = (jobId: string) => {
        router.push(`/admin/applications/${jobId}`);
    };

    const handleDeleteJob = async () => {
        if (!deleteJob) return;

        try {
            await ky.delete(`/api/post/${deleteJob.id}`);

            setJobs(jobs.filter((job) => job.id !== deleteJob.id));

            toast({
                title: 'Job Deleted',
                description: 'The job posting has been successfully deleted',
            });
        } catch (error) {
            console.error('Error deleting job:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete job. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setShowDeleteDialog(false);
            setDeleteJob(null);
        }
    };

    return (
        <NavbarLayout>
            <div className='container mx-auto px-4 py-6'>
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
                    <div>
                        <h1 className='text-2xl font-bold'>Manage Job Postings</h1>
                        <p className='text-muted-foreground'>
                            {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
                        </p>
                    </div>

                    <div className='mt-4 md:mt-0'>
                        <Button asChild>
                            <Link href='/admin/posts/new'>
                                <Plus className='h-4 w-4 mr-2' />
                                Create New Job
                            </Link>
                        </Button>
                    </div>
                </div>

                <FilterBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    jobType={jobType}
                    setJobType={setJobType}
                    workplaceType={workplaceType}
                    setWorkplaceType={setWorkplaceType}
                    jobState={jobState}
                    setJobState={setJobState}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    resetFilters={resetFilters}
                    isAdmin={true}
                />

                {loading && jobs.length === 0 ? (
                    <>
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className='mb-4'>
                                <CardContent className='p-4'>
                                    <div className='flex justify-between items-start'>
                                        <div className='space-y-2'>
                                            <Skeleton className='h-5 w-48' />
                                            <Skeleton className='h-4 w-32' />
                                        </div>
                                        <Skeleton className='h-6 w-16 rounded-full' />
                                    </div>
                                    <div className='mt-3 flex'>
                                        <Skeleton className='h-5 w-16 rounded-full mr-2' />
                                        <Skeleton className='h-5 w-16 rounded-full' />
                                    </div>
                                    <div className='mt-3 flex'>
                                        <Skeleton className='h-5 w-16 rounded-full mr-2' />
                                        <Skeleton className='h-5 w-16 rounded-full mr-2' />
                                        <Skeleton className='h-5 w-16 rounded-full' />
                                    </div>
                                    <div className='mt-3 pt-2 border-t'>
                                        <div className='flex justify-between'>
                                            <Skeleton className='h-4 w-24' />
                                            <div className='flex gap-2'>
                                                <Skeleton className='h-7 w-16 rounded' />
                                                <Skeleton className='h-7 w-16 rounded' />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </>
                ) : filteredJobs.length === 0 ? (
                    <Card>
                        <CardContent className='py-10 flex flex-col items-center justify-center text-center'>
                            <Briefcase className='h-12 w-12 text-muted-foreground mb-4' />
                            <h2 className='text-xl font-semibold mb-2'>No Jobs Found</h2>
                            <p className='text-muted-foreground mb-6 max-w-md'>
                                {searchQuery || jobType !== 'all' || workplaceType !== 'all' || jobState !== 'all'
                                    ? 'No jobs match your current filters. Try adjusting your search criteria.'
                                    : "You haven't created any job postings yet. Create your first job posting to start receiving applications."}
                            </p>

                            {searchQuery || jobType !== 'all' || workplaceType !== 'all' || jobState !== 'all' ? (
                                <Button variant='outline' onClick={resetFilters}>
                                    <RefreshCw className='h-4 w-4 mr-2' />
                                    Reset Filters
                                </Button>
                            ) : (
                                <Button asChild>
                                    <Link href='/admin/posts/new'>
                                        <Plus className='h-4 w-4 mr-2' />
                                        Create Your First Job
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div>
                        {filteredJobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onEdit={() => handleEditJob(job.id)}
                                onView={() => handleViewJob(job.id)}
                                onDelete={() => {
                                    setDeleteJob(job);
                                    setShowDeleteDialog(true);
                                }}
                            />
                        ))}

                        <div ref={observerRef} className='h-10'>
                            {loading && jobs.length > 0 && (
                                <div className='flex items-center justify-center py-3'>
                                    <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                                    <span className='ml-2 text-sm text-muted-foreground'>Loading more jobs...</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the job posting
                                {deleteJob && <span className='font-medium'> &quot;{deleteJob.profile}&quot;</span>}. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteJob} className='bg-destructive text-destructive-foreground'>
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </NavbarLayout>
    );
}
