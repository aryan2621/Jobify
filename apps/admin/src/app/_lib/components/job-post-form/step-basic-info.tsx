import { Input } from '@jobify/ui/input';
import { Label } from '@jobify/ui/label';
import { Textarea } from '@jobify/ui/textarea';
import { Job } from '@jobify/domain/job';
import { ValidationState } from '@/app/_lib/utils';
import { FieldError } from './field-error';

type Props = {
    formData: Job;
    validation: ValidationState;
    onChange: (field: keyof Job, value: unknown) => void;
};

export function StepBasicInfo({ formData, validation, onChange }: Props) {
    return (
        <div className='space-y-4'>
            <div>
                <Label htmlFor='company-name'>
                    Company Name <span className='text-destructive'>*</span>
                </Label>
                <Input
                    id='company-name'
                    placeholder='Ex: Google'
                    value={formData.company}
                    onChange={(e) => onChange('company', e.target.value)}
                    className={`${!validation.company.valid && validation.company.touched ? 'border-destructive' : ''}`}
                />
                {!validation.company.valid && validation.company.touched && <FieldError message={validation.company.message} />}
            </div>

            <div>
                <Label htmlFor='job-profile'>
                    Job Title <span className='text-destructive'>*</span>
                </Label>
                <Input
                    id='job-profile'
                    placeholder='Ex: Software Developer'
                    value={formData.profile}
                    onChange={(e) => onChange('profile', e.target.value)}
                    className={`${!validation.profile.valid && validation.profile.touched ? 'border-destructive' : ''}`}
                />
                {!validation.profile.valid && validation.profile.touched && <FieldError message={validation.profile.message} />}
            </div>

            <div>
                <Label htmlFor='job-description'>
                    Job Description <span className='text-destructive'>*</span>
                </Label>
                <div className='flex justify-end mb-1'>
                    <span className='text-xs text-muted-foreground'>{formData.description.length} / 1000 characters</span>
                </div>
                <Textarea
                    id='job-description'
                    placeholder='Describe the job responsibilities, requirements, and benefits'
                    value={formData.description}
                    onChange={(e) => onChange('description', e.target.value)}
                    rows={8}
                    className={`${!validation.description.valid && validation.description.touched ? 'border-destructive' : ''}`}
                />
                {!validation.description.valid && validation.description.touched && <FieldError message={validation.description.message} />}
            </div>
        </div>
    );
}
