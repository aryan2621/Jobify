'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ky from 'ky';

import NavbarLayout from '@/layouts/navbar';
import { Briefcase, Edit, Eye, MoreHorizontal, Plus, Trash2, Users, RefreshCw } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

import { Job, JobState } from '@/model/job';
import { useJobFetching } from '@/hooks/use-job-fetching';
import { FilterBar } from '@/components/elements/filter-bar';
import { JobDetail } from '@/components/elements/job-detail';
import { getDaysRemaining } from '@/lib/job-utils/utils';

const JobTableRow = ({
    job,
    onEdit,
    onView,
    onDelete,
}: {
    job: Job;
    onEdit: () => void;
    onView: () => void;
    onDelete: () => void;
}) => {
    const daysRemaining = getDaysRemaining(job.lastDateToApply);
    const isExpired = daysRemaining <= 0;

    return (
        <TableRow>
            <TableCell>
                <div>
                    <div className='font-medium'>{job.profile}</div>
                    <div className='text-xs text-muted-foreground flex items-center mt-0.5'>
                        <Briefcase className='h-3 w-3 mr-1 flex-shrink-0' />
                        {job.company || 'Company'} • {job.location}
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <Badge variant='outline' className='text-xs'>
                    {job.type}
                </Badge>
            </TableCell>
            <TableCell>
                <Badge variant='outline' className='text-xs'>
                    {job.workplaceType}
                </Badge>
            </TableCell>
            <TableCell>
                <Badge variant={isExpired ? 'outline' : 'secondary'} className='text-xs'>
                    {isExpired ? 'Expired' : `${daysRemaining}d left`}
                </Badge>
                {job.state && (
                    <Badge
                        variant={job.state === JobState.PUBLISHED ? 'default' : job.state === JobState.DRAFT ? 'outline' : 'secondary'}
                        className='text-xs ml-1'
                    >
                        {job.state}
                    </Badge>
                )}
            </TableCell>
            <TableCell>
                <div className='flex items-center gap-2'>
                    <Button variant='ghost' size='sm' onClick={onView} className='h-8 text-xs'>
                        <Eye className='h-3.5 w-3.5 mr-1' />
                        View
                    </Button>
                    <Button variant='ghost' size='icon' className='h-8 w-8' asChild title='Go to applications'>
                        <Link href={`/applications/${job.id}`}>
                            <Users className='h-4 w-4' />
                        </Link>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon' className='h-8 w-8'>
                                <MoreHorizontal className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={onEdit} className='flex items-center'>
                                <Edit className='mr-2 h-4 w-4' />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onDelete} className='text-destructive flex items-center'>
                                <Trash2 className='mr-2 h-4 w-4' />
                                Delete Job
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </TableCell>
        </TableRow>
    );
};

export default function AdminPostsPage() {
    const router = useRouter();
    const [viewJob, setViewJob] = useState<Job | null>(null);
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
        router.push(`/posts/${jobId}`);
    };

    const handleViewJob = (job: Job) => {
        setViewJob(job);
    };

    const handleDeleteJob = async () => {
        if (!deleteJob) return;

        try {
            await ky.delete(`/api/post?id=${deleteJob.id}`);

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
                            <Link href='/posts/new'>
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
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Workplace</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className='w-[280px]'>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className='h-5 w-40' /></TableCell>
                                        <TableCell><Skeleton className='h-5 w-16' /></TableCell>
                                        <TableCell><Skeleton className='h-5 w-20' /></TableCell>
                                        <TableCell><Skeleton className='h-5 w-20' /></TableCell>
                                        <TableCell><Skeleton className='h-8 w-48' /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
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
                                    <Link href='/posts/new'>
                                        <Plus className='h-4 w-4 mr-2' />
                                        Create Your First Job
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Workplace</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className='w-[280px]'>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredJobs.map((job) => (
                                    <JobTableRow
                                        key={job.id}
                                        job={job}
                                        onEdit={() => handleEditJob(job.id)}
                                        onView={() => handleViewJob(job)}
                                        onDelete={() => {
                                            setDeleteJob(job);
                                            setShowDeleteDialog(true);
                                        }}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                        <div ref={observerRef} className='h-10'>
                            {loading && jobs.length > 0 && (
                                <div className='flex items-center justify-center py-3 border-t'>
                                    <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                                    <span className='ml-2 text-sm text-muted-foreground'>Loading more jobs...</span>
                                </div>
                            )}
                        </div>
                    </Card>
                )}
                <Dialog open={!!viewJob} onOpenChange={(open) => !open && setViewJob(null)}>
                    <DialogContent className='max-w-2xl max-h-[90vh] p-0 gap-0'>
                        <DialogHeader className='sr-only'>
                            <DialogTitle>Job details</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className='max-h-[90vh]'>
                            <div className='p-6'>
                                {viewJob && (
                                    <JobDetail job={viewJob} applicationsHref={`/applications/${viewJob.id}`} />
                                )}
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>

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
