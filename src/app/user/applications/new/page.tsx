'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ky from 'ky';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';
import NavbarLayout from '@/layouts/navbar';
import { LoadingApplyFormSkeleton } from '@/components/elements/apply-skeleton';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, CheckCircle, Info, Briefcase, GraduationCap } from 'lucide-react';

import { uploadResume } from '@/appwrite/server/storage';
import { Job } from '@/model/job';
import { Application, ApplicationStatus, DegreeType, Education, Experience, Gender, JobSource } from '@/model/application';
import JobComponent from '@/components/elements/job';
import { FormSectionTitle, ProgressStepper } from '../../_lib/components';
import { clearFormDraft, FORM_STEPS, FormValidation, loadFormDraft, saveFormDraft } from '../../_lib/utils';
import { PersonalInfoForm } from '../../_lib/components/form-steps/personal-info-form';
import { ApplicationReview } from '../../_lib/components/form-steps/application-review';
import { CoverLetterForm } from '../../_lib/components/form-steps/cover-letter-form';
import { SkillsForm } from '../../_lib/components/form-steps/skills-form';
import { ExperienceForm } from '../../_lib/components/form-steps/experience-form';
import { EducationForm } from '../../_lib/components/form-steps/education-form';

const createEmptyApplication = (jobId: string): Application =>
    new Application(
        uuidv4(),
        '',
        '',
        '',
        '',
        '',
        Gender.Male,
        [new Education('', '', DegreeType.BACHELOR, 0)],
        [new Experience('', '', '', false, '', '', 0)],
        [],
        JobSource.ANGEL_LIST,
        '',
        [''],
        '',
        ApplicationStatus.APPLIED,
        jobId,
        new Date().toISOString(),
        ''
    );

export default function JobApplicationForm({ params }: { params: { id: string } }) {
    const { id } = params;
    const router = useRouter();

    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('+1');
    const [page, setPage] = useState(1);
    const [formData, setFormData] = useState<Application>(createEmptyApplication(id));
    const [validation, setValidation] = useState<FormValidation>({});
    const [showPreviewMode, setShowPreviewMode] = useState(false);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

    const autoSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    const validationErrors = useMemo(() => {
        return Object.entries(validation)
            .filter(([_, field]) => field.touched && !field.isValid)
            .map(([key, field]) => field.errorMessage);
    }, [validation]);

    const handleFieldChange = useCallback(
        (field: string, value: any, index = -1) => {
            setFormData((prev) => {
                let newData = { ...prev };

                if (field === 'education' && index >= 0) {
                    const newEducation = [...prev.education];
                    newEducation[index] = value;
                    newData.education = newEducation;
                } else if (field === 'experience' && index >= 0) {
                    const newExperience = [...prev.experience];
                    newExperience[index] = value;
                    newData.experience = newExperience;
                } else if (field === 'socialLinks' && index >= 0) {
                    const newSocialLinks = [...prev.socialLinks];
                    newSocialLinks[index] = value;
                    newData.socialLinks = newSocialLinks;
                } else {
                    (newData as any)[field] = value;
                }

                return newData;
            });

            const fieldKey = index >= 0 ? `${field}_${index}` : field;

            if ((field === 'education' || field === 'experience') && index >= 0) {
                Object.keys(value).forEach((nestedField) => {
                    if (['college', 'degree'].includes(nestedField) || ['profile', 'company', 'startDate'].includes(nestedField)) {
                        setValidation((prev) => ({
                            ...prev,
                            [`${field}_${index}_${nestedField}`]: {
                                ...prev[`${field}_${index}_${nestedField}`],
                                touched: true,
                                value: value[nestedField],
                                isValid: Boolean(value[nestedField]),
                                errorMessage: `${nestedField.charAt(0).toUpperCase() + nestedField.slice(1)} is required`,
                            },
                        }));
                    }
                });
            } else {
                setValidation((prev) => ({
                    ...prev,
                    [fieldKey]: {
                        ...prev[fieldKey],
                        touched: true,
                    },
                }));
            }

            if (autoSaveEnabled) {
                if (autoSaveTimerRef.current) {
                    clearTimeout(autoSaveTimerRef.current);
                }

                autoSaveTimerRef.current = setTimeout(() => {
                    const updatedFormData = { ...formData };
                    if (field === 'education' && index >= 0) {
                        updatedFormData.education[index] = value;
                    } else if (field === 'experience' && index >= 0) {
                        updatedFormData.experience[index] = value;
                    } else if (field === 'socialLinks' && index >= 0) {
                        updatedFormData.socialLinks[index] = value;
                    } else {
                        (updatedFormData as any)[field] = value;
                    }

                    saveFormDraft(updatedFormData);
                }, 1500);
            }
        },
        [formData, autoSaveEnabled]
    );

    const validateForm = useCallback(() => {
        let isValid = true;
        const newValidation: FormValidation = { ...validation };

        const requiredFields = [
            { key: 'firstName', label: 'First Name' },
            { key: 'lastName', label: 'Last Name' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone Number' },
            { key: 'currentLocation', label: 'Current Location' },
        ];

        requiredFields.forEach(({ key, label }) => {
            const value = (formData as any)[key];
            const isEmpty = !value || value.trim() === '';

            newValidation[key] = {
                value,
                isValid: !isEmpty,
                errorMessage: isEmpty ? `${label} is required` : '',
                touched: true,
            };

            if (isEmpty) isValid = false;
        });

        if (formData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const emailValid = emailRegex.test(formData.email);

            newValidation.email = {
                ...newValidation.email,
                isValid: emailValid,
                errorMessage: emailValid ? '' : 'Please enter a valid email address',
            };

            if (!emailValid) isValid = false;
        }

        formData.education.forEach((edu, index) => {
            const collegeValid = Boolean(edu.college && edu.college.trim());
            const degreeValid = Boolean(edu.degree && edu.degree.trim());

            newValidation[`education_${index}_college`] = {
                value: edu.college,
                isValid: collegeValid,
                errorMessage: collegeValid ? '' : 'College/University name is required',
                touched: true,
            };

            newValidation[`education_${index}_degree`] = {
                value: edu.degree,
                isValid: degreeValid,
                errorMessage: degreeValid ? '' : 'Degree name is required',
                touched: true,
            };

            newValidation[`education_${index}`] = {
                college: newValidation[`education_${index}_college`],
                degree: newValidation[`education_${index}_degree`],
            } as any;

            if (!collegeValid || !degreeValid) isValid = false;
        });

        formData.experience.forEach((exp, index) => {
            const profileValid = Boolean(exp.profile && exp.profile.trim());
            const companyValid = Boolean(exp.company && exp.company.trim());
            const startDateValid = Boolean(exp.startDate && exp.startDate.trim());

            newValidation[`experience_${index}_profile`] = {
                value: exp.profile,
                isValid: profileValid,
                errorMessage: profileValid ? '' : 'Job Title is required',
                touched: true,
            };

            newValidation[`experience_${index}_company`] = {
                value: exp.company,
                isValid: companyValid,
                errorMessage: companyValid ? '' : 'Company name is required',
                touched: true,
            };

            newValidation[`experience_${index}_startDate`] = {
                value: exp.startDate,
                isValid: startDateValid,
                errorMessage: startDateValid ? '' : 'Start Date is required',
                touched: true,
            };

            newValidation[`experience_${index}`] = {
                profile: newValidation[`experience_${index}_profile`],
                company: newValidation[`experience_${index}_company`],
                startDate: newValidation[`experience_${index}_startDate`],
            } as any;

            if (!profileValid || !companyValid || !startDateValid) isValid = false;
        });

        const skillsValid = formData.skills.length > 0;
        newValidation.skills = {
            value: formData.skills,
            isValid: skillsValid,
            errorMessage: skillsValid ? '' : 'Please select at least one skill',
            touched: true,
        };

        if (!skillsValid) isValid = false;

        const socialLinksValid = formData.socialLinks.some((link) => Boolean(link && link.trim()));
        formData.socialLinks.forEach((link, index) => {
            if (link && link.trim()) {
                let linkIsValid = true;
                try {
                    new URL(link);
                } catch (e) {
                    linkIsValid = false;
                }

                newValidation[`socialLink_${index}`] = {
                    value: link,
                    isValid: linkIsValid,
                    errorMessage: linkIsValid ? '' : 'Please enter a valid URL',
                    touched: true,
                };

                if (!linkIsValid) isValid = false;
            }
        });

        const resumeValid = Boolean(formData.resume);
        newValidation.resume = {
            value: formData.resume,
            isValid: resumeValid,
            errorMessage: resumeValid ? '' : 'Please upload your resume',
            touched: true,
        };

        if (!resumeValid) isValid = false;

        const coverLetterValid = Boolean(formData.coverLetter && formData.coverLetter.trim());
        newValidation.coverLetter = {
            value: formData.coverLetter,
            isValid: coverLetterValid,
            errorMessage: coverLetterValid ? '' : 'Please write a cover letter',
            touched: true,
        };

        if (!coverLetterValid) isValid = false;

        setValidation(newValidation);
        return isValid;
    }, [formData, validation]);

    const handleFiles = useCallback(
        async (files: FileList | null) => {
            if (!files || files.length === 0) {
                return;
            }

            const file = files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: 'File too large',
                    description: 'Please upload a file less than 5MB',
                    variant: 'destructive',
                });
                return;
            }

            try {
                setValidation((prev) => ({
                    ...prev,
                    resume: {
                        ...prev.resume,
                        touched: true,
                    },
                }));

                const id = await uploadResume(file);
                setFormData((prev) => ({ ...prev, resume: id }));

                setValidation((prev) => ({
                    ...prev,
                    resume: {
                        value: id,
                        isValid: Boolean(id),
                        errorMessage: '',
                        touched: true,
                    },
                }));

                if (autoSaveEnabled) {
                    saveFormDraft({
                        ...formData,
                        resume: id,
                    });
                }

                toast({
                    title: 'Resume uploaded',
                    description: 'Your resume has been successfully uploaded',
                });
            } catch (error) {
                console.error('Error uploading file', error);
                toast({
                    title: 'Upload error',
                    description: 'There was an error uploading your resume. Please try again.',
                    variant: 'destructive',
                });
            }
        },
        [formData, autoSaveEnabled]
    );
    const goToNextPage = useCallback(() => {
        const isPageValid = validatePage(page);

        if (isPageValid) {
            setPage((prev) => Math.min(prev + 1, FORM_STEPS.length));
            window.scrollTo(0, 0);
        }
    }, [page]);

    const goToPrevPage = useCallback(() => {
        setPage((prev) => Math.max(prev - 1, 1));
        window.scrollTo(0, 0);
    }, []);

    const goToPage = useCallback(
        (pageNum: number) => {
            if (pageNum <= page || pageNum === page + 1) {
                setPage(pageNum);
                window.scrollTo(0, 0);
            } else {
                const isCurrentValid = validatePage(page);
                if (isCurrentValid) {
                    setPage(pageNum);
                    window.scrollTo(0, 0);
                }
            }
        },
        [page]
    );

    const validatePage = useCallback(
        (pageNum: number): boolean => {
            switch (pageNum) {
                case 1: // Personal info
                    const personalFields = ['firstName', 'lastName', 'email', 'phone', 'currentLocation'];
                    personalFields.forEach((field) => {
                        handleFieldChange(field, (formData as any)[field]);
                    });

                    return personalFields.every((field) => {
                        const val = (formData as any)[field];
                        return Boolean(val && val.trim());
                    });

                case 2: // Education
                    return formData.education.every((edu, index) => {
                        if (!edu.college || !edu.degree) {
                            handleFieldChange(
                                'education',
                                {
                                    ...edu,
                                    college: edu.college,
                                    degree: edu.degree,
                                },
                                index
                            );
                            return false;
                        }
                        return true;
                    });

                case 3: // Experience
                    return formData.experience.every((exp, index) => {
                        if (!exp.profile || !exp.company || !exp.startDate) {
                            handleFieldChange(
                                'experience',
                                {
                                    ...exp,
                                    profile: exp.profile,
                                    company: exp.company,
                                    startDate: exp.startDate,
                                },
                                index
                            );
                            return false;
                        }
                        return true;
                    });

                case 4: // Skills & Social
                    if (formData.skills.length === 0) {
                        setValidation((prev) => ({
                            ...prev,
                            skills: {
                                value: [],
                                isValid: false,
                                errorMessage: 'Please select at least one skill',
                                touched: true,
                            },
                        }));
                        return false;
                    }
                    return true;

                case 5: // Cover letter
                    if (!formData.coverLetter || formData.coverLetter.trim() === '') {
                        handleFieldChange('coverLetter', formData.coverLetter);
                        return false;
                    }
                    return true;

                default:
                    return true;
            }
        },
        [formData, handleFieldChange]
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const isValid = validateForm();

        if (!isValid) {
            toast({
                title: 'Validation Error',
                description: 'Please fix the errors in the form before submitting.',
                variant: 'destructive',
            });
            setShowPreviewMode(true);
            return;
        }

        try {
            setSubmitting(true);

            const formattedData = {
                ...formData,
                phone: selectedCountry + ' ' + formData.phone,
            };

            await ky.post('/api/application', {
                json: {
                    ...formattedData,
                    education: JSON.stringify(formattedData.education),
                    experience: JSON.stringify(formattedData.experience),
                    socialLinks: JSON.stringify(formattedData.socialLinks),
                    skills: JSON.stringify(formattedData.skills),
                },
            });

            toast({
                title: 'Application Submitted',
                description: 'Your application has been successfully submitted.',
            });

            clearFormDraft(id);

            setSubmitted(true);
            setTimeout(() => {
                router.push('/posts');
            }, 3000);
        } catch (error: any) {
            toast({
                title: 'Error Submitting Application',
                description: error.message || 'An error occurred while submitting your application. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddSocialLink = useCallback(() => {
        setFormData((prev) => ({
            ...prev,
            socialLinks: [...prev.socialLinks, ''],
        }));
    }, []);

    const handleRemoveSocialLink = useCallback((index: number) => {
        setFormData((prev) => ({
            ...prev,
            socialLinks: prev.socialLinks.filter((_, i) => i !== index),
        }));
    }, []);

    const handleUpdateSocialLink = useCallback(
        (index: number, value: string) => {
            handleFieldChange('socialLinks', value, index);
        },
        [handleFieldChange]
    );

    useEffect(() => {
        if (!id) return;

        const fetchJob = async () => {
            try {
                setLoading(true);
                const res = (await ky.get(`/api/post?id=${id}`).json()) as Job;
                setJob(res);

                const savedDraft = loadFormDraft(id);
                if (savedDraft) {
                    setFormData({ ...savedDraft, jobId: id });
                    toast({
                        title: 'Draft Loaded',
                        description: 'Your previously saved application has been loaded.',
                    });
                } else {
                    setFormData((prev) => ({ ...prev, jobId: id }));
                }
            } catch (error) {
                console.error('Error fetching job', error);
                toast({
                    title: 'Error Loading Job',
                    description: 'Failed to load job details. Please try refreshing the page.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchJob();

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [id]);

    useEffect(() => {
        if (autoSaveEnabled && id && !loading && !submitted) {
            const saveTimer = setTimeout(() => {
                saveFormDraft(formData);
            }, 5000);

            return () => clearTimeout(saveTimer);
        }
    }, [formData, autoSaveEnabled, id, loading, submitted]);

    if (!id) {
        return (
            <NavbarLayout>
                <div className='flex items-center justify-center h-[calc(100vh-4rem)]'>
                    <div className='flex flex-col items-center space-y-4'>
                        <AlertCircle className='h-16 w-16 text-destructive mb-2' />
                        <p className='text-lg font-semibold'>Invalid Application ID</p>
                        <Button onClick={() => router.push('/posts')}>Go back to job listings</Button>
                    </div>
                </div>
            </NavbarLayout>
        );
    }

    return (
        <NavbarLayout>
            <div className='container max-w-6xl mx-auto py-6 px-4'>
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    {loading ? (
                        <div className='col-span-full'>
                            <LoadingApplyFormSkeleton />
                        </div>
                    ) : job ? (
                        <>
                            {/* Job details sidebar */}
                            <div className='col-span-1'>
                                <div className='lg:sticky lg:top-20'>
                                    <JobComponent job={job} />

                                    {!submitted && (
                                        <Card className='mt-4'>
                                            <CardContent className='pt-4'>
                                                <div className='flex items-center justify-between'>
                                                    <Label htmlFor='auto-save' className='flex items-center space-x-2 cursor-pointer'>
                                                        <span>Auto-save draft</span>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <Info className='w-4 h-4 text-muted-foreground' />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className='max-w-xs'>
                                                                        When enabled, your application will be saved locally as you type
                                                                    </p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </Label>
                                                    <Switch id='auto-save' checked={autoSaveEnabled} onCheckedChange={setAutoSaveEnabled} />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>

                            {/* Application form */}
                            <div className='col-span-1 lg:col-span-2'>
                                {submitted ? (
                                    <Card>
                                        <CardContent className='pt-8 pb-8'>
                                            <div className='flex flex-col items-center justify-center text-center space-y-4'>
                                                <div className='bg-primary/10 p-3 rounded-full'>
                                                    <CheckCircle className='h-12 w-12 text-primary' />
                                                </div>
                                                <h2 className='text-2xl font-bold'>Application Submitted!</h2>
                                                <p className='text-muted-foreground max-w-md'>
                                                    Thank you for submitting your application. We &#39;ve received your information and will be in
                                                    touch soon.
                                                </p>
                                                <Button className='mt-4' onClick={() => router.push('/posts')}>
                                                    Browse More Jobs
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{showPreviewMode ? 'Review Application' : 'Application Form'}</CardTitle>
                                            <CardDescription>
                                                {showPreviewMode
                                                    ? 'Review your application before submission'
                                                    : `Step ${page} of ${FORM_STEPS.length}: ${FORM_STEPS[page - 1].title}`}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent>
                                            <form id='application-form' onSubmit={handleSubmit}>
                                                {!showPreviewMode ? (
                                                    <>
                                                        <ProgressStepper
                                                            currentStep={page}
                                                            totalSteps={FORM_STEPS.map((s) => s.id)}
                                                            onStepClick={goToPage}
                                                        />

                                                        <AnimatePresence mode='wait'>
                                                            <motion.div
                                                                key={`page-${page}`}
                                                                initial={{ opacity: 0, x: 20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: -20 }}
                                                                transition={{ duration: 0.2 }}
                                                            >
                                                                {page === 1 && (
                                                                    <PersonalInfoForm
                                                                        formData={formData}
                                                                        validation={validation}
                                                                        setFormData={setFormData}
                                                                        onFieldChange={handleFieldChange}
                                                                        selectedCountry={selectedCountry}
                                                                        setSelectedCountry={setSelectedCountry}
                                                                    />
                                                                )}

                                                                {page === 2 && (
                                                                    <div className='space-y-6'>
                                                                        <FormSectionTitle
                                                                            title='Education'
                                                                            subtitle='Add your educational background'
                                                                            icon={<GraduationCap className='w-5 h-5 text-primary' />}
                                                                        />

                                                                        {formData.education.map((edu, index) => (
                                                                            <EducationForm
                                                                                key={`edu-${index}`}
                                                                                education={edu}
                                                                                index={index}
                                                                                formData={formData}
                                                                                validation={validation}
                                                                                setFormData={setFormData}
                                                                                onFieldChange={handleFieldChange}
                                                                            />
                                                                        ))}

                                                                        <Button
                                                                            type='button'
                                                                            variant='outline'
                                                                            onClick={() => {
                                                                                setFormData({
                                                                                    ...formData,
                                                                                    education: [
                                                                                        ...formData.education,
                                                                                        new Education('', '', DegreeType.BACHELOR, 0),
                                                                                    ],
                                                                                });
                                                                            }}
                                                                        >
                                                                            Add Another Education
                                                                        </Button>
                                                                    </div>
                                                                )}

                                                                {page === 3 && (
                                                                    <div className='space-y-6'>
                                                                        <FormSectionTitle
                                                                            title='Experience'
                                                                            subtitle='Add your work experience'
                                                                            icon={<Briefcase className='w-5 h-5 text-primary' />}
                                                                        />

                                                                        {formData.experience.map((exp, index) => (
                                                                            <ExperienceForm
                                                                                key={`exp-${index}`}
                                                                                experience={exp}
                                                                                index={index}
                                                                                formData={formData}
                                                                                validation={validation}
                                                                                setFormData={setFormData}
                                                                                onFieldChange={handleFieldChange}
                                                                            />
                                                                        ))}

                                                                        <Button
                                                                            type='button'
                                                                            variant='outline'
                                                                            onClick={() => {
                                                                                setFormData({
                                                                                    ...formData,
                                                                                    experience: [
                                                                                        ...formData.experience,
                                                                                        new Experience('', '', '', false, '', '', 0),
                                                                                    ],
                                                                                });
                                                                            }}
                                                                        >
                                                                            Add Another Experience
                                                                        </Button>
                                                                    </div>
                                                                )}

                                                                {page === 4 && (
                                                                    <SkillsForm
                                                                        formData={formData}
                                                                        validation={validation}
                                                                        predefinedSkills={job?.skills ?? []}
                                                                        onFieldChange={handleFieldChange}
                                                                        onAddSocialLink={handleAddSocialLink}
                                                                        onRemoveSocialLink={handleRemoveSocialLink}
                                                                        onUpdateSocialLink={handleUpdateSocialLink}
                                                                    />
                                                                )}

                                                                {page === 5 && (
                                                                    <CoverLetterForm
                                                                        formData={formData}
                                                                        validation={validation}
                                                                        onFieldChange={handleFieldChange}
                                                                    />
                                                                )}
                                                            </motion.div>
                                                        </AnimatePresence>
                                                    </>
                                                ) : (
                                                    <ApplicationReview formData={formData} validationErrors={validationErrors} />
                                                )}

                                                <input
                                                    type='file'
                                                    id='resume-file'
                                                    accept='.pdf,.doc,.docx'
                                                    onChange={(e) => handleFiles(e.target.files)}
                                                    className='hidden'
                                                />
                                            </form>
                                        </CardContent>

                                        <CardFooter className='flex justify-between border-t p-6'>
                                            {showPreviewMode ? (
                                                <>
                                                    <Button
                                                        type='button'
                                                        variant='outline'
                                                        onClick={() => {
                                                            setShowPreviewMode(false);
                                                            setPage(
                                                                validationErrors.length > 0
                                                                    ? Math.min(
                                                                          ...Object.keys(validation)
                                                                              .filter((k) => validation[k].touched && !validation[k].isValid)
                                                                              .map((k) => {
                                                                                  if (k.startsWith('education')) return 2;
                                                                                  if (k.startsWith('experience')) return 3;
                                                                                  if (
                                                                                      k.startsWith('skills') ||
                                                                                      k.startsWith('social') ||
                                                                                      k === 'resume'
                                                                                  )
                                                                                      return 4;
                                                                                  if (k === 'coverLetter') return 5;
                                                                                  return 1;
                                                                              })
                                                                      )
                                                                    : 1
                                                            );
                                                        }}
                                                    >
                                                        Back to Editing
                                                    </Button>

                                                    <Button
                                                        type='submit'
                                                        form='application-form'
                                                        disabled={submitting || validationErrors.length > 0}
                                                        className='relative'
                                                    >
                                                        {submitting ? (
                                                            <>
                                                                <span className='opacity-0'>Submit Application</span>
                                                                <span className='absolute inset-0 flex items-center justify-center'>
                                                                    <svg
                                                                        className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                                                                        xmlns='http://www.w3.org/2000/svg'
                                                                        fill='none'
                                                                        viewBox='0 0 24 24'
                                                                    >
                                                                        <circle
                                                                            className='opacity-25'
                                                                            cx='12'
                                                                            cy='12'
                                                                            r='10'
                                                                            stroke='currentColor'
                                                                            strokeWidth='4'
                                                                        ></circle>
                                                                        <path
                                                                            className='opacity-75'
                                                                            fill='currentColor'
                                                                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                                                        ></path>
                                                                    </svg>
                                                                    <span>Submitting...</span>
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>Submit Application</>
                                                        )}
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button type='button' variant='outline' onClick={goToPrevPage} disabled={page === 1}>
                                                        Previous
                                                    </Button>

                                                    {page < FORM_STEPS.length ? (
                                                        <Button type='button' onClick={goToNextPage}>
                                                            Continue
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            type='button'
                                                            onClick={() => {
                                                                const isValid = validateForm();
                                                                setShowPreviewMode(true);

                                                                if (!isValid) {
                                                                    toast({
                                                                        title: 'Please fix validation errors',
                                                                        description: 'Some required information is missing or invalid',
                                                                        variant: 'destructive',
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            Review Application
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </CardFooter>
                                    </Card>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className='col-span-full'>
                            <LoadingApplyFormSkeleton />
                        </div>
                    )}
                </div>
            </div>
        </NavbarLayout>
    );
}
