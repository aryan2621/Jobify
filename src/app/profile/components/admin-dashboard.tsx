'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase } from 'lucide-react';
import Link from 'next/link';
import { Job } from '@/model/job';
import JobCard from './job-card';

interface AdminDashboardProps {
    postedJobs: Job[];
    loading: boolean;
}

export default function AdminDashboard({ postedJobs, loading }: AdminDashboardProps) {
    return (
        <Card>
            <CardHeader className='pb-3'>
                <CardTitle>Posted Jobs</CardTitle>
                <CardDescription>Manage your job listings and view applicants</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className='space-y-4'>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className='h-24 bg-muted animate-pulse rounded-md'></div>
                        ))}
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {postedJobs.length > 0 ? (
                            <>
                                {postedJobs.map((job, index) => (
                                    <JobCard key={index} job={job} isPosted={true} />
                                ))}

                                <div className='flex justify-center mt-6'>
                                    <Button asChild variant='outline'>
                                        <Link href='/post'>Post a New Job</Link>
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className='text-center py-8'>
                                <Briefcase className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                                <h3 className='font-medium text-lg mb-2'>No Jobs Posted Yet</h3>
                                <p className='text-muted-foreground mb-6'>Create your first job listing to start receiving applications</p>
                                <Button asChild>
                                    <Link href='/post'>Post Your First Job</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
