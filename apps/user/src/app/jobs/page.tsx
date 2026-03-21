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
const JobTableRow = ({ job, onView }: {
    job: Job;
    onView: () => void;
}) => {
    const daysRemaining = getDaysRemaining(job.lastDateToApply);
    const isExpired = daysRemaining <= 0;
    return (<TableRow>
            <TableCell>
                <div>
                    <div className='font-medium'>{job.profile}</div>
                    <div className='text-xs text-muted-foreground flex items-center mt-0.5'>
                        <Building2 className='h-3 w-3 mr-1 flex-shrink-0'/>
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
            </TableCell>
            <TableCell>
                <Button variant='ghost' size='sm' onClick={onView} className='h-8 text-xs'>
                    <Eye className='h-3.5 w-3.5 mr-1'/>
                    View
                </Button>
            </TableCell>
        </TableRow>);
};
export default function JobListings() {
    const [viewJob, setViewJob] = useState<Job | null>(null);
    const { filteredJobs, loading, hasMore, observerRef, searchQuery, setSearchQuery, jobType, setJobType, workplaceType, setWorkplaceType, sortBy, setSortBy, resetFilters, } = useJobFetching(10);
    return (<NavbarLayout>
            <div className='container mx-auto px-4 py-6'>
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
                    <div>
                        <h1 className='text-2xl font-bold'>Job Listings</h1>
                        <p className='text-muted-foreground'>
                            {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} available
                        </p>
                    </div>
                </div>

                <FilterBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} jobType={jobType} setJobType={setJobType} workplaceType={workplaceType} setWorkplaceType={setWorkplaceType} sortBy={sortBy} setSortBy={setSortBy} resetFilters={resetFilters} compact={false}/>

                {loading && filteredJobs.length === 0 ? (<Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Workplace</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className='w-[120px]'>Actions</TableHead>
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
                                {searchQuery || jobType !== 'all' || workplaceType !== 'all'
                ? 'No jobs match your current filters. Try adjusting your search criteria.'
                : 'There are no job listings available at the moment.'}
                            </p>
                            {(searchQuery || jobType !== 'all' || workplaceType !== 'all') && (<Button variant='outline' onClick={resetFilters}>
                                    <RefreshCw className='h-4 w-4 mr-2'/>
                                    Reset Filters
                                </Button>)}
                        </CardContent>
                    </Card>) : (<Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Workplace</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className='w-[120px]'>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredJobs.map((job) => (<JobTableRow key={job.id} job={job} onView={() => setViewJob(job)}/>))}
                            </TableBody>
                        </Table>
                        <div ref={observerRef} className='h-10'>
                            {loading && filteredJobs.length > 0 && (<div className='flex items-center justify-center py-3 border-t'>
                                    <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent'/>
                                    <span className='ml-2 text-sm text-muted-foreground'>Loading more jobs...</span>
                                </div>)}
                        </div>
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
