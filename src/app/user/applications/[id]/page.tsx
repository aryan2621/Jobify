'use client';

import { useCallback, useEffect, useState } from 'react';
import ky from 'ky';
import Link from 'next/link';

import NavbarLayout from '@/layouts/navbar';
import {
    User as UserIcon,
    MapPin,
    CheckCircle,
    Download,
    ArrowLeft,
    FileText,
    Inbox,
    Lightbulb,
    AlertCircle,
    Mail,
    Link as LinkIcon,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

import { Application, ApplicationStatus } from '@/model/application';
import { Job } from '@/model/job';
import { downloadResume, formatDate } from '@/app/user/_lib/utils';
import { ApplicationTimeline, JobDetails, StatusBadge } from '@/app/user/_lib/components';

export default function UserApplicationDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;

    const [application, setApplication] = useState<Application | null>(null);
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('details');
    const [fetchingResume, setFetchingResume] = useState(false);

    const fetchApplication = useCallback(async () => {
        try {
            setLoading(true);
            const response = (await ky.get(`/api/application?id=${id}`).json()) as any;
            const app = new Application(
                response.id,
                response.firstName,
                response.lastName,
                response.email,
                response.phone,
                response.currentLocation,
                response.gender,
                JSON.parse(response.education),
                JSON.parse(response.experience),
                JSON.parse(response.skills),
                response.source,
                response.resume,
                JSON.parse(response.socialLinks),
                response.coverLetter,
                response.status,
                response.jobId,
                response.createdAt,
                response.createdBy
            );

            setApplication(app);

            // Fetch the related job
            fetchJob(response.jobId);
        } catch (error) {
            console.error('Error fetching application:', error);
            setError('Failed to load application details. Please try again.');
            setLoading(false);
        }
    }, [id]);

    const fetchJob = async (jobId: string) => {
        try {
            const response = (await ky.get(`/api/post?id=${jobId}`).json()) as Job;

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
        } catch (error) {
            console.error('Error fetching job:', error);
            setError('Could not load job details.');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (id) {
            fetchApplication();
        }
    }, [id, fetchApplication]);

    if (!id) {
        return (
            <NavbarLayout>
                <div className='container mx-auto px-4 py-6'>
                    <Alert variant='destructive'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>No application ID provided</AlertDescription>
                    </Alert>
                    <Button className='mt-4' asChild>
                        <Link href='/user/applications'>Back to Applications</Link>
                    </Button>
                </div>
            </NavbarLayout>
        );
    }

    return (
        <NavbarLayout>
            <div className='container mx-auto px-4 py-6'>
                <div className='mb-6'>
                    <Button variant='ghost' asChild className='mb-2'>
                        <Link href='/user/applications'>
                            <ArrowLeft className='h-4 w-4 mr-2' />
                            Back to Applications
                        </Link>
                    </Button>
                    <h1 className='text-2xl font-bold'>{loading ? 'Loading Application...' : 'Application Details'}</h1>
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
                ) : application && job ? (
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <div className='space-y-4'>
                            <Card>
                                <CardHeader className='pb-2'>
                                    <CardTitle className='text-lg'>Application Status</CardTitle>
                                </CardHeader>
                                <CardContent className='space-y-4'>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-muted-foreground'>Status:</span>
                                        <StatusBadge status={application.status} />
                                    </div>

                                    <ApplicationTimeline status={application.status} />
                                    <Separator />
                                    <div className='grid grid-cols-2 gap-4 text-sm'>
                                        <div>
                                            <span className='text-muted-foreground'>Applied on:</span>
                                            <p className='font-medium'>{formatDate(application.createdAt)}</p>
                                        </div>
                                        <div>
                                            <span className='text-muted-foreground'>Last updated:</span>
                                            <p className='font-medium'>{formatDate(application.createdAt)}</p>
                                        </div>
                                    </div>

                                    {application.status === ApplicationStatus.SELECTED && (
                                        <Alert>
                                            <CheckCircle className='h-4 w-4' />
                                            <AlertTitle>Congratulations!</AlertTitle>
                                            <AlertDescription>
                                                You have been selected for this position. We will contact you shortly with next steps.
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {application.status === ApplicationStatus.REJECTED && (
                                        <Alert>
                                            <AlertCircle className='h-4 w-4' />
                                            <AlertTitle>Application Status</AlertTitle>
                                            <AlertDescription>
                                                We appreciate your interest, but we have decided to move forward with other candidates at this time.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                                <CardFooter className='bg-muted/20 pt-3'>
                                    <Button
                                        onClick={() => downloadResume(application.resume)}
                                        disabled={fetchingResume || !application.resume}
                                        className='w-full'
                                    >
                                        <Download className='h-4 w-4 mr-2' />
                                        {fetchingResume ? 'Downloading...' : 'Download Resume'}
                                    </Button>
                                </CardFooter>
                            </Card>

                            <JobDetails job={job} />
                        </div>

                        <div className='md:col-span-2'>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Application</CardTitle>
                                    <CardDescription>
                                        Details of your application for {job.profile} at {job.company}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                                        <TabsList className='mb-4'>
                                            <TabsTrigger value='details'>Personal Details</TabsTrigger>
                                            <TabsTrigger value='experience'>Experience</TabsTrigger>
                                            <TabsTrigger value='education'>Education</TabsTrigger>
                                            <TabsTrigger value='coverLetter'>Cover Letter</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value='details'>
                                            <div className='grid grid-cols-2 gap-4 mb-6'>
                                                {[
                                                    {
                                                        icon: <UserIcon className='h-4 w-4 text-primary' />,
                                                        label: 'Name',
                                                        value: `${application.firstName} ${application.lastName}`,
                                                    },
                                                    { icon: <Mail className='h-4 w-4 text-primary' />, label: 'Email', value: application.email },
                                                    {
                                                        icon: <MapPin className='h-4 w-4 text-primary' />,
                                                        label: 'Location',
                                                        value: application.currentLocation,
                                                    },
                                                    {
                                                        icon: <UserIcon className='h-4 w-4 text-primary' />,
                                                        label: 'Gender',
                                                        value: application.gender,
                                                    },
                                                ].map((item, index) => (
                                                    <div key={index} className='space-y-1'>
                                                        <div className='flex items-center text-sm text-muted-foreground'>
                                                            {item.icon}
                                                            <span className='ml-2'>{item.label}</span>
                                                        </div>
                                                        <p className='font-medium'>{item.value}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className='space-y-2 mb-6'>
                                                <h3 className='font-medium flex items-center'>
                                                    <Lightbulb className='h-4 w-4 text-primary mr-2' />
                                                    Skills
                                                </h3>
                                                <div className='flex flex-wrap gap-2'>
                                                    {application.skills.map((skill, index) => (
                                                        <Badge key={index} variant='secondary'>
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                    {application.skills.length === 0 && (
                                                        <p className='text-sm text-muted-foreground'>No skills provided</p>
                                                    )}
                                                </div>
                                            </div>

                                            {application.socialLinks.length > 0 && (
                                                <div className='space-y-2'>
                                                    <h3 className='font-medium flex items-center'>
                                                        <LinkIcon className='h-4 w-4 text-primary mr-2' />
                                                        Social Links
                                                    </h3>
                                                    <div className='space-y-1'>
                                                        {application.socialLinks.filter(Boolean).map((link, index) => (
                                                            <a
                                                                key={index}
                                                                href={link.startsWith('http') ? link : `https://${link}`}
                                                                target='_blank'
                                                                rel='noopener noreferrer'
                                                                className='block text-primary hover:underline text-sm'
                                                            >
                                                                {link}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </TabsContent>

                                        <TabsContent value='experience'>
                                            {application.experience.length > 0 ? (
                                                <div className='space-y-4'>
                                                    {application.experience.map((exp, index) => (
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
                                                                    <span className='text-xs bg-muted rounded-full px-2 py-1'>
                                                                        {exp.yoe} years experience
                                                                    </span>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className='text-center py-8'>
                                                    <AlertCircle className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                                                    <p className='text-muted-foreground'>No experience information provided</p>
                                                </div>
                                            )}
                                        </TabsContent>

                                        <TabsContent value='education'>
                                            {application.education.length > 0 ? (
                                                <div className='space-y-4'>
                                                    {application.education.map((edu, index) => (
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
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className='text-center py-8'>
                                                    <AlertCircle className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                                                    <p className='text-muted-foreground'>No education information provided</p>
                                                </div>
                                            )}
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
                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center py-12'>
                        <Inbox className='h-16 w-16 text-muted-foreground mb-4' />
                        <h2 className='text-xl font-semibold mb-2'>Application Not Found</h2>
                        <p className='text-muted-foreground mb-6 text-center max-w-md'>
                            The application you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
                        </p>
                        <Button asChild>
                            <Link href='/user/applications'>View Your Applications</Link>
                        </Button>
                    </div>
                )}
            </div>
        </NavbarLayout>
    );
}
