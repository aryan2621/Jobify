'use client';


import { Button } from '@/components/ui/button';
import NavbarLayout from '@/layouts/navbar';
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditWorkflowPage() {
     const router = useRouter();
    return (
        <NavbarLayout>
            <div className='flex items-center justify-center h-[calc(100vh-4rem)]'>
                <div className='flex flex-col items-center space-y-4'>
                    <p className='text-lg font-semibold'>Invalid Workflow ID</p>
                    <Button className='text-white px-4 py-2 rounded' asChild>
                        <Link href='/admin/posts'>
                            <ArrowLeft className='h-4 w-4 mr-2' />
                            Go back to the posts page
                        </Link>
                    </Button>
                </div>
            </div>
        </NavbarLayout>
    );
}
