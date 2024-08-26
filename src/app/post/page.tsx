'use client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, FileIcon, TrophyIcon } from '@/elements/icon';
import { FormEvent, useState } from 'react';
import { EditorElement } from '@/elements/editor';
import { EditorState, ContentState, convertFromHTML } from 'draft-js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NavbarLayout from '@/layouts/navbar';
import { predefinedSkills } from '@/utils';
import { Job, JobType, WorkplaceTypes } from '@/model/job';
import ky from 'ky';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { ReloadIcon } from '@radix-ui/react-icons';

export default function Component() {
    const [jobDescription, setJobDescription] = useState(EditorState.createEmpty());
    const [rejectionContent, setRejectionContent] = useState(
        EditorState.createWithContent(
            ContentState.createFromBlockArray(
                convertFromHTML(
                    '<p> Thank you for applying.We have gone through your application and regret to inform you that we are not proceeding with your application at this time. All the best for your future endeavors. </p>'
                ).contentBlocks
            )
        )
    );
    const [selectionContent, setSelectionContent] = useState(
        EditorState.createWithContent(
            ContentState.createFromBlockArray(
                convertFromHTML(
                    '<p> Congratulations! We are pleased to inform you that you have been selected for the further process. We are excited to have you on board and look forward to working with you. </p>'
                ).contentBlocks
            )
        )
    );

    const isDateAlreadyPassed = (date: string) => {
        return new Date(date) < new Date();
    };

    const [newSkill, setNewSkill] = useState('');
    const [page, setPage] = useState(1);

    const nextPage = () => {
        setPage((prev) => prev + 1);
    };
    const prevPage = () => {
        setPage((prev) => prev - 1);
    };

    const handleSkillChange = (skill: string) => {
        setFormData({
            ...formData,
            skills: formData.skills?.includes(skill) ? formData.skills.filter((s) => s !== skill) : [...(formData.skills ?? []), skill],
        });
    };

    const addNewSkill = () => {
        if (newSkill && !(formData.skills ?? []).includes(newSkill)) {
            setFormData({
                ...formData,
                skills: [...(formData.skills ?? []), newSkill],
            });
            setNewSkill('');
        }
    };
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Job>(
        new Job(
            uuidv4(),
            '',
            '',
            '',
            JobType.FULL_TIME,
            WorkplaceTypes.ONSITE,
            '',
            '',
            [],
            rejectionContent.getCurrentContent().getPlainText(),
            selectionContent.getCurrentContent().getPlainText(),
            new Date().toISOString(),
            '',
            []
        )
    );

    const validateJob = (job: Job) => {
        if (!job.profile) {
            throw new Error('Job profile is required');
        }
        if (!job.description) {
            throw new Error('Job description is required');
        }
        if (!job.company) {
            throw new Error('Company name is required');
        }
        if (job.description.length < 30) {
            throw new Error('Job description must be at least 30 characters');
        }
        if (!job.lastDateToApply) {
            throw new Error('Last date to apply is required');
        }
        if (isDateAlreadyPassed(job.lastDateToApply)) {
            throw new Error('Last date to apply must be a future date');
        }
        if (!job.location) {
            throw new Error('Job location is required');
        }
        if (!job.skills || job.skills.length === 0) {
            throw new Error('At least one skill is required');
        }
        if (!job.rejectionContent) {
            throw new Error('Rejection content is required');
        }
        if (job.rejectionContent.length < 30) {
            throw new Error('Rejection content must be at least 30 characters');
        }
        if (!job.selectionContent) {
            throw new Error('Selection content is required');
        }
        if (job.selectionContent.length < 30) {
            throw new Error('Selection content must be at least 30 characters');
        }
    };
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            validateJob(formData);
            await ky.post('/api/post', {
                json: formData,
            });
            toast({
                title: 'Success',
                description: `Job posted successfully, visit Posts Tab to view all the job`,
            });
        } catch (error: any) {
            toast({
                title: 'Error while posting job',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };
    return (
        <NavbarLayout>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3 max-w-6xl mx-auto'>
                <div className='col-span-2 space-y-6'>
                    <Card className='max-w-3xl mx-auto'>
                        <CardHeader>
                            <CardTitle>Job Application Form</CardTitle>
                            <CardDescription>Fill out the form to post for a job.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className='grid gap-4' onSubmit={handleSubmit}>
                                {page === 1 && (
                                    <>
                                        <div className='grid gap-2'>
                                            <Label htmlFor='company-name'>Company Name</Label>
                                            <Input
                                                id='company-name'
                                                placeholder='Ex: Google'
                                                className='max-w-md'
                                                value={formData.company}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        company: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className='grid gap-2'>
                                            <Label htmlFor='job-profile'>Job Profile</Label>
                                            <Input
                                                id='job-profile'
                                                placeholder='Ex: Software Developer'
                                                className='max-w-md'
                                                value={formData.profile}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        profile: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className='grid gap-2'>
                                            <Label htmlFor='job-description'>Job Description</Label>
                                            <EditorElement
                                                content={jobDescription}
                                                onValueChange={(content) => {
                                                    setJobDescription(content);
                                                    setFormData({
                                                        ...formData,
                                                        description: content.getCurrentContent().getPlainText(),
                                                    });
                                                }}
                                                placeholder='Enter job description here'
                                            />
                                        </div>

                                        <div className='flex justify-between'>
                                            <Button disabled className='invisible'>
                                                Previous
                                            </Button>
                                            <Button onClick={nextPage}>Next</Button>
                                        </div>
                                    </>
                                )}

                                {page === 2 && (
                                    <>
                                        <>
                                            <div className='flex flex-wrap gap-4'>
                                                <div className='grid gap-2 flex-1 min-w-[200px]'>
                                                    <Label htmlFor='job-type'>Job Type</Label>
                                                    <Select
                                                        value={formData.type}
                                                        onValueChange={(value) =>
                                                            setFormData({
                                                                ...formData,
                                                                type: value as JobType,
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger className='max-w-xs'>
                                                            <SelectValue placeholder='Select a category' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {[
                                                                JobType.FULL_TIME,
                                                                JobType.PART_TIME,
                                                                JobType.INTERNSHIP,
                                                                JobType.CONTRACT,
                                                                JobType.FREELANCE,
                                                                JobType.TEMPORARY,
                                                            ].map((type, index) => (
                                                                <SelectItem key={index} value={type}>
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
                                                        onValueChange={(value) =>
                                                            setFormData({
                                                                ...formData,
                                                                workplaceType: value as WorkplaceTypes,
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger className='max-w-xs'>
                                                            <SelectValue placeholder='Select a category' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {[WorkplaceTypes.ONSITE, WorkplaceTypes.REMOTE, WorkplaceTypes.HYBRID].map(
                                                                (type, index) => (
                                                                    <SelectItem key={index} value={type}>
                                                                        {type}
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </>
                                        <>
                                            <div className='flex flex-wrap gap-4'>
                                                <div className='grid gap-2 flex-1 min-w-[200px]'>
                                                    <Label htmlFor='job-location'>Job Location</Label>
                                                    <Input
                                                        id='job-location'
                                                        placeholder='Ex: New York, USA'
                                                        className='w-full'
                                                        value={formData.location}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                location: e.target.value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className='grid gap-2 flex-1 min-w-[200px]'>
                                                    <Label htmlFor='apply-date'>Last Date to Apply</Label>
                                                    <Input
                                                        id='apply-date'
                                                        type='date'
                                                        placeholder='Last Date to Apply'
                                                        className='w-full'
                                                        value={formData.lastDateToApply}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                lastDateToApply: e.target.value,
                                                            })
                                                        }
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className='flex justify-between'>
                                                <Button onClick={prevPage}>Previous</Button>
                                                <Button onClick={nextPage}>Next</Button>
                                            </div>
                                        </>
                                    </>
                                )}

                                {page === 3 && (
                                    <>
                                        <div className='grid gap-2'>
                                            <Label htmlFor='skills'>Skills</Label>
                                            <div className='flex flex-wrap gap-2'>
                                                {predefinedSkills.map((skill) => (
                                                    <label key={skill} className='flex items-center space-x-2'>
                                                        <input
                                                            type='checkbox'
                                                            value={skill}
                                                            checked={(formData.skills ?? []).includes(skill)}
                                                            onChange={() => handleSkillChange(skill)}
                                                            className='checkbox'
                                                        />
                                                        <span>{skill}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <div className='flex items-center gap-2 mt-4'>
                                                <Input
                                                    id='new-skill'
                                                    placeholder='Add new skill'
                                                    value={newSkill}
                                                    onChange={(e) => setNewSkill(e.target.value)}
                                                    className='w-full max-w-xs'
                                                />
                                                <Button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        addNewSkill();
                                                    }}
                                                >
                                                    Add Skill
                                                </Button>
                                            </div>
                                            <div className='mt-2'>
                                                <div className='flex flex-wrap gap-2 mt-1'>
                                                    {(formData.skills ?? []).map((skill) => (
                                                        <Badge key={skill} variant='secondary' className='text-sm'>
                                                            {skill}
                                                            <button className='ml-1 text-xs' onClick={() => handleSkillChange(skill)}>
                                                                ×
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className='flex justify-between'>
                                            <Button onClick={prevPage}>Previous</Button>
                                            <Button onClick={nextPage}>Next</Button>
                                        </div>
                                    </>
                                )}

                                {page === 4 && (
                                    <>
                                        <div className='grid gap-2'>
                                            <Label htmlFor='job-description'>Rejection Content</Label>
                                            <EditorElement
                                                content={rejectionContent}
                                                onValueChange={(content) => {
                                                    setRejectionContent(content);
                                                    setFormData({
                                                        ...formData,
                                                        rejectionContent: content.getCurrentContent().getPlainText(),
                                                    });
                                                }}
                                                placeholder='Enter rejection content here'
                                            />
                                        </div>

                                        <div className='grid gap-2'>
                                            <Label htmlFor='job-description'>Selection Content</Label>
                                            <EditorElement
                                                content={selectionContent}
                                                onValueChange={(content) => {
                                                    setSelectionContent(content);
                                                    setFormData({
                                                        ...formData,
                                                        selectionContent: content.getCurrentContent().getPlainText(),
                                                    });
                                                }}
                                                placeholder='Enter selection content here'
                                            />
                                        </div>

                                        <div className='flex justify-between'>
                                            <Button onClick={prevPage}>Previous</Button>
                                            <Button type='submit' disabled={loading}>
                                                {loading ? (
                                                    <>
                                                        <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                                                        {'Submitting...'}
                                                    </>
                                                ) : (
                                                    <>Submit Job</>
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>
                <div className='space-y-6'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Applications</CardTitle>
                            <CardDescription>View the status of your recent job applications.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='grid gap-4'>
                                <div className='flex items-center justify-between rounded-md bg-muted p-4'>
                                    <div>
                                        <h4 className='text-sm font-medium'>Software Engineer</h4>
                                        <p className='text-xs text-muted-foreground'>Applied on 2023-04-15</p>
                                    </div>
                                    <Badge variant='outline'>Pending</Badge>
                                </div>
                                <div className='flex items-center justify-between rounded-md bg-muted p-4'>
                                    <div>
                                        <h4 className='text-sm font-medium'>Product Designer</h4>
                                        <p className='text-xs text-muted-foreground'>Applied on 2023-03-22</p>
                                    </div>
                                    <Badge variant='outline' className='bg-green-500 text-green-50'>
                                        Accepted
                                    </Badge>
                                </div>
                                <div className='flex items-center justify-between rounded-md bg-muted p-4'>
                                    <div>
                                        <h4 className='text-sm font-medium'>UI/UX Designer</h4>
                                        <p className='text-xs text-muted-foreground'>Applied on 2023-02-10</p>
                                    </div>
                                    <Badge variant='outline' className='bg-red-500 text-red-50'>
                                        Rejected
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Analytics</CardTitle>
                            <CardDescription>View your job application performance metrics.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='grid gap-4'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <h4 className='text-sm font-medium'>Applications Submitted</h4>
                                        <p className='text-2xl font-bold'>25</p>
                                    </div>
                                    <FileIcon className='h-6 w-6 text-muted-foreground' />
                                </div>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <h4 className='text-sm font-medium'>Interviews Scheduled</h4>
                                        <p className='text-2xl font-bold'>8</p>
                                    </div>
                                    <CalendarIcon className='h-6 w-6 text-muted-foreground' />
                                </div>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <h4 className='text-sm font-medium'>Job Offers Received</h4>
                                        <p className='text-2xl font-bold'>3</p>
                                    </div>
                                    <TrophyIcon className='h-6 w-6 text-muted-foreground' />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </NavbarLayout>
    );
}
