'use client';

import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { State } from '@/model/state';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    Copy,
    ExternalLink,
    Info,
    Key,
    Link,
    Loader2,
    LockKeyhole,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
} from 'lucide-react';

// Types
interface OAuthState {
    isLoading: boolean;
    isSuccess: boolean;
    error: string | null;
    errorDetails: string | null;
    errorCode: ErrorCode | null;
    stage: AuthStage;
    autoCloseCountdown: number | null;
    serviceName: string;
    stateParam: string | null;
}

interface OAuthMessage {
    type: 'oauth_response';
    code: string;
    state: string | null;
    pkceVerifier?: string;
}

type ErrorCode =
    | 'missing_parameters'
    | 'invalid_parameters'
    | 'popup_blocked'
    | 'connection_failed'
    | 'communication_error'
    | 'state_mismatch'
    | 'auth_rejected'
    | 'timeout'
    | 'unknown';

type AuthStage = 'initializing' | 'redirecting' | 'waiting_for_auth' | 'processing_response' | 'sending_response' | 'completed' | 'failed';

type RequiredParam = (typeof REQUIRED_PARAMS)[number];

// Constants
const REQUIRED_PARAMS = ['authUrl', 'client_id', 'scope', 'redirect_uri'] as const;

const AUTO_CLOSE_DELAY = 3000; // 3 seconds
const AUTH_TIMEOUT = 300000; // 5 minutes

// Helper functions
const generatePKCEChallenge = async (): Promise<{ verifier: string; challenge: string }> => {
    // Generate a random string for the code verifier
    const generateRandomString = (): string => {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, (byte) => ('0' + (byte & 0xff).toString(16)).slice(-2)).join('');
    };

    // Create code verifier - random string between 43-128 chars
    const verifier = generateRandomString();

    // Create the code challenge from the verifier
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);

    // Base64 encode the digest and make it URL safe
    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

    return { verifier, challenge: base64 };
};
export default function OAuthComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [state, setState] = useState<OAuthState>({
        isLoading: true,
        isSuccess: false,
        error: null,
        errorDetails: null,
        errorCode: null,
        stage: 'initializing',
        autoCloseCountdown: null,
        serviceName: searchParams?.get('service') || 'the service',
        stateParam: null,
    });

    // Refs
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const pkceVerifierRef = useRef<string | null>(null);

    // Derived values
    const isAuthCodePresent = useMemo(() => Boolean(searchParams?.get('code')), [searchParams]);

    // Calculate progress based on stage
    const progressPercentage = useMemo(() => {
        const stages: Record<AuthStage, number> = {
            initializing: 10,
            redirecting: 30,
            waiting_for_auth: 40,
            processing_response: 70,
            sending_response: 80,
            completed: 100,
            failed: 100,
        };

        return stages[state.stage] || 0;
    }, [state.stage]);

    // Get stage message for user feedback
    const stageMessage = useMemo(() => {
        const messages: Record<AuthStage, string> = {
            initializing: 'Initializing authentication process...',
            redirecting: 'Redirecting to authorization page...',
            waiting_for_auth: 'Waiting for authorization...',
            processing_response: 'Processing authorization response...',
            sending_response: 'Sending authorization data...',
            completed: 'Authentication completed successfully!',
            failed: 'Authentication failed',
        };

        return messages[state.stage] || 'Processing...';
    }, [state.stage]);

    /**
     * Validates all required parameters for OAuth flow
     */
    const validateParams = useCallback((): [boolean, Record<RequiredParam, string>, ErrorCode | null, string | null] => {
        const params: Partial<Record<RequiredParam, string>> = {};
        const missingParams: string[] = [];

        for (const param of REQUIRED_PARAMS) {
            const value = searchParams?.get(param);
            if (!value) {
                missingParams.push(param);
            } else {
                params[param] = value;
            }
        }

        if (missingParams.length > 0) {
            return [false, {} as Record<RequiredParam, string>, 'missing_parameters', `Missing required parameters: ${missingParams.join(', ')}`];
        }

        // Validate redirect_uri format
        try {
            new URL(params.redirect_uri as string);
        } catch (e) {
            return [false, params as Record<RequiredParam, string>, 'invalid_parameters', 'Invalid redirect_uri format'];
        }

        return [true, params as Record<RequiredParam, string>, null, null];
    }, [searchParams]);

    /**
     * Initiates the OAuth flow by redirecting to the authorization URL
     */
    const initiateOAuth = useCallback(async () => {
        setState((prev) => ({
            ...prev,
            isLoading: true,
            error: null,
            errorDetails: null,
            errorCode: null,
            stage: 'initializing',
        }));

        try {
            const [isValid, params, errorCode, errorMessage] = validateParams();

            if (!isValid) {
                throw new Error(errorMessage || `Missing parameters: ${REQUIRED_PARAMS.join(', ')}`, {
                    cause: { code: errorCode || 'missing_parameters' },
                });
            }

            setState((prev) => ({ ...prev, stage: 'redirecting' }));

            // Generate PKCE challenge and verifier for enhanced security
            const { verifier, challenge } = await generatePKCEChallenge();
            pkceVerifierRef.current = verifier;

            // Generate state parameter to prevent CSRF attacks
            const stateParam = crypto.randomUUID();

            const httpParams = new URLSearchParams({
                client_id: params.client_id,
                redirect_uri: params.redirect_uri,
                response_type: 'code',
                scope: params.scope,
                state: stateParam,
                code_challenge: challenge,
                code_challenge_method: 'S256',
            });

            // Add any additional custom parameters
            searchParams?.forEach((value, key) => {
                if (!REQUIRED_PARAMS.includes(key as RequiredParam) && key !== 'service' && key !== 'code' && key !== 'state') {
                    httpParams.set(key, value);
                }
            });

            setState((prev) => ({ ...prev, stateParam }));

            // Set timeout for auth process
            timeoutRef.current = setTimeout(() => {
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: 'Authentication timed out',
                    errorDetails: 'The authentication process took too long to complete',
                    errorCode: 'timeout',
                    stage: 'failed',
                }));
            }, AUTH_TIMEOUT);

            const fullAuthUrl = `${params.authUrl}?${httpParams.toString()}`;
            router.push(fullAuthUrl);
        } catch (error) {
            console.error('[OAuth] Initialization error:', error);

            const errorCause = error instanceof Error ? (error.cause as { code?: ErrorCode } | undefined) : undefined;
            const errorCode = errorCause?.code || 'unknown';

            setState((prev) => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to initialize OAuth flow',
                errorDetails: error instanceof Error && error.stack ? error.stack : null,
                errorCode,
                isLoading: false,
                stage: 'failed',
            }));

            const stateManager = new State();
            stateManager.errorState(errorCode);
        }
    }, [router, searchParams, validateParams]);

    /**
     * Sends the authorization code back to the parent window
     */
    const sendAuthCodeToParent = useCallback(
        (authCode: string) => {
            setState((prev) => ({
                ...prev,
                stage: 'sending_response',
                isLoading: true,
            }));

            const stateManager = new State();

            try {
                if (!window.opener) {
                    throw new Error('Parent window not found', {
                        cause: { code: 'communication_error' },
                    });
                }

                // Check if state matches for CSRF protection
                const receivedState = searchParams?.get('state');
                if (state.stateParam && receivedState !== state.stateParam) {
                    throw new Error('State parameter mismatch - possible CSRF attack', {
                        cause: { code: 'state_mismatch' },
                    });
                }

                const message: OAuthMessage = {
                    type: 'oauth_response',
                    code: authCode,
                    state: receivedState || null,
                    pkceVerifier: pkceVerifierRef.current || undefined,
                };

                // More secure origin targeting - replace '*' with specific origin in production
                // The parent page origin should be passed as a parameter for better security
                const targetOrigin = '*';
                window.opener.postMessage(message, targetOrigin);

                stateManager.successState();

                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    isSuccess: true,
                    stage: 'completed',
                    autoCloseCountdown: Math.floor(AUTO_CLOSE_DELAY / 1000),
                }));

                // Start countdown for auto-close
                countdownRef.current = setInterval(() => {
                    setState((prev) => {
                        const newCount = (prev.autoCloseCountdown || 0) - 1;
                        if (newCount <= 0) {
                            clearInterval(countdownRef.current!);
                            window.close();
                            return prev;
                        }
                        return { ...prev, autoCloseCountdown: newCount };
                    });
                }, 1000);

                // Set timeout for auto-close
                setTimeout(() => window.close(), AUTO_CLOSE_DELAY);
            } catch (error) {
                console.error('[OAuth] Communication error:', error);

                const errorCause = error instanceof Error ? (error.cause as { code?: ErrorCode } | undefined) : undefined;
                const errorCode = errorCause?.code || 'communication_error';

                stateManager.errorState(errorCode);

                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: error instanceof Error ? error.message : 'Failed to communicate with parent window',
                    errorDetails: error instanceof Error && error.stack ? error.stack : null,
                    errorCode,
                    stage: 'failed',
                }));
            }
        },
        [searchParams, state.stateParam]
    );

    /**
     * Main effect to handle the OAuth flow
     */
    useEffect(() => {
        const code = searchParams?.get('code');
        const error = searchParams?.get('error');
        const errorDescription = searchParams?.get('error_description');

        if (error) {
            // Handle OAuth provider errors
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: error,
                errorDetails: errorDescription || 'The authentication request was rejected',
                errorCode: 'auth_rejected',
                stage: 'failed',
            }));

            const stateManager = new State();
            stateManager.errorState('auth_rejected');
        } else if (code) {
            setState((prev) => ({
                ...prev,
                stage: 'processing_response',
                isLoading: true,
            }));

            // Clear timeout if code is received
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            sendAuthCodeToParent(code);
        } else if (!state.error && !state.isSuccess) {
            initiateOAuth();
        }

        // Cleanup timeouts and intervals on unmount
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }
        };
    }, [initiateOAuth, searchParams, sendAuthCodeToParent, state.error, state.isSuccess]);

    /**
     * Handles manual retry
     */
    const handleRetry = useCallback(() => {
        router.push(window.location.pathname);
    }, [router]);

    /**
     * Copy error details to clipboard
     */
    const copyErrorToClipboard = useCallback(() => {
        const errorText = `Error: ${state.error}\n${state.errorDetails || ''}`;
        navigator.clipboard.writeText(errorText).catch((err) => {
            console.error('Failed to copy error details:', err);
        });
    }, [state.error, state.errorDetails]);

    /**
     * Copy debug information to clipboard
     */
    const copyDebugInfo = useCallback(() => {
        const debugInfo = {
            error: state.error,
            errorDetails: state.errorDetails,
            errorCode: state.errorCode,
            stage: state.stage,
            queryParams: Object.fromEntries([...(searchParams?.entries() || [])]),
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
        };

        navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2)).catch((err) => {
            console.error('Failed to copy debug info:', err);
        });
    }, [searchParams, state.error, state.errorCode, state.errorDetails, state.stage]);

    /**
     * Renders error content based on error code
     */
    const renderErrorContent = useCallback(() => {
        const errorMessages: Record<ErrorCode, { title: string; description: string; icon: JSX.Element }> = {
            missing_parameters: {
                title: 'Configuration Error',
                description: 'Some required parameters are missing. Please contact support.',
                icon: <AlertCircle className='h-8 w-8 text-destructive' />,
            },
            invalid_parameters: {
                title: 'Invalid Configuration',
                description: 'Some parameters have invalid format. Please contact support.',
                icon: <AlertCircle className='h-8 w-8 text-destructive' />,
            },
            popup_blocked: {
                title: 'Popup Blocked',
                description: 'The authentication popup was blocked. Please allow popups and try again.',
                icon: <ShieldAlert className='h-8 w-8 text-destructive' />,
            },
            connection_failed: {
                title: 'Connection Failed',
                description: 'Could not connect to the authentication service. Please check your internet connection.',
                icon: <Link className='h-8 w-8 text-destructive' />,
            },
            communication_error: {
                title: 'Communication Error',
                description: 'Failed to communicate with the parent window.',
                icon: <Link className='h-8 w-8 text-destructive' />,
            },
            state_mismatch: {
                title: 'Security Error',
                description: 'Security verification failed. Please try again.',
                icon: <ShieldAlert className='h-8 w-8 text-destructive' />,
            },
            auth_rejected: {
                title: 'Authentication Rejected',
                description: 'The authentication request was rejected or cancelled.',
                icon: <LockKeyhole className='h-8 w-8 text-destructive' />,
            },
            timeout: {
                title: 'Authentication Timeout',
                description: 'The authentication process took too long to complete.',
                icon: <RefreshCw className='h-8 w-8 text-destructive' />,
            },
            unknown: {
                title: 'Unknown Error',
                description: 'An unexpected error occurred. Please try again or contact support.',
                icon: <AlertCircle className='h-8 w-8 text-destructive' />,
            },
        };

        const error = errorMessages[state.errorCode || 'unknown'];

        return (
            <div className='text-center space-y-2'>
                {error.icon}
                <h2 className='text-lg font-semibold'>{error.title}</h2>
                <p className='text-sm text-muted-foreground'>{error.description}</p>

                {state.error && (
                    <Alert variant='destructive' className='mt-4 text-left'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertTitle>Error Details</AlertTitle>
                        <AlertDescription className='break-words'>
                            {state.error}
                            {state.errorDetails && (
                                <details className='mt-2 text-xs'>
                                    <summary className='cursor-pointer'>Technical Details</summary>
                                    <p className='mt-1 whitespace-pre-wrap break-words'>{state.errorDetails}</p>
                                </details>
                            )}
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        );
    }, [state.error, state.errorCode, state.errorDetails]);

    return (
        <div className='flex min-h-screen flex-col items-center justify-center p-4 bg-muted/30' role='dialog' aria-labelledby='oauth-dialog-title'>
            <TooltipProvider>
                <Card className='w-full max-w-md shadow-lg'>
                    <CardHeader
                        className={`
            border-b pb-3
            ${state.isSuccess ? 'bg-green-50 dark:bg-green-950/20' : ''}
            ${state.error ? 'bg-red-50 dark:bg-red-950/20' : ''}
          `}
                    >
                        <div className='flex items-center justify-between'>
                            <CardTitle id='oauth-dialog-title'>
                                {state.isSuccess
                                    ? 'Authentication Successful'
                                    : state.error
                                      ? 'Authentication Failed'
                                      : `Authenticating with ${state.serviceName}`}
                            </CardTitle>

                            {state.error && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8'
                                            onClick={copyDebugInfo}
                                            aria-label='Copy debug information'
                                        >
                                            <Copy className='h-4 w-4' />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Copy debug information</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>

                        {state.isLoading && !state.isSuccess && !state.error && (
                            <Progress value={progressPercentage} className='h-1 mt-2' aria-label='Authentication progress' />
                        )}
                    </CardHeader>

                    <CardContent className='pt-6 pb-4'>
                        {state.isLoading && !state.isSuccess && !state.error ? (
                            <div className='text-center space-y-4' aria-live='polite'>
                                <div className='relative mx-auto w-16 h-16'>
                                    <Loader2 className='h-16 w-16 animate-spin text-primary' />
                                    <div className='absolute inset-0 flex items-center justify-center'>
                                        <LockKeyhole className='h-6 w-6 text-primary' />
                                    </div>
                                </div>
                                <div>
                                    <h2 className='text-lg font-medium'>{stageMessage}</h2>
                                    <p className='text-sm text-muted-foreground mt-1'>
                                        {state.stage === 'waiting_for_auth'
                                            ? `Please complete the authentication in the ${state.serviceName} window`
                                            : 'This window will automatically close when completed'}
                                    </p>
                                </div>
                            </div>
                        ) : state.isSuccess ? (
                            <div className='text-center space-y-4' aria-live='polite'>
                                <div className='rounded-full bg-green-100 dark:bg-green-900/20 p-3 w-16 h-16 mx-auto flex items-center justify-center'>
                                    <CheckCircle className='h-8 w-8 text-green-600 dark:text-green-500' />
                                </div>
                                <div>
                                    <h2 className='text-lg font-medium'>Authentication Successful</h2>
                                    <p className='text-sm text-muted-foreground mt-1'>
                                        You have successfully authenticated with {state.serviceName}.
                                        {state.autoCloseCountdown !== null && (
                                            <>
                                                {' '}
                                                This window will close in {state.autoCloseCountdown} second{state.autoCloseCountdown !== 1 && 's'}.
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            renderErrorContent()
                        )}
                    </CardContent>

                    <CardFooter
                        className={`
            pt-2 pb-4 flex flex-col sm:flex-row gap-2 justify-between
            ${state.isSuccess || state.error ? 'border-t' : ''}
          `}
                    >
                        {state.error ? (
                            <>
                                <Button variant='outline' className='w-full sm:w-auto' onClick={handleRetry} disabled={state.isLoading}>
                                    <RefreshCw className='mr-2 h-4 w-4' />
                                    Try Again
                                </Button>

                                <Button variant='default' className='w-full sm:w-auto' onClick={() => window.close()}>
                                    Close Window
                                </Button>
                            </>
                        ) : state.isSuccess ? (
                            <Button className='w-full' onClick={() => window.close()}>
                                Close Window
                            </Button>
                        ) : (
                            <div className='w-full flex items-center justify-between text-xs text-muted-foreground pt-2'>
                                <div className='flex items-center'>
                                    <ShieldCheck className='h-3.5 w-3.5 mr-1.5' />
                                    <span>Secure authentication</span>
                                </div>

                                <Button variant='ghost' size='sm' className='h-6 text-xs' onClick={() => window.close()}>
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            </TooltipProvider>
        </div>
    );
}
