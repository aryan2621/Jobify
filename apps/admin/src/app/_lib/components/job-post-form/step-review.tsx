import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@jobify/ui/alert';
import { Job } from '@jobify/domain/job';
import { ValidationState } from '@/app/_lib/utils';
import { JobPreview } from './job-preview';

type Props = {
    formData: Job;
    validation: ValidationState;
};

export function StepReview({ formData, validation }: Props) {
    return (
        <div className='space-y-6'>
            <Alert>
                <AlertTitle>Review your job posting</AlertTitle>
                <AlertDescription>Please review your job posting details before final submission.</AlertDescription>
            </Alert>

            <JobPreview formData={formData} />

            {Object.values(validation).some((field) => !field.valid && field.touched) && (
                <Alert variant='destructive' className='mt-4'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertTitle>Validation Errors</AlertTitle>
                    <AlertDescription>
                        Please fix the following errors before submitting:
                        <ul className='list-disc pl-5 mt-2'>
                            {Object.entries(validation).map(([key, field]) =>
                                !field.valid && field.touched ? (
                                    <li key={key} className='text-sm'>
                                        {field.message}
                                    </li>
                                ) : null
                            )}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
