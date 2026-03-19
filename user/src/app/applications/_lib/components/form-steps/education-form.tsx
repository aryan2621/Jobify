'use client';

import { Application, DegreeType, Education } from '@/model/application';
import { memo } from 'react';
import { FormValidation } from '../../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { GraduationCap } from 'lucide-react';
import { RemoveButton, FormField } from '../index';

export const EducationForm = memo(
    ({
        education,
        index,
        formData,
        validation,
        setFormData,
        onFieldChange,
    }: {
        education: Education;
        index: number;
        formData: Application;
        validation: FormValidation;
        setFormData: (data: Application) => void;
        onFieldChange: (field: string, value: any, index?: number) => void;
    }) => {
        const educationValidation = (validation[`education_${index}`] as any) || {};

        return (
            <Card className='mb-6'>
                <CardHeader className='pb-2'>
                    <div className='flex justify-between items-center'>
                        <CardTitle className='text-base flex items-center'>
                            <GraduationCap className='mr-2 h-5 w-5' />
                            Education {index + 1}
                        </CardTitle>
                        {formData.education.length > 1 && (
                            <RemoveButton
                                onClick={() => {
                                    const newEducation = formData.education.filter((_, i) => i !== index);
                                    setFormData({ ...formData, education: newEducation });
                                }}
                                label='Remove Education'
                            />
                        )}
                    </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <FormField
                        label='College/University'
                        error={educationValidation.college?.errorMessage}
                        touched={educationValidation.college?.touched}
                        required
                    >
                        <Input
                            placeholder='Enter college or university name'
                            value={education.college}
                            onChange={(e) => onFieldChange('education', { ...education, college: e.target.value }, index)}
                            className={educationValidation.college?.touched && !educationValidation.college?.isValid ? 'border-destructive' : ''}
                        />
                    </FormField>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <FormField
                            label='Degree Name'
                            error={educationValidation.degree?.errorMessage}
                            touched={educationValidation.degree?.touched}
                            required
                        >
                            <Input
                                placeholder='E.g., Computer Science'
                                value={education.degree}
                                onChange={(e) => onFieldChange('education', { ...education, degree: e.target.value }, index)}
                                className={educationValidation.degree?.touched && !educationValidation.degree?.isValid ? 'border-destructive' : ''}
                            />
                        </FormField>

                        <FormField label='Degree Type' required>
                            <Select
                                value={education.degreeType}
                                onValueChange={(value) => onFieldChange('education', { ...education, degreeType: value }, index)}
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
                        </FormField>
                    </div>

                    <FormField label={`SGPA / GPA (out of 10)`} helpText='Drag the slider or click to select your grade point average'>
                        <div className='flex items-center gap-4'>
                            <Slider
                                value={[education.sgpa]}
                                onValueChange={(value) => onFieldChange('education', { ...education, sgpa: value[0] }, index)}
                                max={10}
                                min={0}
                                step={0.1}
                                className='flex-grow'
                            />
                            <Badge variant='secondary' className='w-16 justify-center'>
                                {education.sgpa.toFixed(1)}
                            </Badge>
                        </div>
                    </FormField>
                </CardContent>
            </Card>
        );
    }
);

EducationForm.displayName = 'EducationForm';
