'use client';

import { Application } from '@/model/application';
import { FormValidation } from '../../utils';
import { memo } from 'react';
import { FormField, FormSectionTitle, RemoveButton } from '..';
import { Lightbulb, Link } from 'lucide-react';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const SkillsForm = memo(
    ({
        formData,
        validation,
        predefinedSkills,
        onFieldChange,
        onAddSocialLink,
        onRemoveSocialLink,
        onUpdateSocialLink,
    }: {
        formData: Application;
        validation: FormValidation;
        predefinedSkills: string[];
        onFieldChange: (field: string, value: any, index?: number) => void;
        onAddSocialLink: () => void;
        onRemoveSocialLink: (index: number) => void;
        onUpdateSocialLink: (index: number, value: string) => void;
    }) => {
        const [newSkill, setNewSkill] = useState('');

        const handleAddSkill = (e: React.FormEvent) => {
            e.preventDefault();
            if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
                onFieldChange('skills', [...formData.skills, newSkill.trim()]);
                setNewSkill('');
            }
        };

        return (
            <div className='space-y-8'>
                <div>
                    <FormSectionTitle
                        title='Skills'
                        subtitle='Select your relevant skills for this position'
                        icon={<Lightbulb className='w-5 h-5 text-primary' />}
                    />

                    <FormField label='Skills' error={validation.skills?.errorMessage} touched={validation.skills?.touched} required>
                        <div className='space-y-4'>
                            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'>
                                {predefinedSkills.map((skill, index) => (
                                    <label
                                        key={index}
                                        className={`
                    flex items-center p-3 rounded-md border 
                    ${formData.skills.includes(skill) ? 'bg-primary/10 border-primary' : 'border-input'}
                    hover:border-primary/50 transition-colors cursor-pointer
                  `}
                                    >
                                        <input
                                            type='checkbox'
                                            value={skill}
                                            checked={formData.skills.includes(skill)}
                                            onChange={(e) => {
                                                const newSkills = e.target.checked
                                                    ? [...formData.skills, skill]
                                                    : formData.skills.filter((s) => s !== skill);
                                                onFieldChange('skills', newSkills);
                                            }}
                                            className='mr-2 h-4 w-4'
                                        />
                                        <span className='text-sm'>{skill}</span>
                                    </label>
                                ))}
                            </div>

                            <div className='flex items-end gap-2'>
                                <div className='flex-grow'>
                                    <Label htmlFor='new-skill'>Add Custom Skill</Label>
                                    <Input
                                        id='new-skill'
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        placeholder='Enter a custom skill'
                                    />
                                </div>
                                <Button
                                    onClick={handleAddSkill}
                                    type='button'
                                    disabled={!newSkill.trim() || formData.skills.includes(newSkill.trim())}
                                >
                                    Add Skill
                                </Button>
                            </div>

                            <div className='flex flex-wrap gap-2 mt-2'>
                                {formData.skills.map((skill, index) => (
                                    <Badge key={index} className='py-1.5 px-2'>
                                        {skill}
                                        <button
                                            type='button'
                                            className='ml-2 text-xs hover:text-accent-foreground'
                                            onClick={() => {
                                                const newSkills = formData.skills.filter((_, i) => i !== index);
                                                onFieldChange('skills', newSkills);
                                            }}
                                            aria-label={`Remove ${skill}`}
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                ))}
                                {formData.skills.length === 0 && <p className='text-sm text-muted-foreground'>No skills selected yet</p>}
                            </div>
                        </div>
                    </FormField>
                </div>

                <div>
                    <FormSectionTitle
                        title='Social Links'
                        subtitle='Add your professional profiles and websites'
                        icon={<Link className='w-5 h-5 text-primary' />}
                    />

                    <FormField
                        label='Resume / CV'
                        error={validation.resume?.errorMessage}
                        touched={validation.resume?.touched}
                        required
                        helpText='Upload your resume in PDF, DOC, or DOCX format (max 5MB)'
                    >
                        <div className='flex flex-col space-y-2'>
                            <Input
                                type='file'
                                id='resume'
                                accept='.pdf,.doc,.docx'
                                onChange={(e) => {
                                    const files = e.target.files;
                                    if (files && files.length > 0) {
                                        onFieldChange('resume', '', -1);
                                    }
                                }}
                                className={validation.resume?.touched && !validation.resume?.isValid ? 'border-destructive' : ''}
                            />
                            {formData.resume && <p className='text-xs text-primary'>Resume uploaded successfully</p>}
                        </div>
                    </FormField>

                    <div className='space-y-4 mt-6'>
                        {formData.socialLinks.map((link, index) => (
                            <div key={`social-link-${index}`} className='flex items-center gap-2'>
                                <div className='flex-grow'>
                                    <Input
                                        value={link}
                                        onChange={(e) => onUpdateSocialLink(index, e.target.value)}
                                        placeholder='https://'
                                        className={
                                            validation[`socialLink_${index}`]?.touched && !validation[`socialLink_${index}`]?.isValid
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                    {validation[`socialLink_${index}`]?.touched && !validation[`socialLink_${index}`]?.isValid && (
                                        <p className='text-destructive text-xs mt-1'>{validation[`socialLink_${index}`]?.errorMessage}</p>
                                    )}
                                </div>

                                {formData.socialLinks.length > 1 && <RemoveButton onClick={() => onRemoveSocialLink(index)} label='Remove link' />}
                            </div>
                        ))}

                        <Button type='button' variant='outline' size='sm' onClick={onAddSocialLink} className='mt-2'>
                            Add Another Link
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
);

SkillsForm.displayName = 'SkillsForm';
