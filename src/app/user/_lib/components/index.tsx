'use client';

import { AlertCircle, FileText, Info, Link, XIcon } from 'lucide-react';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { ApplicationStatus } from '@/model/application';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Job } from '@/model/job';
import { formatDate } from '@/lib/job-utils/utils';
import { memo } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { FORM_STEPS } from '@/app/user/_lib/utils';
import { Label } from '@/components/ui/label';

type StatusBadgeProps = {
    status: ApplicationStatus;
    showText?: boolean;
    customText?: Record<ApplicationStatus, string>;
} & BadgeProps;

export const StatusBadge = ({ status, showText = true, customText, ...props }: StatusBadgeProps) => {
    const variants = {
        [ApplicationStatus.APPLIED]: { variant: 'secondary' as const, icon: <Clock className='w-3 h-3 mr-1' /> },
        [ApplicationStatus.SELECTED]: { variant: 'default' as const, icon: <CheckCircle className='w-3 h-3 mr-1' /> },
        [ApplicationStatus.REJECTED]: { variant: 'destructive' as const, icon: <XCircle className='w-3 h-3 mr-1' /> },
    };

    const { variant, icon } = variants[status];
    const text = customText ? customText[status] : showText ? status : '';

    return (
        <Badge variant={variant} className='flex items-center' {...props}>
            {icon}
            {text}
        </Badge>
    );
};

type CoverLetterDisplayProps = {
    coverLetter?: string;
    emptyStateVariant?: 'icon' | 'text';
    className?: string;
};

export const CoverLetterDisplay = ({ coverLetter, emptyStateVariant = 'icon', className = '' }: CoverLetterDisplayProps) => {
    if (coverLetter) {
        return (
            <div className={`whitespace-pre-line ${className}`}>
                <p className='text-sm'>{coverLetter}</p>
            </div>
        );
    }

    if (emptyStateVariant === 'icon') {
        return (
            <div className={`text-center py-8 ${className}`}>
                <FileText className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                <p className='text-muted-foreground'>No cover letter provided</p>
            </div>
        );
    }

    return <p className={`text-sm text-muted-foreground italic ${className}`}>No cover letter provided</p>;
};

export const ApplicationTimeline = ({ status }: { status: ApplicationStatus }) => {
    const getStepStatus = (stepStatus: ApplicationStatus, currentStatus: ApplicationStatus) => {
        if (currentStatus === stepStatus) return 'current';

        if (currentStatus === ApplicationStatus.SELECTED) {
            return stepStatus === ApplicationStatus.REJECTED ? 'inactive' : 'completed';
        }

        if (currentStatus === ApplicationStatus.REJECTED) {
            return stepStatus === ApplicationStatus.SELECTED ? 'inactive' : stepStatus === ApplicationStatus.APPLIED ? 'completed' : 'current';
        }

        return stepStatus === ApplicationStatus.APPLIED ? 'current' : 'inactive';
    };

    return (
        <div className='pt-4 pb-2'>
            <div className='flex items-center justify-between'>
                <div
                    className={`flex flex-col items-center ${
                        getStepStatus(ApplicationStatus.APPLIED, status) === 'completed'
                            ? 'text-primary'
                            : getStepStatus(ApplicationStatus.APPLIED, status) === 'current'
                              ? 'text-primary'
                              : 'text-muted-foreground'
                    }`}
                >
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-2
            ${
                getStepStatus(ApplicationStatus.APPLIED, status) === 'completed'
                    ? 'bg-primary text-primary-foreground'
                    : getStepStatus(ApplicationStatus.APPLIED, status) === 'current'
                      ? 'border-2 border-primary'
                      : 'border border-muted-foreground'
            }`}
                    >
                        {getStepStatus(ApplicationStatus.APPLIED, status) === 'completed' ? (
                            <CheckCircle className='h-4 w-4' />
                        ) : (
                            <Clock className='h-4 w-4' />
                        )}
                    </div>
                    <span className='text-xs'>Applied</span>
                </div>

                <div
                    className={`w-full mx-4 h-1 ${getStepStatus(ApplicationStatus.APPLIED, status) === 'completed' ? 'bg-primary' : 'bg-muted'}`}
                ></div>

                <div
                    className={`flex flex-col items-center ${
                        getStepStatus(ApplicationStatus.SELECTED, status) === 'completed'
                            ? 'text-primary'
                            : getStepStatus(ApplicationStatus.SELECTED, status) === 'current'
                              ? 'text-primary'
                              : 'text-muted-foreground'
                    }`}
                >
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-2
            ${
                getStepStatus(ApplicationStatus.SELECTED, status) === 'completed'
                    ? 'bg-primary text-primary-foreground'
                    : getStepStatus(ApplicationStatus.SELECTED, status) === 'current'
                      ? 'border-2 border-primary'
                      : 'border border-muted-foreground'
            }`}
                    >
                        {getStepStatus(ApplicationStatus.SELECTED, status) === 'completed' ? (
                            <CheckCircle className='h-4 w-4' />
                        ) : (
                            <CheckCircle className='h-4 w-4' />
                        )}
                    </div>
                    <span className='text-xs'>Selected</span>
                </div>

                <div
                    className={`w-full mx-4 h-1 ${
                        getStepStatus(ApplicationStatus.REJECTED, status) === 'completed' || status === ApplicationStatus.REJECTED
                            ? 'bg-primary'
                            : 'bg-muted'
                    }`}
                ></div>

                <div
                    className={`flex flex-col items-center ${
                        getStepStatus(ApplicationStatus.REJECTED, status) === 'completed'
                            ? 'text-primary'
                            : getStepStatus(ApplicationStatus.REJECTED, status) === 'current'
                              ? 'text-primary'
                              : 'text-muted-foreground'
                    }`}
                >
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-2
            ${
                getStepStatus(ApplicationStatus.REJECTED, status) === 'completed'
                    ? 'bg-primary text-primary-foreground'
                    : getStepStatus(ApplicationStatus.REJECTED, status) === 'current'
                      ? 'border-2 border-primary'
                      : 'border border-muted-foreground'
            }`}
                    >
                        {getStepStatus(ApplicationStatus.REJECTED, status) === 'completed' ? (
                            <CheckCircle className='h-4 w-4' />
                        ) : (
                            <XCircle className='h-4 w-4' />
                        )}
                    </div>
                    <span className='text-xs'>Not Selected</span>
                </div>
            </div>
        </div>
    );
};

export const JobDetails = ({ job }: { job: Job }) => {
    const daysRemaining = (date: string) => {
        const today = new Date();
        const lastDate = new Date(date);
        const diffTime = lastDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const isActive = daysRemaining(job.lastDateToApply) > 0;

    return (
        <Card>
            <CardHeader className='pb-2'>
                <CardTitle className='text-lg'>Job Details</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='flex justify-between items-start'>
                    <div>
                        <h3 className='font-medium'>{job.profile}</h3>
                        <p className='text-sm text-muted-foreground'>{job.company}</p>
                    </div>
                    <Badge variant={isActive ? 'default' : 'outline'}>{isActive ? 'Active' : 'Closed'}</Badge>
                </div>

                <div className='flex flex-wrap gap-2'>
                    <Badge variant='secondary'>{job.type}</Badge>
                    <Badge variant='secondary'>{job.workplaceType}</Badge>
                </div>

                <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                        <span className='text-muted-foreground'>Location:</span>
                        <p className='font-medium'>{job.location}</p>
                    </div>
                    <div>
                        <span className='text-muted-foreground'>Apply by:</span>
                        <p className='font-medium'>{formatDate(job.lastDateToApply)}</p>
                    </div>
                </div>

                <div>
                    <span className='text-muted-foreground text-sm'>Required Skills:</span>
                    <div className='flex flex-wrap gap-2 mt-2'>
                        {job.skills.map((skill, index) => (
                            <Badge key={index} variant='outline'>
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter className='bg-muted/20 pt-3'>
                <Button variant='outline' className='w-full' asChild>
                    <Link href={`/posts/${job.id}`}>View Full Job Details</Link>
                </Button>
            </CardFooter>
        </Card>
    );
};
export const ProgressStepper = memo(
    ({ currentStep, totalSteps, onStepClick }: { currentStep: number; totalSteps: number[]; onStepClick: (step: number) => void }) => {
        const progress = ((currentStep - 1) / (totalSteps.length - 1)) * 100;

        return (
            <div className='mb-8'>
                <div className='flex justify-between mb-2'>
                    {FORM_STEPS.map((step, index) => (
                        <TooltipProvider key={`step-${index}`}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onStepClick(step.id)}
                                        className={`flex flex-col items-center transition-colors ${
                                            currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                                        }`}
                                        aria-current={currentStep === step.id ? 'step' : undefined}
                                    >
                                        <div
                                            className={`
                    relative z-10 flex items-center justify-center w-10 h-10 rounded-full 
                    border-2 mb-2 transition-colors duration-200
                    ${
                        currentStep > step.id
                            ? 'bg-primary border-primary text-primary-foreground'
                            : currentStep === step.id
                              ? 'border-primary bg-background text-primary'
                              : 'border-muted-foreground bg-background text-muted-foreground'
                    }
                  `}
                                        >
                                            {currentStep > step.id ? <CheckCircle className='w-5 h-5' /> : step.icon}
                                        </div>
                                        <span className='text-xs font-medium hidden md:block'>{step.title}</span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{step.title}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
                <Progress value={progress} className='h-2' />
            </div>
        );
    }
);

ProgressStepper.displayName = 'ProgressStepper';

export const FormSectionTitle = memo(({ title, subtitle, icon }: { title: string; subtitle?: string; icon: React.ReactNode }) => (
    <div className='flex items-center space-x-3 mb-6'>
        <div className='bg-primary/10 p-2 rounded-full'>{icon}</div>
        <div>
            <h3 className='text-lg font-medium'>{title}</h3>
            {subtitle && <p className='text-sm text-muted-foreground'>{subtitle}</p>}
        </div>
    </div>
));

FormSectionTitle.displayName = 'FormSectionTitle';

export const FormField = memo(
    ({
        label,
        error,
        touched,
        children,
        required = false,
        helpText,
    }: {
        label: string;
        error?: string;
        touched?: boolean;
        children: React.ReactNode;
        required?: boolean;
        helpText?: string;
    }) => (
        <div className='mb-4'>
            <div className='flex justify-between items-center mb-1.5'>
                <Label className='flex items-center'>
                    {label} {required && <span className='text-destructive ml-0.5'>*</span>}
                </Label>
                {helpText && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className='w-4 h-4 text-muted-foreground cursor-help' />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className='max-w-xs text-sm'>{helpText}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            {children}
            {touched && error && (
                <div className='text-destructive text-sm mt-1 flex items-center'>
                    <AlertCircle className='w-3.5 h-3.5 mr-1.5' />
                    {error}
                </div>
            )}
        </div>
    )
);

FormField.displayName = 'FormField';
export const RemoveButton = memo(({ onClick, label = 'Remove' }: { onClick: () => void; label?: string }) => (
    <Button variant='destructive' onClick={onClick} size='sm' className='h-8 w-8 p-1' aria-label={label} title={label}>
        <XIcon className='h-4 w-4' />
    </Button>
));

RemoveButton.displayName = 'RemoveButton';
