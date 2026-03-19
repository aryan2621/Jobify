'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * OAuth redirect compatibility: if NEXT_PUBLIC_OAUTH_REDIRECT_URL is set to
 * /auth/callback, Google (and the popup) land here. Forward to /oauth so the
 * same OAuth handler runs. In Google Console use either /oauth or /auth/callback
 * as the authorized redirect URI to match your env.
 */
export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const query = searchParams?.toString();
        router.replace(query ? `/oauth?${query}` : '/oauth');
    }, [router, searchParams]);

    return (
        <div className='flex min-h-screen items-center justify-center bg-muted/30'>
            <p className='text-muted-foreground'>Redirecting...</p>
        </div>
    );
}
