import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Application, ApplicationStatus } from '@/model/application';
import { CalendarDays, MapPin, ArrowUpRight, CheckCircle, Clock, XCircle, Briefcase } from 'lucide-react';

interface ApplicationCardProps {
    application: Application;
}

const ApplicationCard = ({ application }: ApplicationCardProps) => {
    // Helper function to get status badge variant
    const getStatusVariant = (status: ApplicationStatus) => {
        switch (status) {
            case ApplicationStatus.SELECTED:
                return 'success';
            case ApplicationStatus.REJECTED:
                return 'destructive';
            case ApplicationStatus.APPLIED:
            default:
                return 'default';
        }
    };

    // Helper function to get status icon
    const getStatusIcon = (status: ApplicationStatus) => {
        switch (status) {
            case ApplicationStatus.SELECTED:
                return <CheckCircle className='h-3.5 w-3.5 mr-1' />;
            case ApplicationStatus.REJECTED:
                return <XCircle className='h-3.5 w-3.5 mr-1' />;
            case ApplicationStatus.APPLIED:
            default:
                return <Clock className='h-3.5 w-3.5 mr-1' />;
        }
    };

    // Format date to be more readable
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Get the most recent experience (if any)
    const currentJobTitle =
        application.experience && application.experience.length > 0 ? application.experience[0].profile : 'No previous experience';

    // Get the most recent employer (if any)
    const currentEmployer = application.experience && application.experience.length > 0 ? application.experience[0].company : '';

    return (
        <Card className='mb-4 hover:shadow-md transition-shadow'>
            <CardContent className='p-5'>
                <div className='flex justify-between items-start'>
                    <div>
                        <div className='flex items-center gap-1.5'>
                            <Badge variant={getStatusVariant(application.status) as any} className='mt-1.5 flex items-center text-xs px-2 py-0.5'>
                                {getStatusIcon(application.status)}
                                {application.status}
                            </Badge>
                        </div>

                        <div className='flex flex-col sm:flex-row sm:items-center gap-2 mt-3'>
                            <div className='flex items-center text-xs text-muted-foreground'>
                                <Briefcase className='h-3 w-3 mr-1' />
                                {currentJobTitle}
                                {currentEmployer && <span className='ml-1'>at {currentEmployer}</span>}
                            </div>
                            <div className='flex items-center text-xs text-muted-foreground'>
                                <MapPin className='h-3 w-3 mr-1' />
                                {application.currentLocation || 'Location not specified'}
                            </div>
                            <div className='flex items-center text-xs text-muted-foreground'>
                                <CalendarDays className='h-3 w-3 mr-1' />
                                Applied {formatDate(application.createdAt)}
                            </div>
                        </div>
                    </div>
                </div>

                {application.skills && application.skills.length > 0 && (
                    <div className='mt-3 pt-3 border-t'>
                        <div className='flex flex-wrap gap-1.5'>
                            {application.skills.slice(0, 5).map((skill, index) => (
                                <Badge key={index} variant='outline' className='text-xs'>
                                    {skill}
                                </Badge>
                            ))}
                            {application.skills.length > 5 && (
                                <Badge variant='outline' className='text-xs'>
                                    +{application.skills.length - 5} more
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ApplicationCard;
