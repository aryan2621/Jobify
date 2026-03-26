import { Input } from '@jobify/ui/input';
import { Label } from '@jobify/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@jobify/ui/select';
import { Job, JobType, WorkplaceTypes } from '@jobify/domain/job';
import { ValidationState } from '@/app/_lib/utils';
import { FieldError } from './field-error';

type Props = {
    formData: Job;
    validation: ValidationState;
    onChange: (field: keyof Job, value: unknown) => void;
};

export function StepWorkplace({ formData, validation, onChange }: Props) {
    return (
        <div className='space-y-4'>
            <div className='flex flex-wrap gap-4'>
                <div className='grid gap-2 flex-1 min-w-[200px]'>
                    <Label htmlFor='job-type'>Job Type</Label>
                    <Select value={formData.type} onValueChange={(value) => onChange('type', value as JobType)}>
                        <SelectTrigger>
                            <SelectValue placeholder='Select job type' />
                        </SelectTrigger>
                        <SelectContent>
                            {[
                                JobType.FULL_TIME,
                                JobType.PART_TIME,
                                JobType.INTERNSHIP,
                                JobType.CONTRACT,
                                JobType.FREELANCE,
                                JobType.TEMPORARY,
                            ].map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className='grid gap-2 flex-1 min-w-[200px]'>
                    <Label htmlFor='workplace-type'>Workplace Type</Label>
                    <Select value={formData.workplaceType} onValueChange={(value) => onChange('workplaceType', value as WorkplaceTypes)}>
                        <SelectTrigger>
                            <SelectValue placeholder='Select workplace type' />
                        </SelectTrigger>
                        <SelectContent>
                            {[WorkplaceTypes.ONSITE, WorkplaceTypes.REMOTE, WorkplaceTypes.HYBRID].map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className='flex flex-wrap gap-4'>
                <div className='grid gap-2 flex-1 min-w-[200px]'>
                    <Label htmlFor='job-location'>
                        Job Location <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                        id='job-location'
                        placeholder='Ex: New York, USA'
                        value={formData.location}
                        onChange={(e) => onChange('location', e.target.value)}
                        className={`${!validation.location.valid && validation.location.touched ? 'border-destructive' : ''}`}
                    />
                    {!validation.location.valid && validation.location.touched && <FieldError message={validation.location.message} />}
                </div>

                <div className='grid gap-2 flex-1 min-w-[200px]'>
                    <Label htmlFor='apply-date'>
                        Application Deadline <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                        id='apply-date'
                        type='date'
                        value={formData.lastDateToApply}
                        onChange={(e) => onChange('lastDateToApply', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={`${!validation.lastDateToApply.valid && validation.lastDateToApply.touched ? 'border-destructive' : ''}`}
                    />
                    {!validation.lastDateToApply.valid && validation.lastDateToApply.touched && (
                        <FieldError message={validation.lastDateToApply.message} />
                    )}
                </div>
            </div>
        </div>
    );
}
