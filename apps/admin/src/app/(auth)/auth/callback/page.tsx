'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallbackContent() {
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

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className='flex min-h-screen items-center justify-center bg-muted/30'>
                <p className='text-muted-foreground'>Redirecting...</p>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
