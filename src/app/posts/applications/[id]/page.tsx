'use client';

import FiltersPage from '@/elements/filters';
import NavbarLayout from '@/layouts/navbar';
import { Application, ApplicationStatus } from '@/model/application';
import { User } from '@/model/user';
import { useCallback, useEffect, useRef, useState } from 'react';
import ky from 'ky';
import LoadingPostSkeleton from '@/elements/post-skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User as UserIcon, Briefcase, MapPin, Phone, Building, GraduationCap, Lightbulb, Globe, FileText, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getResume } from '@/appwrite/server/storage';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

interface ApplicationCardProps {
    application: Application;
    isSelected: boolean;
    onClick: () => void;
}

const DetailSection = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <>
        <h3 className='font-semibold flex items-center mb-2'>
            {icon}
            <span className='ml-2'>{title}</span>
        </h3>
        {children}
        <Separator className='my-4' />
    </>
);

const ApplicationCard = ({ application, isSelected, onClick }: ApplicationCardProps) => (
    <Card onClick={onClick} className={`cursor-pointer mb-2 transition-shadow hover:shadow-md ${isSelected ? 'border-2 border-blue-300' : ''}`}>
        <CardHeader className='flex flex-row items-center space-x-4 py-2'>
            <Avatar>
                <AvatarFallback>{`${application.firstName[0]}${application.lastName[0]}`}</AvatarFallback>
            </Avatar>
            <div>
                <CardTitle>{`${application.firstName} ${application.lastName}`}</CardTitle>
                <p className='text-sm text-muted-foreground'>{application.email}</p>
            </div>
        </CardHeader>
        <CardContent className='py-2'>
            <div className='flex items-center space-x-2 text-sm'>
                <Briefcase className='w-4 h-4' />
                <span>{application.experience[0]?.profile || 'Not specified'}</span>
            </div>
            <div className='flex items-center space-x-2 text-sm mt-1'>
                <MapPin className='w-4 h-4' />
                <span>{application.currentLocation}</span>
            </div>
        </CardContent>
    </Card>
);

const ApplicationDetail = ({ application }: { application: Application | null }) => {
    const [fetchingResume, setFetchingResume] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleStatusChange = async (newStatus: ApplicationStatus) => {
        await onStatusChange(newStatus);
        setIsDialogOpen(false);
    };
    const onStatusChange = async (newStatus: ApplicationStatus) => {
        if (application) {
            application.status = newStatus;
            try {
                await ky.put('/api/application', {
                    json: { jobId: application.jobId, applicationId: application.id, status: newStatus },
                });
                toast({
                    title: 'Application status updated successfully',
                    description: `Application status updated to ${newStatus}. An email has been sent to the applicant.`,
                });
            } catch (error) {
                toast({
                    title: 'Error updating application status',
                    description: 'Error updating application status. Please try again later.',
                });
            }
        }
    };
    const isStatusChangeable = application?.status === ApplicationStatus.APPLIED;

    if (!application) {
        return (
            <Card className='h-full flex items-center justify-center'>
                <CardContent>
                    <p className='text-center text-muted-foreground'>Select an application to see details</p>
                </CardContent>
            </Card>
        );
    }

    const fetchResume = async (resume: string) => {
        try {
            setFetchingResume(true);
            const file = await getResume(resume);
            const blob = new Blob([file], { type: 'application/octet-binary;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'resume.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.log('Error fetching resume', error);
        } finally {
            setFetchingResume(false);
        }
    };
    return (
        <Card className='h-full overflow-auto'>
            <CardHeader className='pb-2'>
                <div className='flex items-center space-x-4'>
                    <Avatar className='w-16 h-16'>
                        <AvatarFallback className='text-2xl'>{`${application.firstName[0]}${application.lastName[0]}`}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className='text-2xl'>{`${application.firstName} ${application.lastName}`}</CardTitle>
                        <p className='text-muted-foreground'>{application.email}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-2 text-sm'>
                    {[
                        { icon: <Phone className='w-4 h-4' />, value: application.phone },
                        { icon: <MapPin className='w-4 h-4' />, value: application.currentLocation },
                        { icon: <UserIcon className='w-4 h-4' />, value: application.gender },
                        { icon: <Building className='w-4 h-4' />, value: application.source },
                    ].map((item, index) => (
                        <div key={index} className='flex items-center space-x-2'>
                            {item.icon}
                            <span>{item.value}</span>
                        </div>
                    ))}
                </div>

                <DetailSection title='Education' icon={<GraduationCap className='w-5 h-5' />}>
                    {application.education.map((edu, index) => (
                        <div key={index} className='mb-2'>
                            <p className='font-medium'>{`${edu.degree} (${edu.degreeType})`}</p>
                            <p className='text-sm text-muted-foreground'>{edu.college}</p>
                            <p className='text-sm text-muted-foreground'>SGPA: {edu.sgpa}</p>
                        </div>
                    ))}
                </DetailSection>

                <DetailSection title='Experience' icon={<Briefcase className='w-5 h-5' />}>
                    {application.experience.map((exp, index) => (
                        <div key={index} className='mb-2'>
                            <p className='font-medium'>{exp.profile}</p>
                            <p className='text-sm text-muted-foreground'>{`${exp.company} (${exp.employer})`}</p>
                            <p className='text-sm text-muted-foreground'>{`${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}`}</p>
                            <p className='text-sm text-muted-foreground'>Years of Experience: {exp.yoe}</p>
                        </div>
                    ))}
                </DetailSection>

                <DetailSection title='Skills' icon={<Lightbulb className='w-5 h-5' />}>
                    <div className='flex flex-wrap gap-2'>
                        {application.skills.map((skill, index) => (
                            <Badge key={index} variant='secondary'>
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </DetailSection>

                <DetailSection title='Social Links' icon={<Globe className='w-5 h-5' />}>
                    {application.socialLinks.map((link, index) => (
                        <a key={index} href={link} target='_blank' rel='noopener noreferrer' className='block text-blue-500 hover:underline'>
                            {link}
                        </a>
                    ))}
                </DetailSection>

                <DetailSection title='Resume' icon={<FileText className='w-5 h-5' />}>
                    <a
                        href='#'
                        onClick={(e) => {
                            e.preventDefault();
                            fetchResume(application.resume);
                        }}
                        className='text-blue-500 hover:underline'
                    >
                        {fetchingResume ? 'Fetching Resume...' : 'View Resume'}
                    </a>
                </DetailSection>

                <DetailSection title='Cover Letter' icon={<FileText className='w-5 h-5' />}>
                    <p className='text-sm'>{application.coverLetter}</p>
                </DetailSection>

                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <h3 className='font-semibold flex items-center mb-2'>
                            <UserIcon className='w-5 h-5 mr-2' /> Application Status
                        </h3>
                        <div className='flex items-center space-x-2'>
                            <Button variant='outline' size='sm' disabled={!isStatusChangeable} onClick={() => setIsDialogOpen(true)}>
                                {application.status}
                            </Button>
                            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Change Application Status</AlertDialogTitle>
                                        <AlertDialogDescription>Select a new status for this application.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleStatusChange(ApplicationStatus.SELECTED)}>Accept</AlertDialogAction>
                                        <AlertDialogAction onClick={() => handleStatusChange(ApplicationStatus.REJECTED)}>Reject</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                    <div>
                        <h3 className='font-semibold flex items-center mb-2'>
                            <Calendar className='w-5 h-5 mr-2' /> Applied On
                        </h3>
                        <p>{new Date(application.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

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

export default function Component({ params }: { params: { id: string } }) {
    const { id } = params;
    const router = useRouter();
    const limit = 10;
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastId, setLastId] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef<HTMLDivElement | null>(null);
    const loadingRef = useRef(false);
    const [applications, setApplications] = useState<Application[]>([]);

    const fetchApplications = useCallback(async () => {
        if (loadingRef.current || !hasMore) return;

        setLoading(true);
        loadingRef.current = true;
        try {
            const url = `/api/job-applications?jobId=${id}` + `&limit=${limit}` + (lastId ? '&lastId=' + lastId : '');
            const res = (await ky.get(url).json()) as any[];
            const fetchedApplications = (res ?? []).map(
                (application: any) =>
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
                        application.status,
                        application.jobId,
                        application.createdAt,
                        application.createdBy
                    )
            );
            setApplications((prevApplications) => [...prevApplications, ...fetchedApplications]);
            setLastId(fetchedApplications.length ? fetchedApplications[fetchedApplications.length - 1].id : null);
            setHasMore(fetchedApplications.length === limit);
            if (selectedApplication === null && fetchedApplications.length > 0) {
                setSelectedApplication(fetchedApplications[0]);
            }
        } catch (error) {
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, []);
    const debouncedFetchApplications = useDebounce(fetchApplications, 300);
    useEffect(() => {
        if (!id) return;
        debouncedFetchApplications();
    }, [debouncedFetchApplications]);

    useEffect(() => {
        if (!id) return;
        if (!observerRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    debouncedFetchApplications();
                }
            },
            { threshold: 1.0 }
        );
        observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [debouncedFetchApplications, hasMore]);

    if (!id) {
        return (
            <NavbarLayout>
                <div className='flex items-center justify-center h-[calc(100vh-4rem)]'>
                    <div className='flex flex-col items-center space-y-4'>
                        <p className='text-lg font-semibold'>Invalid Application ID</p>
                        <Button className='text-white px-4 py-2 rounded' onClick={() => router.push('/posts')}>
                            Go back to the posts page
                        </Button>
                    </div>
                </div>
            </NavbarLayout>
        );
    }

    return (
        <NavbarLayout>
            <FiltersPage />
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-5'>
                <div className='col-span-1 md:col-span-1'>
                    {loading && applications.length === 0 ? (
                        [...Array(3)].map((_, index) => <LoadingPostSkeleton key={index} />)
                    ) : applications.length === 0 ? (
                        <Card className='p-6'>
                            <CardContent className='flex flex-col items-center justify-center'>
                                <UserIcon className='w-12 h-12 text-gray-400 mb-4' />
                                <h2 className='text-lg font-semibold text-muted-foreground'>No Applications Found</h2>
                                <p className='text-sm text-muted-foreground text-center mt-2'>
                                    There are no applications available at the moment. Please check back later.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {applications.map((application) => (
                                <ApplicationCard
                                    key={application.id}
                                    application={application}
                                    isSelected={application.id === selectedApplication?.id}
                                    onClick={() => setSelectedApplication(application)}
                                />
                            ))}
                        </>
                    )}
                    <div ref={observerRef} className='h-10'></div>
                </div>
                {selectedApplication && applications.length > 0 && (
                    <div className='col-span-1 md:col-span-2 border-l pl-6'>
                        <ApplicationDetail application={selectedApplication} />
                    </div>
                )}
            </div>
        </NavbarLayout>
    );
}
