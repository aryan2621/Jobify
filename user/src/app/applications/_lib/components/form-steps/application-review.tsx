'use client';

import { memo } from 'react';

import { Application } from '@/model/application';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const ApplicationReview = memo(({ formData, validationErrors }: { formData: Application; validationErrors: string[] }) => {
    const sections = [
        {
            title: 'Personal Information',
            complete: Boolean(formData.firstName && formData.lastName && formData.email && formData.phone && formData.currentLocation),
            items: [
                { label: 'Name', value: `${formData.firstName} ${formData.lastName}` },
                { label: 'Email', value: formData.email },
                { label: 'Phone', value: formData.phone },
                { label: 'Location', value: formData.currentLocation },
                { label: 'Gender', value: formData.gender },
            ],
        },
        {
            title: 'Education',
            complete: Boolean(formData.education.length && formData.education.every((e) => e.college && e.degree)),
            items: formData.education.map((edu) => ({
                label: edu.college || 'University/College',
                value: `${edu.degree} (${edu.degreeType})`,
            })),
        },
        {
            title: 'Experience',
            complete: Boolean(formData.experience.length && formData.experience.every((e) => e.company && e.profile)),
            items: formData.experience.map((exp) => ({
                label: exp.company || 'Company',
                value: `${exp.profile} (${exp.yoe} years)`,
            })),
        },
        {
            title: 'Skills',
            complete: formData.skills.length > 0,
            items: [
                {
                    label: 'Skills',
                    value: formData.skills.length > 0 ? formData.skills.join(', ') : 'No skills added',
                },
            ],
        },
        {
            title: 'Social Links',
            complete: formData.socialLinks.some((link) => Boolean(link)),
            items: [
                {
                    label: 'Links',
                    value: formData.socialLinks.filter(Boolean).join(', ') || 'No links added',
                },
            ],
        },
        {
            title: 'Cover Letter',
            complete: Boolean(formData.coverLetter && formData.coverLetter.length > 50),
            items: [
                {
                    label: 'Cover Letter',
                    value: formData.coverLetter ? `${formData.coverLetter.substring(0, 100)}...` : 'No cover letter added',
                },
            ],
        },
        {
            title: 'Resume',
            complete: Boolean(formData.resume),
            items: [
                {
                    label: 'Resume',
                    value: formData.resume ? 'Uploaded' : 'Not uploaded',
                },
            ],
        },
    ];

    return (
        <div className='space-y-6'>
            <div className='text-center mb-8'>
                <h3 className='text-xl font-semibold'>Application Summary</h3>
                <p className='text-muted-foreground'>Review your application before submission</p>
            </div>

            {validationErrors.length > 0 && (
                <Card className='border-destructive mb-6'>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-base text-destructive flex items-center'>
                            <AlertCircle className='w-5 h-5 mr-2' />
                            Please fix the following issues
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className='list-disc pl-5 space-y-1'>
                            {validationErrors.map((error, index) => (
                                <li key={index} className='text-sm text-destructive'>
                                    {error}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <div className='grid gap-6 md:grid-cols-2'>
                {sections.map((section, i) => (
                    <Card key={i} className={!section.complete ? 'border-amber-200' : ''}>
                        <CardHeader className='pb-2'>
                            <CardTitle className='text-base flex items-center justify-between'>
                                {section.title}
                                {section.complete ? (
                                    <CheckCircle className='h-5 w-5 text-primary' />
                                ) : (
                                    <AlertCircle className='h-5 w-5 text-amber-500' />
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='text-sm'>
                            {section.items.map((item, j) => (
                                <div key={j} className='mb-2'>
                                    <span className='text-muted-foreground'>{item.label}: </span>
                                    <span className='font-medium'>{item.value || '—'}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
});

ApplicationReview.displayName = 'ApplicationReview';
