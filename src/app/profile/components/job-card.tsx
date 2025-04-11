import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Job } from "@/model/job";
import { MapPin, Calendar, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

    
interface JobCardProps {
    job: Job;
    isPosted: boolean;
}

// Job card for displaying job list items
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

                {isPosted && (
                    <div className='mt-3 pt-3 border-t'>
                        <div className='flex justify-between items-center text-xs'>
                            <span>Applications</span>
                            <span className='font-medium'>
                                {job.applications?.length || 12}/{50}
                            </span>
                        </div>
                        <Progress value={((job.applications?.length || 12) / 50) * 100} className='h-1.5 mt-1' />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default JobCard;