import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Job } from '@/model/job';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Application, ApplicationStatus } from '@/model/application';
import ky from 'ky';
import { LoadingApplicationSkeleton } from '@/elements/application-skeleton';
import { getResume } from '@/appwrite/server/storage';
import { Badge } from './badge';
import { toast } from './use-toast';
import { Check, X } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from '@/components/ui/alert-dialog';

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

interface ApplicationsProps {
    job: Job;
}

export default function Component({ job }: ApplicationsProps) {
    const limit = 10;
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [fetchingApplications, setFetchingApplications] = useState(false);
    const [applications, setApplications] = useState<any[]>(job.applications ?? []);
    const [fetchingResume, setFetchingResume] = useState(false);

    const [lastId, setLastId] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef<HTMLDivElement | null>(null);
    const loadingRef = useRef(false);

    const [alertOpen, setAlertOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<ApplicationStatus | null>(null);

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

    const fetchApplications = useCallback(async () => {
        if (loadingRef.current || !hasMore) return;

        setFetchingApplications(true);
        loadingRef.current = true;
        try {
            const url = `/api/job-applications?jobId=${job.id}` + `&limit=${limit}` + (lastId ? '&lastId=' + lastId : '');
            const response = await ky.get(url).json();
            const applications = (response as any[]).map(
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
            );
            setApplications((prevApplications) => [...prevApplications, ...applications]);
            setLastId(applications.length ? applications[applications.length - 1].id : null);
            setHasMore(applications.length === limit);

            if (selectedApplication === null && applications.length > 0) {
                setSelectedApplication(applications[0]);
            }
        } catch (error) {
            console.log('Error fetching applicants', error);
        } finally {
            setFetchingApplications(false);
            loadingRef.current = false;
        }
    }, [lastId, hasMore, selectedApplication]);

    const debouncedFetchApplications = useDebounce(fetchApplications, 300);

    useEffect(() => {
        debouncedFetchApplications();
    }, [debouncedFetchApplications]);

    const handleStatusChange = (status: ApplicationStatus) => {
        setNewStatus(status);
        setAlertOpen(true);
    };

    const handleUpdateApplicationStatus = async () => {
        if (selectedApplication && newStatus) {
            try {
                await ky.put('/api/application', {
                    json: { jobId: job.id, applicationId: selectedApplication.id, status: newStatus },
                });
                setApplications(applications.map((app) => (app.id === selectedApplication.id ? { ...app, status: newStatus } : app)));
                setSelectedApplication((prev) => (prev ? { ...prev, status: newStatus } : null));
                toast({
                    title: 'Application status updated successfully',
                    description: `Application status updated to ${newStatus}. An email has been sent to the applicant.`,
                });
            } catch (error) {
                toast({
                    title: 'Error updating application status',
                    description: 'Error updating application status. Please try again later.',
                });
            } finally {
                setAlertOpen(false);
                setNewStatus(null);
            }
        }
    };

    return (
        <div>
            {applications.length > 0 ? (
                <div>
                    {fetchingApplications ? (
                        <LoadingApplicationSkeleton />
                    ) : (
                        <div className='space-y-4'>
                            {applications.map((applicant: Application, index: number) => (
                                <div
                                    key={index}
                                    className='border rounded-md p-4 cursor-pointer hover:bg-muted'
                                    onClick={() => setSelectedApplication(applicant)}
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
                    )}

                    {selectedApplication && (
                        <Dialog open onOpenChange={() => setSelectedApplication(null)}>
                            <DialogContent className='p-6 max-w-2xl'>
                                <DialogHeader>
                                    <DialogTitle>
                                        {selectedApplication.firstName} {selectedApplication.lastName}
                                    </DialogTitle>
                                    <DialogDescription>{selectedApplication.email}</DialogDescription>
                                </DialogHeader>
                                <div className='grid gap-4'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <h5 className='text-xs font-medium'>Phone</h5>
                                            <p className='text-sm'>{selectedApplication.phone}</p>
                                        </div>
                                        <div>
                                            <h5 className='text-xs font-medium'>Country</h5>
                                            <p className='text-sm'>{selectedApplication.currentLocation}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className='text-xs font-medium'>Resume</h5>
                                        <Button onClick={() => fetchResume(selectedApplication.resume)}>
                                            {fetchingResume ? 'Downloading...' : 'Download Resume'}
                                        </Button>
                                    </div>
                                    <div>
                                        <h5 className='text-xs font-medium'>Education</h5>
                                        {selectedApplication.education.map((edu: any, idx: number) => (
                                            <div className='text-sm' key={idx}>
                                                {edu.degreeType} in {edu.degree} from {edu.college}, SGPA{' '}
                                                <Badge variant='secondary'>{edu.sgpa}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <h5 className='text-xs font-medium'>Experience</h5>
                                        {selectedApplication.experience.map((exp: any, idx: number) => (
                                            <p className='text-sm' key={idx}>
                                                {exp.profile} at {exp.company} ({exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate})
                                            </p>
                                        ))}
                                    </div>
                                    <div>
                                        <h5 className='text-xs font-medium'>Skills</h5>
                                        {selectedApplication.skills.map((skill: string, idx: number) => (
                                            <Badge key={idx} variant='secondary' className='text-sm mr-1'>
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div>
                                        <h5 className='text-xs font-medium'>Cover Letter</h5>
                                        <p className='text-sm'>{selectedApplication.coverLetter}</p>
                                    </div>
                                    <div>
                                        <h5 className='text-xs font-medium'>Update Status</h5>
                                        <Button
                                            onClick={() => handleStatusChange(ApplicationStatus.SELECTED)}
                                            disabled={selectedApplication.status !== ApplicationStatus.APPLIED}
                                            className='mr-2'
                                        >
                                            <Check className='mr-2 h-4 w-4' /> Change Status
                                        </Button>
                                    </div>
                                </div>
                                <DialogClose asChild>
                                    <Button variant='secondary' className='mt-4'>
                                        Close
                                    </Button>
                                </DialogClose>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            ) : (
                <p>No applications found for this job.</p>
            )}

            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <DialogTitle>Change Application Status</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to change the status to {newStatus === ApplicationStatus.SELECTED ? 'Selected' : 'Rejected'}?
                        </DialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setAlertOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUpdateApplicationStatus}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
