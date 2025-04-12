'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function OAuthComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const code = searchParams?.get('code');
        const error = searchParams?.get('error');
        const state = searchParams?.get('state');

        if (code) {
            if (window.opener) {
                window.opener.postMessage(
                    {
                        type: 'oauth_response',
                        code: code,
                        state: state,
                    },
                    '*'
                );
                setTimeout(() => window.close(), 3000);
            }
        } else if (!error) {
            const authUrl = searchParams?.get('authUrl');
            const clientId = searchParams?.get('client_id');
            const scope = searchParams?.get('scope');
            const redirectUri = searchParams?.get('redirect_uri');

            if (authUrl && clientId && scope && redirectUri) {
                try {
                    const stateParam = crypto.randomUUID();

                    const params = new URLSearchParams({
                        client_id: clientId,
                        redirect_uri: redirectUri,
                        response_type: 'code',
                        scope: scope,
                        state: stateParam,
                    });

                    searchParams?.forEach((value, key) => {
                        if (!['authUrl', 'client_id', 'scope', 'redirect_uri', 'service', 'code', 'state'].includes(key)) {
                            params.set(key, value);
                        }
                    });

                    const fullAuthUrl = `${authUrl}?${params.toString()}`;
                    router.push(fullAuthUrl);
                } catch (err) {
                    console.error('OAuth initialization error:', err);
                }
            }
        }
    }, [router, searchParams]);

    const code = searchParams?.get('code');
    const error = searchParams?.get('error');
    const service = searchParams?.get('service') || 'the service';

    return (
        <div className='flex min-h-screen flex-col items-center justify-center p-4 bg-muted/30'>
            <Card className='w-full max-w-md shadow-lg'>
                <CardHeader className={`border-b pb-3 ${code ? 'bg-green-50 dark:bg-green-950/20' : error ? 'bg-red-50 dark:bg-red-950/20' : ''}`}>
                    <CardTitle>{code ? 'Authentication Successful' : error ? 'Authentication Failed' : `Authenticating with ${service}`}</CardTitle>
                </CardHeader>

                <CardContent className='pt-6 pb-4'>
                    {code ? (
                        <div className='text-center space-y-4'>
                            <div className='rounded-full bg-green-100 dark:bg-green-900/20 p-3 w-16 h-16 mx-auto flex items-center justify-center'>
                                <CheckCircle className='h-8 w-8 text-green-600 dark:text-green-500' />
                            </div>
                            <div>
                                <h2 className='text-lg font-medium'>Authentication Successful</h2>
                                <p className='text-sm text-muted-foreground mt-1'>
                                    You have successfully authenticated with {service}. This window will close automatically.
                                </p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className='text-center space-y-4'>
                            <div className='rounded-full bg-red-100 dark:bg-red-900/20 p-3 w-16 h-16 mx-auto flex items-center justify-center'>
                                <AlertCircle className='h-8 w-8 text-red-600 dark:text-red-500' />
                            </div>
                            <div>
                                <h2 className='text-lg font-medium'>Authentication Failed</h2>
                                <p className='text-sm text-muted-foreground mt-1'>{error || 'An error occurred during authentication.'}</p>
                            </div>
                        </div>
                    ) : (
                        <div className='text-center space-y-4'>
                            <div className='relative mx-auto w-16 h-16'>
                                <Loader2 className='h-16 w-16 animate-spin text-primary' />
                            </div>
                            <p>Redirecting to authentication page...</p>
                        </div>
                    )}
                </CardContent>

                <CardFooter className={`pt-2 pb-4 ${code || error ? 'border-t' : ''}`}>
                    <Button className='w-full' onClick={() => window.close()}>
                        Close Window
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
