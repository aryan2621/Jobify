'use client';

import React, { useState, FormEvent, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ky from 'ky';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Eye, CheckCircle, AlertCircle } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Job, JobState, JobType, WorkplaceTypes } from '@/model/job';
import { FORM_STEPS, predefinedSkills, REJECTION_EMAIL_CONTENT, SELECTION_EMAIL_CONTENT, ValidationState } from '@/app/admin/_lib/utils';

const FormProgress = ({ currentPage, totalPages }: { currentPage: number; totalPages: number }) => {
    const progress = (currentPage / totalPages) * 100;

    return (
        <div className='mb-6'>
            <div className='flex justify-between mb-2'>
                {FORM_STEPS.map((step, index) => (
                    <div
                        key={step.id}
                        className={`text-center flex flex-col items-center relative w-full ${
                            index !== FORM_STEPS.length - 1
                                ? "after:content-[''] after:h-[2px] after:w-full after:absolute after:top-4 after:left-1/2 after:bg-muted"
                                : ''
                        }`}
                    >
                        <div
                            className={`z-10 flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium mb-1 
              ${
                  currentPage > step.id
                      ? 'bg-primary text-primary-foreground'
                      : currentPage === step.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
              }`}
                        >
                            {currentPage > step.id ? <CheckCircle className='h-4 w-4' /> : step.id}
                        </div>
                        <span className='text-xs hidden md:block'>{step.title}</span>
                    </div>
                ))}
            </div>
            <Progress value={progress} className='h-2' />
        </div>
    );
};

const EmailTemplateHelper = ({ onInsertVariable }: { onInsertVariable: (variable: string) => void }) => {
    const variables = [
        { name: 'Applicant Name', code: '{applicant_name}' },
        { name: 'Job Title', code: '{job_title}' },
        { name: 'Company Name', code: '{company_name}' },
        { name: 'Application Date', code: '{application_date}' },
    ];

    return (
        <div className='mb-4 p-3 bg-muted rounded-md'>
            <p className='text-sm mb-2'>Available template variables:</p>
            <div className='flex flex-wrap gap-2'>
                {variables.map((variable) => (
                    <Badge
                        key={variable.code}
                        variant='outline'
                        className='cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors'
                        onClick={() => onInsertVariable(variable.code)}
                    >
                        {variable.name}
                    </Badge>
                ))}
            </div>
        </div>
    );
};

const FieldError = ({ message }: { message: string }) => (
    <div className='text-destructive text-xs flex items-center mt-1'>
        <AlertCircle className='h-3 w-3 mr-1' />
        <span>{message}</span>
    </div>
);

interface JobPostFormProps {
    initialData?: Job | null;
    isEditMode?: boolean;
    onSuccess?: (job: Job) => void;
    onCancel?: () => void;
}

export default function JobPostForm({ initialData, isEditMode = false, onSuccess, onCancel }: JobPostFormProps) {
    const router = useRouter();

    const [page, setPage] = useState(1);
    const [newSkill, setNewSkill] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const [formData, setFormData] = useState<Job>(() => {
        if (initialData) {
            return initialData;
        }

        return new Job(
            crypto.randomUUID(),
            '',
            '',
            '',
            JobType.FULL_TIME,
            WorkplaceTypes.ONSITE,
            '',
            '',
            [],
            REJECTION_EMAIL_CONTENT,
            SELECTION_EMAIL_CONTENT,
            new Date().toISOString(),
            JobState.DRAFT,
            '',
            []
        );
    });

    const [validation, setValidation] = useState<ValidationState>({
        company: { valid: false, message: '', touched: false },
        profile: { valid: false, message: '', touched: false },
        description: { valid: false, message: '', touched: false },
        location: { valid: false, message: '', touched: false },
        lastDateToApply: { valid: false, message: '', touched: false },
        skills: { valid: false, message: '', touched: false },
        rejectionContent: { valid: false, message: '', touched: false },
        selectionContent: { valid: false, message: '', touched: false },
    });

    const nextPage = useCallback(() => {
        if (validateCurrentPage()) {
            setPage((prev) => Math.min(prev + 1, FORM_STEPS.length));
            window.scrollTo(0, 0);
        } else {
            toast({
                title: 'Validation Error',
                description: 'Please fix the errors before proceeding',
                variant: 'destructive',
            });
        }
    }, []);

    const prevPage = useCallback(() => {
        setPage((prev) => Math.max(prev - 1, 1));
        window.scrollTo(0, 0);
    }, []);

    const validateCurrentPage = useCallback(() => {
        let isValid = true;
        const newValidation = { ...validation };

        if (page === 1) {
            if (!formData.company.trim()) {
                newValidation.company = {
                    valid: false,
                    message: 'Company name is required',
                    touched: true,
                };
                isValid = false;
            } else {
                newValidation.company = {
                    valid: true,
                    message: '',
                    touched: true,
                };
            }

            if (!formData.profile.trim()) {
                newValidation.profile = {
                    valid: false,
                    message: 'Job profile is required',
                    touched: true,
                };
                isValid = false;
            } else {
                newValidation.profile = {
                    valid: true,
                    message: '',
                    touched: true,
                };
            }

            if (!formData.description.trim()) {
                newValidation.description = {
                    valid: false,
                    message: 'Job description is required',
                    touched: true,
                };
                isValid = false;
            } else if (formData.description.length < 30) {
                newValidation.description = {
                    valid: false,
                    message: 'Job description must be at least 30 characters',
                    touched: true,
                };
                isValid = false;
            } else {
                newValidation.description = {
                    valid: true,
                    message: '',
                    touched: true,
                };
            }
        } else if (page === 2) {
            if (!formData.location.trim()) {
                newValidation.location = {
                    valid: false,
                    message: 'Job location is required',
                    touched: true,
                };
                isValid = false;
            } else {
                newValidation.location = {
                    valid: true,
                    message: '',
                    touched: true,
                };
            }

            if (!formData.lastDateToApply) {
                newValidation.lastDateToApply = {
                    valid: false,
                    message: 'Last date to apply is required',
                    touched: true,
                };
                isValid = false;
            } else if (isDateAlreadyPassed(formData.lastDateToApply)) {
                newValidation.lastDateToApply = {
                    valid: false,
                    message: 'Last date to apply must be a future date',
                    touched: true,
                };
                isValid = false;
            } else {
                newValidation.lastDateToApply = {
                    valid: true,
                    message: '',
                    touched: true,
                };
            }
        } else if (page === 3) {
            if (!formData.skills || formData.skills.length === 0) {
                newValidation.skills = {
                    valid: false,
                    message: 'At least one skill is required',
                    touched: true,
                };
                isValid = false;
            } else {
                newValidation.skills = {
                    valid: true,
                    message: '',
                    touched: true,
                };
            }
        } else if (page === 4) {
            if (!formData.rejectionContent.trim()) {
                newValidation.rejectionContent = {
                    valid: false,
                    message: 'Rejection email content is required',
                    touched: true,
                };
                isValid = false;
            } else if (formData.rejectionContent.length < 30) {
                newValidation.rejectionContent = {
                    valid: false,
                    message: 'Rejection content must be at least 30 characters',
                    touched: true,
                };
                isValid = false;
            } else {
                newValidation.rejectionContent = {
                    valid: true,
                    message: '',
                    touched: true,
                };
            }
            if (!formData.selectionContent.trim()) {
                newValidation.selectionContent = {
                    valid: false,
                    message: 'Selection email content is required',
                    touched: true,
                };
                isValid = false;
            } else if (formData.selectionContent.length < 30) {
                newValidation.selectionContent = {
                    valid: false,
                    message: 'Selection content must be at least 30 characters',
                    touched: true,
                };
                isValid = false;
            } else {
                newValidation.selectionContent = {
                    valid: true,
                    message: '',
                    touched: true,
                };
            }
        }

        setValidation(newValidation);
        return isValid;
    }, [formData, page, validation]);

    const validateForm = useCallback(() => {
        const newValidation = { ...validation };
        let isValid = true;

        if (!formData.company.trim()) {
            newValidation.company = {
                valid: false,
                message: 'Company name is required',
                touched: true,
            };
            isValid = false;
        } else {
            newValidation.company = {
                valid: true,
                message: '',
                touched: true,
            };
        }

        if (!formData.profile.trim()) {
            newValidation.profile = {
                valid: false,
                message: 'Job profile is required',
                touched: true,
            };
            isValid = false;
        } else {
            newValidation.profile = {
                valid: true,
                message: '',
                touched: true,
            };
        }

        if (!formData.description.trim()) {
            newValidation.description = {
                valid: false,
                message: 'Job description is required',
                touched: true,
            };
            isValid = false;
        } else if (formData.description.length < 30) {
            newValidation.description = {
                valid: false,
                message: 'Job description must be at least 30 characters',
                touched: true,
            };
            isValid = false;
        } else {
            newValidation.description = {
                valid: true,
                message: '',
                touched: true,
            };
        }

        if (!formData.location.trim()) {
            newValidation.location = {
                valid: false,
                message: 'Job location is required',
                touched: true,
            };
            isValid = false;
        } else {
            newValidation.location = {
                valid: true,
                message: '',
                touched: true,
            };
        }

        if (!formData.lastDateToApply) {
            newValidation.lastDateToApply = {
                valid: false,
                message: 'Last date to apply is required',
                touched: true,
            };
            isValid = false;
        } else if (isDateAlreadyPassed(formData.lastDateToApply)) {
            newValidation.lastDateToApply = {
                valid: false,
                message: 'Last date to apply must be a future date',
                touched: true,
            };
            isValid = false;
        } else {
            newValidation.lastDateToApply = {
                valid: true,
                message: '',
                touched: true,
            };
        }

        const skillsValid = formData.skills.length > 0;
        newValidation.skills = {
            valid: skillsValid,
            message: skillsValid ? '' : 'Please select at least one skill',
            touched: true,
        };

        if (!skillsValid) isValid = false;

        if (!formData.rejectionContent.trim()) {
            newValidation.rejectionContent = {
                valid: false,
                message: 'Rejection email content is required',
                touched: true,
            };
            isValid = false;
        } else if (formData.rejectionContent.length < 30) {
            newValidation.rejectionContent = {
                valid: false,
                message: 'Rejection content must be at least 30 characters',
                touched: true,
            };
            isValid = false;
        } else {
            newValidation.rejectionContent = {
                valid: true,
                message: '',
                touched: true,
            };
        }

        if (!formData.selectionContent.trim()) {
            newValidation.selectionContent = {
                valid: false,
                message: 'Selection email content is required',
                touched: true,
            };
            isValid = false;
        } else if (formData.selectionContent.length < 30) {
            newValidation.selectionContent = {
                valid: false,
                message: 'Selection content must be at least 30 characters',
                touched: true,
            };
            isValid = false;
        } else {
            newValidation.selectionContent = {
                valid: true,
                message: '',
                touched: true,
            };
        }

        setValidation(newValidation);
        return isValid;
    }, [formData, validation]);

    const isDateAlreadyPassed = (date: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(date);
        return selectedDate < today;
    };

    const handleSkillChange = useCallback((skill: string) => {
        setFormData((prev) => {
            const newSkills = prev.skills?.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...(prev.skills ?? []), skill];

            return {
                ...prev,
                skills: newSkills,
            };
        });
        setIsDirty(true);
    }, []);

    const addNewSkill = useCallback(() => {
        if (newSkill && !(formData.skills ?? []).includes(newSkill)) {
            setFormData((prev) => ({
                ...prev,
                skills: [...(prev.skills ?? []), newSkill],
            }));
            setNewSkill('');
            setIsDirty(true);
        }
    }, [formData.skills, newSkill]);

    const insertTemplateVariable = useCallback(
        (variable: string, field: 'rejectionContent' | 'selectionContent') => {
            const textarea = document.getElementById(field) as HTMLTextAreaElement;
            if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const content = formData[field];
                const newContent = content.substring(0, start) + variable + content.substring(end);

                setFormData((prev) => ({
                    ...prev,
                    [field]: newContent,
                }));

                setTimeout(() => {
                    textarea.focus();
                    textarea.setSelectionRange(start + variable.length, start + variable.length);
                }, 0);
            } else {
                setFormData((prev) => ({
                    ...prev,
                    [field]: prev[field] + variable,
                }));
            }
            setIsDirty(true);
        },
        [formData]
    );

    const handleFormChange = useCallback((field: keyof Job, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        setIsDirty(true);
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>, isDraft: boolean = false) => {
        e.preventDefault();

        if (!isDraft && !validateForm()) {
            toast({
                title: 'Validation Error',
                description: 'Please fix the errors before submitting',
                variant: 'destructive',
            });
            return;
        }

        setSubmitting(true);

        try {
            const endpoint = isEditMode ? '/api/post' : '/api/post';
            const method = isEditMode ? 'put' : 'post';

            const response = await ky[method](endpoint, {
                json: {
                    ...formData,
                    state: isDraft ? JobState.DRAFT : JobState.PUBLISHED,
                },
            });

            const updatedJob = await response.json();

            toast({
                title: 'Success',
                description: isEditMode
                    ? isDraft
                        ? 'Job saved as draft successfully'
                        : 'Job updated successfully'
                    : isDraft
                      ? 'Draft saved successfully'
                      : 'Job posted successfully',
            });

            setIsDirty(false);
            setSubmitted(true);

            if (onSuccess) {
                onSuccess(updatedJob as Job);
            } else {
                setTimeout(() => {
                    router.push('/admin/posts');
                }, 1500);
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'An unexpected error occurred',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const renderJobPreview = () => {
        const formatDate = (dateString: string) => {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        };

        return (
            <div className='space-y-6'>
                <div className='border-b pb-4'>
                    <h2 className='text-2xl font-bold'>{formData.profile || 'Job Title'}</h2>
                    <div className='flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground'>
                        <div className='flex items-center'>
                            <div className='h-4 w-4 mr-1' />
                            {formData.type}
                        </div>
                        <div>•</div>
                        <div className='flex items-center'>
                            <div className='h-4 w-4 mr-1' />
                            {formData.workplaceType}
                        </div>
                        <div>•</div>
                        <div>{formData.location || 'Location'}</div>
                    </div>
                </div>

                <div>
                    <h3 className='text-lg font-semibold mb-2'>Company</h3>
                    <p>{formData.company || 'Company Name'}</p>
                </div>

                <div>
                    <h3 className='text-lg font-semibold mb-2'>Description</h3>
                    <p className='whitespace-pre-line'>{formData.description || 'Job description will appear here.'}</p>
                </div>

                <div>
                    <h3 className='text-lg font-semibold mb-2'>Required Skills</h3>
                    <div className='flex flex-wrap gap-2'>
                        {formData.skills && formData.skills.length > 0 ? (
                            formData.skills.map((skill) => (
                                <Badge key={skill} variant='secondary'>
                                    {skill}
                                </Badge>
                            ))
                        ) : (
                            <p className='text-muted-foreground'>No skills specified</p>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className='text-lg font-semibold mb-2'>Application Deadline</h3>
                    <p>{formatDate(formData.lastDateToApply)}</p>
                </div>
            </div>
        );
    };

    useEffect(() => {
        if (isEditMode && initialData) {
            validateForm();
        }
    }, [isEditMode, initialData, validateForm]);

    return (
        <Card className='max-w-3xl mx-auto'>
            <CardHeader>
                <div className='flex justify-between items-start'>
                    <div>
                        <CardTitle>{isEditMode ? 'Edit Job Posting' : 'Post a New Job'}</CardTitle>
                        <CardDescription>
                            {isEditMode ? 'Update the job details and save or publish.' : 'Fill out the form to post a new job opening.'}
                        </CardDescription>
                    </div>
                    {isEditMode && (
                        <div className='flex items-center space-x-2'>
                            <Badge variant={formData.state === JobState.PUBLISHED ? 'default' : 'outline'}>{formData.state}</Badge>
                        </div>
                    )}
                </div>

                <FormProgress currentPage={page} totalPages={FORM_STEPS.length} />
            </CardHeader>

            <CardContent>
                <form id='job-form' className='space-y-6' onSubmit={(e) => handleSubmit(e, false)}>
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={`page-${page}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {page === 1 && (
                                <div className='space-y-4'>
                                    <div>
                                        <Label htmlFor='company-name'>
                                            Company Name <span className='text-destructive'>*</span>
                                        </Label>
                                        <Input
                                            id='company-name'
                                            placeholder='Ex: Google'
                                            value={formData.company}
                                            onChange={(e) => handleFormChange('company', e.target.value)}
                                            className={`${!validation.company.valid && validation.company.touched ? 'border-destructive' : ''}`}
                                        />
                                        {!validation.company.valid && validation.company.touched && (
                                            <FieldError message={validation.company.message} />
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor='job-profile'>
                                            Job Title <span className='text-destructive'>*</span>
                                        </Label>
                                        <Input
                                            id='job-profile'
                                            placeholder='Ex: Software Developer'
                                            value={formData.profile}
                                            onChange={(e) => handleFormChange('profile', e.target.value)}
                                            className={`${!validation.profile.valid && validation.profile.touched ? 'border-destructive' : ''}`}
                                        />
                                        {!validation.profile.valid && validation.profile.touched && (
                                            <FieldError message={validation.profile.message} />
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor='job-description'>
                                            Job Description <span className='text-destructive'>*</span>
                                        </Label>
                                        <div className='flex justify-end mb-1'>
                                            <span className='text-xs text-muted-foreground'>{formData.description.length} / 1000 characters</span>
                                        </div>
                                        <Textarea
                                            id='job-description'
                                            placeholder='Describe the job responsibilities, requirements, and benefits'
                                            value={formData.description}
                                            onChange={(e) => handleFormChange('description', e.target.value)}
                                            rows={8}
                                            className={`${!validation.description.valid && validation.description.touched ? 'border-destructive' : ''}`}
                                        />
                                        {!validation.description.valid && validation.description.touched && (
                                            <FieldError message={validation.description.message} />
                                        )}
                                    </div>
                                </div>
                            )}

                            {page === 2 && (
                                <div className='space-y-4'>
                                    <div className='flex flex-wrap gap-4'>
                                        <div className='grid gap-2 flex-1 min-w-[200px]'>
                                            <Label htmlFor='job-type'>Job Type</Label>
                                            <Select value={formData.type} onValueChange={(value) => handleFormChange('type', value as JobType)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select job type' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[
                                                        JobType.FULL_TIME,
                                                        JobType.PART_TIME,
                                                        JobType.INTERNSHIP,
                                                        JobType.CONTRACT,
                                                        JobType.FREELANCE,
                                                        JobType.TEMPORARY,
                                                    ].map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className='grid gap-2 flex-1 min-w-[200px]'>
                                            <Label htmlFor='workplace-type'>Workplace Type</Label>
                                            <Select
                                                value={formData.workplaceType}
                                                onValueChange={(value) => handleFormChange('workplaceType', value as WorkplaceTypes)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select workplace type' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[WorkplaceTypes.ONSITE, WorkplaceTypes.REMOTE, WorkplaceTypes.HYBRID].map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className='flex flex-wrap gap-4'>
                                        <div className='grid gap-2 flex-1 min-w-[200px]'>
                                            <Label htmlFor='job-location'>
                                                Job Location <span className='text-destructive'>*</span>
                                            </Label>
                                            <Input
                                                id='job-location'
                                                placeholder='Ex: New York, USA'
                                                value={formData.location}
                                                onChange={(e) => handleFormChange('location', e.target.value)}
                                                className={`${!validation.location.valid && validation.location.touched ? 'border-destructive' : ''}`}
                                            />
                                            {!validation.location.valid && validation.location.touched && (
                                                <FieldError message={validation.location.message} />
                                            )}
                                        </div>

                                        <div className='grid gap-2 flex-1 min-w-[200px]'>
                                            <Label htmlFor='apply-date'>
                                                Application Deadline <span className='text-destructive'>*</span>
                                            </Label>
                                            <Input
                                                id='apply-date'
                                                type='date'
                                                value={formData.lastDateToApply}
                                                onChange={(e) => handleFormChange('lastDateToApply', e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className={`${!validation.lastDateToApply.valid && validation.lastDateToApply.touched ? 'border-destructive' : ''}`}
                                            />
                                            {!validation.lastDateToApply.valid && validation.lastDateToApply.touched && (
                                                <FieldError message={validation.lastDateToApply.message} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {page === 3 && (
                                <div className='space-y-4'>
                                    <div>
                                        <Label htmlFor='skills'>
                                            Required Skills <span className='text-destructive'>*</span>
                                        </Label>

                                        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2'>
                                            {predefinedSkills.map((skill) => (
                                                <label
                                                    key={skill}
                                                    className={`
                                  flex items-center p-2 rounded-md border cursor-pointer
                                  ${formData.skills.includes(skill) ? 'bg-primary/10 border-primary' : 'border-input hover:border-primary/50'}
                                  transition-colors text-sm
                                `}
                                                >
                                                    <input
                                                        type='checkbox'
                                                        value={skill}
                                                        checked={(formData.skills ?? []).includes(skill)}
                                                        onChange={() => handleSkillChange(skill)}
                                                        className='mr-2'
                                                    />
                                                    <span>{skill}</span>
                                                </label>
                                            ))}
                                        </div>

                                        <div className='flex items-center gap-2 mt-4'>
                                            <Input
                                                id='new-skill'
                                                placeholder='Add custom skill'
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                className='flex-grow'
                                            />
                                            <Button
                                                type='button'
                                                onClick={addNewSkill}
                                                disabled={!newSkill.trim() || (formData.skills ?? []).includes(newSkill)}
                                            >
                                                Add Skill
                                            </Button>
                                        </div>

                                        <div className='mt-4'>
                                            <Label>Selected Skills</Label>
                                            <div className='flex flex-wrap gap-2 mt-2 p-3 bg-muted rounded-md min-h-16 items-start'>
                                                {(formData.skills ?? []).length > 0 ? (
                                                    (formData.skills ?? []).map((skill) => (
                                                        <Badge key={skill} className='px-3 py-1.5'>
                                                            {skill}
                                                            <button
                                                                type='button'
                                                                className='ml-2 hover:text-destructive'
                                                                onClick={() => handleSkillChange(skill)}
                                                                aria-label={`Remove ${skill}`}
                                                            >
                                                                ×
                                                            </button>
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <p className='text-muted-foreground text-sm'>No skills selected yet</p>
                                                )}
                                            </div>
                                            {!validation.skills.valid && validation.skills.touched && (
                                                <FieldError message={validation.skills.message} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {page === 4 && (
                                <div className='space-y-6'>
                                    <Tabs defaultValue='rejection'>
                                        <TabsList className='grid w-full grid-cols-2'>
                                            <TabsTrigger value='rejection'>Rejection Email</TabsTrigger>
                                            <TabsTrigger value='selection'>Selection Email</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value='rejection' className='space-y-4 mt-4'>
                                            <EmailTemplateHelper
                                                onInsertVariable={(variable) => insertTemplateVariable(variable, 'rejectionContent')}
                                            />

                                            <div>
                                                <Label htmlFor='rejectionContent'>
                                                    Rejection Email Template <span className='text-destructive'>*</span>
                                                </Label>
                                                <Textarea
                                                    id='rejectionContent'
                                                    placeholder='Write your rejection email template here'
                                                    value={formData.rejectionContent}
                                                    onChange={(e) => handleFormChange('rejectionContent', e.target.value)}
                                                    rows={10}
                                                    className={`font-mono text-sm ${!validation.rejectionContent.valid && validation.rejectionContent.touched ? 'border-destructive' : ''}`}
                                                />
                                                {!validation.rejectionContent.valid && validation.rejectionContent.touched && (
                                                    <FieldError message={validation.rejectionContent.message} />
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value='selection' className='space-y-4 mt-4'>
                                            <EmailTemplateHelper
                                                onInsertVariable={(variable) => insertTemplateVariable(variable, 'selectionContent')}
                                            />

                                            <div>
                                                <Label htmlFor='selectionContent'>
                                                    Selection Email Template <span className='text-destructive'>*</span>
                                                </Label>
                                                <Textarea
                                                    id='selectionContent'
                                                    placeholder='Write your selection email template here'
                                                    value={formData.selectionContent}
                                                    onChange={(e) => handleFormChange('selectionContent', e.target.value)}
                                                    rows={10}
                                                    className={`font-mono text-sm ${!validation.selectionContent.valid && validation.selectionContent.touched ? 'border-destructive' : ''}`}
                                                />
                                                {!validation.selectionContent.valid && validation.selectionContent.touched && (
                                                    <FieldError message={validation.selectionContent.message} />
                                                )}
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            )}

                            {page === 5 && (
                                <div className='space-y-6'>
                                    <Alert>
                                        <AlertTitle>Review your job posting</AlertTitle>
                                        <AlertDescription>Please review your job posting details before final submission.</AlertDescription>
                                    </Alert>

                                    {renderJobPreview()}

                                    {Object.values(validation).some((field) => !field.valid && field.touched) && (
                                        <Alert variant='destructive' className='mt-4'>
                                            <AlertCircle className='h-4 w-4' />
                                            <AlertTitle>Validation Errors</AlertTitle>
                                            <AlertDescription>
                                                Please fix the following errors before submitting:
                                                <ul className='list-disc pl-5 mt-2'>
                                                    {Object.entries(validation).map(([key, field]) =>
                                                        !field.valid && field.touched ? (
                                                            <li key={key} className='text-sm'>
                                                                {field.message}
                                                            </li>
                                                        ) : null
                                                    )}
                                                </ul>
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </form>
            </CardContent>

            <CardFooter className='flex justify-between border-t pt-4'>
                <Button type='button' variant='outline' onClick={prevPage} disabled={page === 1 || loading}>
                    Previous
                </Button>

                <div className='flex gap-2'>
                    {page < FORM_STEPS.length && (
                        <Button type='button' onClick={nextPage} disabled={loading}>
                            Next
                        </Button>
                    )}

                    {page === FORM_STEPS.length && (
                        <div className='flex gap-2'>
                            <Button type='button' variant='outline' onClick={(e) => handleSubmit(e as any, true)} disabled={loading || submitting}>
                                {submitting ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Saving...
                                    </>
                                ) : (
                                    'Save as Draft'
                                )}
                            </Button>

                            <Button
                                type='submit'
                                form='job-form'
                                disabled={loading || submitting || Object.values(validation).some((field) => !field.valid && field.touched)}
                                className='min-w-24'
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        {isEditMode ? 'Updating...' : 'Posting...'}
                                    </>
                                ) : isEditMode ? (
                                    'Update Job'
                                ) : (
                                    'Post Job'
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
