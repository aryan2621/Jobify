'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { OAuthConfig } from '@/model/oauth';
import { getOAuthUrl } from '@/lib/utils/oauth-utils';
import { Button } from '@/components/ui/button';

interface OAuthHandlerProps {
    config: OAuthConfig;
    onSuccess: (response: any) => void;
    onError: (error: string) => void;
    children?: React.ReactNode;
}

export function OAuthHandler({ config, onSuccess, onError, children }: OAuthHandlerProps) {
    const { toast } = useToast();
    const handleAuthMessage = (event: MessageEvent) => {
        console.log(event.data);
        if (event.origin !== window.location.origin) {
            toast({
                variant: 'destructive',
                title: 'Invalid origin',
                description: 'The message origin is not valid.',
            });
            return;
        }
        if (event.data.type === 'oauth_response' && event.data.code) {
            onSuccess(event.data);
            return;
        }
        if (event.data.type === 'oauth_response' && !event.data.code) {
            onError(event.data.error);
            return;
        }
        if (event.data.type === 'oauth_window_closed') {
            onError('The OAuth window was closed.');
            return;
        }
    };

    const initiateOAuth = () => {
        const authUrl = getOAuthUrl(config);
        const authWindow = window.open(authUrl, '_blank', 'width=500,height=600');
        if (!authWindow) {
            toast({
                variant: 'destructive',
                title: 'Pop-up blocked',
                description: 'Please allow pop-ups and try again.',
            });
            return;
        }

        window.addEventListener('message', handleAuthMessage, false);
    };

    return (
        <>
            {children ? (
                <div onClick={initiateOAuth}>{children}</div>
            ) : (
                <Button variant={'outline'} className='w-full mb-4' onClick={initiateOAuth}>
                    Connect to {config.service}
                </Button>
            )}
        </>
    );
}
