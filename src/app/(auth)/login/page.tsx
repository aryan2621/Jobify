'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import Image from 'next/image';
import { FormEvent, useState } from 'react';
import { LoginUserRequest } from '@/model/request';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import ky from 'ky';
import { useRouter } from 'next/navigation';
import { userStore } from '@/store';
import { Eye, EyeOff, Briefcase, Lock, User as UserIcon, Loader2, ArrowRight, Mail, Shield } from 'lucide-react';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [req, setReq] = useState<LoginUserRequest>(new LoginUserRequest('', ''));
    const router = useRouter();
    const login = userStore((state) => state.login);
    const currentYear = new Date().getFullYear();

    const validateReq = (req: LoginUserRequest) => {
        if (!req.username) {
            throw new Error('Username cannot be empty.');
        }
        if (!req.password) {
            throw new Error('Password cannot be empty.');
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            validateReq(req);
            await login(req);
            toast({
                title: 'Welcome back!',
                description: 'You have successfully signed in.',
            });
            router.push('/');
        } catch (error: any) {
            toast({
                title: 'Login Failed',
                description: error.message || 'Invalid username or password. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-background flex flex-col items-center justify-center py-10 px-4'>
            <div className='flex w-full max-w-5xl mx-auto'>
                {/* Left Side - Image and Info */}
                <div className='hidden lg:flex flex-col w-1/2 pr-10'>
                    <div className='mb-8'>
                        <Link href='/' className='text-2xl font-bold flex items-center'>
                            <Briefcase className='mr-2 h-6 w-6 text-primary' />
                            JobConnect
                        </Link>
                    </div>

                    <div className='mb-8'>
                        <h1 className='text-3xl font-bold mb-4'>Welcome Back</h1>
                        <p className='text-muted-foreground'>
                            Sign in to your account to continue your professional journey and explore new opportunities.
                        </p>
                    </div>

                    <div className='relative mt-4 flex-1 flex items-center justify-center'>
                        <div className='absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-60 rounded-xl'></div>
                        <Image
                            src='/login.jpeg'
                            alt='Login Image'
                            width={500}
                            height={500}
                            className='relative object-cover rounded-xl shadow-xl max-h-[500px] z-10'
                        />
                    </div>

                    <div className='mt-8'>
                        <div className='bg-muted/50 p-4 rounded-lg border border-border/50'>
                            <div className='flex items-start gap-3'>
                                <div className='p-2 bg-primary/10 rounded-full text-primary flex-shrink-0'>
                                    <Shield className='h-5 w-5' />
                                </div>
                                <div>
                                    <h3 className='font-medium text-sm'>Secure Login</h3>
                                    <p className='text-xs text-muted-foreground mt-1'>
                                        Your connection to JobConnect is secure and your data is protected by industry-standard encryption.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <Card className='flex-1 lg:w-1/2 max-w-md mx-auto border-muted/60 shadow-lg'>
                    <CardHeader className='pb-6'>
                        <div className='lg:hidden mb-6'>
                            <Link href='/' className='text-xl font-bold flex items-center justify-center'>
                                <Briefcase className='mr-2 h-5 w-5 text-primary' />
                                JobConnect
                            </Link>
                        </div>
                        <CardTitle className='text-2xl font-bold'>Sign In</CardTitle>
                        <CardDescription>Enter your credentials to access your account</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form className='space-y-5' onSubmit={handleSubmit}>
                            <div className='space-y-3'>
                                <div>
                                    <Label htmlFor='username' className='flex items-center gap-1.5'>
                                        <UserIcon className='h-3.5 w-3.5' />
                                        Username
                                    </Label>
                                    <div className='relative mt-1.5'>
                                        <Input
                                            id='username'
                                            placeholder='Enter your username'
                                            value={req.username}
                                            onChange={(e) => setReq({ ...req, username: e.target.value })}
                                            className='bg-background'
                                            autoComplete='username'
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className='flex items-center justify-between'>
                                        <Label htmlFor='password' className='flex items-center gap-1.5'>
                                            <Lock className='h-3.5 w-3.5' />
                                            Password
                                        </Label>
                                        <Link href='/forgot-password' className='text-xs text-primary font-medium hover:underline'>
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className='relative mt-1.5'>
                                        <Input
                                            id='password'
                                            autoComplete='current-password'
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder='Enter your password'
                                            value={req.password}
                                            onChange={(e) => setReq({ ...req, password: e.target.value })}
                                            className='pr-10 bg-background'
                                        />
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            size='icon'
                                            className='absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground'
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                                            <span className='sr-only'>{showPassword ? 'Hide password' : 'Show password'}</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className='flex items-center space-x-2 mt-1'>
                                <Checkbox id='remember' checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
                                <label htmlFor='remember' className='text-sm text-muted-foreground'>
                                    Remember me for 30 days
                                </label>
                            </div>

                            <Button disabled={loading} type='submit' className='w-full mt-2' size='lg'>
                                {loading ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Signing In...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className='ml-2 h-4 w-4' />
                                    </>
                                )}
                            </Button>

                            <div className='relative mt-6 pt-6'>
                                <div className='absolute inset-0 flex items-center'>
                                    <Separator className='w-full' />
                                </div>
                                <div className='relative flex justify-center text-xs uppercase'>
                                    <span className='bg-card px-2 text-muted-foreground'>Or continue with</span>
                                </div>
                            </div>

                            <div className='grid grid-cols-2 gap-3 mt-2'>
                                <Button variant='outline' type='button' disabled={loading} className='w-full'>
                                    <svg className='mr-2 h-4 w-4' viewBox='0 0 24 24'>
                                        <path
                                            d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                                            fill='#4285F4'
                                        />
                                        <path
                                            d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                                            fill='#34A853'
                                        />
                                        <path
                                            d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                                            fill='#FBBC05'
                                        />
                                        <path
                                            d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                                            fill='#EA4335'
                                        />
                                    </svg>
                                    Google
                                </Button>
                                <Button variant='outline' type='button' disabled={loading} className='w-full'>
                                    <svg className='mr-2 h-4 w-4' fill='currentColor' viewBox='0 0 24 24'>
                                        <path d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z' />
                                    </svg>
                                    Facebook
                                </Button>
                            </div>
                        </form>
                    </CardContent>

                    <CardFooter className='flex flex-col space-y-4 pt-2'>
                        <div className='text-center w-full'>
                            <p className='text-sm text-muted-foreground'>
                                &#39;t have an account?{' '}
                                <Link href='/signup' className='text-primary font-medium hover:underline'>
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Bottom links */}
            <div className='mt-10 text-center text-xs text-muted-foreground'>
                <div className='flex justify-center space-x-4'>
                    <Link href='/terms' className='hover:underline'>
                        Terms of Service
                    </Link>
                    All rights reserved.
                    <Link href='/privacy' className='hover:underline'>
                        Privacy Policy
                    </Link>
                    <Link href='/contact' className='hover:underline'>
                        Contact Us
                    </Link>
                </div>
                <p className='mt-2'>© {currentYear} - JobConnect. All rights reserved.</p>
            </div>
        </div>
    );
}
