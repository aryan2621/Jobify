'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
    const [authWindowOpen, setAuthWindowOpen] = useState(false);
    const authWindowRef = useRef<Window | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const messageListenerRef = useRef<boolean>(false);

    
    const handleAuthMessage = useCallback(
        (event: MessageEvent) => {
            console.log('Received OAuth message:', event.data);

            if (event.origin !== window.location.origin) {
                toast({
                    variant: 'destructive',
                    title: 'Invalid origin',
                    description: 'The message origin is not valid.',
                });
                return;
            }

            if (event.data.type === 'oauth_response') {
                
                window.removeEventListener('message', handleAuthMessage);
                messageListenerRef.current = false;

                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                setAuthWindowOpen(false);

                if (event.data.code) {
                    onSuccess(event.data);
                } else {
                    console.log('Auth error:', event.data.error);
                    onError(event.data.error || 'Authentication failed');
                }
            }

            if (event.data.type === 'oauth_window_closed') {
                
                window.removeEventListener('message', handleAuthMessage);
                messageListenerRef.current = false;

                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                setAuthWindowOpen(false);
                onError('The OAuth window was closed.');
            }
        },
        [onSuccess, onError, toast]
    );

    
    useEffect(() => {
        return () => {
            
            if (messageListenerRef.current) {
                window.removeEventListener('message', handleAuthMessage);
                messageListenerRef.current = false;
            }

            
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            
            try {
                if (authWindowRef.current) {
                    authWindowRef.current.close();
                    authWindowRef.current = null;
                }
            } catch (e) {
                console.log('Could not access or close auth window due to COOP policy');
            }
        };
    }, [handleAuthMessage]);

    const initiateOAuth = () => {
        
        if (authWindowOpen) {
            return;
        }

        
        if (messageListenerRef.current) {
            window.removeEventListener('message', handleAuthMessage);
        }

        
        window.addEventListener('message', handleAuthMessage);
        messageListenerRef.current = true;

        const authUrl = getOAuthUrl(config);
        const newAuthWindow = window.open(authUrl, '_blank', 'width=500,height=600');

        if (!newAuthWindow) {
            toast({
                variant: 'destructive',
                title: 'Pop-up blocked',
                description: 'Please allow pop-ups and try again.',
            });
            window.removeEventListener('message', handleAuthMessage);
            messageListenerRef.current = false;
            return;
        }

        authWindowRef.current = newAuthWindow;
        setAuthWindowOpen(true);

        
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            timeoutRef.current = null;
            if (messageListenerRef.current) {
                window.removeEventListener('message', handleAuthMessage);
                messageListenerRef.current = false;
            }
            setAuthWindowOpen(false);
        }, 5 * 60 * 1000);
    };

    return (
        <>
            {children ? (
                <div onClick={initiateOAuth}>{children}</div>
            ) : (
                <Button variant={'outline'} className='w-full mb-4' onClick={initiateOAuth} disabled={authWindowOpen}>
                    {authWindowOpen ? 'Connecting...' : `Connect to ${config.service}`}
                </Button>
            )}
        </>
    );
}
