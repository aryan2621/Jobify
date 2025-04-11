import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/model/job';
import { Building2, MapPin, Briefcase, Calendar, FileText, Lightbulb } from 'lucide-react';

export default function JobComponent({ job }: { job: Job }) {
    return (
        <Card className='w-full max-w-2xl'>
            <CardHeader>
                <CardTitle className='text-2xl font-bold'>{job.profile}</CardTitle>
                <CardDescription>{job.company}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='flex items-center space-x-2'>
                    <Building2 className='w-5 h-5 text-gray-500' />
                    <span>
                        <strong>Company:</strong> {job.company}
                    </span>
                </div>

                <div className='flex items-center space-x-2'>
                    <MapPin className='w-5 h-5 text-gray-500' />
                    <span>
                        <strong>Location:</strong> {job.location}
                    </span>
                </div>

                <div className='flex items-center space-x-2'>
                    <Briefcase className='w-5 h-5 text-gray-500' />
                    <span>
                        <strong>Type:</strong> {job.type}
                    </span>
                </div>

                <div className='flex items-center space-x-2'>
                    <Calendar className='w-5 h-5 text-gray-500' />
                    <span>
                        <strong>Last Date to Apply:</strong> {new Date(job.lastDateToApply).toLocaleDateString()}
                    </span>
                </div>

                <div className='space-y-2'>
                    <div className='flex items-center space-x-2'>
                        <FileText className='w-5 h-5 text-gray-500' />
                        <strong>Description:</strong>
                    </div>
                    <p className='ml-7'>{job.description}</p>
                </div>

                <div className='space-y-2'>
                    <div className='flex items-center space-x-2'>
                        <Lightbulb className='w-5 h-5 text-gray-500' />
                        <strong>Required Skills:</strong>
                    </div>
                    <div className='ml-7 flex flex-wrap gap-2'>
                        {job.skills.map((skill, index) => (
                            <Badge key={index} variant='secondary'>
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
