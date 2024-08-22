'use client';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, FileIcon, TrophyIcon } from '@/elements/icon';
import { useState } from 'react';
import { EditorElement } from '@/elements/editor';
import { EditorState, ContentState, convertFromHTML } from 'draft-js';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import NavbarLayout from '@/layouts/navbar';
import { predefinedSkills } from '@/utils';
import { JobSource, JobType, WorkplaceTypes } from '@/model/job';

export default function Component() {
    const [jobDescription, setJobDescription] = useState(
        EditorState.createEmpty()
    );
    const [rejectionContent, setRejectionContent] = useState(
        EditorState.createWithContent(
            ContentState.createFromBlockArray(
                convertFromHTML(
                    '<p> Thank you for applying.We have gone through your application and regret to inform you that we are not proceeding with your application at this time. All the best for your future endeavors. </p>'
                )
            )
        )
    );
    const [selectionContent, setSelectionContent] = useState(
        EditorState.createWithContent(
            ContentState.createFromBlockArray(
                convertFromHTML(
                    '<p> Congratulations! We are pleased to inform you that you have been selected for the further process. We are excited to have you on board and look forward to working with you. </p>'
                )
            )
        )
    );
    const [jobType, setJobType] = useState('Full-time');
    const [workplaceType, setWorkplaceType] = useState('On Office');
    const [source, setSource] = useState('Internet');
    const [applyDate, setApplyDate] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState('');
    const [page, setPage] = useState(1);

    const nextPage = () => {
        setPage((prev) => prev + 1);
    };
    const prevPage = () => {
        setPage((prev) => prev - 1);
    };

    const handleSkillChange = (skill: string) => {
        setSkills((prev) =>
            prev.includes(skill)
                ? prev.filter((s) => s !== skill)
                : [...prev, skill]
        );
    };

    const addNewSkill = () => {
        if (newSkill && !skills.includes(newSkill)) {
            setSkills((prev) => [...prev, newSkill]);
            setNewSkill('');
        }
    };
    return (
        <NavbarLayout>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3 max-w-6xl mx-auto'>
                <div className='col-span-2 space-y-6'>
                    <Card className='max-w-3xl mx-auto'>
                        <CardHeader>
                            <CardTitle>Job Application Form</CardTitle>
                            <CardDescription>
                                Fill out the form to post for a job.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className='grid gap-4'>
                                {page === 1 && (
                                    <>
                                        <div className='grid gap-2'>
                                            <Label htmlFor='job-profile'>
                                                Job Profile
                                            </Label>
                                            <Input
                                                id='job-profile'
                                                placeholder='Ex: Software Developer'
                                                className='max-w-md'
                                            />
                                        </div>

                                        <div className='grid gap-2'>
                                            <Label htmlFor='job-description'>
                                                Job Description
                                            </Label>
                                            <EditorElement
                                                content={jobDescription}
                                                setContent={setJobDescription}
                                                placeholder='Enter job description here'
                                            />
                                        </div>

                                        <div className='flex justify-between'>
                                            <Button
                                                disabled
                                                className='invisible'
                                            >
                                                Previous
                                            </Button>
                                            <Button onClick={nextPage}>
                                                Next
                                            </Button>
                                        </div>
                                    </>
                                )}

                                {page === 2 && (
                                    <>
                                        <div className='flex flex-wrap gap-4'>
                                            <div className='grid gap-2 flex-1 min-w-[200px]'>
                                                <Label htmlFor='job-type'>
                                                    Job Type
                                                </Label>
                                                <Select
                                                    value={jobType}
                                                    onValueChange={setJobType}
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
                                                            <SelectItem
                                                                key={index}
                                                                value={type}
                                                            >
                                                                {type}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className='grid gap-2 flex-1 min-w-[200px]'>
                                                <Label htmlFor='workplace-type'>
                                                    Workplace Type
                                                </Label>
                                                <Select
                                                    value={workplaceType}
                                                    onValueChange={
                                                        setWorkplaceType
                                                    }
                                                >
                                                    <SelectTrigger className='max-w-xs'>
                                                        <SelectValue placeholder='Select a category' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[
                                                            WorkplaceTypes.ONSITE,
                                                            WorkplaceTypes.REMOTE,
                                                            WorkplaceTypes.HYBRID,
                                                        ].map((type, index) => (
                                                            <SelectItem
                                                                key={index}
                                                                value={type}
                                                            >
                                                                {type}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className='flex justify-between'>
                                            <Button onClick={prevPage}>
                                                Previous
                                            </Button>
                                            <Button onClick={nextPage}>
                                                Next
                                            </Button>
                                        </div>
                                    </>
                                )}

                                {page === 3 && (
                                    <>
                                        <div className='flex flex-wrap gap-4'>
                                            <div className='grid gap-2 flex-1 min-w-[200px]'>
                                                <Label htmlFor='source'>
                                                    How did you hear about the
                                                    job?
                                                </Label>
                                                <Select
                                                    value={source}
                                                    onValueChange={setSource}
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
                                                            <SelectItem
                                                                key={index}
                                                                value={type}
                                                            >
                                                                {type}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className='grid gap-2 flex-1 min-w-[200px]'>
                                                <Label htmlFor='apply-date'>
                                                    Last Date to Apply
                                                </Label>
                                                <Input
                                                    id='apply-date'
                                                    type='date'
                                                    placeholder='Last Date to Apply'
                                                    className='w-full'
                                                    value={applyDate}
                                                    onChange={(e) =>
                                                        setApplyDate(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className='flex justify-between'>
                                            <Button onClick={prevPage}>
                                                Previous
                                            </Button>
                                            <Button onClick={nextPage}>
                                                Next
                                            </Button>
                                        </div>
                                    </>
                                )}

                                {page === 4 && (
                                    <>
                                        <div className='grid gap-2'>
                                            <Label htmlFor='job-location'>
                                                Job Location
                                            </Label>
                                            <Input
                                                id='job-location'
                                                placeholder='Ex: New York, USA'
                                                className='w-full'
                                            />
                                        </div>

                                        <div className='grid gap-2'>
                                            <Label htmlFor='skills'>
                                                Skills
                                            </Label>
                                            <div className='flex flex-wrap gap-2'>
                                                {predefinedSkills.map(
                                                    (skill) => (
                                                        <label
                                                            key={skill}
                                                            className='flex items-center space-x-2'
                                                        >
                                                            <input
                                                                type='checkbox'
                                                                value={skill}
                                                                checked={skills.includes(
                                                                    skill
                                                                )}
                                                                onChange={() =>
                                                                    handleSkillChange(
                                                                        skill
                                                                    )
                                                                }
                                                                className='checkbox'
                                                            />
                                                            <span>{skill}</span>
                                                        </label>
                                                    )
                                                )}
                                            </div>
                                            <div className='flex items-center gap-2 mt-4'>
                                                <Input
                                                    id='new-skill'
                                                    placeholder='Add new skill'
                                                    value={newSkill}
                                                    onChange={(e) =>
                                                        setNewSkill(
                                                            e.target.value
                                                        )
                                                    }
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
                                                    {skills.map((skill) => (
                                                        <Badge
                                                            key={skill}
                                                            variant='secondary'
                                                            className='text-sm'
                                                        >
                                                            {skill}
                                                            <button
                                                                className='ml-1 text-xs'
                                                                onClick={() =>
                                                                    handleSkillChange(
                                                                        skill
                                                                    )
                                                                }
                                                            >
                                                                ×
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className='flex justify-between'>
                                            <Button onClick={prevPage}>
                                                Previous
                                            </Button>
                                            <Button onClick={nextPage}>
                                                Next
                                            </Button>
                                        </div>
                                    </>
                                )}

                                {page === 5 && (
                                    <>
                                        <div className='grid gap-2'>
                                            <Label htmlFor='job-description'>
                                                Rejection Content
                                            </Label>
                                            <EditorElement
                                                content={rejectionContent}
                                                setContent={setRejectionContent}
                                                placeholder='Enter rejection content here'
                                            />
                                        </div>

                                        <div className='grid gap-2'>
                                            <Label htmlFor='job-description'>
                                                Selection Content
                                            </Label>
                                            <EditorElement
                                                content={selectionContent}
                                                setContent={setSelectionContent}
                                                placeholder='Enter selection content here'
                                            />
                                        </div>

                                        <div className='flex justify-between'>
                                            <Button onClick={prevPage}>
                                                Previous
                                            </Button>
                                            <Button type='submit' className=''>
                                                Submit Job
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
                            <CardDescription>
                                View the status of your recent job applications.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='grid gap-4'>
                                <div className='flex items-center justify-between rounded-md bg-muted p-4'>
                                    <div>
                                        <h4 className='text-sm font-medium'>
                                            Software Engineer
                                        </h4>
                                        <p className='text-xs text-muted-foreground'>
                                            Applied on 2023-04-15
                                        </p>
                                    </div>
                                    <Badge variant='outline'>Pending</Badge>
                                </div>
                                <div className='flex items-center justify-between rounded-md bg-muted p-4'>
                                    <div>
                                        <h4 className='text-sm font-medium'>
                                            Product Designer
                                        </h4>
                                        <p className='text-xs text-muted-foreground'>
                                            Applied on 2023-03-22
                                        </p>
                                    </div>
                                    <Badge
                                        variant='outline'
                                        className='bg-green-500 text-green-50'
                                    >
                                        Accepted
                                    </Badge>
                                </div>
                                <div className='flex items-center justify-between rounded-md bg-muted p-4'>
                                    <div>
                                        <h4 className='text-sm font-medium'>
                                            UI/UX Designer
                                        </h4>
                                        <p className='text-xs text-muted-foreground'>
                                            Applied on 2023-02-10
                                        </p>
                                    </div>
                                    <Badge
                                        variant='outline'
                                        className='bg-red-500 text-red-50'
                                    >
                                        Rejected
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Analytics</CardTitle>
                            <CardDescription>
                                View your job application performance metrics.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='grid gap-4'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <h4 className='text-sm font-medium'>
                                            Applications Submitted
                                        </h4>
                                        <p className='text-2xl font-bold'>25</p>
                                    </div>
                                    <FileIcon className='h-6 w-6 text-muted-foreground' />
                                </div>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <h4 className='text-sm font-medium'>
                                            Interviews Scheduled
                                        </h4>
                                        <p className='text-2xl font-bold'>8</p>
                                    </div>
                                    <CalendarIcon className='h-6 w-6 text-muted-foreground' />
                                </div>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <h4 className='text-sm font-medium'>
                                            Job Offers Received
                                        </h4>
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
