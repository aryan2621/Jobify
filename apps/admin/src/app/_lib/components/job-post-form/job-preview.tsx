import { Badge } from '@jobify/ui/badge';
import { Job } from '@jobify/domain/job';

function formatPreviewDate(dateString: string) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function JobPreview({ formData }: { formData: Job }) {
    return (
        <div className='space-y-6'>
            <div className='border-b pb-4'>
                <h2 className='text-2xl font-bold'>{formData.profile || 'Job Title'}</h2>
                <div className='flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground'>
                    <div className='flex items-center'>
                        <div className='h-4 w-4 mr-1' />
                        {formData.type}
                    </div>
                    <div>•</div>
                    <div className='flex items-center'>
                        <div className='h-4 w-4 mr-1' />
                        {formData.workplaceType}
                    </div>
                    <div>•</div>
                    <div>{formData.location || 'Location'}</div>
                </div>
            </div>

            <div>
                <h3 className='text-lg font-semibold mb-2'>Company</h3>
                <p>{formData.company || 'Company Name'}</p>
            </div>

            <div>
                <h3 className='text-lg font-semibold mb-2'>Description</h3>
                <p className='whitespace-pre-line'>{formData.description || 'Job description will appear here.'}</p>
            </div>

            <div>
                <h3 className='text-lg font-semibold mb-2'>Required Skills</h3>
                <div className='flex flex-wrap gap-2'>
                    {formData.skills && formData.skills.length > 0 ? (
                        formData.skills.map((skill) => (
                            <Badge key={skill} variant='secondary'>
                                {skill}
                            </Badge>
                        ))
                    ) : (
                        <p className='text-muted-foreground'>No skills specified</p>
                    )}
                </div>
            </div>

            <div>
                <h3 className='text-lg font-semibold mb-2'>Application Deadline</h3>
                <p>{formatPreviewDate(formData.lastDateToApply)}</p>
            </div>
        </div>
    );
}
