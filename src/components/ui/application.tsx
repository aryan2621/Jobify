'use client';

import { useEffect, useState } from 'react';
import { Job } from '@/model/job';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { APPLICANTS_DEFAULT_PAGE_SIZE } from '@/utils';

interface ApplicationsProps {
    job: Job;
}

export default function Component({ job }: ApplicationsProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
    const [applications, setApplications] = useState<any[]>(job.applications ?? []);

    const applicantsPerPage = APPLICANTS_DEFAULT_PAGE_SIZE;
    const indexOfLastApplicant = currentPage * applicantsPerPage;
    const indexOfFirstApplicant = indexOfLastApplicant - applicantsPerPage;
    const currentApplicants = applications.slice(indexOfFirstApplicant, indexOfLastApplicant);
    const totalPages = Math.ceil(applications.length / applicantsPerPage);

    useEffect(() => {
        setCurrentPage(1);
        setSelectedApplicant(null);
        setApplications(job.applications ?? []);
    }, [job]);

    return (
        <div>
            {applications.length > 0 ? (
                <div>
                    <h3 className='text-lg font-medium mb-4'>Applicants</h3>
                    <div className='space-y-4'>
                        {currentApplicants.map((applicant: any, index: number) => (
                            <div
                                key={index}
                                className='border rounded-md p-4 cursor-pointer hover:bg-muted'
                                onClick={() => setSelectedApplicant(applicant)}
                            >
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <h4 className='font-medium'>{applicant.name}</h4>
                                        <p className='text-sm text-muted-foreground'>{applicant.email}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className='flex justify-center mt-4'>
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                                        className={`cursor-pointer ${currentPage === 1 ? 'cursor-not-allowed' : ''}`}
                                    />
                                </PaginationItem>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <PaginationItem key={i + 1}>
                                        <PaginationLink
                                            isActive={currentPage === i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className='cursor-pointer'
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                                        className={`cursor-pointer ${currentPage === totalPages ? 'cursor-not-allowed' : ''}`}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>

                    {selectedApplicant && (
                        <Dialog open onOpenChange={() => setSelectedApplicant(null)}>
                            <DialogContent className='p-6 max-w-2xl'>
                                <DialogHeader>
                                    <DialogTitle>{selectedApplicant.name}</DialogTitle>
                                    <DialogDescription>{selectedApplicant.email}</DialogDescription>
                                </DialogHeader>
                                <div className='grid gap-4'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <h5 className='text-xs font-medium'>Phone</h5>
                                            <p className='text-sm'>{selectedApplicant.phone}</p>
                                        </div>
                                        <div>
                                            <h5 className='text-xs font-medium'>Country</h5>
                                            <p className='text-sm'>{selectedApplicant.country}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className='text-xs font-medium'>Resume</h5>
                                        <a
                                            href={selectedApplicant.resumeLink}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-sm text-blue-600'
                                        >
                                            View Resume
                                        </a>
                                    </div>
                                    <div>
                                        <h5 className='text-xs font-medium'>Experience</h5>
                                        <p className='text-sm'>{selectedApplicant.experience}</p>
                                    </div>
                                    <div>
                                        <h5 className='text-xs font-medium'>Current Job</h5>
                                        <p className='text-sm'>{selectedApplicant.currentJob}</p>
                                    </div>
                                    <div>
                                        <h5 className='text-xs font-medium'>Skills</h5>
                                        <p className='text-sm'>{selectedApplicant.skills.join(', ')}</p>
                                    </div>
                                    <div>
                                        <h5 className='text-xs font-medium'>Cover Letter</h5>
                                        <p className='text-sm'>{selectedApplicant.coverLetter}</p>
                                    </div>
                                </div>
                                <DialogClose asChild>
                                    <Button>Close</Button>
                                </DialogClose>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            ) : (
                <h3 className='text-center align-center text-sm text-muted-foreground'>No applicants found for this job.</h3>
            )}
        </div>
    );
}
