'use client';

import { Button } from '@jobify/ui/button';
import { useEffect, useState } from 'react';
import { toast } from '@jobify/ui/use-toast';
import { Profile } from '@jobify/domain/user';
import { OAuthHandler } from '@/components/elements/oauth-button';
import { Badge } from '@jobify/ui/badge';
import { Check, Mail } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@jobify/ui/tooltip';
import { Info } from 'lucide-react';
import { gmailOAuthConfig, googleCalenderOAuthConfig } from '@/config/oauth';
import ky from 'ky';
import { Skeleton } from '@jobify/ui/skeleton';
import { Calendar } from 'lucide-react';

interface ProfileSettingsTabProps {
    profile: Profile;
    setProfile: (profile: Profile) => void;
    submitting: boolean;
    updateUser: (field: Partial<Profile>) => Promise<void>;
}

export default function ProfileSettingsTab({ updateUser }: ProfileSettingsTabProps) {
    const [gmailConnected, setGmailConnected] = useState(false);
    const [calendarConnected, setCalendarConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setIsLoading(true);
                const data = (await ky.get('/api/settings').json()) as { gmailConnected?: boolean; calendarConnected?: boolean };
                setGmailConnected(Boolean(data?.gmailConnected));
                setCalendarConnected(Boolean(data?.calendarConnected));
            } catch (error) {
                console.error('Error fetching settings:', error);
                setGmailConnected(false);
                setCalendarConnected(false);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleOAuthSuccess = async (response: any) => {
        try {
            await ky.post('/api/connect-to-gmail', {
                json: {
                    authCode: response.code,
                },
            });
            setGmailConnected(true);
            toast({
                title: 'Gmail connected successfully',
                description: 'You can now send emails using your Gmail account from the application.',
            });
        } catch (error) {
            console.error('Error while connecting to gmail', error);
            toast({
                title: 'Gmail connection failed',
                description: 'Error connecting to Gmail. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleCalendarOAuthSuccess = async (response: any) => {
        try {
            await ky.post('/api/connect-to-calendar', {
                json: {
                    authCode: response.code,
                },
            });
            setCalendarConnected(true);
            toast({
                title: 'Calendar connected successfully',
                description: 'You can now schedule interviews using your Google Calendar.',
            });
        } catch (error) {
            console.error('Error while connecting to calendar', error);
            toast({
                title: 'Calendar connection failed',
                description: 'Error connecting to Calendar. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleOAuthError = (service: string) => {
        toast({
            title: `${service} Connection Failed`,
            description: `Error connecting to ${service}, please try again`,
            variant: 'destructive',
        });
    };

    if (isLoading) {
        return (
            <div className='space-y-6'>
                <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                        <Skeleton className='h-6 w-48' />
                        <Skeleton className='h-4 w-4' />
                    </div>
                    <div className='bg-muted/50 p-4 rounded-md'>
                        <div className='flex items-center justify-between mb-4'>
                            <div className='flex items-center'>
                                <Skeleton className='h-5 w-5 mr-2' />
                                <Skeleton className='h-5 w-32' />
                            </div>
                            <Skeleton className='h-6 w-24' />
                        </div>
                        <Skeleton className='h-4 w-full mb-4' />
                        <Skeleton className='h-10 w-32' />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                    <h3 className='text-lg font-medium'>Email Configuration</h3>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className='h-4 w-4 text-muted-foreground cursor-help' />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className='max-w-xs text-xs'>Configure your email settings to send notifications and communications</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <div className='bg-muted/50 p-4 rounded-md'>
                    <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center'>
                            <Mail className='h-5 w-5 mr-2 text-primary' />
                            <h4 className='font-medium'>Gmail Integration</h4>
                        </div>
                        {gmailConnected && (
                            <Badge variant='outline' className='bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300'>
                                <Check className='h-3.5 w-3.5 mr-1' />
                                Connected
                            </Badge>
                        )}
                    </div>

                    <p className='text-sm text-muted-foreground mb-4'>Connect your Gmail account to send emails directly from your application</p>

                    <OAuthHandler config={gmailOAuthConfig} onSuccess={handleOAuthSuccess} onError={() => handleOAuthError('Gmail')}>
                        <Button variant={gmailConnected ? 'outline' : 'default'} className='flex items-center'>
                            {gmailConnected ? (
                                <>
                                    <Check className='h-4 w-4 mr-2 text-green-500' />
                                    Connected
                                </>
                            ) : (
                                <>
                                    <Mail className='h-4 w-4 mr-2' />
                                    Connect Gmail
                                </>
                            )}
                        </Button>
                    </OAuthHandler>
                </div>

                <div className='bg-muted/50 p-4 rounded-md'>
                    <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center'>
                            <Calendar className='h-5 w-5 mr-2 text-primary' />
                            <h4 className='font-medium'>Calendar Integration</h4>
                        </div>
                        {calendarConnected && (
                            <Badge variant='outline' className='bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300'>
                                <Check className='h-3.5 w-3.5 mr-1' />
                                Connected
                            </Badge>
                        )}
                    </div>

                    <p className='text-sm text-muted-foreground mb-4'>Connect your Google Calendar to schedule interviews directly from the application</p>

                    <OAuthHandler config={googleCalenderOAuthConfig} onSuccess={handleCalendarOAuthSuccess} onError={() => handleOAuthError('Calendar')}>
                        <Button variant={calendarConnected ? 'outline' : 'default'} className='flex items-center'>
                            {calendarConnected ? (
                                <>
                                    <Check className='h-4 w-4 mr-2 text-green-500' />
                                    Connected
                                </>
                            ) : (
                                <>
                                    <Calendar className='h-4 w-4 mr-2' />
                                    Connect Calendar
                                </>
                            )}
                        </Button>
                    </OAuthHandler>
                </div>
            </div>
        </div>
    );
}
