'use client';
import { Button } from '@/components/ui/button';
import NavbarLayout from '@/layouts/navbar';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function Component() {
    const router = useRouter();
    return (
        <NavbarLayout>
            <div className='flex items-center justify-center h-[calc(100vh-4rem)]'>
                <div className='flex flex-col items-center space-y-4'>
                    <p className='text-lg font-semibold'>Invalid Job ID</p>
                    <Button className='text-white px-4 py-2 rounded' onClick={() => router.push('/posts')}>
                        Go back to the posts page
                    </Button>
                </div>
            </div>
        </NavbarLayout>
    );
}
