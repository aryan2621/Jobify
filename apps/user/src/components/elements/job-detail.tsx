import { Job } from '@jobify/domain/job';
import { User } from '@jobify/domain/user';
import { useState, useEffect } from 'react';
import ky from 'ky';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@jobify/ui/card';
import { Inbox, Share2, Building, MapPin, Clock3, CheckCircle2, Calendar, Briefcase, Clock, SendIcon, Building2, } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@jobify/ui/separator';
import { Badge } from '@jobify/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@jobify/ui/tabs';
import { ScrollArea } from '@jobify/ui/scroll-area';
import { toast } from '@jobify/ui/use-toast';
import { formatDate, getDaysRemaining } from '@/lib/job-utils/utils';
import { LoadingApplicationSkeleton } from './application-skeleton';
import { Button } from '@jobify/ui/button';
export const JobDetail = ({ job }: {
    job: Job | null;
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [hasApplied, setHasApplied] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [currentTab, setCurrentTab] = useState('description');
    useEffect(() => {
        if (!job)
            return;
        let cancelled = false;
        const load = async () => {
            try {
                setFetching(true);
                const res = (await ky.get('/api/me').json()) as {
                    id: string;
                    firstName: string;
                    lastName: string;
                    username: string;
                    email: string;
                    createdAt?: string;
                };
                if (cancelled)
                    return;
                setUser(
                    new User(
                        res.id,
                        res.firstName,
                        res.lastName,
                        res.username,
                        res.email,
                        '',
                        '',
                        res.createdAt ?? ''
                    )
                );
                const { applied } = await ky.get(`/api/applications/check?jobId=${encodeURIComponent(job.id)}`).json<{ applied: boolean }>();
                if (!cancelled)
                    setHasApplied(applied);
            }
            catch {
                if (!cancelled) {
                    setUser(null);
                    setHasApplied(false);
                }
            }
            finally {
                if (!cancelled)
                    setFetching(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [job]);
    if (!job) {
        return (<Card className='h-full flex items-center justify-center bg-muted/10'>
                <CardContent className='py-20'>
                    <div className='text-center'>
                        <Inbox className='h-12 w-12 text-muted-foreground/50 mx-auto mb-4'/>
                        <h3 className='text-lg font-medium text-muted-foreground mb-1'>No Job Selected</h3>
                        <p className='text-sm text-muted-foreground/70 max-w-md'>Select a job from the list to view detailed information</p>
                    </div>
                </CardContent>
            </Card>);
    }
    const daysRemaining = getDaysRemaining(job.lastDateToApply);
    const isAlreadyApplied = hasApplied;
    const isOwner = job.createdBy === user?.id;
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/jobs?jobId=${job.id}` : '';
    const shareTitle = `${job.profile} at ${job.company ?? 'Company'}`;
    const shareText = `${job.profile} - ${job.company ?? 'Company'} (${job.location})`;
    const handleShareJob = async () => {
        try {
            if (typeof navigator !== 'undefined' && navigator.share) {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl,
                });
                toast({ title: 'Shared', description: 'Job link shared successfully.' });
            }
            else {
                await navigator.clipboard.writeText(shareUrl);
                toast({ title: 'Link copied', description: 'Job link copied to clipboard.' });
            }
        }
        catch (err) {
            if ((err as Error).name !== 'AbortError') {
                try {
                    await navigator.clipboard.writeText(shareUrl);
                    toast({ title: 'Link copied', description: 'Job link copied to clipboard.' });
                }
                catch {
                    toast({ title: 'Share failed', description: 'Could not share or copy link.', variant: 'destructive' });
                }
            }
        }
    };
    return (<>
            {fetching ? (<LoadingApplicationSkeleton />) : (<Card className='w-full'>
                    <CardHeader className='pb-0 pt-5'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <CardTitle className='text-2xl font-bold'>{job.profile}</CardTitle>
                                <CardDescription className='flex items-center space-x-2 mt-1'>
                                    <Building2 className='h-4 w-4'/>
                                    <span>{job.company ?? 'NA'}</span>
                                    <Separator orientation='vertical' className='h-4'/>
                                    <MapPin className='h-4 w-4'/>
                                    <span>{job.location}</span>
                                </CardDescription>
                            </div>

                            <div className='flex items-center gap-2 flex-shrink-0'>
                                <Button size='sm' disabled={isAlreadyApplied || isOwner || daysRemaining <= 0} asChild={!(isAlreadyApplied || isOwner || daysRemaining <= 0)} className={isAlreadyApplied || isOwner || daysRemaining <= 0
                ? 'cursor-default'
                : ''}>
                                    {isAlreadyApplied ? (<span className='flex items-center gap-1.5'>
                                            <CheckCircle2 className='h-4 w-4'/>
                                            Already Applied
                                        </span>) : isOwner ? (<span className='flex items-center gap-1.5'>
                                            <Building className='h-4 w-4'/>
                                            Own job
                                        </span>) : daysRemaining <= 0 ? (<span className='flex items-center gap-1.5'>
                                            <Clock className='h-4 w-4'/>
                                            Application Closed
                                        </span>) : (<Link href={`/applications/new/${job.id}`} className='flex items-center gap-1.5'>
                                            <SendIcon className='h-4 w-4'/>
                                            Apply Now
                                        </Link>)}
                                </Button>
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    className='gap-1.5'
                                    onClick={() => void handleShareJob()}
                                >
                                    <Share2 className='h-4 w-4' />
                                    Share
                                </Button>
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
                            <ScrollArea className='max-h-[70vh] pr-4 mt-4'>
                                <TabsContent value='description' className='space-y-4 mt-0'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <Badge variant='outline'>{job.type}</Badge>
                                            <Badge variant='outline'>{job.workplaceType}</Badge>
                                        </div>

                                        {daysRemaining > 0 ? (<div className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${daysRemaining <= 3 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                                <Clock3 className='h-3 w-3'/>
                                                {daysRemaining} days remaining
                                            </div>) : (<div className='text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 flex items-center gap-1'>
                                                <Clock3 className='h-3 w-3'/>
                                                Deadline passed
                                            </div>)}
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
                                            {job.skills.map((skill, idx) => (<Badge key={idx} variant='secondary' className='text-sm'>
                                                    {skill}
                                                </Badge>))}
                                        </div>
                                    </div>

                                    <div className='bg-muted/30 rounded-lg p-4 mt-4'>
                                        <h4 className='font-medium mb-2'>How to Apply</h4>
                                        <p className='text-sm text-muted-foreground'>
                                            Use the Apply Now button above to submit your application for this role.
                                        </p>
                                    </div>
                                </TabsContent>

                                <TabsContent value='company' className='space-y-4 mt-0'>
                                    <div className='bg-muted/30 rounded-lg p-4'>
                                        <div className='flex items-center gap-3'>
                                            <div className='h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center'>
                                                <Building className='h-6 w-6 text-primary'/>
                                            </div>
                                            <div>
                                                <h3 className='font-medium text-lg'>{job.company || '—'}</h3>
                                                <p className='text-sm text-muted-foreground flex items-center gap-1'>
                                                    <MapPin className='h-3.5 w-3.5'/>
                                                    {job.location}
                                                </p>
                                            </div>
                                        </div>
                                        <p className='text-sm text-muted-foreground mt-4'>
                                            No additional company information provided for this posting.
                                        </p>
                                    </div>
                                </TabsContent>

                                <TabsContent value='details' className='space-y-4 mt-0'>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <Card className='bg-muted/30'>
                                            <CardContent className='p-4'>
                                                <h3 className='text-sm font-medium mb-3 flex items-center'>
                                                    <Briefcase className='w-4 h-4 text-primary mr-2'/>
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
                                                    <Calendar className='w-4 h-4 text-primary mr-2'/>
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
                                                        <span className={`px-2 py-0.5 rounded text-xs ${daysRemaining > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
                                                <CheckCircle2 className='w-4 h-4 text-primary mr-2'/>
                                                Application Process
                                            </h3>
                                            <p className='text-sm text-muted-foreground'>
                                                No application process details provided for this role.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </ScrollArea>
                        </Tabs>
                    </CardContent>
                </Card>)}
        </>);
};
