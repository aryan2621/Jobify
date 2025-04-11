'use client';

import { useState } from 'react';
import { ArrowLeft, Eye } from 'lucide-react';

import NavbarLayout from '@/layouts/navbar';
import JobPostForm from '@/app/admin/_lib/components/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import { Job } from '@/model/job';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
export default function CreateJobPostPage() {
    const [showPreview, setShowPreview] = useState(false);
    const router = useRouter();
    const handleSuccess = (job: Job) => {
        console.log('Job created successfully:', job);
    };

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
                    <h1 className='text-2xl font-bold'>Create New Job</h1>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='col-span-2'>
                        <JobPostForm onSuccess={handleSuccess} />
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

                                {showPreview && <div className='mt-4 border rounded-md p-4 bg-card'>Job preview will be shown here.</div>}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Tips</CardTitle>
                                <CardDescription>How to write effective job postings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className='space-y-2 text-sm text-muted-foreground'>
                                    <li className='flex gap-2'>
                                        <span className='h-4 w-4 text-primary shrink-0 mt-0.5' />
                                        <span>Be specific about responsibilities and requirements</span>
                                    </li>
                                    <li className='flex gap-2'>
                                        <span className='h-4 w-4 text-primary shrink-0 mt-0.5' />
                                        <span>Include salary range and benefits when possible</span>
                                    </li>
                                    <li className='flex gap-2'>
                                        <span className='h-4 w-4 text-primary shrink-0 mt-0.5' />
                                        <span>Use inclusive language to attract diverse candidates</span>
                                    </li>
                                    <li className='flex gap-2'>
                                        <span className='h-4 w-4 text-primary shrink-0 mt-0.5' />
                                        <span>Clearly mention remote/hybrid work options</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </NavbarLayout>
    );
}
