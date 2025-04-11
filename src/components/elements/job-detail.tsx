import { Job } from '@/model/job';
import { User, UserRole } from '@/model/user';
import { useState, useEffect } from 'react';
import ky from 'ky';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
    Inbox,
    MoreHorizontal,
    Share2,
    MessageSquare,
    BarChart,
    BookmarkPlus,
    Building,
    MapPin,
    Clock3,
    CheckCircle2,
    Calendar,
    Briefcase,
    Globe,
    CreditCard,
    Clock,
    SendIcon,
    Building2,
    Link,
    Users,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import { formatDate, getDaysRemaining } from '@/lib/job-utils/utils';
import { LoadingApplicationSkeleton } from './application-skeleton';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';

export const JobDetail = ({ job }: { job: Job | null }) => {
    const [user, setUser] = useState<User | null>(null);
    const [fetching, setFetching] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [currentTab, setCurrentTab] = useState('description');

    useEffect(() => {
        if (!job) return;
        const fetchUser = async () => {
            try {
                const res = (await ky.get('/api/me').json()) as User;
                setUser(
                    new User(
                        res.id,
                        res.firstName,
                        res.lastName,
                        res.username,
                        res.email,
                        res.password,
                        res.confirmPassword,
                        res.createdAt,
                        res.jobs,
                        res.applications,
                        res.role,
                        res.tnC,
                        res.workflows
                    )
                );
            } catch (error) {
                console.error('Error fetching user:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load user information.',
                    variant: 'destructive',
                });
            } finally {
                setFetching(false);
            }
        };
        setFetching(true);
        fetchUser();
    }, [job]);

    if (!job) {
        return (
            <Card className='h-full flex items-center justify-center bg-muted/10'>
                <CardContent className='py-20'>
                    <div className='text-center'>
                        <Inbox className='h-12 w-12 text-muted-foreground/50 mx-auto mb-4' />
                        <h3 className='text-lg font-medium text-muted-foreground mb-1'>No Job Selected</h3>
                        <p className='text-sm text-muted-foreground/70 max-w-md'>Select a job from the list to view detailed information</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const daysRemaining = getDaysRemaining(job.lastDateToApply);
    const isAlreadyApplied = user?.applications.some((app) => job.applications.includes(app));
    const isOwner = job.createdBy === user?.id;

    const handleSaveJob = () => {
        setIsSaved(!isSaved);
        toast({
            title: isSaved ? 'Job Removed' : 'Job Saved',
            description: isSaved ? 'Job has been removed from your saved list.' : 'Job has been saved to your profile.',
        });
    };

    return (
        <>
            {fetching ? (
                <LoadingApplicationSkeleton />
            ) : (
                <Card className='h-full'>
                    <CardHeader className='pb-0 pt-5'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <CardTitle className='text-2xl font-bold'>{job.profile}</CardTitle>
                                <CardDescription className='flex items-center space-x-2 mt-1'>
                                    <Building2 className='h-4 w-4' />
                                    <span>{job.company ?? 'NA'}</span>
                                    <Separator orientation='vertical' className='h-4' />
                                    <MapPin className='h-4 w-4' />
                                    <span>{job.location}</span>
                                </CardDescription>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Button variant={isSaved ? 'default' : 'outline'} size='sm' className='gap-1' onClick={handleSaveJob}>
                                    <BookmarkPlus className='h-4 w-4' />
                                    {isSaved ? 'Saved' : 'Save'}
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant='ghost' size='icon'>
                                            <MoreHorizontal className='h-4 w-4' />
                                            <span className='sr-only'>More options</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align='end'>
                                        <DropdownMenuItem className='flex items-center'>
                                            <Share2 className='mr-2 h-4 w-4' />
                                            Share Job
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className='flex items-center'>
                                            <MessageSquare className='mr-2 h-4 w-4' />
                                            Contact Recruiter
                                        </DropdownMenuItem>
                                        {isOwner && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className='flex items-center'>
                                                    <BarChart className='mr-2 h-4 w-4' />
                                                    View Stats
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/posts/applications/${job.id}`} className='flex items-center'>
                                                        <Users className='mr-2 h-4 w-4' />
                                                        Manage Applications
                                                    </Link>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className='pt-4 pb-6'>
                        <Tabs defaultValue='description' value={currentTab} onValueChange={setCurrentTab}>
                            <TabsList className='grid w-full grid-cols-3'>
                                <TabsTrigger value='description' className='text-sm'>
                                    Description
                                </TabsTrigger>
                                <TabsTrigger value='company' className='text-sm'>
                                    Company
                                </TabsTrigger>
                                <TabsTrigger value='details' className='text-sm'>
                                    Job Details
                                </TabsTrigger>
                            </TabsList>
                            <ScrollArea className='h-[calc(100vh-320px)] pr-4 mt-4'>
                                <TabsContent value='description' className='space-y-4 mt-0'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <Badge variant='outline'>{job.type}</Badge>
                                            <Badge variant='outline'>{job.workplaceType}</Badge>
                                        </div>

                                        {daysRemaining > 0 ? (
                                            <div
                                                className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${
                                                    daysRemaining <= 3 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                                                }`}
                                            >
                                                <Clock3 className='h-3 w-3' />
                                                {daysRemaining} days remaining
                                            </div>
                                        ) : (
                                            <div className='text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 flex items-center gap-1'>
                                                <Clock3 className='h-3 w-3' />
                                                Deadline passed
                                            </div>
                                        )}
                                    </div>

                                    <div className='space-y-3'>
                                        <h3 className='text-lg font-semibold'>Job Description</h3>
                                        <div className='bg-muted/30 rounded-lg p-4'>
                                            <p className='text-sm whitespace-pre-line'>{job.description}</p>
                                        </div>
                                    </div>

                                    <div className='space-y-3'>
                                        <h3 className='text-lg font-semibold'>Required Skills</h3>
                                        <div className='flex flex-wrap gap-2'>
                                            {job.skills.map((skill, idx) => (
                                                <Badge key={idx} variant='secondary' className='text-sm'>
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className='bg-muted/30 rounded-lg p-4 mt-4'>
                                        <h4 className='font-medium mb-2'>How to Apply</h4>
                                        <p className='text-sm text-muted-foreground'>
                                            Click the &#39;Apply Now&#39; button to submit your application. Make sure your profile is up to date and
                                            prepare any requested documents before starting the application process.
                                        </p>
                                    </div>
                                </TabsContent>

                                <TabsContent value='company' className='space-y-4 mt-0'>
                                    <div className='bg-muted/30 rounded-lg p-4'>
                                        <div className='flex items-center gap-3 mb-4'>
                                            <div className='h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center'>
                                                <Building className='h-6 w-6 text-primary' />
                                            </div>
                                            <div>
                                                <h3 className='font-medium text-lg'>{job.company || 'Company Name'}</h3>
                                                <p className='text-sm text-muted-foreground'>{job.location}</p>
                                            </div>
                                        </div>

                                        <p className='text-sm text-muted-foreground mb-4'>
                                            This is where company information would be displayed. Currently, detailed company information is not
                                            available in the data model.
                                        </p>

                                        <div className='grid grid-cols-2 gap-3 text-sm'>
                                            <div className='flex items-center gap-2'>
                                                <Globe className='h-4 w-4 text-muted-foreground' />
                                                <span>Website: Not specified</span>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <Users className='h-4 w-4 text-muted-foreground' />
                                                <span>Size: Not specified</span>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <Briefcase className='h-4 w-4 text-muted-foreground' />
                                                <span>Industry: Not specified</span>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <CreditCard className='h-4 w-4 text-muted-foreground' />
                                                <span>Funding: Not specified</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='space-y-3'>
                                        <h3 className='text-lg font-semibold'>About Company</h3>
                                        <p className='text-sm text-muted-foreground'>
                                            No detailed company information is available. Employers can add company descriptions, values, culture
                                            information, and more to attract potential applicants.
                                        </p>
                                    </div>
                                </TabsContent>

                                <TabsContent value='details' className='space-y-4 mt-0'>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <Card className='bg-muted/30'>
                                            <CardContent className='p-4'>
                                                <h3 className='text-sm font-medium mb-3 flex items-center'>
                                                    <Briefcase className='w-4 h-4 text-primary mr-2' />
                                                    Job Details
                                                </h3>

                                                <div className='space-y-3'>
                                                    <div className='flex justify-between text-sm'>
                                                        <span className='text-muted-foreground'>Employment Type:</span>
                                                        <span>{job.type}</span>
                                                    </div>
                                                    <Separator />
                                                    <div className='flex justify-between text-sm'>
                                                        <span className='text-muted-foreground'>Workplace Type:</span>
                                                        <span>{job.workplaceType}</span>
                                                    </div>
                                                    <Separator />
                                                    <div className='flex justify-between text-sm'>
                                                        <span className='text-muted-foreground'>Location:</span>
                                                        <span>{job.location}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className='bg-muted/30'>
                                            <CardContent className='p-4'>
                                                <h3 className='text-sm font-medium mb-3 flex items-center'>
                                                    <Calendar className='w-4 h-4 text-primary mr-2' />
                                                    Job Timeline
                                                </h3>

                                                <div className='space-y-3'>
                                                    <div className='flex justify-between text-sm'>
                                                        <span className='text-muted-foreground'>Posted on:</span>
                                                        <span>{formatDate(job.createdAt)}</span>
                                                    </div>
                                                    <Separator />
                                                    <div className='flex justify-between text-sm'>
                                                        <span className='text-muted-foreground'>Apply before:</span>
                                                        <span>{formatDate(job.lastDateToApply)}</span>
                                                    </div>
                                                    <Separator />
                                                    <div className='flex justify-between text-sm'>
                                                        <span className='text-muted-foreground'>Status:</span>
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-xs ${
                                                                daysRemaining > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}
                                                        >
                                                            {daysRemaining > 0 ? 'Active' : 'Closed'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Card className='bg-muted/30'>
                                        <CardContent className='p-4'>
                                            <h3 className='text-sm font-medium mb-3 flex items-center'>
                                                <CheckCircle2 className='w-4 h-4 text-primary mr-2' />
                                                Application Process
                                            </h3>

                                            <div className='space-y-4'>
                                                <div className='flex gap-3'>
                                                    <div className='h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
                                                        <span className='text-xs font-medium'>1</span>
                                                    </div>
                                                    <div>
                                                        <p className='font-medium text-sm'>Application Submission</p>
                                                        <p className='text-xs text-muted-foreground'>Submit your resume and cover letter</p>
                                                    </div>
                                                </div>

                                                <div className='flex gap-3'>
                                                    <div className='h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
                                                        <span className='text-xs font-medium'>2</span>
                                                    </div>
                                                    <div>
                                                        <p className='font-medium text-sm'>Application Review</p>
                                                        <p className='text-xs text-muted-foreground'>Our team reviews your application</p>
                                                    </div>
                                                </div>

                                                <div className='flex gap-3'>
                                                    <div className='h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
                                                        <span className='text-xs font-medium'>3</span>
                                                    </div>
                                                    <div>
                                                        <p className='font-medium text-sm'>Interview Process</p>
                                                        <p className='text-xs text-muted-foreground'>
                                                            Selected candidates will be contacted for interviews
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </ScrollArea>
                        </Tabs>
                    </CardContent>

                    <CardFooter className='px-6 py-4 border-t bg-muted/20'>
                        {user?.role === UserRole.USER ? (
                            <Button
                                className='w-full'
                                disabled={isAlreadyApplied || isOwner || daysRemaining <= 0}
                                asChild={!(isAlreadyApplied || isOwner || daysRemaining <= 0)}
                            >
                                {isAlreadyApplied ? (
                                    <div className='flex items-center justify-center'>
                                        <CheckCircle2 className='h-5 w-5 mr-2' />
                                        Already Applied
                                    </div>
                                ) : isOwner ? (
                                    <div className='flex items-center justify-center'>
                                        <Building className='h-5 w-5 mr-2' />
                                        You cannot apply to your own job
                                    </div>
                                ) : daysRemaining <= 0 ? (
                                    <div className='flex items-center justify-center'>
                                        <Clock className='h-5 w-5 mr-2' />
                                        Application Closed
                                    </div>
                                ) : (
                                    <Link href={`/application/${job.id}`} className='w-full flex items-center justify-center'>
                                        <SendIcon className='h-5 w-5 mr-2' />
                                        Apply Now
                                    </Link>
                                )}
                            </Button>
                        ) : (
                            <Button className='w-full' disabled={!isOwner} asChild={isOwner}>
                                {isOwner ? (
                                    <Link href={`/posts/applications/${job.id}`} className='w-full flex items-center justify-center'>
                                        <Users className='h-5 w-5 mr-2' />
                                        View Applications ({job.applications.length})
                                    </Link>
                                ) : (
                                    <div className='flex items-center justify-center'>
                                        <Users className='h-5 w-5 mr-2' />
                                        You cannot access applications
                                    </div>
                                )}
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            )}
        </>
    );
};
