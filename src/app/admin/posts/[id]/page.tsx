'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import ky from 'ky';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, TrophyIcon } from 'lucide-react';

import NavbarLayout from '@/layouts/navbar';
import JobPostForm from '@/app/admin/_lib/components/index';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

import { Job, JobState } from '@/model/job';

export default function EditJobPostPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const router = useRouter();

    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const fetchJob = useCallback(async () => {
        try {
            setLoading(true);
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
        } catch (error) {
            console.error('Error fetching job:', error);
            setError('Failed to load job details. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchJob();
        }
    }, [id, fetchJob]);

    const handleSuccess = (updatedJob: Job) => {
        setJob(updatedJob);

        setTimeout(() => {
            router.push('/admin/posts');
        }, 1500);
    };

    if (loading) {
        return (
            <NavbarLayout>
                <div className='container mx-auto px-4 py-8'>
                    <div className='flex items-center mb-6'>
                        <Button variant='ghost' asChild className='mr-4'>
                            <Link href='/admin/posts'>
                                <ArrowLeft className='h-4 w-4 mr-2' />
                                Back to Jobs
                            </Link>
                        </Button>
                        <h1 className='text-2xl font-bold'>Loading Job Details...</h1>
                    </div>

                    <div className='animate-pulse space-y-6'>
                        <div className='h-8 bg-muted rounded w-1/4'></div>
                        <div className='h-64 bg-muted rounded'></div>
                        <div className='h-8 bg-muted rounded w-1/3'></div>
                        <div className='h-64 bg-muted rounded'></div>
                    </div>
                </div>
            </NavbarLayout>
        );
    }

    if (error || !job) {
        return (
            <NavbarLayout>
                <div className='container mx-auto px-4 py-8'>
                    <div className='flex items-center mb-6'>
                        <Button variant='ghost' asChild className='mr-4'>
                            <Link href='/admin/posts'>
                                <ArrowLeft className='h-4 w-4 mr-2' />
                                Back to Jobs
                            </Link>
                        </Button>
                        <h1 className='text-2xl font-bold'>Job Not Found</h1>
                    </div>

                    <Alert variant='destructive'>
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {error ||
                                "The job you're looking for could not be found. It may have been deleted or you may not have permission to view it."}
                        </AlertDescription>
                    </Alert>

                    <div className='mt-6'>
                        <Button asChild>
                            <Link href='/admin/posts'>Return to Jobs List</Link>
                        </Button>
                    </div>
                </div>
            </NavbarLayout>
        );
    }

    return (
        <NavbarLayout>
            <div className='container mx-auto px-4 py-6'>
                <div className='flex items-center mb-6'>
                    <Button variant='ghost' asChild className='mr-4'>
                        <Link href='/admin/posts'>
                            <ArrowLeft className='h-4 w-4 mr-2' />
                            Back to Jobs
                        </Link>
                    </Button>
                    <h1 className='text-2xl font-bold'>Edit Job: {job.profile}</h1>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='col-span-2'>
                        <JobPostForm initialData={job} isEditMode={true} onSuccess={handleSuccess} />
                    </div>

                    <div className='space-y-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Preview Job</CardTitle>
                                <CardDescription>See how your job will appear to applicants</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className='w-full' variant='outline' onClick={() => setShowPreview(!showPreview)}>
                                    <Eye className='h-4 w-4 mr-2' />
                                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                                </Button>

                                {showPreview && (
                                    <div className='mt-4 border rounded-md p-4 bg-card max-h-96 overflow-y-auto'>
                                        <div className='space-y-6'>
                                            <div className='border-b pb-4'>
                                                <h2 className='text-xl font-bold'>{job.profile}</h2>
                                                <div className='flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground'>
                                                    <div>{job.type}</div>
                                                    <div>•</div>
                                                    <div>{job.workplaceType}</div>
                                                    <div>•</div>
                                                    <div>{job.location}</div>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className='text-md font-semibold mb-2'>Company</h3>
                                                <p>{job.company}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Job Statistics</CardTitle>
                                <CardDescription>Current application status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-4'>
                                    <div className='flex justify-between items-center'>
                                        <span className='text-sm'>Total Applications</span>
                                        <Badge variant='secondary'>{job.applications.length}</Badge>
                                    </div>
                                    <Separator />
                                    <div className='flex justify-between items-center'>
                                        <span className='text-sm'>Status</span>
                                        <Badge
                                            variant={
                                                job.state === JobState.PUBLISHED ? 'default' : job.state === JobState.DRAFT ? 'outline' : 'secondary'
                                            }
                                        >
                                            {job.state}
                                        </Badge>
                                    </div>
                                    <Separator />
                                    <div className='flex justify-between items-center'>
                                        <span className='text-sm'>Created On</span>
                                        <span className='text-sm'>{new Date(job.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className='border-t bg-muted/20 flex justify-center'>
                                <Button variant='outline' className='w-full' asChild>
                                    <Link href={`/admin/applications/${job.id}`}>
                                        <TrophyIcon className='h-4 w-4 mr-2' />
                                        View Applications
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </NavbarLayout>
    );
}
