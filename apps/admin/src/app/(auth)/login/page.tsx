'use client';

import { Badge } from '@jobify/ui/badge';
import { Card, CardContent, CardFooter } from '@jobify/ui/card';
import { Label } from '@jobify/ui/label';
import { Input } from '@jobify/ui/input';
import { Button } from '@jobify/ui/button';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { LoginUserRequest } from '@jobify/domain/request';
import { toast } from '@jobify/ui/use-toast';
import { userStore } from '@/store';
import { Eye, EyeOff, Building2, Lock, User as UserIcon, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [req, setReq] = useState<LoginUserRequest>(new LoginUserRequest('', ''));
    const login = userStore((state) => state.login);

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
            window.location.assign('/');
        } catch (error: any) {
            let errorMessage = 'Invalid username or password. Please try again.';

            if (error.response) {
                try {
                    const errorData = await error.response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    errorMessage = 'Login failed. Please try again.';
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast({
                title: 'Login Failed',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-background flex items-center justify-center py-10 px-4'>
            <div className='w-full max-w-md'>
                <div className='text-center mb-8'>
                    <Badge variant='outline' className='mb-4 border-border bg-muted/40 text-muted-foreground'>
                        Employer portal
                    </Badge>
                    <Link href='/' className='text-2xl font-bold flex items-center justify-center gap-2 mb-3 text-foreground'>
                        <span className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-border'>
                            <Building2 className='h-6 w-6 text-primary' />
                        </span>
                        JobConnect
                    </Link>
                    <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2'>
                        For hiring teams
                    </p>
                    <h1 className='text-2xl font-bold mb-2'>Employer sign in</h1>
                    <p className='text-muted-foreground text-sm'>
                        Post roles, manage applicants, and run hiring workflows
                    </p>
                </div>

                <Card className='border-muted/60 shadow-lg'>
                    <CardContent className='pt-6'>
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
                                    <Label htmlFor='password' className='flex items-center gap-1.5'>
                                        <Lock className='h-3.5 w-3.5' />
                                        Password
                                    </Label>
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
                        </form>
                    </CardContent>

                    <CardFooter className='flex flex-col space-y-4 pt-2'>
                        <div className='text-center w-full'>
                            <p className='text-sm text-muted-foreground'>
                                Don&apos;t have an account?{' '}
                                <Link href='/signup' className='text-primary font-medium hover:underline'>
                                    Create employer account
                                </Link>
                            </p>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
