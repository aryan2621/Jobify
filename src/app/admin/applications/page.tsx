'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
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
    SortAsc,
    SortDesc,
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
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
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

// Models
import { Application, ApplicationStatus } from '@/model/application';
import { Job } from '@/model/job';
import { getResume } from '@/appwrite/server/storage';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Format date to be more user-friendly
const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// Status Badge component
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

// Application List Item
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
                        <StatusBadge status={application.status} />
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

// Filter Bar Component
const FilterBar = ({
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortOption,
    setSortOption,
    resetFilters,
}: {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    sortOption: string;
    setSortOption: (option: string) => void;
    resetFilters: () => void;
}) => {
    return (
        <Card className='mb-4'>
            <CardContent className='p-4'>
                <div className='space-y-4'>
                    <div className='relative'>
                        <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder='Search by name, email, or skills...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='pl-9'
                        />
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <div className='flex items-center'>
                                    <Filter className='h-4 w-4 mr-2' />
                                    <SelectValue placeholder='Filter by Status' />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>All Statuses</SelectItem>
                                <SelectItem value={ApplicationStatus.APPLIED}>Pending</SelectItem>
                                <SelectItem value={ApplicationStatus.SELECTED}>Selected</SelectItem>
                                <SelectItem value={ApplicationStatus.REJECTED}>Rejected</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={sortOption} onValueChange={setSortOption}>
                            <SelectTrigger>
                                <div className='flex items-center'>
                                    <SortAsc className='h-4 w-4 mr-2' />
                                    <SelectValue placeholder='Sort By' />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='newest'>Newest First</SelectItem>
                                <SelectItem value='oldest'>Oldest First</SelectItem>
                                <SelectItem value='nameAsc'>Name (A-Z)</SelectItem>
                                <SelectItem value='nameDesc'>Name (Z-A)</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant='outline' className='w-full' onClick={resetFilters}>
                            <RefreshCw className='h-4 w-4 mr-2' />
                            Reset Filters
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Application Detail Component
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
            const file = await getResume(application.resume);
            const blob = new Blob([file], { type: 'application/octet-binary;charset=utf-8' });
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
                                    <StatusBadge status={application.status} />
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
                                        // Prevent closing the dialog while status change is in progress
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
                                                    // Error is already handled in the parent component
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
                                                    // Error is already handled in the parent component
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
                                                    // Error is already handled in the parent component
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
                                                <Link href={`/admin/posts/${jobDetails.id}`}>View Full Job Details</Link>
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

// Helper function to calculate days remaining
const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const lastDate = new Date(deadline);
    const diffTime = lastDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
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
}

export default function AdminApplicationsPage() {
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [jobs, setJobs] = useState<Map<string, Job>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusChangeLoading, setStatusChangeLoading] = useState(false);

    // Filters state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOption, setSortOption] = useState('newest');

    // Debounced search query
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Fetch applications
    const fetchApplications = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = (await ky.get('/api/admin/applications').json()) as any[];

            if (!Array.isArray(res)) {
                throw new Error('Invalid response format');
            }

            const fetchedApplications = res.map(
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

            // If there are applications, fetch the related jobs
            if (fetchedApplications.length > 0) {
                const jobIds = [...new Set(fetchedApplications.map((app) => app.jobId))];
                fetchJobsData(jobIds);
            }

            if (fetchedApplications.length > 0 && !selectedApplication) {
                setSelectedApplication(fetchedApplications[0]);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError('Failed to load applications. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [selectedApplication]);

    // Fetch job details for applications
    const fetchJobsData = async (jobIds: string[]) => {
        try {
            const jobsMap = new Map<string, Job>();

            // Fetch each job in parallel
            await Promise.all(
                jobIds.map(async (jobId) => {
                    try {
                        const jobData = (await ky.get(`/api/post?id=${jobId}`).json()) as Job;
                        jobsMap.set(
                            jobId,
                            new Job(
                                jobData.id,
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
                                jobData.applications
                            )
                        );
                    } catch (error) {
                        console.error(`Error fetching job ${jobId}:`, error);
                    }
                })
            );

            setJobs(jobsMap);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    // Handle status change
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

            // Update local state
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

    // Reset filters
    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setSortOption('newest');
    };

    // Filtered and sorted applications
    const filteredApplications = useMemo(() => {
        let filtered = [...applications];

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter((app) => app.status === statusFilter);
        }

        // Apply search filter
        if (debouncedSearchQuery) {
            const query = debouncedSearchQuery.toLowerCase();
            filtered = filtered.filter(
                (app) =>
                    app.firstName.toLowerCase().includes(query) ||
                    app.lastName.toLowerCase().includes(query) ||
                    app.email.toLowerCase().includes(query) ||
                    app.skills.some((skill) => skill.toLowerCase().includes(query)) ||
                    (app.experience &&
                        app.experience.some((exp) => exp.profile.toLowerCase().includes(query) || exp.company.toLowerCase().includes(query)))
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortOption) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'nameAsc':
                    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
                case 'nameDesc':
                    return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [applications, statusFilter, debouncedSearchQuery, sortOption]);

    // Get the job details for the selected application
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
                            {filteredApplications.length} {filteredApplications.length === 1 ? 'application' : 'applications'} found
                        </p>
                    </div>

                    <Button variant='ghost' asChild className='mt-2 md:mt-0'>
                        <Link href='/admin/posts'>
                            <ArrowLeft className='h-4 w-4 mr-2' />
                            Back to Jobs
                        </Link>
                    </Button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='md:col-span-1'>
                        <FilterBar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            sortOption={sortOption}
                            setSortOption={setSortOption}
                            resetFilters={resetFilters}
                        />

                        {error && (
                            <Alert variant='destructive' className='mb-4'>
                                <AlertCircle className='h-4 w-4' />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className='h-[calc(100vh-300px)] overflow-auto space-y-2'>
                            {loading ? (
                                // Loading skeleton
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
                                // Empty state
                                <Card className='py-10'>
                                    <CardContent className='flex flex-col items-center justify-center text-center'>
                                        <Inbox className='h-12 w-12 text-muted-foreground mb-4' />
                                        <h2 className='text-xl font-semibold mb-2'>No Applications Found</h2>
                                        <p className='text-muted-foreground mb-6 max-w-sm'>
                                            {debouncedSearchQuery || statusFilter !== 'all'
                                                ? 'No applications match your current filters.'
                                                : 'There are no applications in the system yet.'}
                                        </p>

                                        {(debouncedSearchQuery || statusFilter !== 'all') && (
                                            <Button variant='outline' onClick={resetFilters}>
                                                <RefreshCw className='h-4 w-4 mr-2' />
                                                Reset Filters
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                // Application list
                                filteredApplications.map((application) => (
                                    <ApplicationCard
                                        key={application.id}
                                        application={application}
                                        isSelected={selectedApplication?.id === application.id}
                                        onClick={() => setSelectedApplication(application)}
                                        statusChangeLoading={statusChangeLoading}
                                        isChangingStatus={selectedApplication?.id === application.id}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    <div className='md:col-span-2'>
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
