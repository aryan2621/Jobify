import { Badge } from '@jobify/ui/badge';

export function EmailTemplateHelper({ onInsertVariable }: { onInsertVariable: (variable: string) => void }) {
    const variables = [
        { name: 'Applicant Name', code: '{applicant_name}' },
        { name: 'Job Title', code: '{job_title}' },
        { name: 'Company Name', code: '{company_name}' },
        { name: 'Application Date', code: '{application_date}' },
    ];

    return (
        <div className='mb-4 p-3 bg-muted rounded-md'>
            <p className='text-sm mb-2'>Available template variables:</p>
            <div className='flex flex-wrap gap-2'>
                {variables.map((variable) => (
                    <Badge
                        key={variable.code}
                        variant='outline'
                        className='cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors'
                        onClick={() => onInsertVariable(variable.code)}
                    >
                        {variable.name}
                    </Badge>
                ))}
            </div>
        </div>
    );
}
