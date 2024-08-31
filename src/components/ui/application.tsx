import React, { useEffect, useState } from 'react';
import { Job } from '@/model/job';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { APPLICANTS_DEFAULT_PAGE_SIZE } from '@/utils';
import { Application, ApplicationStatus } from '@/model/application';
import ky from 'ky';
import { LoadingApplicationSkeleton } from '@/elements/application-skeleton';
import { getResume } from '@/appwrite/server/storage';
import { Badge } from './badge';
import { toast } from './use-toast';
import { Check, X } from 'lucide-react';

interface ApplicationsProps {
    job: Job;
}

export default function Component({ job }: ApplicationsProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedApplications, setSelectedApplications] = useState<Application | null>(null);
    const [fetchingApplications, setFetchingApplications] = useState(false);
    const [applications, setApplications] = useState<any[]>(job.applications ?? []);
    const [fetchingResume, setFetchingResume] = useState(false);

    const applicantsPerPage = APPLICANTS_DEFAULT_PAGE_SIZE;
    const indexOfLastApplicant = currentPage * applicantsPerPage;
    const indexOfFirstApplicant = indexOfLastApplicant - applicantsPerPage;
    const currentApplicants = applications.slice(indexOfFirstApplicant, indexOfLastApplicant);
    const totalPages = Math.ceil(applications.length / applicantsPerPage);

    useEffect(() => {
        setCurrentPage(1);
        setSelectedApplications(null);
        setApplications(job.applications ?? []);
        fetchApplications();
    }, [job.id]);

    const fetchResume = async (resume: string) => {
        try {
            setFetchingResume(true);
            const file = await getResume(resume);
            const blob = new Blob([file], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.log('Error fetching resume', error);
        } finally {
            setFetchingResume(false);
        }
    };

    const fetchApplications = async () => {
        try {
            setFetchingApplications(true);
            const response = await ky.get(`/api/job-applications?jobId=${job.id}`).json();
            setApplications(
                (response as any[]).map(
                    (application) =>
                        new Application(
                            application.id,
                            application.firstName,
                            application.lastName,
                            application.email,
                            application.phone,
                            application.currentLocation,
                            application.gender,
                            JSON.parse(application.education),
                            JSON.parse(application.experience),
                            JSON.parse(application.skills),
                            application.source,
                            application.resume,
                            JSON.parse(application.socialLinks),
                            application.coverLetter,
                            application.status as ApplicationStatus,
                            application.jobId,
                            application.createdAt,
                            application.createdBy
                        )
                )
            );
        } catch (error) {
            console.log('Error fetching applicants', error);
        } finally {
            setFetchingApplications(false);
        }
    };
    const updateApplicationStatus = async (jobId: string, applicationId: string, status: ApplicationStatus) => {
        try {
            setApplications(applications.map((app) => (app.id === applicationId ? { ...app, status } : app)));
            setSelectedApplications((prev) => (prev ? { ...prev, status } : null));
            await ky.put('/api/application', {
                json: { jobId, applicationId, status },
            });
            toast({
                title: 'Application status updated successfully',
                description: `Application status updated to ${status}. An email has been sent to the applicant.`,
            });
        } catch (error) {
            toast({
                title: 'Error updating application status',
                description: 'Error updating application status. Please try again later.',
            });
        }
    };

    return (
        <div>
            {applications.length > 0 ? (
                <div>
                    {fetchingApplications ? (
                        <LoadingApplicationSkeleton />
                    ) : (
                        <>
                            <div className='space-y-4'>
                                {currentApplicants.map((applicant: Application, index: number) => (
                                    <div
                                        key={index}
                                        className='border rounded-md p-4 cursor-pointer hover:bg-muted'
                                        onClick={() => setSelectedApplications(applicant)}
                                    >
                                        <div className='flex items-center justify-between'>
                                            <div>
                                                <h4 className='font-medium'>
                                                    {applicant.firstName} {applicant.lastName}
                                                </h4>
                                                <p className='text-sm text-muted-foreground'>{applicant.email}</p>
                                            </div>
                                            <Badge>{applicant.status}</Badge>
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
                        </>
                    )}

                    {selectedApplications && (
                        <Dialog open onOpenChange={() => setSelectedApplications(null)}>
                            <DialogContent className='p-6 max-w-2xl'>
                                <DialogHeader>
                                    <DialogTitle>
                                        {selectedApplications.firstName} {selectedApplications.lastName}
                                    </DialogTitle>
                                    <DialogDescription>{selectedApplications.email}</DialogDescription>
                                </DialogHeader>
                                <div className='grid gap-4'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <h5 className='text-xs font-medium'>Phone</h5>
                                            <p className='text-sm'>{selectedApplications.phone}</p>
                                        </div>
                                        <div>
                                            <h5 className='text-xs font-medium'>Country</h5>
                                            <p className='text-sm'>{selectedApplications.currentLocation}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className='text-xs font-medium'>Resume</h5>
                                        <Button onClick={() => fetchResume(selectedApplications.resume)}>
                                            {fetchingResume ? 'Downloading...' : 'Download Resume'}
                                        </Button>
                                    </div>
                                    <div>
                                        <h5 className='text-xs font-medium'>Education</h5>
                                        {selectedApplications.education.map((edu: any, idx: number) => (
                                            <div className='text-sm' key={idx}>
                                                {edu.degreeType} in {edu.degree} from {edu.college}, SGPA{' '}
                                                <Badge variant='secondary'>{edu.sgpa}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <h5 className='text-xs font-medium'>Experience</h5>
                                        {selectedApplications.experience.map((exp: any, idx: number) => (
                                            <p className='text-sm' key={idx}>
                                                {exp.profile} at {exp.company} ({exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate})
                                            </p>
                                        ))}
                                    </div>
                                    <div>
                                        <h5 className='text-xs font-medium'>Skills</h5>
                                        {selectedApplications.skills.map((skill: string, idx: number) => (
                                            <Badge key={idx} variant='secondary' className='text-sm mr-1'>
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div>
                                        <h5 className='text-xs font-medium'>Cover Letter</h5>
                                        <p className='text-sm'>{selectedApplications.coverLetter}</p>
                                    </div>
                                    <div>
                                        <h5 className='text-xs font-medium'>Update Status</h5>
                                        <div className='flex space-x-2 mt-2'>
                                            <Button
                                                onClick={() => updateApplicationStatus(job.id, selectedApplications.id, ApplicationStatus.SELECTED)}
                                                disabled={selectedApplications.status === ApplicationStatus.SELECTED}
                                            >
                                                <Check className='mr-2 h-4 w-4' /> Approve
                                            </Button>
                                            <Button
                                                onClick={() => updateApplicationStatus(job.id, selectedApplications.id, ApplicationStatus.REJECTED)}
                                                disabled={selectedApplications.status === ApplicationStatus.REJECTED}
                                            >
                                                <X className='mr-2 h-4 w-4' /> Reject
                                            </Button>
                                        </div>
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
