'use client';

import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import ky from 'ky';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import NavbarLayout from '@/layouts/navbar';
import {
    User as UserIcon,
    Briefcase,
    MapPin,
    RefreshCw,
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    ChevronDown,
    Download,
    Mail,
    AlertCircle,
    ArrowLeft,
    FileText,
    Inbox,
    Star,
    Send,
    Video,
    Handshake,
    LogOut,
} from 'lucide-react';


import { Card, CardContent, CardHeader, CardTitle } from '@jobify/ui/card';
import { Button } from '@jobify/ui/button';
import { Badge } from '@jobify/ui/badge';
import { toast } from '@jobify/ui/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@jobify/ui/tabs';
import { ApplicationFilterBar } from '@jobify/ui/components/application-filter-bar';
import { Avatar, AvatarFallback } from '@jobify/ui/avatar';
import { Skeleton } from '@jobify/ui/skeleton';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@jobify/ui/alert-dialog';


import { Application, ApplicationStatus, ApplicationStage, parseApplicationStage } from '@jobify/domain/application';
import { User } from '@jobify/domain/user';
import { Job } from '@jobify/domain/job';

type SortOption = 'newest' | 'oldest' | 'nameAsc' | 'nameDesc';

type AdminApplicationFilters = {
    searchQuery: string;
    statusFilter: string;
    stageFilter: string;
    sortOption: SortOption;
};

const DEFAULT_ADMIN_APP_FILTERS: AdminApplicationFilters = {
    searchQuery: '',
    statusFilter: 'all',
    stageFilter: 'all',
    sortOption: 'newest',
};

const APPLICATIONS_PAGE_SIZE = 100;

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

/** Public API returns arrays; legacy responses used JSON strings. `JSON.parse([])` throws (empty string coercion). */
function jsonArrayFromApi<T>(raw: unknown): T[] {
    if (Array.isArray(raw)) return raw as T[];
    if (typeof raw === 'string') {
        const s = raw.trim();
        if (!s) return [];
        return JSON.parse(s) as T[];
    }
    return [];
}

function applicationFromApi(app: any): Application {
    return new Application(
        app.id,
        app.firstName,
        app.lastName,
        app.email,
        app.phone,
        app.currentLocation,
        app.gender,
        jsonArrayFromApi(app.education),
        jsonArrayFromApi(app.experience),
        jsonArrayFromApi<string>(app.skills),
        app.source,
        app.resume,
        jsonArrayFromApi<string>(app.socialLinks),
        app.coverLetter,
        app.status,
        parseApplicationStage(app.stage),
        app.jobId,
        app.createdAt,
        app.createdBy
    );
}

const StatusBadge = ({ status, stage }: { status: ApplicationStatus; stage: ApplicationStage }) => {
    const statusVariants = {
        [ApplicationStatus.APPLIED]: {
            variant: 'secondary' as const,
            icon: <Clock className='w-3 h-3 mr-1' />,
        },
        [ApplicationStatus.SELECTED]: {
            variant: 'default' as const,
            icon: <CheckCircle className='w-3 h-3 mr-1' />,
        },
        [ApplicationStatus.REJECTED]: {
            variant: 'destructive' as const,
            icon: <XCircle className='w-3 h-3 mr-1' />,
        },
    };

    const stageVariants = {
        [ApplicationStage.APPLIED]: {
            icon: <Send className='w-3 h-3 mr-1' />,
            color: 'text-blue-600',
        },
        [ApplicationStage.SHORTLISTED]: {
            icon: <Star className='w-3 h-3 mr-1' />,
            color: 'text-yellow-600',
        },
        [ApplicationStage.ASSIGNMENT_SENT]: {
            icon: <FileText className='w-3 h-3 mr-1' />,
            color: 'text-purple-600',
        },
        [ApplicationStage.ASSIGNMENT_SUBMITTED]: {
            icon: <Send className='w-3 h-3 mr-1' />,
            color: 'text-indigo-600',
        },
        [ApplicationStage.INTERVIEW_SCHEDULED]: {
            icon: <Calendar className='w-3 h-3 mr-1' />,
            color: 'text-green-600',
        },
        [ApplicationStage.INTERVIEW_DONE]: {
            icon: <Video className='w-3 h-3 mr-1' />,
            color: 'text-teal-600',
        },
        [ApplicationStage.OFFER_SENT]: {
            icon: <Mail className='w-3 h-3 mr-1' />,
            color: 'text-orange-600',
        },
        [ApplicationStage.HIRED]: {
            icon: <Handshake className='w-3 h-3 mr-1' />,
            color: 'text-emerald-600',
        },
        [ApplicationStage.REJECTED]: {
            icon: <XCircle className='w-3 h-3 mr-1' />,
            color: 'text-red-600',
        },
        [ApplicationStage.WITHDRAWN]: {
            icon: <LogOut className='w-3 h-3 mr-1' />,
            color: 'text-gray-600',
        },
    };

    const { variant, icon } = statusVariants[status];
    const stageInfo = stageVariants[stage];
    
    const formatStage = (stage: ApplicationStage) => {
        return stage.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    return (
        <div className='flex flex-col gap-1'>
            <Badge variant={variant} className='flex items-center'>
                {icon}
                {status}
            </Badge>
            <Badge variant='outline' className={`text-xs flex items-center ${stageInfo.color}`}>
                {stageInfo.icon}
                {formatStage(stage)}
            </Badge>
        </div>
    );
};


const ApplicationCard = ({
    application,
    isSelected,
    onClick,
    statusChangeLoading,
    isChangingStatus,
}: {
    application: Application;
    isSelected: boolean;
    onClick: () => void;
    statusChangeLoading: boolean;
    isChangingStatus: boolean;
}) => {
    return (
        <Card className={`mb-3 cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-primary shadow-md' : ''}`} onClick={onClick}>
            <CardContent className='p-4'>
                <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                        <Avatar>
                            <AvatarFallback>{`${application.firstName[0]}${application.lastName[0]}`}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className='font-medium'>{`${application.firstName} ${application.lastName}`}</h3>
                            <p className='text-xs text-muted-foreground'>{application.email}</p>
                        </div>
                    </div>
                    {isChangingStatus && statusChangeLoading ? (
                        <div className='flex items-center'>
                            <RefreshCw className='w-3 h-3 mr-1 animate-spin text-muted-foreground' />
                            <span className='text-xs text-muted-foreground'>Updating...</span>
                        </div>
                    ) : (
                        <StatusBadge status={application.status} stage={application.stage} />
                    )}
                </div>

                <div className='mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-sm'>
                    <div className='flex items-center'>
                        <Briefcase className='h-3.5 w-3.5 mr-1 text-muted-foreground' />
                        <span>{application.experience[0]?.profile || 'Not specified'}</span>
                    </div>
                    <div className='flex items-center'>
                        <MapPin className='h-3.5 w-3.5 mr-1 text-muted-foreground' />
                        <span>{application.currentLocation}</span>
                    </div>
                </div>

                <div className='mt-3 flex flex-wrap gap-1.5'>
                    {application.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant='secondary' className='text-xs py-0 h-5'>
                            {skill}
                        </Badge>
                    ))}
                    {application.skills.length > 3 && (
                        <Badge variant='secondary' className='text-xs py-0 h-5'>
                            +{application.skills.length - 3}
                        </Badge>
                    )}
                </div>

                <div className='mt-3 text-xs text-muted-foreground flex justify-between border-t pt-2'>
                    <span>Applied: {formatDate(application.createdAt)}</span>
                    <span>Job ID: {application.jobId.substring(0, 8)}</span>
                </div>
            </CardContent>
        </Card>
    );
};


const ApplicationDetail = ({
    application,
    onStatusChange,
    jobDetails,
    statusChangeLoading,
}: {
    application: Application | null;
    onStatusChange: (status: ApplicationStatus) => Promise<void>;
    jobDetails: Job | null;
    statusChangeLoading: boolean;
}) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [fetchingResume, setFetchingResume] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);

    if (!application) {
        return (
            <Card className='h-full flex items-center justify-center'>
                <CardContent className='py-10'>
                    <div className='text-center'>
                        <Inbox className='h-12 w-12 mx-auto text-muted-foreground/50 mb-4' />
                        <h3 className='text-lg font-medium mb-2'>Select an Application</h3>
                        <p className='text-sm text-muted-foreground max-w-md mx-auto'>
                            Select an application from the list to view detailed information about the candidate.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const handleDownloadResume = async () => {
        try {
            setFetchingResume(true);
            const res = await fetch(`/api/resume?applicationId=${application.id}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch resume');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${application.firstName}_${application.lastName}_Resume.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading resume:', error);
            toast({
                title: 'Download Failed',
                description: 'Could not download the resume. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setFetchingResume(false);
        }
    };

    return (
        <div className='space-y-4'>
            <Card>
                <CardHeader className='pb-2'>
                    <div className='flex justify-between items-start'>
                        <div className='flex items-center gap-4'>
                            <Avatar className='h-16 w-16'>
                                <AvatarFallback className='text-xl'>{`${application.firstName[0]}${application.lastName[0]}`}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className='text-xl'>{`${application.firstName} ${application.lastName}`}</CardTitle>
                                <div className='flex items-center mt-1'>
                                    <p className='text-sm text-muted-foreground mr-3'>{application.email}</p>
                                    <StatusBadge status={application.status} stage={application.stage} />
                                </div>
                            </div>
                        </div>

                        <div className='space-x-2'>
                            <Button variant='outline' size='sm' onClick={handleDownloadResume} disabled={fetchingResume || !application.resume}>
                                <Download className='h-4 w-4 mr-2' />
                                Resume
                            </Button>

                            <Button variant='outline' size='sm' onClick={() => (window.location.href = `mailto:${application.email}`)}>
                                <Mail className='h-4 w-4 mr-2' />
                                Contact
                            </Button>

                            <AlertDialog
                                open={showStatusDialog}
                                onOpenChange={(open) => {
                                    if (!open && statusChangeLoading) {

                                        return;
                                    }
                                    setShowStatusDialog(open);
                                }}
                            >
                                <AlertDialogTrigger asChild>
                                    <Button size='sm'>
                                        Change Status
                                        <ChevronDown className='h-4 w-4 ml-2' />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Update Application Status</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Change the status of this application. This will send an email notification to the applicant.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className='grid grid-cols-1 gap-4 my-4'>
                                        <Button
                                            variant='outline'
                                            className={application.status === ApplicationStatus.APPLIED ? 'border-primary' : ''}
                                            onClick={async () => {
                                                try {
                                                    await onStatusChange(ApplicationStatus.APPLIED);
                                                    setShowStatusDialog(false);
                                                } catch (error) {

                                                }
                                            }}
                                            disabled={statusChangeLoading}
                                        >
                                            {statusChangeLoading ? (
                                                <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                                            ) : (
                                                <Clock className='h-4 w-4 mr-2' />
                                            )}
                                            Mark as Pending
                                        </Button>

                                        <Button
                                            variant='default'
                                            className={
                                                application.status === ApplicationStatus.SELECTED
                                                    ? 'bg-green-600 hover:bg-green-700'
                                                    : 'bg-green-600 hover:bg-green-700'
                                            }
                                            onClick={async () => {
                                                try {
                                                    await onStatusChange(ApplicationStatus.SELECTED);
                                                    setShowStatusDialog(false);
                                                } catch (error) {

                                                }
                                            }}
                                            disabled={statusChangeLoading}
                                        >
                                            {statusChangeLoading ? (
                                                <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                                            ) : (
                                                <CheckCircle className='h-4 w-4 mr-2' />
                                            )}
                                            Select Applicant
                                        </Button>

                                        <Button
                                            variant='default'
                                            className={
                                                application.status === ApplicationStatus.REJECTED
                                                    ? 'bg-red-600 hover:bg-red-700'
                                                    : 'bg-red-600 hover:bg-red-700'
                                            }
                                            onClick={async () => {
                                                try {
                                                    await onStatusChange(ApplicationStatus.REJECTED);
                                                    setShowStatusDialog(false);
                                                } catch (error) {

                                                }
                                            }}
                                            disabled={statusChangeLoading}
                                        >
                                            {statusChangeLoading ? (
                                                <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                                            ) : (
                                                <XCircle className='h-4 w-4 mr-2' />
                                            )}
                                            Reject Applicant
                                        </Button>
                                    </div>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={statusChangeLoading}>Cancel</AlertDialogCancel>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className='mb-4'>
                            <TabsTrigger value='profile'>Profile</TabsTrigger>
                            <TabsTrigger value='experience'>Experience</TabsTrigger>
                            <TabsTrigger value='education'>Education</TabsTrigger>
                            <TabsTrigger value='jobDetails'>Job Details</TabsTrigger>
                        </TabsList>

                        <TabsContent value='profile'>
                            <div className='space-y-6'>
                                <div className='grid grid-cols-2 gap-4'>
                                    {[
                                        { icon: <UserIcon className='h-4 w-4 text-muted-foreground' />, label: 'Gender', value: application.gender },
                                        {
                                            icon: <MapPin className='h-4 w-4 text-muted-foreground' />,
                                            label: 'Location',
                                            value: application.currentLocation,
                                        },
                                        {
                                            icon: <Calendar className='h-4 w-4 text-muted-foreground' />,
                                            label: 'Applied On',
                                            value: formatDate(application.createdAt),
                                        },
                                        { icon: <Briefcase className='h-4 w-4 text-muted-foreground' />, label: 'Source', value: application.source },
                                    ].map((item, index) => (
                                        <div key={index} className='flex flex-col'>
                                            <span className='text-xs text-muted-foreground flex items-center mb-1'>
                                                {item.icon}
                                                <span className='ml-2'>{item.label}</span>
                                            </span>
                                            <span className='font-medium'>{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <h3 className='font-medium mb-2 flex items-center'>
                                        <Briefcase className='h-4 w-4 text-primary mr-2' />
                                        Skills
                                    </h3>
                                    <div className='flex flex-wrap gap-2'>
                                        {application.skills.map((skill, index) => (
                                            <Badge key={index} variant='secondary'>
                                                {skill}
                                            </Badge>
                                        ))}
                                        {application.skills.length === 0 && <span className='text-sm text-muted-foreground'>No skills listed</span>}
                                    </div>
                                </div>

                                <div>
                                    <h3 className='font-medium mb-2 flex items-center'>
                                        <FileText className='h-4 w-4 text-primary mr-2' />
                                        Cover Letter
                                    </h3>
                                    <Card className='bg-muted/30'>
                                        <CardContent className='p-4'>
                                            {application.coverLetter ? (
                                                <p className='whitespace-pre-line text-sm'>{application.coverLetter}</p>
                                            ) : (
                                                <p className='text-sm text-muted-foreground italic'>No cover letter provided</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value='experience'>
                            <div className='space-y-4'>
                                {application.experience.length > 0 ? (
                                    application.experience.map((exp, index) => (
                                        <Card key={index} className='bg-muted/30'>
                                            <CardContent className='p-4'>
                                                <div className='flex justify-between items-start'>
                                                    <div>
                                                        <h3 className='font-medium'>{exp.profile}</h3>
                                                        <p className='text-sm'>{exp.company}</p>
                                                        {exp.employer && exp.employer !== exp.company && (
                                                            <p className='text-xs text-muted-foreground'>Employer: {exp.employer}</p>
                                                        )}
                                                    </div>
                                                    <Badge variant='outline'>
                                                        {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                                                    </Badge>
                                                </div>
                                                <div className='mt-2'>
                                                    <span className='text-xs bg-muted rounded-full px-2 py-1'>{exp.yoe} years experience</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className='text-center py-8'>
                                        <AlertCircle className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                                        <p className='text-muted-foreground'>No experience information available</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value='education'>
                            <div className='space-y-4'>
                                {application.education.length > 0 ? (
                                    application.education.map((edu, index) => (
                                        <Card key={index} className='bg-muted/30'>
                                            <CardContent className='p-4'>
                                                <div className='flex justify-between items-start'>
                                                    <div>
                                                        <h3 className='font-medium'>{edu.degree}</h3>
                                                        <p className='text-sm'>{edu.college}</p>
                                                        <p className='text-xs text-muted-foreground'>Degree Type: {edu.degreeType}</p>
                                                    </div>
                                                    <Badge variant='outline'>SGPA: {edu.sgpa.toFixed(1)}</Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className='text-center py-8'>
                                        <AlertCircle className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                                        <p className='text-muted-foreground'>No education information available</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value='jobDetails'>
                            <div className='space-y-4'>
                                {jobDetails ? (
                                    <>
                                        <Card className='bg-muted/30'>
                                            <CardContent className='p-4'>
                                                <div className='flex justify-between items-start'>
                                                    <div>
                                                        <h3 className='font-medium'>{jobDetails.profile}</h3>
                                                        <p className='text-sm'>{jobDetails.company}</p>
                                                        <div className='flex mt-2 gap-2'>
                                                            <Badge variant='outline'>{jobDetails.type}</Badge>
                                                            <Badge variant='outline'>{jobDetails.workplaceType}</Badge>
                                                        </div>
                                                    </div>
                                                    <Badge>{getDaysRemaining(jobDetails.lastDateToApply) > 0 ? 'Active' : 'Closed'}</Badge>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <div>
                                            <h3 className='font-medium mb-2 flex items-center'>
                                                <MapPin className='h-4 w-4 text-primary mr-2' />
                                                Location
                                            </h3>
                                            <p>{jobDetails.location}</p>
                                        </div>

                                        <div>
                                            <h3 className='font-medium mb-2 flex items-center'>
                                                <Calendar className='h-4 w-4 text-primary mr-2' />
                                                Application Deadline
                                            </h3>
                                            <p>{formatDate(jobDetails.lastDateToApply)}</p>
                                        </div>

                                        <div>
                                            <Button asChild variant='outline' className='w-full'>
                                                <Link href={`/posts/${jobDetails.id}`}>View Full Job Details</Link>
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className='text-center py-8'>
                                        <AlertCircle className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                                        <p className='text-muted-foreground'>Could not load job details</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};


const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const lastDate = new Date(deadline);
    const diffTime = lastDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};


export default function AdminApplicationsPage() {
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [jobs, setJobs] = useState<Map<string, Job>>(new Map());
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusChangeLoading, setStatusChangeLoading] = useState(false);
    const loadingRef = useRef(false);
    const lastIdRef = useRef<string | null>(null);
    const hasMoreRef = useRef(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const [filterDraft, setFilterDraft] = useState<AdminApplicationFilters>(DEFAULT_ADMIN_APP_FILTERS);
    const [filterApplied, setFilterApplied] = useState<AdminApplicationFilters>(DEFAULT_ADMIN_APP_FILTERS);

    const fetchJobsData = useCallback(async (jobIds: string[]) => {
        if (jobIds.length === 0) return;
        try {
            const jobsMap = new Map<string, Job>();

            await Promise.all(
                jobIds.map(async (jobId) => {
                    try {
                        const jobData = (await ky.get(`/api/post?id=${jobId}`).json()) as Job;
                        jobsMap.set(
                            jobId,
                            new Job(
                                jobData.id ?? (jobData as { $id?: string }).$id ?? '',
                                jobData.profile,
                                jobData.description,
                                jobData.company,
                                jobData.type,
                                jobData.workplaceType,
                                jobData.lastDateToApply,
                                jobData.location,
                                jobData.skills,
                                jobData.rejectionContent,
                                jobData.selectionContent,
                                jobData.createdAt,
                                jobData.state,
                                jobData.createdBy,
                            )
                        );
                    } catch (err) {
                        console.error(`Error fetching job ${jobId}:`, err);
                    }
                })
            );

            setJobs((prev) => {
                const next = new Map(prev);
                for (const [k, v] of jobsMap) next.set(k, v);
                return next;
            });
        } catch (err) {
            console.error('Error fetching jobs:', err);
        }
    }, []);

    const fetchApplications = useCallback(
        async (replace: boolean) => {
            if (loadingRef.current) return;
            if (!replace && !hasMoreRef.current) return;
            loadingRef.current = true;
            setLoading(true);
            setError(null);
            if (replace) {
                setApplications([]);
                lastIdRef.current = null;
                setHasMore(true);
                hasMoreRef.current = true;
            }
            try {
                const cursor = replace ? null : lastIdRef.current;
                const url = `/api/applications?limit=${APPLICATIONS_PAGE_SIZE}${cursor ? `&lastId=${encodeURIComponent(cursor)}` : ''}`;
                const res = (await ky.get(url).json()) as any[];
                if (!Array.isArray(res)) {
                    throw new Error('Invalid response format');
                }
                const fetched = res.map(applicationFromApi);
                setApplications((prev) => (replace ? fetched : [...prev, ...fetched]));
                const nextLast = fetched.length ? fetched[fetched.length - 1].id : null;
                lastIdRef.current = nextLast;
                const more = fetched.length === APPLICATIONS_PAGE_SIZE;
                setHasMore(more);
                hasMoreRef.current = more;
                if (fetched.length > 0) {
                    const jobIds = [...new Set(fetched.map((a) => a.jobId))];
                    void fetchJobsData(jobIds);
                }
                if (replace && fetched.length > 0) {
                    setSelectedApplication((prev) => prev ?? fetched[0]);
                }
                if (!replace && fetched.length > 0) {
                    setSelectedApplication((prev) => prev ?? fetched[0]);
                }
            } catch (err) {
                console.error('Error fetching applications:', err);
                setError('Failed to load applications. Please try again.');
            } finally {
                setLoading(false);
                loadingRef.current = false;
            }
        },
        [fetchJobsData]
    );

    useEffect(() => {
        void fetchApplications(true);
    }, [fetchApplications]);

    useEffect(() => {
        const root = scrollRef.current;
        const target = sentinelRef.current;
        if (!root || !target) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && hasMoreRef.current && !loadingRef.current) {
                    void fetchApplications(false);
                }
            },
            { root, rootMargin: '200px', threshold: 0 }
        );
        observer.observe(target);
        return () => observer.disconnect();
    }, [fetchApplications, loading, applications.length, hasMore]);


    const handleStatusChange = async (status: ApplicationStatus) => {
        if (!selectedApplication) return;

        setStatusChangeLoading(true);
        try {
            await ky.put('/api/application', {
                json: {
                    jobId: selectedApplication.jobId,
                    applicationId: selectedApplication.id,
                    status,
                },
            });


            setApplications((prevApplications) => prevApplications.map((app) => (app.id === selectedApplication.id ? { ...app, status } : app)));

            setSelectedApplication((prev) => (prev ? { ...prev, status } : null));

            toast({
                title: 'Status Updated',
                description: `Application status updated to ${status}`,
            });
        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                title: 'Error',
                description: 'Failed to update application status',
                variant: 'destructive',
            });
        } finally {
            setStatusChangeLoading(false);
        }
    };


    const applyFilters = useCallback(() => {
        setFilterApplied({ ...filterDraft });
        void fetchApplications(true);
    }, [filterDraft, fetchApplications]);

    const refreshList = useCallback(async () => {
        setFilterDraft({ ...filterApplied });
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        setError(null);
        setApplications([]);
        lastIdRef.current = null;
        setHasMore(true);
        hasMoreRef.current = true;
        try {
            const all: Application[] = [];
            let cursor: string | null = null;
            let more = true;
            while (more) {
                const url = `/api/applications?limit=${APPLICATIONS_PAGE_SIZE}${cursor ? `&lastId=${encodeURIComponent(cursor)}` : ''}`;
                const res = (await ky.get(url).json()) as any[];
                if (!Array.isArray(res)) {
                    throw new Error('Invalid response format');
                }
                const batch = res.map(applicationFromApi);
                if (batch.length === 0) break;
                all.push(...batch);
                cursor = batch[batch.length - 1].id;
                more = batch.length === APPLICATIONS_PAGE_SIZE;
            }
            setApplications(all);
            lastIdRef.current = all.length > 0 ? all[all.length - 1].id : null;
            setHasMore(false);
            hasMoreRef.current = false;
            setSelectedApplication(all.length > 0 ? all[0] : null);
            if (all.length > 0) {
                const jobIds = [...new Set(all.map((a) => a.jobId))];
                await fetchJobsData(jobIds);
            }
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError('Failed to load applications. Please try again.');
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [filterApplied, fetchJobsData]);

    const clearFiltersAndRefetch = useCallback(() => {
        setFilterDraft(DEFAULT_ADMIN_APP_FILTERS);
        setFilterApplied(DEFAULT_ADMIN_APP_FILTERS);
        void fetchApplications(true);
    }, [fetchApplications]);

    const filteredApplications = useMemo(() => {
        let filtered = [...applications];
        const { searchQuery, statusFilter, stageFilter, sortOption } = filterApplied;

        if (statusFilter !== 'all') {
            filtered = filtered.filter((app) => app.status === statusFilter);
        }

        if (stageFilter !== 'all') {
            filtered = filtered.filter((app) => app.stage === stageFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (app) =>
                    app.firstName.toLowerCase().includes(query) ||
                    app.lastName.toLowerCase().includes(query) ||
                    app.email.toLowerCase().includes(query) ||
                    app.skills.some((skill) => skill.toLowerCase().includes(query)) ||
                    app.experience.some((exp) => exp.profile.toLowerCase().includes(query) || exp.company.toLowerCase().includes(query))
            );
        }

        switch (sortOption) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'nameAsc':
                filtered.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
                break;
            case 'nameDesc':
                filtered.sort((a, b) => `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`));
                break;
        }

        return filtered;
    }, [applications, filterApplied]);


    const selectedJobDetails = useMemo(() => {
        if (!selectedApplication) return null;
        return jobs.get(selectedApplication.jobId) || null;
    }, [selectedApplication, jobs]);

    return (
        <NavbarLayout>
            <div className='container mx-auto px-4 py-6'>
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
                    <div>
                        <h1 className='text-2xl font-bold'>All Applications</h1>
                        <p className='text-muted-foreground'>
                            {loading && applications.length === 0
                                ? 'Loading applications…'
                                : `${filteredApplications.length} ${filteredApplications.length === 1 ? 'application' : 'applications'} found`}
                        </p>
                    </div>

                    <div className='mt-4 md:mt-0'>
                        <Button variant='ghost' asChild>
                            <Link href='/posts'>
                                <ArrowLeft className='h-4 w-4 mr-2' />
                                Back to Jobs
                            </Link>
                        </Button>
                    </div>
                </div>

                <ApplicationFilterBar
                    searchQuery={filterDraft.searchQuery}
                    setSearchQuery={(q) => setFilterDraft((p) => ({ ...p, searchQuery: q }))}
                    statusFilter={filterDraft.statusFilter}
                    setStatusFilter={(v) => setFilterDraft((p) => ({ ...p, statusFilter: v }))}
                    stageFilter={filterDraft.stageFilter}
                    setStageFilter={(v) => setFilterDraft((p) => ({ ...p, stageFilter: v }))}
                    sortBy={filterDraft.sortOption}
                    setSortBy={(v) => setFilterDraft((p) => ({ ...p, sortOption: v }))}
                    onApply={applyFilters}
                    onRefresh={refreshList}
                    compact={false}
                />

                <div className='grid min-w-0 grid-cols-1 gap-6 items-start lg:grid-cols-3'>
                    <div className='flex h-[calc(100vh-220px)] min-h-0 min-w-0 flex-col overflow-hidden lg:col-span-1'>
                        <Card className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'>
                            <CardHeader className='border-b px-4 py-3'>
                                <CardTitle className='truncate text-base'>
                                    Applications ({filteredApplications.length})
                                </CardTitle>
                            </CardHeader>
                            <div ref={scrollRef} className='min-h-0 min-w-0 flex-1 overflow-auto p-3'>
                                {loading && applications.length === 0 ? (
                                    Array(5)
                                        .fill(0)
                                        .map((_, index) => (
                                            <Card key={index} className='mb-3'>
                                                <CardContent className='p-4'>
                                                    <div className='flex items-start justify-between'>
                                                        <div className='flex items-center gap-3'>
                                                            <Skeleton className='h-10 w-10 rounded-full' />
                                                            <div>
                                                                <Skeleton className='h-5 w-40 mb-1' />
                                                                <Skeleton className='h-3 w-32' />
                                                            </div>
                                                        </div>
                                                        <Skeleton className='h-5 w-20 rounded-full' />
                                                    </div>
                                                    <div className='mt-3'>
                                                        <Skeleton className='h-4 w-full' />
                                                        <Skeleton className='h-4 w-2/3 mt-2' />
                                                    </div>
                                                    <div className='mt-3 flex gap-2'>
                                                        <Skeleton className='h-5 w-16 rounded-full' />
                                                        <Skeleton className='h-5 w-16 rounded-full' />
                                                        <Skeleton className='h-5 w-16 rounded-full' />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                ) : filteredApplications.length === 0 ? (
                                    <div className='flex flex-col items-center justify-center py-10 text-center'>
                                        <Inbox className='h-12 w-12 text-muted-foreground mb-4' />
                                        <h2 className='text-xl font-semibold mb-2'>No Applications Found</h2>
                                        <p className='text-muted-foreground mb-6 max-w-sm'>
                                            {filterApplied.searchQuery || filterApplied.statusFilter !== 'all' || filterApplied.stageFilter !== 'all'
                                                ? 'No applications match your current filters.'
                                                : 'There are no applications in the system yet.'}
                                        </p>

                                        {(filterApplied.searchQuery || filterApplied.statusFilter !== 'all' || filterApplied.stageFilter !== 'all') && (
                                            <Button variant='outline' onClick={clearFiltersAndRefetch}>
                                                <RefreshCw className='h-4 w-4 mr-2' />
                                                Reset Filters
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {filteredApplications.map((application) => (
                                            <ApplicationCard
                                                key={application.id}
                                                application={application}
                                                isSelected={selectedApplication?.id === application.id}
                                                onClick={() => setSelectedApplication(application)}
                                                statusChangeLoading={statusChangeLoading}
                                                isChangingStatus={selectedApplication?.id === application.id}
                                            />
                                        ))}
                                        <div ref={sentinelRef} className='h-1 w-full shrink-0' aria-hidden />
                                        {loading && applications.length > 0 && hasMore && (
                                            <div className='flex justify-center py-2'>
                                                <div className='flex animate-pulse space-x-2'>
                                                    <div className='h-2 w-2 rounded-full bg-muted-foreground' />
                                                    <div className='h-2 w-2 rounded-full bg-muted-foreground' />
                                                    <div className='h-2 w-2 rounded-full bg-muted-foreground' />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className='min-w-0 lg:col-span-2'>
                        <ApplicationDetail
                            application={selectedApplication}
                            onStatusChange={handleStatusChange}
                            jobDetails={selectedJobDetails}
                            statusChangeLoading={statusChangeLoading}
                        />
                    </div>
                </div>
            </div>
        </NavbarLayout>
    );
}
