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
    Users,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Progress } from '@/components/ui/progress';

import { Application, ApplicationStatus } from '@/model/application';
import { Job } from '@/model/job';
import { getResume } from '@/appwrite/server/storage';

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

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
                    <StatusBadge status={application.status} />
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

                <div className='mt-3 text-xs text-muted-foreground pt-2 border-t'>Applied: {formatDate(application.createdAt)}</div>
            </CardContent>
        </Card>
    );
};

const ApplicationDetail = ({
    application,
    onStatusChange,
}: {
    application: Application | null;
    onStatusChange: (status: ApplicationStatus) => Promise<void>;
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

                            <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
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
                                                await onStatusChange(ApplicationStatus.APPLIED);
                                                setShowStatusDialog(false);
                                            }}
                                        >
                                            <Clock className='h-4 w-4 mr-2' />
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
                                                await onStatusChange(ApplicationStatus.SELECTED);
                                                setShowStatusDialog(false);
                                            }}
                                        >
                                            <CheckCircle className='h-4 w-4 mr-2' />
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
                                                await onStatusChange(ApplicationStatus.REJECTED);
                                                setShowStatusDialog(false);
                                            }}
                                        >
                                            <XCircle className='h-4 w-4 mr-2' />
                                            Reject Applicant
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

                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className='mb-4'>
                            <TabsTrigger value='profile'>Profile</TabsTrigger>
                            <TabsTrigger value='experience'>Experience</TabsTrigger>
                            <TabsTrigger value='education'>Education</TabsTrigger>
                            <TabsTrigger value='coverLetter'>Cover Letter</TabsTrigger>
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
                                        <Globe className='h-4 w-4 text-primary mr-2' />
                                        Social Links
                                    </h3>
                                    <div className='space-y-1'>
                                        {application.socialLinks && application.socialLinks.length > 0 ? (
                                            application.socialLinks.map((link, index) => (
                                                <a
                                                    key={index}
                                                    href={link.startsWith('http') ? link : `https://${link}`}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='block text-primary hover:underline text-sm'
                                                >
                                                    {link}
                                                </a>
                                            ))
                                        ) : (
                                            <span className='text-sm text-muted-foreground'>No social links provided</span>
                                        )}
                                    </div>
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

                        <TabsContent value='coverLetter'>
                            <Card className='bg-muted/30'>
                                <CardContent className='p-4'>
                                    {application.coverLetter ? (
                                        <div className='whitespace-pre-line'>
                                            <p className='text-sm'>{application.coverLetter}</p>
                                        </div>
                                    ) : (
                                        <div className='text-center py-8'>
                                            <FileText className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                                            <p className='text-muted-foreground'>No cover letter provided</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

const JobSummary = ({ job }: { job: Job | null }) => {
    if (!job) return null;

    const daysRemaining = getDaysRemaining(job.lastDateToApply);
    const isActive = daysRemaining > 0;

    return (
        <Card>
            <CardHeader className='pb-2'>
                <CardTitle className='text-lg flex items-center'>
                    <Briefcase className='h-5 w-5 mr-2 text-primary' />
                    Job Details
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='flex justify-between items-start'>
                    <div>
                        <h3 className='font-medium'>{job.profile}</h3>
                        <p className='text-sm'>{job.company}</p>
                    </div>
                    <Badge variant={isActive ? 'default' : 'outline'}>{isActive ? 'Active' : 'Expired'}</Badge>
                </div>

                <div className='flex flex-wrap gap-2'>
                    <Badge variant='secondary'>{job.type}</Badge>
                    <Badge variant='secondary'>{job.workplaceType}</Badge>
                </div>

                <Separator />

                <div className='grid grid-cols-2 gap-2 text-sm'>
                    <div>
                        <span className='text-muted-foreground'>Location:</span>
                        <div className='font-medium mt-1'>{job.location}</div>
                    </div>
                    <div>
                        <span className='text-muted-foreground'>Deadline:</span>
                        <div className='font-medium mt-1'>{formatDate(job.lastDateToApply)}</div>
                    </div>
                </div>

                <Separator />

                <div>
                    <h3 className='text-sm text-muted-foreground mb-2'>Required Skills:</h3>
                    <div className='flex flex-wrap gap-2'>
                        {job.skills.map((skill, index) => (
                            <Badge key={index} variant='outline'>
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter className='bg-muted/30 pt-3 pb-3'>
                <Button variant='outline' className='w-full' asChild>
                    <Link href={`/admin/posts/${job.id}`}>View Full Job Details</Link>
                </Button>
            </CardFooter>
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
}) => {
    return (
        <div className='flex flex-col md:flex-row gap-4 mb-4'>
            <div className='relative flex-1'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input placeholder='Search applicants...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='pl-9' />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='w-full md:w-40'>
                    <div className='flex items-center'>
                        <Filter className='h-4 w-4 mr-2' />
                        <SelectValue placeholder='Status' />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value='all'>All Statuses</SelectItem>
                    <SelectItem value={ApplicationStatus.APPLIED}>Pending</SelectItem>
                    <SelectItem value={ApplicationStatus.SELECTED}>Selected</SelectItem>
                    <SelectItem value={ApplicationStatus.REJECTED}>Rejected</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};

const ApplicationStats = ({ applications }: { applications: Application[] }) => {
    const pendingCount = applications.filter((app) => app.status === ApplicationStatus.APPLIED).length;
    const selectedCount = applications.filter((app) => app.status === ApplicationStatus.SELECTED).length;
    const rejectedCount = applications.filter((app) => app.status === ApplicationStatus.REJECTED).length;

    return (
        <Card className='mb-4'>
            <CardContent className='py-4'>
                <div className='grid grid-cols-3 gap-4'>
                    <div className='flex flex-col items-center'>
                        <div className='text-2xl font-bold'>{pendingCount}</div>
                        <div className='text-xs text-muted-foreground'>Pending</div>
                    </div>
                    <div className='flex flex-col items-center'>
                        <div className='text-2xl font-bold text-green-600'>{selectedCount}</div>
                        <div className='text-xs text-muted-foreground'>Selected</div>
                    </div>
                    <div className='flex flex-col items-center'>
                        <div className='text-2xl font-bold text-red-600'>{rejectedCount}</div>
                        <div className='text-xs text-muted-foreground'>Rejected</div>
                    </div>
                </div>

                <Separator className='my-4' />

                <div className='space-y-3'>
                    <div>
                        <div className='flex justify-between text-sm mb-1'>
                            <span>Pending</span>
                            <span>{Math.round((pendingCount / applications.length) * 100)}%</span>
                        </div>
                        <Progress value={(pendingCount / applications.length) * 100} className='h-2 bg-muted' />
                    </div>

                    <div>
                        <div className='flex justify-between text-sm mb-1'>
                            <span>Selected</span>
                            <span>{Math.round((selectedCount / applications.length) * 100)}%</span>
                        </div>
                        <Progress value={(selectedCount / applications.length) * 100} className='h-2 bg-green-100' />
                    </div>

                    <div>
                        <div className='flex justify-between text-sm mb-1'>
                            <span>Rejected</span>
                            <span>{Math.round((rejectedCount / applications.length) * 100)}%</span>
                        </div>
                        <Progress value={(rejectedCount / applications.length) * 100} className='h-2 bg-red-100' />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const lastDate = new Date(deadline);
    const diffTime = lastDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

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

    const [job, setJob] = useState<Job | null>(null);
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
            const response = (await ky.get(`/api/post?id=${id}`).json()) as Job;
            setJob(
                new Job(
                    response.id,
                    response.profile,
                    response.description,
                    response.company,
                    response.type,
                    response.workplaceType,
                    response.lastDateToApply,
                    response.location,
                    response.skills,
                    response.rejectionContent,
                    response.selectionContent,
                    response.createdAt,
                    response.state,
                    response.createdBy,
                    response.applications
                )
            );

            fetchApplications();
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
                        <Link href='/admin/posts'>
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
                <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center gap-4'>
                        <Button variant='ghost' asChild className='mr-4'>
                            <Link href='/admin/posts'>
                                <ArrowLeft className='h-4 w-4 mr-2' />
                                Back to Jobs
                            </Link>
                        </Button>
                        <h1 className='text-2xl font-bold'>
                            {loading ? 'Loading...' : job ? `Applications for ${job.profile}` : 'Job Applications'}
                        </h1>
                    </div>
                    <div>
                        <span className='text-muted-foreground'>
                            {applications.length} {applications.length === 1 ? 'application' : 'applications'} received
                        </span>
                    </div>
                </div>

                {error ? (
                    <Alert variant='destructive' className='mb-6'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : loading ? (
                    <div className='space-y-4'>
                        <Skeleton className='h-12 w-64' />
                        <Skeleton className='h-48 w-full' />
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                            <div className='space-y-4'>
                                <Skeleton className='h-32 w-full' />
                                <Skeleton className='h-64 w-full' />
                            </div>
                            <div className='md:col-span-2'>
                                <Skeleton className='h-96 w-full' />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <div className='space-y-4'>
                            <JobSummary job={job} />

                            {applications.length > 0 && <ApplicationStats applications={applications} />}

                            <div className='space-y-4'>
                                <FilterBar
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    statusFilter={statusFilter}
                                    setStatusFilter={setStatusFilter}
                                />

                                {filteredApplications.length === 0 ? (
                                    <Card className='py-10'>
                                        <CardContent className='flex flex-col items-center justify-center text-center'>
                                            <Users className='h-12 w-12 text-muted-foreground mb-4' />
                                            <h2 className='text-xl font-semibold mb-2'>No Applications Found</h2>
                                            <p className='text-muted-foreground mb-6 max-w-sm'>
                                                {debouncedSearchQuery || statusFilter !== 'all'
                                                    ? 'No applications match your current filters.'
                                                    : "This job hasn't received any applications yet."}
                                            </p>

                                            {(debouncedSearchQuery || statusFilter !== 'all') && (
                                                <Button
                                                    variant='outline'
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
                                    <div className='space-y-3 max-h-[600px] overflow-y-auto pr-2'>
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
                        </div>

                        <div className='md:col-span-2'>
                            <ApplicationDetail application={selectedApplication} onStatusChange={handleStatusChange} />
                        </div>
                    </div>
                )}
            </div>
            <ApplicationDetail application={selectedApplication} onStatusChange={handleStatusChange} />
        </NavbarLayout>
    );
}
