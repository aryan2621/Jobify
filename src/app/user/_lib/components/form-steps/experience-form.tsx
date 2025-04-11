"use client";

import { Application } from "@/model/application";
import { Experience } from "@/model/application";
import { memo } from "react";
import { FormValidation } from "../../utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Briefcase, Calendar } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RemoveButton } from "..";
import { FormField } from "..";



export const ExperienceForm = memo(
    ({
        experience,
        index,
        formData,
        validation,
        setFormData,
        onFieldChange,
    }: {
        experience: Experience;
        index: number;
        formData: Application;
        validation: FormValidation;
        setFormData: (data: Application) => void;
        onFieldChange: (field: string, value: any, index?: number) => void;
    }) => {
        const expValidation = (validation[`experience_${index}`] as any) || {};

        return (
            <Card className='mb-6'>
                <CardHeader className='pb-2'>
                    <div className='flex justify-between items-center'>
                        <CardTitle className='text-base flex items-center'>
                            <Briefcase className='mr-2 h-5 w-5' />
                            Experience {index + 1}
                        </CardTitle>
                        {formData.experience.length > 1 && (
                            <RemoveButton
                                onClick={() => {
                                    const newExperience = formData.experience.filter((_, i) => i !== index);
                                    setFormData({ ...formData, experience: newExperience });
                                }}
                                label='Remove Experience'
                            />
                        )}
                    </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <FormField label='Job Title' error={expValidation.profile?.errorMessage} touched={expValidation.profile?.touched} required>
                        <Input
                            placeholder='E.g., Software Engineer'
                            value={experience.profile}
                            onChange={(e) => onFieldChange('experience', { ...experience, profile: e.target.value }, index)}
                            className={expValidation.profile?.touched && !expValidation.profile?.isValid ? 'border-destructive' : ''}
                        />
                    </FormField>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <FormField label='Company Name' error={expValidation.company?.errorMessage} touched={expValidation.company?.touched} required>
                            <Input
                                placeholder='E.g., Google'
                                value={experience.company}
                                onChange={(e) => onFieldChange('experience', { ...experience, company: e.target.value }, index)}
                                className={expValidation.company?.touched && !expValidation.company?.isValid ? 'border-destructive' : ''}
                            />
                        </FormField>

                        <FormField label='Employer' helpText='Enter the name of your direct employer or contractor'>
                            <Input
                                placeholder='Enter employer name'
                                value={experience.employer}
                                onChange={(e) => onFieldChange('experience', { ...experience, employer: e.target.value }, index)}
                            />
                        </FormField>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <FormField
                            label='Start Date'
                            error={expValidation.startDate?.errorMessage}
                            touched={expValidation.startDate?.touched}
                            required
                        >
                            <div className='relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <Calendar className='h-4 w-4 text-muted-foreground' />
                                </div>
                                <Input
                                    type='date'
                                    placeholder='Start Date'
                                    value={experience.startDate}
                                    onChange={(e) => onFieldChange('experience', { ...experience, startDate: e.target.value }, index)}
                                    className={`pl-10 ${expValidation.startDate?.touched && !expValidation.startDate?.isValid ? 'border-destructive' : ''}`}
                                />
                            </div>
                        </FormField>

                        <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <Label htmlFor={`current-job-${index}`}>Current Job</Label>
                                <Switch
                                    id={`current-job-${index}`}
                                    checked={experience.isCurrent}
                                    onCheckedChange={(checked) => onFieldChange('experience', { ...experience, isCurrent: checked }, index)}
                                />
                            </div>

                            {!experience.isCurrent && (
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                        <Calendar className='h-4 w-4 text-muted-foreground' />
                                    </div>
                                    <Input
                                        type='date'
                                        placeholder='End Date'
                                        value={experience.endDate}
                                        onChange={(e) => onFieldChange('experience', { ...experience, endDate: e.target.value }, index)}
                                        className='pl-10'
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <FormField label='Years of Experience' helpText='Drag the slider to select your years of experience in this role'>
                        <div className='flex items-center gap-4'>
                            <Slider
                                value={[experience.yoe]}
                                onValueChange={(value) => onFieldChange('experience', { ...experience, yoe: value[0] }, index)}
                                max={20}
                                min={0}
                                step={0.5}
                                className='flex-grow'
                            />
                            <Badge variant='secondary' className='w-24 justify-center'>
                                {experience.yoe} Years
                            </Badge>
                        </div>
                    </FormField>
                </CardContent>
            </Card>
        );
    }
);

ExperienceForm.displayName = 'ExperienceForm';
