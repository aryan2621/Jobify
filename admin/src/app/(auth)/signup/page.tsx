'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { FormEvent, useState } from 'react';
import { User } from '@/model/user';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Briefcase, User as UserIcon, Loader2, Lock, Mail } from 'lucide-react';
import { userStore } from '@/store';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<User>(
        new User(uuidv4(), '', '', '', '', '', '', new Date().toISOString(), [], [], false, [])
    );
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const signUp = userStore((state) => state.signup);

    const validateForm = () => {
        if (!formData.username) {
            throw new Error('Username cannot be empty.');
        }
        if (!formData.email) {
            throw new Error('Email cannot be empty.');
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(formData.email)) {
            throw new Error('Please enter a valid email address.');
        }
        if (!formData.password) {
            throw new Error('Password cannot be empty.');
        }
        if (!formData.confirmPassword) {
            throw new Error('Confirm Password cannot be empty.');
        }
        if (formData.password !== formData.confirmPassword) {
            throw new Error('Passwords do not match.');
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            validateForm();

            setLoading(true);
            await signUp(formData);

            toast({
                title: 'Account Created Successfully',
                description: 'Your account has been created. Redirecting to login...',
            });

            setTimeout(() => {
                router.push('/login');
            }, 1500);
        } catch (error: any) {
            let errorMessage = 'Error creating account. Please try again.';

            if (error.response) {
                try {
                    const errorData = await error.response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    errorMessage = 'Signup failed. Please try again.';
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast({
                title: 'Error',
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
                    <Link href='/' className='text-2xl font-bold flex items-center justify-center mb-4'>
                        <Briefcase className='mr-2 h-6 w-6 text-primary' />
                        JobConnect
                    </Link>
                    <h1 className='text-2xl font-bold mb-2'>Create Account</h1>
                    <p className='text-muted-foreground'>
                        Join us to start your professional journey
                    </p>
                </div>

                <Card className='border-muted/60 shadow-lg'>
                    <CardContent className='pt-6'>
                        <form className='space-y-4' onSubmit={handleSubmit}>
                            <div>
                                <Label htmlFor='username' className='flex items-center gap-1.5'>
                                    <UserIcon className='h-3.5 w-3.5' />
                                    Username
                                </Label>
                                <div className='relative mt-1.5'>
                                    <Input
                                        name='username'
                                        value={formData.username}
                                        onChange={(e) => {
                                            const newUser = { ...formData, username: e.target.value };
                                            setFormData(newUser as User);
                                        }}
                                        id='username'
                                        type='text'
                                        placeholder='Choose a username'
                                        autoComplete='username'
                                        className='bg-background'
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor='email' className='flex items-center gap-1.5'>
                                    <Mail className='h-3.5 w-3.5' />
                                    Email
                                </Label>
                                <div className='relative mt-1.5'>
                                    <Input
                                        name='email'
                                        value={formData.email}
                                        onChange={(e) => {
                                            const newUser = { ...formData, email: e.target.value };
                                            setFormData(newUser as User);
                                        }}
                                        id='email'
                                        type='email'
                                        placeholder='name@example.com'
                                        autoComplete='email'
                                        className='bg-background'
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
                                        name='password'
                                        value={formData.password}
                                        onChange={(e) => {
                                            const newUser = { ...formData, password: e.target.value };
                                            setFormData(newUser as User);
                                        }}
                                        id='password'
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder='Create a password'
                                        autoComplete='new-password'
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

                            <div>
                                <Label htmlFor='confirmPassword' className='flex items-center gap-1.5'>
                                    <Lock className='h-3.5 w-3.5' />
                                    Confirm Password
                                </Label>
                                <div className='relative mt-1.5'>
                                    <Input
                                        name='confirmPassword'
                                        value={formData.confirmPassword}
                                        onChange={(e) => {
                                            const newUser = { ...formData, confirmPassword: e.target.value };
                                            setFormData(newUser as User);
                                        }}
                                        id='confirmPassword'
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder='Confirm your password'
                                        autoComplete='new-password'
                                        className='pr-10 bg-background'
                                    />
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='icon'
                                        className='absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground'
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                                        <span className='sr-only'>{showConfirmPassword ? 'Hide password' : 'Show password'}</span>
                                    </Button>
                                </div>
                            </div>

                            <Button disabled={loading} type='submit' className='w-full mt-6' size='lg'>
                                {loading ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className='flex flex-col space-y-4 pt-2'>
                        <div className='text-center w-full'>
                            <p className='text-sm text-muted-foreground'>
                                Already have an account?{' '}
                                <Link href='/login' className='text-primary font-medium hover:underline'>
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
