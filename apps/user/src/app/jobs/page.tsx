'use client';
import { useState } from 'react';
import { Card, CardContent } from '@jobify/ui/card';
import { Button } from '@jobify/ui/button';
import { Badge } from '@jobify/ui/badge';
import NavbarLayout from '@/layouts/navbar';
import { Job } from '@jobify/domain/job';
import { Briefcase, Building2, Eye, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@jobify/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from '@jobify/ui/dialog';
import { ScrollArea } from '@jobify/ui/scroll-area';
import { Skeleton } from '@jobify/ui/skeleton';
import { getDaysRemaining } from '@/lib/job-utils/utils';
import { FilterBar } from '@/components/elements/filter-bar';
import { useJobFetching } from '@/hooks/use-job-fetching';
import { JobDetail } from '@/components/elements/job-detail';
const pillBadge = 'whitespace-nowrap shrink-0';
const JobTableRow = ({ job, onView }: {
    job: Job;
    onView: () => void;
}) => {
    const daysRemaining = getDaysRemaining(job.lastDateToApply);
    const isExpired = daysRemaining <= 0;
    return (<TableRow>
            <TableCell className='min-w-[200px] max-w-[280px]'>
                <div className='min-w-0'>
                    <div className='font-medium break-words'>{job.profile}</div>
                    <div className='text-xs text-muted-foreground flex items-start gap-1 mt-0.5 min-w-0'>
                        <Building2 className='h-3 w-3 mt-0.5 flex-shrink-0'/>
                        <span className='break-words'>{job.company || 'Company'} • {job.location}</span>
                    </div>
                </div>
            </TableCell>
            <TableCell className='whitespace-nowrap w-px align-middle'>
                <Badge variant='outline' className={pillBadge}>
                    {job.type}
                </Badge>
            </TableCell>
            <TableCell className='whitespace-nowrap w-px align-middle'>
                <Badge variant='outline' className={pillBadge}>
                    {job.workplaceType}
                </Badge>
            </TableCell>
            <TableCell className='whitespace-nowrap w-px align-middle'>
                <Badge variant={isExpired ? 'outline' : 'secondary'} className={pillBadge}>
                    {isExpired ? 'Expired' : `${daysRemaining}d left`}
                </Badge>
            </TableCell>
            <TableCell className='whitespace-nowrap w-[1%] align-middle'>
                <Button variant='ghost' size='sm' onClick={onView} className='h-8 text-xs whitespace-nowrap'>
                    <Eye className='h-3.5 w-3.5 mr-1 shrink-0'/>
                    View
                </Button>
            </TableCell>
        </TableRow>);
};
export default function JobListings() {
    const [viewJob, setViewJob] = useState<Job | null>(null);
    const {
        jobs,
        filteredJobs,
        paginatedJobs,
        loading,
        page,
        setPage,
        totalPages,
        totalFilteredCount,
        rangeStart,
        rangeEnd,
        pageSize,
        searchQuery,
        setSearchQuery,
        jobType,
        setJobType,
        workplaceType,
        setWorkplaceType,
        sortBy,
        setSortBy,
        applyFilters,
        refreshJobs,
        clearFiltersAndApply,
        appliedFilters,
    } = useJobFetching(10);
    return (<NavbarLayout>
            <div className='container mx-auto px-4 py-6'>
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
                    <div>
                        <h1 className='text-2xl font-bold'>Job Listings</h1>
                        <p className='text-muted-foreground'>
                            {totalFilteredCount} {totalFilteredCount === 1 ? 'job' : 'jobs'} available
                        </p>
                    </div>
                </div>

                <FilterBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    jobType={jobType}
                    setJobType={setJobType}
                    workplaceType={workplaceType}
                    setWorkplaceType={setWorkplaceType}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    onApply={applyFilters}
                    onRefresh={refreshJobs}
                    compact={false}
                />

                {loading && jobs.length === 0 ? (<Card>
                        <Table className='min-w-full w-max'>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='min-w-[200px]'>Role</TableHead>
                                    <TableHead className='whitespace-nowrap'>Type</TableHead>
                                    <TableHead className='whitespace-nowrap'>Workplace</TableHead>
                                    <TableHead className='whitespace-nowrap'>Status</TableHead>
                                    <TableHead className='whitespace-nowrap w-[1%]'>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[1, 2, 3, 4, 5].map((i) => (<TableRow key={i}>
                                        <TableCell>
                                            <Skeleton className='h-5 w-40'/>
                                            <Skeleton className='h-3 w-28 mt-1'/>
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className='h-5 w-16'/>
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className='h-5 w-20'/>
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className='h-5 w-20'/>
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className='h-8 w-20'/>
                                        </TableCell>
                                    </TableRow>))}
                            </TableBody>
                        </Table>
                    </Card>) : filteredJobs.length === 0 ? (<Card>
                        <CardContent className='py-10 flex flex-col items-center justify-center text-center'>
                            <Briefcase className='h-12 w-12 text-muted-foreground mb-4'/>
                            <h2 className='text-xl font-semibold mb-2'>No Jobs Found</h2>
                            <p className='text-muted-foreground mb-6 max-w-md'>
                                {appliedFilters.searchQuery || appliedFilters.jobType !== 'all' || appliedFilters.workplaceType !== 'all'
                ? 'No jobs match your current filters. Try adjusting your search criteria.'
                : 'There are no job listings available at the moment.'}
                            </p>
                            {(appliedFilters.searchQuery || appliedFilters.jobType !== 'all' || appliedFilters.workplaceType !== 'all') && (<Button variant='outline' size='icon' className='h-10 w-10' onClick={clearFiltersAndApply} aria-label='Clear filters' title='Clear filters'>
                                    <RefreshCw className='h-4 w-4'/>
                                </Button>)}
                        </CardContent>
                    </Card>                ) : (<Card className='relative'>
                        {loading && jobs.length > 0 && (
                            <div className='absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-[1px]'>
                                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                    <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                                    Updating listings…
                                </div>
                            </div>
                        )}
                        <Table className='min-w-full w-max'>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='min-w-[200px]'>Role</TableHead>
                                    <TableHead className='whitespace-nowrap'>Type</TableHead>
                                    <TableHead className='whitespace-nowrap'>Workplace</TableHead>
                                    <TableHead className='whitespace-nowrap'>Status</TableHead>
                                    <TableHead className='whitespace-nowrap w-[1%]'>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedJobs.map((job) => (<JobTableRow key={job.id} job={job} onView={() => setViewJob(job)}/>))}
                            </TableBody>
                        </Table>
                        {filteredJobs.length > 0 && (
                            <div className='flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                                <p className='text-center text-sm text-muted-foreground sm:text-left'>
                                    Showing {rangeStart}–{rangeEnd} of {totalFilteredCount} · {pageSize} per page
                                </p>
                                <div className='flex flex-wrap items-center justify-center gap-2'>
                                    <Button type='button' variant='outline' size='sm' disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                                    <Button type='button' variant='outline' size='sm' disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>Next</Button>
                                </div>
                            </div>
                        )}
                    </Card>)}

                <Dialog open={!!viewJob} onOpenChange={(open) => !open && setViewJob(null)}>
                    <DialogContent className='max-w-2xl max-h-[90vh] p-0 gap-0'>
                        <DialogHeader className='sr-only'>
                            <DialogTitle>Job details</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className='max-h-[90vh]'>
                            <div className='p-6'>
                                <JobDetail job={viewJob}/>
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>
        </NavbarLayout>);
}
