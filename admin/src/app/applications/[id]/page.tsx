'use client';

import { useCallback, useEffect, useState } from 'react';
import ky from 'ky';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import NavbarLayout from '@/layouts/navbar';
import {
    User as UserIcon,
    Briefcase,
    MapPin,
    Search,
    Filter,
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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';

import { Application, ApplicationStatus } from '@/model/application';

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

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
        <Badge variant={variant} className='flex items-center'>
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
            className={`mb-3 cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-2 border-primary shadow-md' : ''}`}
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
            <CardHeader className='flex flex-row items-center justify-between py-3 px-4'>
                <div className='flex items-center space-x-3'>
                    <Avatar className='border'>
                        <AvatarFallback>{`${application.firstName[0]}${application.lastName[0]}`}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className='text-base'>{`${application.firstName} ${application.lastName}`}</CardTitle>
                        <p className='text-xs text-muted-foreground'>{application.email}</p>
                    </div>
                </div>
                <StatusBadge status={application.status} />
            </CardHeader>
            <CardContent className='pt-0 pb-3 px-4'>
                <div className='grid grid-cols-2 gap-1 text-xs'>
                    <div className='flex items-center space-x-1'>
                        <Briefcase className='w-3 h-3 text-muted-foreground' />
                        <span>{application.experience[0]?.profile || 'Not specified'}</span>
                    </div>
                    <div className='flex items-center space-x-1'>
                        <MapPin className='w-3 h-3 text-muted-foreground' />
                        <span>{application.currentLocation}</span>
                    </div>
                    <div className='flex items-center space-x-1'>
                        <GraduationCap className='w-3 h-3 text-muted-foreground' />
                        <span>{application.education[0]?.degree || 'Not specified'}</span>
                    </div>
                    <div className='flex items-center space-x-1'>
                        <Clock className='w-3 h-3 text-muted-foreground' />
                        <span>{yearsOfExperience.toFixed(1)} years</span>
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
        <Card className='overflow-auto'>
            <CardHeader className='sticky top-0 z-10 bg-card pb-2 border-b'>
                <div className='flex items-center justify-between gap-4 flex-wrap'>
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

const FilterBar = ({
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
}: {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
}) => (
    <div className='flex flex-col sm:flex-row gap-2 sm:space-x-2'>
        <div className='relative w-full sm:w-64'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
                placeholder='Search applicants...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-8'
            />
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='outline' className='flex-shrink-0'>
                    <Filter className='w-4 h-4 mr-2' />
                    Filter
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Statuses</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(ApplicationStatus.APPLIED)}>
                    <Clock className='w-4 h-4 mr-2' />
                    Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(ApplicationStatus.SELECTED)}>
                    <CheckCircle className='w-4 h-4 mr-2' />
                    Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(ApplicationStatus.REJECTED)}>
                    <XCircle className='w-4 h-4 mr-2' />
                    Rejected
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
);

const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default function JobApplicationsPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const router = useRouter();

    const [applications, setApplications] = useState<Application[]>([]);
    const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const fetchJob = useCallback(async () => {
        try {
            await ky.get(`/api/post?id=${id}`);
            await fetchApplications();
        } catch (error) {
            console.error('Error fetching job:', error);
            setError('Failed to load job details');
            setLoading(false);
        }
    }, [id]);

    const fetchApplications = async () => {
        try {
            const response = (await ky.get(`/api/job-applications?jobId=${id}`).json()) as any[];

            if (!Array.isArray(response)) {
                throw new Error('Invalid response format');
            }

            const fetchedApplications = response.map(
                (app) =>
                    new Application(
                        app.id,
                        app.firstName,
                        app.lastName,
                        app.email,
                        app.phone,
                        app.currentLocation,
                        app.gender,
                        JSON.parse(app.education),
                        JSON.parse(app.experience),
                        JSON.parse(app.skills),
                        app.source,
                        app.resume,
                        JSON.parse(app.socialLinks),
                        app.coverLetter,
                        app.status,
                        app.jobId,
                        app.createdAt,
                        app.createdBy
                    )
            );

            setApplications(fetchedApplications);

            if (fetchedApplications.length > 0 && !selectedApplication) {
                setSelectedApplication(fetchedApplications[0]);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = [...applications];

        if (statusFilter !== 'all') {
            filtered = filtered.filter((app) => app.status === statusFilter);
        }

        if (debouncedSearchQuery) {
            const query = debouncedSearchQuery.toLowerCase();
            filtered = filtered.filter(
                (app) =>
                    app.firstName.toLowerCase().includes(query) ||
                    app.lastName.toLowerCase().includes(query) ||
                    app.email.toLowerCase().includes(query) ||
                    app.skills.some((skill) => skill.toLowerCase().includes(query))
            );
        }

        setFilteredApplications(filtered);
    }, [applications, statusFilter, debouncedSearchQuery]);

    useEffect(() => {
        if (id) {
            fetchJob();
        }
    }, [id, fetchJob]);

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
            <div className='px-4 sm:px-6 py-6'>
                <div className='flex flex-col space-y-6'>
                    <div className='flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0'>
                        <div>
                            <Button variant='ghost' asChild className='mb-2'>
                                <Link href='/posts'>
                                    <ArrowLeft className='h-4 w-4 mr-2' />
                                    Back to Jobs
                                </Link>
                            </Button>
                            <h1 className='text-2xl font-bold'>Applications</h1>
                            <p className='text-muted-foreground'>
                                {loading
                                    ? 'Loading applications…'
                                    : 'Manage and review applications for this job'}
                            </p>
                        </div>
                        <FilterBar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                        />
                    </div>

                    {(statusFilter !== 'all' || searchQuery) && (
                        <div className='flex flex-wrap items-center gap-2 text-sm'>
                            <span className='text-muted-foreground'>Active filters:</span>
                            {statusFilter !== 'all' && (
                                <Badge variant='secondary' className='flex items-center'>
                                    Status: {statusFilter}
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='h-4 w-4 ml-1'
                                        onClick={() => setStatusFilter('all')}
                                    >
                                        <XCircle className='h-3 w-3' />
                                    </Button>
                                </Badge>
                            )}
                            {searchQuery && (
                                <Badge variant='secondary' className='flex items-center'>
                                    Search: {searchQuery}
                                    <Button variant='ghost' size='icon' className='h-4 w-4 ml-1' onClick={() => setSearchQuery('')}>
                                        <XCircle className='h-3 w-3' />
                                    </Button>
                                </Badge>
                            )}
                            <Button
                                variant='ghost'
                                size='sm'
                                className='text-xs'
                                onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('all');
                                }}
                            >
                                Clear all
                            </Button>
                        </div>
                    )}

                    {error && (
                        <Alert variant='destructive' className='mb-4'>
                            <AlertCircle className='h-4 w-4' />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {loading ? (
                        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'>
                            <div className='lg:col-span-1 space-y-3'>
                                <Skeleton className='h-12 w-full rounded-md' />
                                <Skeleton className='h-32 w-full rounded-md' />
                                <Skeleton className='h-32 w-full rounded-md' />
                                <Skeleton className='h-32 w-full rounded-md' />
                            </div>
                            <div className='lg:col-span-2 space-y-4'>
                                <Skeleton className='h-24 w-full rounded-md' />
                                <Skeleton className='h-64 w-full rounded-md' />
                            </div>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'>
                            <div className='lg:col-span-1 h-[calc(100vh-220px)] overflow-hidden flex flex-col'>
                                <Card className='flex-1 overflow-hidden'>
                                    <CardHeader className='py-3 px-4 border-b'>
                                        <div className='flex items-center justify-between'>
                                            <CardTitle className='text-base'>
                                                {loading
                                                    ? statusFilter !== 'all'
                                                        ? `${statusFilter}`
                                                        : 'All Applications'
                                                    : statusFilter !== 'all'
                                                      ? `${statusFilter} (${filteredApplications.length})`
                                                      : `All Applications (${filteredApplications.length})`}
                                            </CardTitle>
                                            {!loading && applications.length > 0 && (
                                                <Badge variant='outline'>
                                                    {filteredApplications.length} of {applications.length}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <div className='h-[calc(100%-57px)] overflow-auto p-3'>
                                        {filteredApplications.length === 0 ? (
                                            <Card className='border-0 shadow-none'>
                                                <CardContent className='flex flex-col items-center justify-center py-10'>
                                                    <UserIcon className='w-16 h-16 text-muted-foreground mb-4 opacity-40' />
                                                    <h2 className='text-lg font-semibold text-center'>
                                                        {searchQuery || statusFilter !== 'all'
                                                            ? 'No applications match your filters'
                                                            : 'No applications yet'}
                                                    </h2>
                                                    <p className='text-sm text-muted-foreground text-center mt-2'>
                                                        {searchQuery || statusFilter !== 'all'
                                                            ? 'Try adjusting your filters or search criteria.'
                                                            : 'Applications will appear here when candidates apply.'}
                                                    </p>
                                                    {(searchQuery || statusFilter !== 'all') && (
                                                        <Button
                                                            variant='outline'
                                                            className='mt-4'
                                                            onClick={() => {
                                                                setSearchQuery('');
                                                                setStatusFilter('all');
                                                            }}
                                                        >
                                                            Clear Filters
                                                        </Button>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            <div className='space-y-3 pr-2'>
                                                {filteredApplications.map((application) => (
                                                    <ApplicationCard
                                                        key={application.id}
                                                        application={application}
                                                        isSelected={selectedApplication?.id === application.id}
                                                        onClick={() => setSelectedApplication(application)}
                                                    />
                                                ))}
                                            </div>
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
