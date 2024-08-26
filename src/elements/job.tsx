import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/model/job';
import React from 'react';

export default function JobComponent({ job }: { job: Job }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>Details of the job</CardDescription>
            </CardHeader>
            <CardContent>
                <div className='space-y-4 mb-6'>
                    <h2 className='text-lg font-semibold'>{job.profile}</h2>
                    <p>
                        <strong>Company:</strong> {job.company}
                    </p>
                    <p>
                        <strong>Location:</strong> {job.location}
                    </p>
                    <p>
                        <strong>Type:</strong> {job.type}
                    </p>
                    <p>
                        <strong>Last Date to Apply:</strong> {new Date(job.lastDateToApply).toLocaleDateString()}
                    </p>
                    <p>
                        <strong>Description:</strong> {job.description}
                    </p>
                    <div>
                        <strong>Required Skills:</strong>
                        <div className='flex flex-wrap gap-2 mt-2'>
                            {job.skills.map((skill, index) => (
                                <Badge key={`skill-${index}`} variant='secondary'>
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
