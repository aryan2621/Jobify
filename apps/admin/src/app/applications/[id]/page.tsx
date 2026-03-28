'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import ky from 'ky';
import Link from 'next/link';

import NavbarLayout from '@/layouts/navbar';
import {
    User as UserIcon,
    Briefcase,
    MapPin,
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
    Globe,
    Building,
    Lightbulb,
    GraduationCap,
    Phone,
    Copy,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@jobify/ui/card';
import { Button } from '@jobify/ui/button';
import { Badge } from '@jobify/ui/badge';
import { Separator } from '@jobify/ui/separator';
import { toast } from '@jobify/ui/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@jobify/ui/tabs';
import { Avatar, AvatarFallback } from '@jobify/ui/avatar';
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
import { Alert, AlertTitle, AlertDescription } from '@jobify/ui/alert';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@jobify/ui/tooltip';
import { Popover, PopoverAnchor, PopoverContent } from '@jobify/ui/popover';
import { Skeleton } from '@jobify/ui/skeleton';

import { Application, ApplicationStatus, parseApplicationStage } from '@jobify/domain/application';
import { ApplicationFilterBar } from '@jobify/ui/components/application-filter-bar';

type SortOption = 'newest' | 'oldest' | 'nameAsc' | 'nameDesc';

type JobApplicationsFilters = {
    searchQuery: string;
    statusFilter: string;
    stageFilter: string;
    sortOption: SortOption;
};

const DEFAULT_JOB_APP_FILTERS: JobApplicationsFilters = {
    searchQuery: '',
    statusFilter: 'all',
    stageFilter: 'all',
    sortOption: 'newest',
};

const APPLICATIONS_PAGE_SIZE = 100;

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

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

const DetailSection = ({
    title,
    icon,
    children,
    noSeparator,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    noSeparator?: boolean;
}) => (
    <div className='mb-4'>
        <h3 className='font-semibold flex items-center mb-3'>
            {icon}
            <span className='ml-2'>{title}</span>
        </h3>
        <div className='pl-7'>{children}</div>
        {!noSeparator && <Separator className='mt-4' />}
    </div>
);

const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
    const variants = {
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

    const { variant, icon } = variants[status];

    return (
        <Badge variant={variant} className='inline-flex shrink-0 items-center whitespace-nowrap'>
            {icon}
            {status}
        </Badge>
    );
};

const ApplicationCard = ({ application, isSelected, onClick }: { application: Application; isSelected: boolean; onClick: () => void }) => {
    const yearsOfExperience = application.experience.reduce((total, exp) => {
        const start = new Date(exp.startDate);
        const end = exp.isCurrent ? new Date() : new Date(exp.endDate);
        const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
        return total + years;
    }, 0);

    return (
        <Card
            className={`mb-3 min-w-0 max-w-full cursor-pointer overflow-hidden transition-all hover:shadow-md ${isSelected ? 'border-2 border-primary shadow-md' : ''}`}
            onClick={onClick}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick();
                    e.preventDefault();
                }
            }}
            role='button'
            aria-pressed={isSelected}
        >
            <CardHeader className='flex min-w-0 flex-col gap-2 py-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3'>
                <div className='flex min-w-0 flex-1 items-center gap-3'>
                    <Avatar className='shrink-0 border'>
                        <AvatarFallback>{`${application.firstName[0]}${application.lastName[0]}`}</AvatarFallback>
                    </Avatar>
                    <div className='min-w-0'>
                        <CardTitle className='truncate text-base'>{`${application.firstName} ${application.lastName}`}</CardTitle>
                        <p className='truncate text-xs text-muted-foreground' title={application.email}>
                            {application.email}
                        </p>
                    </div>
                </div>
                <div className='flex shrink-0 justify-end sm:justify-start sm:pt-0'>
                    <StatusBadge status={application.status} />
                </div>
            </CardHeader>
            <CardContent className='px-4 pb-3 pt-0'>
                <div className='grid grid-cols-2 gap-x-2 gap-y-1 text-xs'>
                    <div className='flex min-w-0 items-center gap-1'>
                        <Briefcase className='h-3 w-3 shrink-0 text-muted-foreground' />
                        <span className='truncate'>{application.experience[0]?.profile || 'Not specified'}</span>
                    </div>
                    <div className='flex min-w-0 items-center gap-1'>
                        <MapPin className='h-3 w-3 shrink-0 text-muted-foreground' />
                        <span className='truncate'>{application.currentLocation}</span>
                    </div>
                    <div className='flex min-w-0 items-center gap-1'>
                        <GraduationCap className='h-3 w-3 shrink-0 text-muted-foreground' />
                        <span className='truncate'>{application.education[0]?.degree || 'Not specified'}</span>
                    </div>
                    <div className='flex min-w-0 items-center gap-1'>
                        <Clock className='h-3 w-3 shrink-0 text-muted-foreground' />
                        <span className='shrink-0'>{yearsOfExperience.toFixed(1)} years</span>
                    </div>
                </div>
                <div className='mt-2 flex flex-wrap gap-1'>
                    {application.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant='outline' className='text-xs py-0'>
                            {skill}
                        </Badge>
                    ))}
                    {application.skills.length > 3 && (
                        <Badge variant='outline' className='text-xs py-0'>
                            +{application.skills.length - 3}
                        </Badge>
                    )}
                </div>
                <div className='mt-2 text-xs text-muted-foreground'>Applied {formatDate(application.createdAt)}</div>
            </CardContent>
        </Card>
    );
};

const ApplicationDetail = ({
    application,
    applicationsLoadedCount,
    isApplicationsLoading,
    onStatusChange,
}: {
    application: Application | null;
    applicationsLoadedCount: number;
    isApplicationsLoading: boolean;
    onStatusChange: (status: ApplicationStatus) => Promise<void>;
}) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [fetchingResume, setFetchingResume] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [statusLoading, setStatusLoading] = useState<ApplicationStatus | null>(null);
    const [contactPopoverOpen, setContactPopoverOpen] = useState(false);

    if (!application) {
        return (
            <Card className='flex items-center justify-center min-h-[200px]'>
                <CardContent className='py-12'>
                    <p className='text-center text-muted-foreground'>
                        {isApplicationsLoading
                            ? 'Loading applications…'
                            : applicationsLoadedCount === 0
                              ? 'This job has not received any applications yet.'
                              : 'Select an application to see details'}
                    </p>
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

    const handleStatusChange = async (status: ApplicationStatus) => {
        try {
            setStatusLoading(status);
            await onStatusChange(status);
            setShowStatusDialog(false);
        } finally {
            setStatusLoading(null);
        }
    };

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(application.email);
            toast({ title: 'Copied', description: 'Email address copied to clipboard.' });
            setContactPopoverOpen(false);
        } catch {
            toast({ title: 'Copy failed', variant: 'destructive' });
        }
    };

    const handleCopyPhone = async () => {
        if (!application.phone) return;
        try {
            await navigator.clipboard.writeText(application.phone);
            toast({ title: 'Copied', description: 'Phone number copied to clipboard.' });
            setContactPopoverOpen(false);
        } catch {
            toast({ title: 'Copy failed', variant: 'destructive' });
        }
    };

    const handleContactClick = async () => {
        const shareTitle = `Contact ${application.firstName} ${application.lastName}`;
        const shareText = `Email: ${application.email}${application.phone ? `\nPhone: ${application.phone}` : ''}`;

        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                });
                toast({ title: 'Shared', description: 'Contact shared with app.' });
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    toast({
                        title: 'Share failed',
                        description: 'Could not open share. Use options below.',
                        variant: 'destructive',
                    });
                    setContactPopoverOpen(true);
                }
            }
        } else {
            setContactPopoverOpen(true);
        }
    };

    return (
        <Card className='min-w-0 overflow-auto'>
            <CardHeader className='sticky top-0 z-10 border-b bg-card pb-2'>
                <div className='flex min-w-0 flex-wrap items-center justify-between gap-4'>
                    <div className='flex items-center space-x-4 min-w-0'>
                        <Avatar className='w-16 h-16 border flex-shrink-0'>
                            <AvatarFallback className='text-2xl'>{`${application.firstName[0]}${application.lastName[0]}`}</AvatarFallback>
                        </Avatar>
                        <div className='min-w-0'>
                            <CardTitle className='text-2xl'>{`${application.firstName} ${application.lastName}`}</CardTitle>
                            <div className='flex items-center space-x-2 mt-1 flex-wrap'>
                                <StatusBadge status={application.status} />
                                <span className='text-sm text-muted-foreground'>Applied {formatDate(application.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                    <div className='flex items-center flex-shrink-0 gap-2'>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size='sm'
                                        variant='outline'
                                        onClick={handleDownloadResume}
                                        disabled={fetchingResume || !application.resume}
                                    >
                                        <Download className='w-4 h-4 mr-2' />
                                        {fetchingResume ? 'Downloading...' : 'Resume'}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Download candidate&apos;s resume</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Popover open={contactPopoverOpen} onOpenChange={setContactPopoverOpen}>
                            <PopoverAnchor asChild>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    className='inline-flex items-center'
                                    onClick={handleContactClick}
                                >
                                    <Mail className='h-4 w-4 mr-2' />
                                    Contact
                                </Button>
                            </PopoverAnchor>
                            <PopoverContent
                                align='end'
                                sideOffset={8}
                                className='w-64 rounded-xl border bg-popover p-0 shadow-lg'
                            >
                                <div className='p-3'>
                                    <div className='flex items-center gap-2'>
                                        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted'>
                                            <UserIcon className='h-4 w-4 text-muted-foreground' />
                                        </div>
                                        <p className='truncate text-sm font-semibold'>
                                            {application.firstName} {application.lastName}
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                                <div className='p-1'>
                                    <a
                                        href={`mailto:${application.email}`}
                                        className='flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground'
                                        onClick={() => setContactPopoverOpen(false)}
                                    >
                                        <Mail className='h-4 w-4 shrink-0 text-muted-foreground' />
                                        Mail
                                    </a>
                                    <button
                                        type='button'
                                        className='flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground'
                                        onClick={handleCopyEmail}
                                    >
                                        <Copy className='h-4 w-4 shrink-0 text-muted-foreground' />
                                        Copy email
                                    </button>
                                    {application.phone && (
                                        <>
                                            <a
                                                href={`tel:${application.phone}`}
                                                className='flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground'
                                                onClick={() => setContactPopoverOpen(false)}
                                            >
                                                <Phone className='h-4 w-4 shrink-0 text-muted-foreground' />
                                                Call
                                            </a>
                                            <button
                                                type='button'
                                                className='flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground'
                                                onClick={handleCopyPhone}
                                            >
                                                <Copy className='h-4 w-4 shrink-0 text-muted-foreground' />
                                                Copy phone
                                            </button>
                                        </>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                        <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                            <AlertDialogTrigger asChild>
                                <Button
                                    size='sm'
                                    disabled={
                                        statusLoading !== null ||
                                        application.status === ApplicationStatus.SELECTED ||
                                        application.status === ApplicationStatus.REJECTED
                                    }
                                >
                                    {statusLoading !== null ? (
                                        <div className='flex items-center'>
                                            <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2'></div>
                                            Updating...
                                        </div>
                                    ) : (
                                        <>
                                            Change Status
                                            <ChevronDown className='h-4 w-4 ml-2' />
                                        </>
                                    )}
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
                                        onClick={() => handleStatusChange(ApplicationStatus.APPLIED)}
                                        disabled={application.status === ApplicationStatus.APPLIED || statusLoading !== null}
                                    >
                                        {statusLoading === ApplicationStatus.APPLIED ? (
                                            <div className='flex items-center'>
                                                <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2'></div>
                                                Updating...
                                            </div>
                                        ) : (
                                            <>
                                                <Clock className='h-4 w-4 mr-2' />
                                                Mark as Pending
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant='default'
                                        className='bg-green-600 hover:bg-green-700'
                                        onClick={() => handleStatusChange(ApplicationStatus.SELECTED)}
                                        disabled={application.status === ApplicationStatus.SELECTED || statusLoading !== null}
                                    >
                                        {statusLoading === ApplicationStatus.SELECTED ? (
                                            <div className='flex items-center'>
                                                <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2'></div>
                                                Updating...
                                            </div>
                                        ) : (
                                            <>
                                                <CheckCircle className='h-4 w-4 mr-2' />
                                                Select Applicant
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant='default'
                                        className='bg-red-600 hover:bg-red-700'
                                        onClick={() => handleStatusChange(ApplicationStatus.REJECTED)}
                                        disabled={application.status === ApplicationStatus.REJECTED || statusLoading !== null}
                                    >
                                        {statusLoading === ApplicationStatus.REJECTED ? (
                                            <div className='flex items-center'>
                                                <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2'></div>
                                                Updating...
                                            </div>
                                        ) : (
                                            <>
                                                <XCircle className='h-4 w-4 mr-2' />
                                                Reject Applicant
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='p-6'>
                <Tabs value={activeTab} onValueChange={setActiveTab} className='mt-4'>
                    <TabsList>
                        <TabsTrigger value='profile'>Profile</TabsTrigger>
                        <TabsTrigger value='experience'>Experience</TabsTrigger>
                        <TabsTrigger value='education'>Education</TabsTrigger>
                        <TabsTrigger value='coverLetter'>Cover Letter</TabsTrigger>
                    </TabsList>
                    <TabsContent value='profile' className='mt-4'>
                        <div className='grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 text-sm mb-6'>
                            {[
                                { icon: <Phone className='w-4 h-4 text-muted-foreground' />, label: 'Phone', value: application.phone },
                                {
                                    icon: <MapPin className='w-4 h-4 text-muted-foreground' />,
                                    label: 'Location',
                                    value: application.currentLocation,
                                },
                                { icon: <UserIcon className='w-4 h-4 text-muted-foreground' />, label: 'Gender', value: application.gender },
                                { icon: <Building className='w-4 h-4 text-muted-foreground' />, label: 'Source', value: application.source },
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
                        <DetailSection title='Skills' icon={<Lightbulb className='w-5 h-5 text-primary' />}>
                            <div className='flex flex-wrap gap-2'>
                                {application.skills.map((skill, index) => (
                                    <Badge key={index} variant='secondary'>
                                        {skill}
                                    </Badge>
                                ))}
                                {application.skills.length === 0 && <span className='text-sm text-muted-foreground'>No skills listed</span>}
                            </div>
                        </DetailSection>
                        <DetailSection title='Social Links' icon={<Globe className='w-5 h-5 text-primary' />} noSeparator>
                            <div className='grid grid-cols-1 gap-2'>
                                {application.socialLinks && application.socialLinks.length > 0 ? (
                                    application.socialLinks.map((link, index) => (
                                        <a
                                            key={index}
                                            href={link.startsWith('http') ? link : `https://${link}`}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-primary hover:underline flex items-center'
                                        >
                                            <Globe className='w-4 h-4 mr-2' />
                                            {link.replace(/^https?:\/\/(www\.)?/, '')}
                                        </a>
                                    ))
                                ) : (
                                    <p className='text-sm text-muted-foreground'>No social links provided</p>
                                )}
                            </div>
                        </DetailSection>
                    </TabsContent>
                    <TabsContent value='experience' className='mt-4'>
                        {application.experience.length > 0 ? (
                            application.experience.map((exp, index) => (
                                <div key={index} className='mb-6'>
                                    <div className='flex justify-between items-start'>
                                        <div>
                                            <h4 className='font-semibold text-base'>{exp.profile}</h4>
                                            <p className='text-sm'>{exp.company}</p>
                                        </div>
                                        <Badge variant='outline'>
                                            {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                                        </Badge>
                                    </div>
                                    <p className='text-sm text-muted-foreground mt-1'>
                                        {exp.employer && exp.employer !== exp.company ? `${exp.employer} • ` : ''}
                                        {exp.yoe} years
                                    </p>
                                    {index < application.experience.length - 1 && <Separator className='my-4' />}
                                </div>
                            ))
                        ) : (
                            <div className='flex flex-col items-center justify-center py-8'>
                                <AlertCircle className='w-12 h-12 text-muted-foreground mb-4' />
                                <p className='text-muted-foreground'>No experience information available</p>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value='education' className='mt-4'>
                        {application.education.length > 0 ? (
                            application.education.map((edu, index) => (
                                <div key={index} className='mb-6'>
                                    <div className='flex justify-between items-start'>
                                        <div>
                                            <h4 className='font-semibold text-base'>{`${edu.degree} (${edu.degreeType})`}</h4>
                                            <p className='text-sm'>{edu.college}</p>
                                        </div>
                                    </div>
                                    <div className='flex items-center mt-1'>
                                        <Badge variant='secondary' className='mr-2'>
                                            SGPA: {typeof edu.sgpa === 'number' ? edu.sgpa.toFixed(1) : edu.sgpa}
                                        </Badge>
                                    </div>
                                    {index < application.education.length - 1 && <Separator className='my-4' />}
                                </div>
                            ))
                        ) : (
                            <div className='flex flex-col items-center justify-center py-8'>
                                <AlertCircle className='w-12 h-12 text-muted-foreground mb-4' />
                                <p className='text-muted-foreground'>No education information available</p>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value='coverLetter' className='mt-4'>
                        <div className='bg-muted/30 p-4 rounded-md'>
                            {application.coverLetter ? (
                                <p className='text-sm whitespace-pre-line'>{application.coverLetter}</p>
                            ) : (
                                <p className='text-sm text-muted-foreground italic'>No cover letter provided</p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default function JobApplicationsPage({ params }: { params: { id: string } }) {
    const { id } = params;

    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const loadingRef = useRef(false);
    const lastIdRef = useRef<string | null>(null);
    const hasMoreRef = useRef(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const [filterDraft, setFilterDraft] = useState<JobApplicationsFilters>(DEFAULT_JOB_APP_FILTERS);
    const [filterApplied, setFilterApplied] = useState<JobApplicationsFilters>(DEFAULT_JOB_APP_FILTERS);

    const fetchApplications = useCallback(
        async (replace: boolean) => {
            if (!id) return;
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
                const url = `/api/job-applications?jobId=${encodeURIComponent(id)}&limit=${APPLICATIONS_PAGE_SIZE}${cursor ? `&lastId=${encodeURIComponent(cursor)}` : ''}`;
                const response = (await ky.get(url).json()) as any[];
                if (!Array.isArray(response)) {
                    throw new Error('Invalid response format');
                }
                const fetched = response.map(applicationFromApi);
                setApplications((prev) => (replace ? fetched : [...prev, ...fetched]));
                const nextLast = fetched.length ? fetched[fetched.length - 1].id : null;
                lastIdRef.current = nextLast;
                const more = fetched.length === APPLICATIONS_PAGE_SIZE;
                setHasMore(more);
                hasMoreRef.current = more;
                if (fetched.length > 0) {
                    setSelectedApplication((prev) => prev ?? fetched[0]);
                }
            } catch (err) {
                console.error('Error fetching applications:', err);
                setError('Failed to load applications');
            } finally {
                setLoading(false);
                loadingRef.current = false;
            }
        },
        [id]
    );

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        void (async () => {
            setError(null);
            try {
                await ky.get(`/api/post?id=${id}`);
                if (!cancelled) {
                    await fetchApplications(true);
                }
            } catch {
                if (!cancelled) {
                    setError('Failed to load job details');
                    setLoading(false);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id, fetchApplications]);

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

    const applyFilters = useCallback(() => {
        setFilterApplied({ ...filterDraft });
        void fetchApplications(true);
    }, [filterDraft, fetchApplications]);

    const refreshList = useCallback(async () => {
        if (!id) return;
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
                const url = `/api/job-applications?jobId=${encodeURIComponent(id)}&limit=${APPLICATIONS_PAGE_SIZE}${cursor ? `&lastId=${encodeURIComponent(cursor)}` : ''}`;
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
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError('Failed to load applications');
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [id, filterApplied]);

    const clearFiltersAndRefetch = useCallback(() => {
        setFilterDraft(DEFAULT_JOB_APP_FILTERS);
        setFilterApplied(DEFAULT_JOB_APP_FILTERS);
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

    useEffect(() => {
        if (filteredApplications.length > 0 &&
            (!selectedApplication || !filteredApplications.some((app) => app.id === selectedApplication.id))) {
            setSelectedApplication(filteredApplications[0]);
        } else if (filteredApplications.length === 0) {
            setSelectedApplication(null);
        }
    }, [filteredApplications, selectedApplication]);

    const handleStatusChange = async (status: ApplicationStatus) => {
        if (!selectedApplication) return;

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
        }
    };

    if (!id) {
        return (
            <NavbarLayout>
                <div className='container mx-auto px-4 py-6'>
                    <Alert variant='destructive'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>No job ID provided</AlertDescription>
                    </Alert>
                    <Button className='mt-4' asChild>
                        <Link href='/posts'>
                            <ArrowLeft className='h-4 w-4 mr-2' />
                            Go back to Jobs
                        </Link>
                    </Button>
                </div>
            </NavbarLayout>
        );
    }

    return (
        <NavbarLayout>
            <div className='container mx-auto px-4 py-6'>
                <div className='mb-6'>
                    <Button variant='ghost' asChild className='mb-2 -ml-2'>
                        <Link href='/posts'>
                            <ArrowLeft className='h-4 w-4 mr-2' />
                            Back to Jobs
                        </Link>
                    </Button>
                    <div>
                        <h1 className='text-2xl font-bold'>Applications</h1>
                        <p className='text-muted-foreground'>
                            {loading && applications.length === 0
                                ? 'Loading applications…'
                                : `${filteredApplications.length} ${filteredApplications.length === 1 ? 'application' : 'applications'} found`}
                        </p>
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

                <div className='flex min-w-0 flex-col space-y-6'>
                    {error && (
                        <Alert variant='destructive' className='mb-4'>
                            <AlertCircle className='h-4 w-4' />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {loading && applications.length === 0 ? (
                        <div className='grid min-w-0 grid-cols-1 gap-6 items-start lg:grid-cols-3'>
                            <div className='min-w-0 space-y-3 lg:col-span-1'>
                                <Skeleton className='h-12 w-full rounded-md' />
                                <Skeleton className='h-32 w-full rounded-md' />
                                <Skeleton className='h-32 w-full rounded-md' />
                                <Skeleton className='h-32 w-full rounded-md' />
                            </div>
                            <div className='min-w-0 space-y-4 lg:col-span-2'>
                                <Skeleton className='h-24 w-full rounded-md' />
                                <Skeleton className='h-64 w-full rounded-md' />
                            </div>
                        </div>
                    ) : (
                        <div className='grid min-w-0 grid-cols-1 gap-6 items-start lg:grid-cols-3'>
                            <div className='flex min-h-0 min-w-0 flex-col overflow-hidden lg:col-span-1 h-[calc(100vh-220px)]'>
                                <Card className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'>
                                    <CardHeader className='border-b px-4 py-3'>
                                        <div className='flex min-w-0 items-center justify-between gap-2'>
                                            <CardTitle className='min-w-0 truncate text-base'>
                                                {filterApplied.statusFilter !== 'all'
                                                    ? `${filterApplied.statusFilter} (${filteredApplications.length})`
                                                    : `All Applications (${filteredApplications.length})`}
                                            </CardTitle>
                                            {!loading && applications.length > 0 && (
                                                <Badge variant='outline' className='shrink-0 whitespace-nowrap'>
                                                    {filteredApplications.length} of {applications.length}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <div ref={scrollRef} className='min-h-0 min-w-0 flex-1 overflow-auto p-3'>
                                        {filteredApplications.length === 0 ? (
                                            <Card className='border-0 shadow-none'>
                                                <CardContent className='flex flex-col items-center justify-center py-10'>
                                                    <UserIcon className='w-16 h-16 text-muted-foreground mb-4 opacity-40' />
                                                    <h2 className='text-lg font-semibold text-center'>
                                                        {filterApplied.searchQuery || filterApplied.statusFilter !== 'all' || filterApplied.stageFilter !== 'all'
                                                            ? 'No applications match your filters'
                                                            : 'No applications yet'}
                                                    </h2>
                                                    <p className='text-sm text-muted-foreground text-center mt-2'>
                                                        {filterApplied.searchQuery || filterApplied.statusFilter !== 'all' || filterApplied.stageFilter !== 'all'
                                                            ? 'Try adjusting your filters or search criteria.'
                                                            : 'Applications will appear here when candidates apply.'}
                                                    </p>
                                                    {(filterApplied.searchQuery || filterApplied.statusFilter !== 'all' || filterApplied.stageFilter !== 'all') && (
                                                        <Button variant='outline' className='mt-4' onClick={clearFiltersAndRefetch}>
                                                            Clear Filters
                                                        </Button>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            <>
                                                <div className='min-w-0 space-y-3 pr-1'>
                                                    {filteredApplications.map((application) => (
                                                        <ApplicationCard
                                                            key={application.id}
                                                            application={application}
                                                            isSelected={selectedApplication?.id === application.id}
                                                            onClick={() => setSelectedApplication(application)}
                                                        />
                                                    ))}
                                                </div>
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
                            <div className='lg:col-span-2 min-w-0'>
                                <TooltipProvider>
                                    <ApplicationDetail
                                        application={selectedApplication}
                                        applicationsLoadedCount={applications.length}
                                        isApplicationsLoading={loading}
                                        onStatusChange={handleStatusChange}
                                    />
                                </TooltipProvider>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </NavbarLayout>
    );
}
