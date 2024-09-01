'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { EyeIcon, EyeOffIcon } from '@/elements/icon';
import { Switch } from '@/components/ui/switch';
import { FormEvent, useState } from 'react';
import { LoginUserRequest } from '@/model/request';
import { ReloadIcon } from '@radix-ui/react-icons';
import { toast } from '@/components/ui/use-toast';
import ky from 'ky';
import { useRouter } from 'next/navigation';

export default function Component() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [req, setReq] = useState<LoginUserRequest>(new LoginUserRequest('', ''));
    const router = useRouter();
    const validateReq = (req: LoginUserRequest) => {
        if (!req.username) {
            throw new Error('Username cannot be empty.');
        }
        if (!req.password) {
            throw new Error('Password cannot be empty.');
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,15}$/;
        if (!passwordRegex.test(req.password)) {
            throw new Error(
                'Password must be 10-15 characters long, with at least one lowercase letter, one uppercase letter, one digit, and one special character.'
            );
        }
    };
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            validateReq(req);
            await ky.post('/api/login', {
                json: req,
            });
            toast({
                title: 'Sign in successfully',
                description: 'You have successfully signed in',
            });
            router.push('/');
        } catch (error: any) {
            toast({
                title: 'Error while signing in',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 items-center justify-center min-h-screen bg-background'>
            <div className='h-full flex justify-center items-center hidden md:flex'>
                <Image src='/login.jpeg' alt='Signup Image' width={500} height={400} className='object-cover rounded-lg shadow-xl' />
            </div>
            <Card className='w-full max-w-md p-6 space-y-6 mx-auto mt-8 mb-8'>
                <CardHeader>
                    <CardTitle className='text-2xl font-bold'>Welcome Back</CardTitle>
                    <CardDescription>Sign in to your account to continue</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className='space-y-6' onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor='username'>Username</Label>
                            <Input
                                id='username'
                                placeholder='Enter your username'
                                value={req.username}
                                onChange={(e) => setReq({ ...req, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className='relative'>
                            <Label htmlFor='password'>Password</Label>
                            <Input
                                id='password'
                                autoComplete='off'
                                type={showPassword ? 'text' : 'password'}
                                placeholder='Enter your password'
                                value={req.password}
                                onChange={(e) => setReq({ ...req, password: e.target.value })}
                                required
                            />
                            <Button
                                variant='ghost'
                                size='icon'
                                className='absolute top-3/4 right-2 -translate-y-1/2 rounded-full'
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowPassword((prev) => !prev);
                                }}
                            >
                                {showPassword ? <EyeOffIcon className='w-5 h-5' /> : <EyeIcon className='w-5 h-5' />}
                            </Button>
                        </div>
                        <Button disabled={loading} type='submit' className='w-full'>
                            {loading ? (
                                <>
                                    <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                                    {'Signing Up...'}
                                </>
                            ) : (
                                <>Sign In</>
                            )}
                        </Button>
                    </form>
                    <div className='text-center'>
                        <p className='mt-4'>
                            Don't have an account?
                            <Link href='/signup' className='hover:underline'>
                                {' '}
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
