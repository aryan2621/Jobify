'use client';

import { memo } from 'react';
import { Application } from '@/model/application';
import { FormValidation } from '../../utils';
import { FormField, FormSectionTitle } from '..';
import { FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export const CoverLetterForm = memo(
    ({
        formData,
        validation,
        onFieldChange,
    }: {
        formData: Application;
        validation: FormValidation;
        onFieldChange: (field: string, value: any) => void;
    }) => (
        <div className='space-y-6'>
            <FormSectionTitle
                title='Cover Letter'
                subtitle="Tell us why you're the perfect fit for this role"
                icon={<FileText className='w-5 h-5 text-primary' />}
            />

            <FormField
                label='Cover Letter'
                error={validation.coverLetter?.errorMessage}
                touched={validation.coverLetter?.touched}
                required
                helpText="Explain why you're interested in this position and how your experience makes you a good fit"
            >
                <Textarea
                    value={formData.coverLetter}
                    onChange={(e) => onFieldChange('coverLetter', e.target.value)}
                    placeholder='Write your cover letter here...'
                    className={`min-h-32 ${validation.coverLetter?.touched && !validation.coverLetter?.isValid ? 'border-destructive' : ''}`}
                />
            </FormField>

            <div className='text-right text-xs text-muted-foreground'>
                {formData.coverLetter.length} characters
                {formData.coverLetter.length > 1000 && <span className='ml-1 text-amber-500'>(Recommended: Keep your cover letter concise)</span>}
            </div>
        </div>
    )
);

CoverLetterForm.displayName = 'CoverLetterForm';
