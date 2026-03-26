'use client';

import React, { useState, FormEvent, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ky from 'ky';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@jobify/ui/card';
import { Button } from '@jobify/ui/button';
import { toast } from '@jobify/ui/use-toast';
import { Badge } from '@jobify/ui/badge';
import { Job, JobState, JobType, WorkplaceTypes } from '@jobify/domain/job';
import { FORM_STEPS, REJECTION_EMAIL_CONTENT, SELECTION_EMAIL_CONTENT, ValidationState } from '@/app/_lib/utils';
import { FormProgress } from './form-progress';
import { StepBasicInfo } from './step-basic-info';
import { StepWorkplace } from './step-workplace';
import { StepSkills } from './step-skills';
import { StepEmailTemplates } from './step-email-templates';
import { StepReview } from './step-review';

export interface JobPostFormProps {
    initialData?: Job | null;
    isEditMode?: boolean;
    onSuccess?: (job: Job) => void;
    onCancel?: () => void;
}

export default function JobPostForm({ initialData, isEditMode = false, onSuccess }: JobPostFormProps) {
    const router = useRouter();

    const [page, setPage] = useState(1);
    const [newSkill, setNewSkill] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

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
            undefined
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
    }, [validateCurrentPage]);

    const prevPage = useCallback(() => {
        setPage((prev) => Math.max(prev - 1, 1));
        window.scrollTo(0, 0);
    }, []);

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
    }, []);

    const addNewSkill = useCallback(() => {
        if (newSkill && !(formData.skills ?? []).includes(newSkill)) {
            setFormData((prev) => ({
                ...prev,
                skills: [...(prev.skills ?? []), newSkill],
            }));
            setNewSkill('');
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
        },
        [formData]
    );

    const handleFormChange = useCallback((field: keyof Job, value: unknown) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
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

            if (onSuccess) {
                onSuccess(updatedJob as Job);
            } else {
                setTimeout(() => {
                    router.push('/posts');
                }, 1500);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (isEditMode && initialData) {
            validateForm();
        }
    }, [isEditMode, initialData]);

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
                            {page === 1 && <StepBasicInfo formData={formData} validation={validation} onChange={handleFormChange} />}
                            {page === 2 && <StepWorkplace formData={formData} validation={validation} onChange={handleFormChange} />}
                            {page === 3 && (
                                <StepSkills
                                    formData={formData}
                                    validation={validation}
                                    newSkill={newSkill}
                                    onNewSkillChange={setNewSkill}
                                    onSkillToggle={handleSkillChange}
                                    onAddCustomSkill={addNewSkill}
                                />
                            )}
                            {page === 4 && (
                                <StepEmailTemplates
                                    formData={formData}
                                    validation={validation}
                                    onChange={handleFormChange}
                                    onInsertTemplateVariable={insertTemplateVariable}
                                />
                            )}
                            {page === 5 && <StepReview formData={formData} validation={validation} />}
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
                            <Button type='button' variant='outline' onClick={(e) => handleSubmit(e as unknown as FormEvent<HTMLFormElement>, true)} disabled={loading || submitting}>
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
