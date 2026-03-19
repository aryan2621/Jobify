'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { Application } from '@/model/application';
import ApplicationCard from './application-card';

interface UserDashboardProps {
    applications: Application[];
    loading: boolean;
}

export default function UserDashboard({ applications, loading }: UserDashboardProps) {
    return (
        <Card>
            <CardHeader className='pb-3'>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>Track your job applications and their status</CardDescription>
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
                        {applications.length > 0 ? (
                            <>
                                {applications.map((application, index) => (
                                    <ApplicationCard key={index} application={application} />
                                ))}

                                <div className='flex justify-center mt-6'>
                                    <Button asChild variant='outline'>
                                        <Link href='/user/posts'>Browse More Jobs</Link>
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className='text-center py-8'>
                                <FileText className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                                <h3 className='font-medium text-lg mb-2'>No Applications Yet</h3>
                                <p className='text-muted-foreground mb-6'>Start applying to jobs to track your application progress</p>
                                <Button asChild>
                                    <Link href='/user/posts'>Browse Available Jobs</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
