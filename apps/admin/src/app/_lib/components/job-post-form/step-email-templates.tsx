import { Label } from '@jobify/ui/label';
import { Textarea } from '@jobify/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@jobify/ui/tabs';
import { Job } from '@jobify/domain/job';
import { ValidationState } from '@/app/_lib/utils';
import { EmailTemplateHelper } from './email-template-helper';
import { FieldError } from './field-error';

type Props = {
    formData: Job;
    validation: ValidationState;
    onChange: (field: keyof Job, value: unknown) => void;
    onInsertTemplateVariable: (variable: string, field: 'rejectionContent' | 'selectionContent') => void;
};

export function StepEmailTemplates({ formData, validation, onChange, onInsertTemplateVariable }: Props) {
    return (
        <div className='space-y-6'>
            <Tabs defaultValue='rejection'>
                <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger value='rejection'>Rejection Email</TabsTrigger>
                    <TabsTrigger value='selection'>Selection Email</TabsTrigger>
                </TabsList>

                <TabsContent value='rejection' className='space-y-4 mt-4'>
                    <EmailTemplateHelper onInsertVariable={(variable) => onInsertTemplateVariable(variable, 'rejectionContent')} />

                    <div>
                        <Label htmlFor='rejectionContent'>
                            Rejection Email Template <span className='text-destructive'>*</span>
                        </Label>
                        <Textarea
                            id='rejectionContent'
                            placeholder='Write your rejection email template here'
                            value={formData.rejectionContent}
                            onChange={(e) => onChange('rejectionContent', e.target.value)}
                            rows={10}
                            className={`font-mono text-sm ${!validation.rejectionContent.valid && validation.rejectionContent.touched ? 'border-destructive' : ''}`}
                        />
                        {!validation.rejectionContent.valid && validation.rejectionContent.touched && (
                            <FieldError message={validation.rejectionContent.message} />
                        )}
                    </div>
                </TabsContent>

                <TabsContent value='selection' className='space-y-4 mt-4'>
                    <EmailTemplateHelper onInsertVariable={(variable) => onInsertTemplateVariable(variable, 'selectionContent')} />

                    <div>
                        <Label htmlFor='selectionContent'>
                            Selection Email Template <span className='text-destructive'>*</span>
                        </Label>
                        <Textarea
                            id='selectionContent'
                            placeholder='Write your selection email template here'
                            value={formData.selectionContent}
                            onChange={(e) => onChange('selectionContent', e.target.value)}
                            rows={10}
                            className={`font-mono text-sm ${!validation.selectionContent.valid && validation.selectionContent.touched ? 'border-destructive' : ''}`}
                        />
                        {!validation.selectionContent.valid && validation.selectionContent.touched && (
                            <FieldError message={validation.selectionContent.message} />
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
