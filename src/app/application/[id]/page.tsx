'use client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import NavbarLayout from '@/layouts/navbar';
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries } from '@/utils';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { XIcon } from '@/elements/icon';
import { Application, ApplicationStatus, DegreeType, Education, Experience, Gender, JobSource } from '@/model/application';
import { v4 as uuidv4 } from 'uuid';
import ky from 'ky';
import { toast } from '@/components/ui/use-toast';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { Job } from '@/model/job';
import { LoadingApplyFormSkeleton } from '@/elements/apply-skeleton';
import JobComponent from '@/elements/job';
import { uploadResume } from '@/appwrite/server/storage';
import { Textarea } from '@/components/ui/textarea';

export default function Component({ params }: { params: { id: string } }) {
    const { id } = params;
    const router = useRouter();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState<Application>(
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
            '',
            new Date().toISOString(),
            ''
        )
    );
    const [page, setPage] = useState(1);
    const [selectedCountry, setSelectedCountry] = useState('+91');

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = (await ky.get(`/api/post?id=${id}`).json()) as Job;
                setJob(res);
                setFormData((prev) => ({ ...prev, jobId: res.id }));
            } catch (error) {
                console.log('Error fetching job', error);
            } finally {
                setLoading(false);
            }
        };
        setLoading(true);
        fetchJob();
    }, [id]);

    if (!id) {
        return (
            <NavbarLayout>
                <div className='flex items-center justify-center h-[calc(100vh-4rem)]'>
                    <div className='flex flex-col items-center space-y-4'>
                        <p className='text-lg font-semibold'>Invalid Application ID</p>
                        <Button className='text-white px-4 py-2 rounded' onClick={() => router.push('/posts')}>
                            Go back to the posts page
                        </Button>
                    </div>
                </div>
            </NavbarLayout>
        );
    }

    const validateApplication = (data: Application) => {
        if (!data.firstName) {
            throw new Error('First Name is required');
        }
        if (!data.lastName) {
            throw new Error('Last Name is required');
        }
        if (!data.email) {
            throw new Error('Email is required');
        }
        if (!data.phone) {
            throw new Error('Phone is required');
        }
        const phone = selectedCountry + ' ' + data.phone;
        setFormData({ ...data, phone });
        if (!data.currentLocation) {
            throw new Error('Current Address is required');
        }
        if (!data.education || data.education.length === 0) {
            throw new Error('Education is required');
        }
        if (!data.experience || data.experience.length === 0) {
            throw new Error('Experience is required');
        }
        if (!data.skills || data.skills.length === 0) {
            throw new Error('Skills are required');
        }
        if (!data.socialLinks || data.socialLinks.length === 0) {
            throw new Error('Social Links are required');
        }
        if (!data.coverLetter) {
            throw new Error('Cover Letter is required');
        }
        if (!data.resume) {
            throw new Error('Resume is required');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            validateApplication(formData);
            setSubmitting(true);
            await ky.post('/api/application', {
                json: {
                    ...formData,
                    education: JSON.stringify(formData.education),
                    experience: JSON.stringify(formData.experience),
                    socialLinks: JSON.stringify(formData.socialLinks),
                    skills: JSON.stringify(formData.skills),
                },
            });
            toast({
                title: 'Application Submitted',
                description: 'Your application has been submitted successfully',
            });
            setSubmitted(true);
        } catch (error: any) {
            toast({
                title: 'Error while submitting application',
                description: error.message ?? 'An error occurred while submitting the application',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const nextPage = () => setPage((prev) => prev + 1);
    const prevPage = () => setPage((prev) => prev - 1);

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) {
            return;
        }
        const file = files[0];
        try {
            const id = await uploadResume(file);
            setFormData({ ...formData, resume: id });
        } catch (error) {
            console.log('Error uploading file', error);
        }
    };

    return (
        <NavbarLayout>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto'>
                {loading ? (
                    <>
                        <LoadingApplyFormSkeleton />
                    </>
                ) : (
                    job && (
                        <>
                            <div className='col-span-1 w-full'>
                                <JobComponent job={job} />
                            </div>
                            <div className='col-span-2 w-full'>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Application Form</CardTitle>
                                        <CardDescription>Fill out the form to apply for a job. Page {page} of 5</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form className='space-y-6' onSubmit={handleSubmit}>
                                            {page === 1 && (
                                                <>
                                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                        <div>
                                                            <Label htmlFor='first-name'>First Name</Label>
                                                            <Input
                                                                id='first-name'
                                                                placeholder='First Name'
                                                                value={formData.firstName}
                                                                onChange={(e) =>
                                                                    setFormData({
                                                                        ...formData,
                                                                        firstName: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor='last-name'>Last Name</Label>
                                                            <Input
                                                                id='last-name'
                                                                placeholder='Last Name'
                                                                value={formData.lastName}
                                                                onChange={(e) =>
                                                                    setFormData({
                                                                        ...formData,
                                                                        lastName: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Label htmlFor='email'>Email Address</Label>
                                                        <Input
                                                            id='email'
                                                            placeholder='Email Address'
                                                            type='email'
                                                            value={formData.email}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    email: e.target.value,
                                                                })
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label htmlFor='phone'>Phone Number</Label>
                                                        <div className='flex gap-2'>
                                                            <select
                                                                value={selectedCountry}
                                                                onChange={(e) => setSelectedCountry(e.target.value)}
                                                                className='w-[100px] p-2 border border-gray-300 rounded'
                                                            >
                                                                {countries.map((country, index) => (
                                                                    <option key={index} value={country.dial_code}>
                                                                        {country.flag} {country.dial_code}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            <Input
                                                                id='phone'
                                                                placeholder='Phone Number'
                                                                className='flex-grow'
                                                                value={formData.phone}
                                                                onChange={(e) =>
                                                                    setFormData({
                                                                        ...formData,
                                                                        phone: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Label htmlFor='current-address'>Current Address</Label>
                                                        <Input
                                                            id='current-address'
                                                            placeholder='Current Address'
                                                            value={formData.currentLocation}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    currentLocation: e.target.value,
                                                                })
                                                            }
                                                        />
                                                    </div>

                                                    <div className='flex flex-wrap gap-4'>
                                                        <div className='grid gap-2 flex-1 min-w-[200px]'>
                                                            <Label htmlFor='gender'>Gender</Label>
                                                            <Select
                                                                value={formData.gender}
                                                                onValueChange={(value) =>
                                                                    setFormData({
                                                                        ...formData,
                                                                        gender: value as Gender,
                                                                    })
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder='Select Gender' />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {[Gender.Female, Gender.Male, Gender.Other].map((item, index) => (
                                                                        <SelectItem key={`gender-${index}`} value={item}>
                                                                            {item}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className='grid gap-2 flex-1 min-w-[200px]'>
                                                            <Label htmlFor='source'>How did you hear about the job?</Label>
                                                            <Select
                                                                value={formData.source}
                                                                onValueChange={(value) =>
                                                                    setFormData({
                                                                        ...formData,
                                                                        source: value as JobSource,
                                                                    })
                                                                }
                                                            >
                                                                <SelectTrigger className='max-w-xs'>
                                                                    <SelectValue placeholder='Select a category' />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {[
                                                                        JobSource.LINKEDIN,
                                                                        JobSource.ANGEL_LIST,
                                                                        JobSource.REFERRAL,
                                                                        JobSource.JOB_PORTAL,
                                                                        JobSource.COMPANY_WEBSITE,
                                                                    ].map((type, index) => (
                                                                        <SelectItem key={`source-${index}`} value={type}>
                                                                            {type}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {page === 2 && (
                                                <>
                                                    {formData.education.map((edu, index) => (
                                                        <EducationForm
                                                            key={`edu-${index}`}
                                                            education={edu}
                                                            index={index}
                                                            formData={formData}
                                                            setFormData={setFormData}
                                                        />
                                                    ))}
                                                    <Button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setFormData({
                                                                ...formData,
                                                                education: [...formData.education, new Education('', '', DegreeType.BACHELOR, 0)],
                                                            });
                                                        }}
                                                        variant='outline'
                                                    >
                                                        Add Another Education
                                                    </Button>
                                                </>
                                            )}

                                            {page === 3 && (
                                                <>
                                                    {formData.experience.map((exp, index) => (
                                                        <ExperienceForm
                                                            key={`exp-${index}`}
                                                            experience={exp}
                                                            index={index}
                                                            formData={formData}
                                                            setFormData={setFormData}
                                                        />
                                                    ))}
                                                    <Button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setFormData({
                                                                ...formData,
                                                                experience: [...formData.experience, new Experience('', '', '', false, '', '', 0)],
                                                            });
                                                        }}
                                                        variant='outline'
                                                    >
                                                        Add Another Experience
                                                    </Button>
                                                </>
                                            )}

                                            {page === 4 && (
                                                <>
                                                    <SkillsForm formData={formData} setFormData={setFormData} predefinedSkills={job?.skills ?? []} />
                                                    <div>
                                                        <Label htmlFor='resume'>Upload Resume</Label>
                                                        <Input
                                                            type='file'
                                                            id='resume'
                                                            accept='.pdf,.doc,.docx'
                                                            onChange={(e) => handleFiles(e.target.files)}
                                                        />
                                                    </div>

                                                    {(formData.socialLinks ?? []).map((link, index) => (
                                                        <SocialLinksForm
                                                            key={`link-${index}`}
                                                            formData={formData}
                                                            setFormData={setFormData}
                                                            index={index}
                                                        />
                                                    ))}
                                                </>
                                            )}

                                            {page === 5 && (
                                                <div>
                                                    <Label htmlFor='cover-letter'>Cover Letter</Label>
                                                    <Textarea
                                                        value={formData.coverLetter}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                coverLetter: e.target.value,
                                                            })
                                                        }
                                                        placeholder='Write a cover letter'
                                                    />
                                                </div>
                                            )}

                                            <div className='flex justify-between mt-6'>
                                                <Button variant='outline' type='button' onClick={prevPage} disabled={page === 1}>
                                                    Previous
                                                </Button>
                                                {page < 5 && (
                                                    <Button type='button' onClick={nextPage} disabled={page === 5}>
                                                        Next
                                                    </Button>
                                                )}
                                                {page === 5 && (
                                                    <Button disabled={submitting || submitted} type='submit'>
                                                        {submitting ? (
                                                            <>
                                                                <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                                                                {'Submitting...'}
                                                            </>
                                                        ) : (
                                                            <>{submitted ? 'Submitted' : 'Submit'}</>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )
                )}
            </div>
        </NavbarLayout>
    );
}

const RemoveButton = ({ onClick }: { onClick: () => void }) => (
    <Button variant='destructive' onClick={onClick} className='h-8 w-8 p-1'>
        <XIcon className='h-4 w-4' />
    </Button>
);

const updateFormDataArray = (formData: Application, setFormData: (data: Application) => void, arrayName: string, index: number, newValue: any) => {
    const newArray = [...(formData as any)[arrayName]];
    newArray[index] = newValue;
    setFormData({ ...formData, [arrayName]: newArray });
};

const EducationForm = ({
    education,
    index,
    formData,
    setFormData,
}: {
    education: Education;
    index: number;
    formData: Application;
    setFormData: (data: Application) => void;
}) => (
    <div className='space-y-4 relative flex items-start gap-4'>
        <div className='flex-grow space-y-4'>
            <Input
                value={education.college}
                onChange={(e) =>
                    updateFormDataArray(formData, setFormData, 'education', index, {
                        ...education,
                        college: e.target.value,
                    })
                }
                placeholder='College Name'
            />
            <Input
                value={education.degree}
                onChange={(e) =>
                    updateFormDataArray(formData, setFormData, 'education', index, {
                        ...education,
                        degree: e.target.value,
                    })
                }
                placeholder='Degree'
            />
            <Select
                value={education.degreeType}
                onValueChange={(value) =>
                    updateFormDataArray(formData, setFormData, 'education', index, {
                        ...education,
                        degreeType: value,
                    })
                }
            >
                <SelectTrigger>
                    <SelectValue placeholder='Select Degree Type' />
                </SelectTrigger>
                <SelectContent>
                    {Object.values(DegreeType).map((type) => (
                        <SelectItem key={type} value={type}>
                            {type}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div>
                <Label htmlFor='marks'>Marks /SGPA</Label>
                <div className='flex gap-2'>
                    <Slider
                        defaultValue={[education.sgpa]}
                        onValueChange={(value) =>
                            updateFormDataArray(formData, setFormData, 'education', index, {
                                ...education,
                                sgpa: value[0],
                            })
                        }
                        max={10}
                        min={0}
                        step={0.1}
                    />
                    <Badge variant='secondary'>{education.sgpa}</Badge>
                </div>
            </div>
        </div>
        {formData.education.length > 1 && (
            <RemoveButton
                onClick={() => {
                    const newEducation = formData.education.filter((_, i) => i !== index);
                    setFormData({ ...formData, education: newEducation });
                }}
            />
        )}
    </div>
);

const ExperienceForm = ({
    experience,
    index,
    formData,
    setFormData,
}: {
    experience: Experience;
    index: number;
    formData: Application;
    setFormData: (data: Application) => void;
}) => (
    <div className='space-y-4 relative flex items-start gap-4'>
        <div className='flex-grow space-y-4'>
            <div className='flex flex-col space-y-4'>
                <Input
                    value={experience.profile}
                    onChange={(e) =>
                        updateFormDataArray(formData, setFormData, 'experience', index, {
                            ...experience,
                            profile: e.target.value,
                        })
                    }
                    placeholder='Job Profile'
                />
                <Input
                    value={experience.company}
                    onChange={(e) =>
                        updateFormDataArray(formData, setFormData, 'experience', index, {
                            ...experience,
                            company: e.target.value,
                        })
                    }
                    placeholder='Company Name'
                />
                <Input
                    value={experience.employer}
                    onChange={(e) =>
                        updateFormDataArray(formData, setFormData, 'experience', index, {
                            ...experience,
                            employer: e.target.value,
                        })
                    }
                    placeholder='Employer Name'
                />
                <div className='flex items-center gap-4'>
                    <label className='flex items-center gap-2'>
                        <Switch
                            checked={experience.isCurrent}
                            onCheckedChange={(checked) =>
                                updateFormDataArray(formData, setFormData, 'experience', index, {
                                    ...experience,
                                    isCurrent: checked,
                                })
                            }
                        />
                        <span>Current Job</span>
                    </label>
                    <Input
                        type='date'
                        placeholder='From'
                        value={experience.startDate}
                        onChange={(e) =>
                            updateFormDataArray(formData, setFormData, 'experience', index, {
                                ...experience,
                                startDate: e.target.value,
                            })
                        }
                    />
                    <Input
                        type='date'
                        disabled={experience.isCurrent}
                        value={experience.endDate}
                        onChange={(e) =>
                            updateFormDataArray(formData, setFormData, 'experience', index, {
                                ...experience,
                                endDate: e.target.value,
                            })
                        }
                        placeholder='To'
                    />
                </div>
                <div className='flex items-center gap-4'>
                    <Label className='mt-2'>Experience</Label>
                    <Slider
                        defaultValue={[experience.yoe]}
                        onValueChange={(value) =>
                            updateFormDataArray(formData, setFormData, 'experience', index, {
                                ...experience,
                                yoe: value[0],
                            })
                        }
                        max={50}
                        min={0}
                        step={0.5}
                        className='flex-grow'
                    />
                    <Badge variant='secondary'>{experience.yoe} Years</Badge>
                </div>
            </div>
        </div>
        {formData.experience.length > 1 && (
            <RemoveButton
                onClick={() => {
                    const newExperience = formData.experience.filter((_, i) => i !== index);
                    setFormData({ ...formData, experience: newExperience });
                }}
            />
        )}
    </div>
);

const SkillsForm = ({
    formData,
    setFormData,
    predefinedSkills,
}: {
    formData: Application;
    setFormData: (data: Application) => void;
    predefinedSkills: string[];
}) => (
    <>
        <div className='flex flex-wrap gap-2'>
            {predefinedSkills.map((skill, index) => (
                <label key={index} className='flex items-center space-x-2'>
                    <input
                        type='checkbox'
                        value={skill}
                        checked={(formData.skills ?? []).includes(skill)}
                        onChange={(e) => {
                            const newSkills = e.target.checked ? [...formData.skills, skill] : formData.skills.filter((s) => s !== skill);
                            setFormData({ ...formData, skills: newSkills });
                        }}
                        className='checkbox'
                    />
                    <span>{skill}</span>
                </label>
            ))}
        </div>
        <div className='mt-2'>
            <div className='flex flex-wrap gap-2 mt-1'>
                {(formData.skills ?? []).map((skill, index) => (
                    <Badge key={index} variant='secondary' className='text-sm'>
                        {skill}
                        <button
                            className='ml-1 text-xs'
                            onClick={() => {
                                const newSkills = formData.skills.filter((_, i) => i !== index);
                                setFormData({ ...formData, skills: newSkills });
                            }}
                        >
                            ×
                        </button>
                    </Badge>
                ))}
            </div>
        </div>
    </>
);

const SocialLinksForm = ({ formData, setFormData, index }: { formData: Application; setFormData: (data: Application) => void; index: number }) => (
    <div className='flex items-center gap-4'>
        <Label>Social Link {index + 1}</Label>
        <div className='flex-grow'>
            <div className='flex items-center gap-2'>
                <Input
                    value={formData.socialLinks[index]}
                    onChange={(e) => updateFormDataArray(formData, setFormData, 'socialLinks', index, e.target.value)}
                    placeholder='Social Link'
                    className='flex-grow'
                />
                {index === formData.socialLinks.length - 1 && (
                    <Button
                        type='button'
                        onClick={() =>
                            setFormData({
                                ...formData,
                                socialLinks: [...formData.socialLinks, ''],
                            })
                        }
                        variant='outline'
                        className='ml-2'
                    >
                        Add
                    </Button>
                )}
            </div>
        </div>
        {formData.socialLinks.length > 1 && (
            <RemoveButton
                onClick={() => {
                    const newSocialLinks = formData.socialLinks.filter((_, i) => i !== index);
                    setFormData({
                        ...formData,
                        socialLinks: newSocialLinks,
                    });
                }}
            />
        )}
    </div>
);
