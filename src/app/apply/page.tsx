'use client';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import NavbarLayout from '@/layouts/navbar';
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditorElement } from '@/elements/editor';
import { EditorState } from 'draft-js';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { countries, predefinedSkills } from '@/utils';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import Upload from '@/elements/upload';
import { XIcon } from '@/elements/icon';
import { DegreeType, Gender } from '@/model/application';

export default function Component() {
    const [page, setPage] = useState(1);
    const [coverLetter, setCoverLetter] = useState(EditorState.createEmpty());
    const [selectedCountry, setSelectedCountry] = useState('+91');
    const [education, setEducation] = useState([
        { collegeName: '', degree: '', degreeType: '', marksSGPA: 0 },
    ]);
    const [experience, setExperience] = useState([
        {
            jobProfile: '',
            companyName: '',
            employerName: '',
            from: '',
            to: '',
            isCurrentJob: false,
            experienceRange: 0,
        },
    ]);
    const [skills, setSkills] = useState<string[]>([]);
    const [resume, setResume] = useState(null);
    const [socialLinks, setSocialLinks] = useState(['']);

    const handleEducationChange = (
        index: number,
        field: string,
        value: string | boolean | number[]
    ) => {
        const newEducation = [...education];
        const newEduAtIndex = { ...newEducation[index], [field]: value };
        newEducation[index] = newEduAtIndex;
        setEducation(newEducation);
    };

    const addEducation = () => {
        setEducation([
            ...education,
            { collegeName: '', degree: '', degreeType: '', marksSGPA: 0 },
        ]);
    };

    const deleteEducation = (index: number) => {
        const newEducation = [...education];
        newEducation.splice(index, 1);
        setEducation(newEducation);
    };

    const handleExperienceChange = (
        index: number,
        field: string,
        value: string | boolean | number[]
    ) => {
        const newExperience = [...experience];
        const newExpAtIndex = { ...newExperience[index], [field]: value };
        newExperience[index] = newExpAtIndex;
        setExperience(newExperience);
    };

    const addExperience = () => {
        setExperience([
            ...experience,
            {
                jobProfile: '',
                companyName: '',
                employerName: '',
                from: '',
                to: '',
                isCurrentJob: false,
                experienceRange: 0,
            },
        ]);
    };

    const deleteExperience = (index: number) => {
        const newExperience = [...experience];
        newExperience.splice(index, 1);
        setExperience(newExperience);
    };

    const handleSkillChange = (skill: string) => {
        setSkills((prev) =>
            prev.includes(skill)
                ? prev.filter((s) => s !== skill)
                : [...prev, skill]
        );
    };

    const handleSocialLinkChange = (index: number, value: string) => {
        const newSocialLinks = [...socialLinks];
        newSocialLinks[index] = value;
        setSocialLinks(newSocialLinks);
    };

    const addSocialLink = () => {
        setSocialLinks([...socialLinks, '']);
    };

    const deleteSocialLink = (index: number) => {
        const newSocialLinks = [...socialLinks];
        newSocialLinks.splice(index, 1);
        setSocialLinks(newSocialLinks);
    };

    const nextPage = () => setPage((prev) => prev + 1);
    const prevPage = () => setPage((prev) => prev - 1);

    const isCurrentJobSelected = (index: number) => {
        return experience[index].isCurrentJob;
    };

    return (
        <NavbarLayout>
            <div className='max-w-3xl mx-auto p-4'>
                <Card>
                    <CardHeader>
                        <CardTitle>Job Application Form</CardTitle>
                        <CardDescription>
                            Fill out the form to apply for a job. Page {page} of
                            5
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className='space-y-6'>
                            {page === 1 && (
                                <>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div>
                                            <Label htmlFor='first-name'>
                                                First Name
                                            </Label>
                                            <Input
                                                id='first-name'
                                                placeholder='First Name'
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor='last-name'>
                                                Last Name
                                            </Label>
                                            <Input
                                                id='last-name'
                                                placeholder='Last Name'
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor='email'>
                                            Email Address
                                        </Label>
                                        <Input
                                            id='email'
                                            placeholder='Email Address'
                                            type='email'
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor='phone'>
                                            Phone Number
                                        </Label>
                                        <div className='flex gap-2'>
                                            <Select
                                                value={selectedCountry}
                                                onValueChange={(value) => {
                                                    setSelectedCountry(value);
                                                }}
                                            >
                                                <SelectTrigger className='w-[100px]'>
                                                    <SelectValue placeholder='Country' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {countries.map(
                                                        (country, index) => (
                                                            <SelectItem
                                                                key={index}
                                                                value={
                                                                    country.dial_code
                                                                }
                                                            >
                                                                {country.flag}
                                                                {country.code}
                                                                {
                                                                    country.dial_code
                                                                }
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                id='phone'
                                                placeholder='Phone Number'
                                                className='flex-grow'
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor='current-address'>
                                            Current Address
                                        </Label>
                                        <Input
                                            id='current-address'
                                            placeholder='Current Address'
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor='gender'>Gender</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Gender' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[
                                                    Gender.Female,
                                                    Gender.Male,
                                                    Gender.Other,
                                                ].map((item, index) => {
                                                    return (
                                                        <SelectItem
                                                            key={index}
                                                            value={item}
                                                        >
                                                            {item}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            {page === 2 && (
                                <>
                                    {education.map((edu, index) => (
                                        <div
                                            key={index}
                                            className='space-y-4 relative flex items-start gap-4'
                                        >
                                            <div className='flex-grow space-y-4'>
                                                <Input
                                                    value={edu.collegeName}
                                                    onChange={(e) =>
                                                        handleEducationChange(
                                                            index,
                                                            'collegeName',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder='College Name'
                                                />
                                                <Input
                                                    value={edu.degree}
                                                    onChange={(e) =>
                                                        handleEducationChange(
                                                            index,
                                                            'degree',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder='Degree'
                                                />
                                                <div>
                                                    <Select
                                                        value={edu.degreeType}
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            handleEducationChange(
                                                                index,
                                                                'degreeType',
                                                                value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select Degree Type' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {[
                                                                DegreeType.BACHELOR,
                                                                DegreeType.MASTER,
                                                                DegreeType.DOCTORATE,
                                                                DegreeType.HIGH_SCHOOL,
                                                                DegreeType.DIPLOMA,
                                                                DegreeType.CERTIFICATE,
                                                                DegreeType.INTERMEDIATE,
                                                            ].map(
                                                                (
                                                                    item,
                                                                    index
                                                                ) => {
                                                                    return (
                                                                        <SelectItem
                                                                            key={
                                                                                index
                                                                            }
                                                                            value={
                                                                                item
                                                                            }
                                                                        >
                                                                            {
                                                                                item
                                                                            }
                                                                        </SelectItem>
                                                                    );
                                                                }
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label htmlFor='marks'>
                                                        Marks/SGPA
                                                    </Label>
                                                    <div className='flex gap-2'>
                                                        <Slider
                                                            defaultValue={[
                                                                edu.marksSGPA,
                                                            ]}
                                                            onValueChange={(
                                                                value
                                                            ) =>
                                                                handleEducationChange(
                                                                    index,
                                                                    'marksSGPA',
                                                                    value
                                                                )
                                                            }
                                                            max={10}
                                                            min={0}
                                                            step={0.1}
                                                        />
                                                        <Badge variant='secondary'>
                                                            {edu.marksSGPA}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            {education.length > 1 && (
                                                <Button
                                                    type='button'
                                                    variant='destructive'
                                                    onClick={() =>
                                                        deleteEducation(index)
                                                    }
                                                    className='h-8 w-8 p-1'
                                                >
                                                    <XIcon className='h-4 w-4' />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        type='button'
                                        onClick={addEducation}
                                        variant='outline'
                                    >
                                        Add Another Education
                                    </Button>
                                </>
                            )}

                            {page === 3 && (
                                <>
                                    {experience.map((exp, index) => (
                                        <div
                                            key={index}
                                            className='space-y-4 relative flex items-start gap-4'
                                        >
                                            <div className='flex-grow space-y-4'>
                                                <Input
                                                    value={exp.jobProfile}
                                                    onChange={(e) =>
                                                        handleExperienceChange(
                                                            index,
                                                            'jobProfile',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder='Job Profile'
                                                />
                                                <Input
                                                    value={exp.companyName}
                                                    onChange={(e) =>
                                                        handleExperienceChange(
                                                            index,
                                                            'companyName',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder='Company Name'
                                                />
                                                <Input
                                                    value={exp.employerName}
                                                    onChange={(e) =>
                                                        handleExperienceChange(
                                                            index,
                                                            'employerName',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder='Employer Name'
                                                />
                                                <div className='grid grid-cols-3 gap-4'>
                                                    <label className='flex items-center space-x-2 mt-2'>
                                                        <Switch
                                                            checked={
                                                                exp.isCurrentJob
                                                            }
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                handleExperienceChange(
                                                                    index,
                                                                    'isCurrentJob',
                                                                    checked
                                                                )
                                                            }
                                                        />
                                                        <span>Current Job</span>
                                                    </label>
                                                    <Input
                                                        type='date'
                                                        placeholder='From'
                                                        value={exp.from}
                                                        onChange={(e) =>
                                                            handleExperienceChange(
                                                                index,
                                                                'from',
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    <Input
                                                        type='date'
                                                        disabled={isCurrentJobSelected(
                                                            index
                                                        )}
                                                        value={exp.to}
                                                        onChange={(e) =>
                                                            handleExperienceChange(
                                                                index,
                                                                'to',
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder='To'
                                                    />
                                                </div>
                                                <div>
                                                    <div className='flex gap-2'>
                                                        <Label className='mt-2'>
                                                            Experience
                                                        </Label>
                                                        <Slider
                                                            defaultValue={[
                                                                exp.experienceRange,
                                                            ]}
                                                            onValueChange={(
                                                                value
                                                            ) =>
                                                                handleExperienceChange(
                                                                    index,
                                                                    'experienceRange',
                                                                    value
                                                                )
                                                            }
                                                            max={50}
                                                            min={0}
                                                            step={0.5}
                                                        />
                                                        <Badge variant='secondary'>
                                                            {
                                                                exp.experienceRange
                                                            }
                                                            Years
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            {experience.length > 1 && (
                                                <Button
                                                    type='button'
                                                    variant='destructive'
                                                    onClick={() =>
                                                        deleteExperience(index)
                                                    }
                                                    className='h-8 w-8 p-1'
                                                >
                                                    <XIcon className='h-4 w-4' />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        type='button'
                                        onClick={addExperience}
                                        variant='outline'
                                    >
                                        Add Another Experience
                                    </Button>
                                </>
                            )}

                            {page === 4 && (
                                <>
                                    <Label htmlFor='skills'>Skills</Label>
                                    <div className='flex flex-wrap gap-2'>
                                        {predefinedSkills.map((skill) => (
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
                                                        handleSkillChange(skill)
                                                    }
                                                    className='checkbox'
                                                />
                                                <span>{skill}</span>
                                            </label>
                                        ))}
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

                                    <div>
                                        <Upload
                                            acceptedFileTypes={[
                                                'application/pdf',
                                            ]}
                                        />
                                    </div>

                                    <div>
                                        {socialLinks.map((link, index) => (
                                            <div
                                                key={index}
                                                className='space-y-4 relative flex items-start gap-4'
                                            >
                                                <div className='flex-grow space-y-4'>
                                                    <Input
                                                        value={link}
                                                        onChange={(e) =>
                                                            handleSocialLinkChange(
                                                                index,
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder='Social Link'
                                                    />
                                                    {index ===
                                                        socialLinks.length -
                                                            1 && (
                                                        <Button
                                                            type='button'
                                                            onClick={
                                                                addSocialLink
                                                            }
                                                            variant='outline'
                                                        >
                                                            Add
                                                        </Button>
                                                    )}
                                                </div>
                                                {socialLinks.length > 1 && (
                                                    <Button
                                                        type='button'
                                                        variant='destructive'
                                                        onClick={() =>
                                                            deleteSocialLink(
                                                                index
                                                            )
                                                        }
                                                        className='h-8 w-8 p-1'
                                                    >
                                                        <XIcon className='h-4 w-4' />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {page === 5 && (
                                <div>
                                    <Label htmlFor='cover-letter'>
                                        Cover Letter
                                    </Label>
                                    <EditorElement
                                        content={coverLetter}
                                        setContent={setCoverLetter}
                                        placeholder='Write a cover letter'
                                    />
                                </div>
                            )}

                            <div className='flex justify-between mt-6'>
                                <Button
                                    type='button'
                                    onClick={prevPage}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                {page < 5 ? (
                                    <Button type='button' onClick={nextPage}>
                                        Next
                                    </Button>
                                ) : (
                                    <Button type='submit'>
                                        Submit Application
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </NavbarLayout>
    );
}
