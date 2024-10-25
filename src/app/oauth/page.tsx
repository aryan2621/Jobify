'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { State } from '@/model/state';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface OAuthState {
    isLoading: boolean;
    error: string | null;
}

interface OAuthMessage {
    type: 'oauth_response';
    code: string;
    state: string | null;
}

const REQUIRED_PARAMS = ['authUrl', 'client_id', 'scope', 'redirect_uri'] as const;
type RequiredParam = (typeof REQUIRED_PARAMS)[number];

export default function OAuthComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [{ isLoading, error }, setState] = useState<OAuthState>({
        isLoading: false,
        error: null,
    });
    const validateParams = useCallback((): [boolean, Record<RequiredParam, string>] => {
        const params: Partial<Record<RequiredParam, string>> = {};

        for (const param of REQUIRED_PARAMS) {
            const value = searchParams?.get(param);
            if (!value) {
                return [false, {} as Record<RequiredParam, string>];
            }
            params[param] = value;
        }

        return [true, params as Record<RequiredParam, string>];
    }, [searchParams]);
    const initiateOAuth = useCallback(async () => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const [isValid, params] = validateParams();

            if (!isValid) {
                throw new Error(`Missing required parameters: ${REQUIRED_PARAMS.join(', ')}`);
            }

            const httpParams = new URLSearchParams({
                client_id: params.client_id,
                redirect_uri: params.redirect_uri,
                response_type: 'code',
                scope: params.scope,
                state: crypto.randomUUID(),
            });

            searchParams?.forEach((value, key) => {
                if (!REQUIRED_PARAMS.includes(key as RequiredParam) && key !== 'service') {
                    httpParams.set(key, value);
                }
            });

            const fullAuthUrl = `${params.authUrl}?${httpParams.toString()}`;
            router.push(fullAuthUrl);
        } catch (error) {
            setState((prev) => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to initialize OAuth flow',
                isLoading: false,
            }));
        }
    }, [router, searchParams, validateParams]);
    const sendAuthCodeToParent = useCallback(
        (authCode: string) => {
            const state = new State();

            try {
                if (!window.opener) {
                    throw new Error('Parent window not found');
                }

                const message: OAuthMessage = {
                    type: 'oauth_response',
                    code: authCode,
                    state: searchParams?.get('state') ?? null,
                };

                window.opener.postMessage(message, '*');
                state.successState();
                requestAnimationFrame(() => {
                    setTimeout(() => window.close(), 2000);
                });
            } catch (error) {
                state.errorState('connection_failed');
                setState((prev) => ({
                    ...prev,
                    error: error instanceof Error ? error.message : 'Failed to communicate with parent window',
                }));
            }
        },
        [searchParams]
    );
    useEffect(() => {
        const code = searchParams?.get('code');

        if (code) {
            sendAuthCodeToParent(code);
        } else if (!error) {
            initiateOAuth();
        } else {
            const state = new State();
            state.errorState('connection_failed');
        }
    }, [error, initiateOAuth, searchParams, sendAuthCodeToParent]);

    return (
        <div className='flex min-h-screen items-center justify-center p-4'>
            <div className='w-full max-w-md space-y-4'>
                {isLoading && (
                    <div className='text-center space-y-4'>
                        <Loader2 className='h-8 w-8 animate-spin mx-auto text-primary' />
                        <p className='text-sm text-gray-500'>Initializing OAuth flow...</p>
                    </div>
                )}

                {error && (
                    <div className='space-y-4'>
                        <Alert variant='destructive'>
                            <AlertTitle>Authentication Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>

                        <Button onClick={initiateOAuth} className='w-full' disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Please wait
                                </>
                            ) : (
                                'Retry Authentication'
                            )}
                        </Button>
                    </div>
                )}

                {!error && !isLoading && (
                    <Alert>
                        <AlertTitle>Authentication in Progress</AlertTitle>
                        <AlertDescription>Please wait while we complete the authentication process...</AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    );
}
