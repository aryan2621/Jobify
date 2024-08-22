'use client';

import { useState } from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
    DialogFooter,
} from '@/components/ui/dialog';
import NavbarLayout from '@/layouts/navbar';
import { jobs } from '@/utils';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

export default function Component() {
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [applicantsPerPage] = useState(5);

    const indexOfLastApplicant = currentPage * applicantsPerPage;
    const indexOfFirstApplicant = indexOfLastApplicant - applicantsPerPage;
    const currentApplicants = selectedJob
        ? selectedJob.applicants.slice(
              indexOfFirstApplicant,
              indexOfLastApplicant
          )
        : [];
    const totalPages = selectedJob
        ? Math.ceil(selectedJob.applicants.length / applicantsPerPage)
        : 1;

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleApplicantClick = (applicant: any) => {
        setSelectedApplicant(applicant);
    };

    const toggleJobSelection = (job: any) => {
        setSelectedJob(selectedJob === job ? null : job);
        setCurrentPage(1);
        setSelectedApplicant(null);
    };

    return (
        <NavbarLayout>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                <div className='col-span-2 space-y-6'>
                    {jobs.map((job: any, index) => (
                        <Card
                            key={index}
                            onClick={() => toggleJobSelection(job)}
                            className='cursor-pointer'
                        >
                            <CardHeader>
                                <CardTitle>{job.title}</CardTitle>
                                <CardDescription>
                                    {job.company} - {job.location}
                                </CardDescription>
                            </CardHeader>
                            {selectedJob === job && (
                                <CardContent>
                                    <div className='grid gap-4'>
                                        <div className='flex items-center justify-between'>
                                            <div>
                                                <h4 className='text-sm font-medium'>
                                                    Status
                                                </h4>
                                                <Badge
                                                    variant='outline'
                                                    className={`bg-${
                                                        job.status === 'Pending'
                                                            ? 'yellow'
                                                            : job.status ===
                                                                'Accepted'
                                                              ? 'green'
                                                              : 'red'
                                                    }-500 text-${
                                                        job.status === 'Pending'
                                                            ? 'yellow'
                                                            : job.status ===
                                                                'Accepted'
                                                              ? 'green'
                                                              : 'red'
                                                    }-50`}
                                                >
                                                    {job.status}
                                                </Badge>
                                            </div>
                                            <div>
                                                <h4 className='text-sm font-medium'>
                                                    Applied On
                                                </h4>
                                                <p className='text-xs text-muted-foreground'>
                                                    {job.appliedDate}
                                                </p>
                                            </div>
                                        </div>
                                        <div className='grid gap-2'>
                                            <h4 className='text-sm font-medium'>
                                                About the Role
                                            </h4>
                                            <p>
                                                This is a {job.title} role at
                                                {job.company} in {job.location}.
                                                The company is looking for a
                                                skilled individual to join their
                                                team and contribute to their
                                                ongoing projects.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
                <div className='space-y-6'>
                    {selectedJob && (
                        <div>
                            <h3 className='text-lg font-medium mb-4'>
                                Applicants
                            </h3>
                            <div className='space-y-4'>
                                {currentApplicants.map(
                                    (applicant: any, index: any) => (
                                        <div
                                            key={index}
                                            className='border rounded-md p-4 cursor-pointer hover:bg-muted'
                                            onClick={() =>
                                                handleApplicantClick(applicant)
                                            }
                                        >
                                            <div className='flex items-center justify-between'>
                                                <div>
                                                    <h4 className='font-medium'>
                                                        {applicant.name}
                                                    </h4>
                                                    <p className='text-sm text-muted-foreground'>
                                                        {applicant.email}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant='outline'
                                                    className={`bg-${
                                                        selectedJob.status ===
                                                        'Pending'
                                                            ? 'yellow'
                                                            : selectedJob.status ===
                                                                'Accepted'
                                                              ? 'green'
                                                              : 'red'
                                                    }-500 text-${
                                                        selectedJob.status ===
                                                        'Pending'
                                                            ? 'yellow'
                                                            : selectedJob.status ===
                                                                'Accepted'
                                                              ? 'green'
                                                              : 'red'
                                                    }-50`}
                                                >
                                                    {selectedJob.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                            <div className='flex justify-center mt-4'>
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() =>
                                                    handlePageChange(
                                                        currentPage > 1
                                                            ? currentPage - 1
                                                            : 1
                                                    )
                                                }
                                                className={`cursor-pointer ${currentPage === 1 ? 'cursor-not-allowed' : ''}`}
                                            />
                                        </PaginationItem>
                                        {Array.from(
                                            { length: totalPages },
                                            (_, i) => (
                                                <PaginationItem key={i + 1}>
                                                    <PaginationLink
                                                        isActive={
                                                            currentPage ===
                                                            i + 1
                                                        }
                                                        onClick={() =>
                                                            handlePageChange(
                                                                i + 1
                                                            )
                                                        }
                                                        className='cursor-pointer'
                                                    >
                                                        {i + 1}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            )
                                        )}
                                        {totalPages > 5 && (
                                            <>
                                                <PaginationEllipsis />
                                                <PaginationItem>
                                                    <PaginationLink
                                                        onClick={() =>
                                                            handlePageChange(
                                                                totalPages
                                                            )
                                                        }
                                                        className='cursor-pointer'
                                                    >
                                                        {totalPages}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            </>
                                        )}
                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() =>
                                                    handlePageChange(
                                                        currentPage < totalPages
                                                            ? currentPage + 1
                                                            : totalPages
                                                    )
                                                }
                                                className={`cursor-pointer ${currentPage === totalPages ? 'cursor-not-allowed' : ''}`}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                            {selectedApplicant && (
                                <Dialog
                                    open
                                    onOpenChange={() =>
                                        setSelectedApplicant(null)
                                    }
                                >
                                    <DialogContent className='p-6 max-w-2xl'>
                                        <DialogHeader>
                                            <DialogTitle>
                                                {selectedApplicant.name}
                                            </DialogTitle>
                                            <DialogDescription>
                                                {selectedApplicant.email}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className='grid gap-4'>
                                            <div className='flex items-center justify-between'>
                                                <div>
                                                    <h5 className='text-xs font-medium'>
                                                        Phone
                                                    </h5>
                                                    <p className='text-sm'>
                                                        {
                                                            selectedApplicant.phone
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <h5 className='text-xs font-medium'>
                                                        Country
                                                    </h5>
                                                    <p className='text-sm'>
                                                        {
                                                            selectedApplicant.country
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <h5 className='text-xs font-medium'>
                                                    Resume
                                                </h5>
                                                <a
                                                    href={
                                                        selectedApplicant.resumeLink
                                                    }
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='text-sm text-blue-600'
                                                >
                                                    View Resume
                                                </a>
                                            </div>
                                            <div>
                                                <h5 className='text-xs font-medium'>
                                                    Experience
                                                </h5>
                                                <p className='text-sm'>
                                                    {
                                                        selectedApplicant.experience
                                                    }
                                                </p>
                                            </div>
                                            <div>
                                                <h5 className='text-xs font-medium'>
                                                    Current Job
                                                </h5>
                                                <p className='text-sm'>
                                                    {
                                                        selectedApplicant.currentJob
                                                    }
                                                </p>
                                            </div>
                                            <div>
                                                <h5 className='text-xs font-medium'>
                                                    Skills
                                                </h5>
                                                <p className='text-sm'>
                                                    {selectedApplicant.skills.join(
                                                        ', '
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <h5 className='text-xs font-medium'>
                                                    Cover Letter
                                                </h5>
                                                <p className='text-sm'>
                                                    {
                                                        selectedApplicant.coverLetter
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <DialogClose asChild>
                                            <Button>Close</Button>
                                        </DialogClose>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </NavbarLayout>
    );
}
