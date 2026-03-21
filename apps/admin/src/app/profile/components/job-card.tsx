import { Badge } from "@jobify/ui/badge";
import { Card, CardContent } from "@jobify/ui/card";
import { Job } from "@jobify/domain/job";
import { MapPin, Calendar, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@jobify/ui/button";
    
interface JobCardProps {
    job: Job;
    isPosted: boolean;
}


const JobCard = ({ job, isPosted = false }: JobCardProps) => {
    return (
        <Card className='mb-4 hover:shadow-md transition-shadow'>
            <CardContent className='p-5'>
                <div className='flex justify-between items-start'>
                    <div>
                        <h3 className='font-semibold'>{job.profile || 'Software Developer'}</h3>
                        <p className='text-sm text-muted-foreground'>{job.company || 'Tech Solutions Inc.'}</p>

                        <div className='flex items-center gap-2 mt-2'>
                            <Badge variant='outline' className='text-xs'>
                                {job.type || 'Full-time'}
                            </Badge>
                            <div className='flex items-center text-xs text-muted-foreground'>
                                <MapPin className='h-3 w-3 mr-1' />
                                {job.location || 'Remote'}
                            </div>
                            <div className='flex items-center text-xs text-muted-foreground'>
                                <Calendar className='h-3 w-3 mr-1' />
                                {job.createdAt || 'Posted 2 weeks ago'}
                            </div>
                        </div>
                    </div>

                    <Link href={isPosted ? `/job/${job.id}/applications` : `/job/${job.id}`}>
                        <Button variant='ghost' size='sm' className='h-8 gap-1'>
                            {isPosted ? 'View Applications' : 'View Details'}
                            <ArrowUpRight className='h-3 w-3' />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};

export default JobCard;