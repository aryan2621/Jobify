import { Input } from '@jobify/ui/input';
import { Label } from '@jobify/ui/label';
import { Button } from '@jobify/ui/button';
import { Badge } from '@jobify/ui/badge';
import { Job } from '@jobify/domain/job';
import { predefinedSkills, ValidationState } from '@/app/_lib/utils';
import { FieldError } from './field-error';

type Props = {
    formData: Job;
    validation: ValidationState;
    newSkill: string;
    onNewSkillChange: (value: string) => void;
    onSkillToggle: (skill: string) => void;
    onAddCustomSkill: () => void;
};

export function StepSkills({ formData, validation, newSkill, onNewSkillChange, onSkillToggle, onAddCustomSkill }: Props) {
    return (
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
                                  ${(formData.skills ?? []).includes(skill) ? 'bg-primary/10 border-primary' : 'border-input hover:border-primary/50'}
                                  transition-colors text-sm
                                `}
                        >
                            <input
                                type='checkbox'
                                value={skill}
                                checked={(formData.skills ?? []).includes(skill)}
                                onChange={() => onSkillToggle(skill)}
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
                        onChange={(e) => onNewSkillChange(e.target.value)}
                        className='flex-grow'
                    />
                    <Button
                        type='button'
                        onClick={onAddCustomSkill}
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
                                        onClick={() => onSkillToggle(skill)}
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
                    {!validation.skills.valid && validation.skills.touched && <FieldError message={validation.skills.message} />}
                </div>
            </div>
        </div>
    );
}
