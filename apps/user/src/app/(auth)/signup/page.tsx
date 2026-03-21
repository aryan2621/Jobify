'use client';
import { Badge } from '@jobify/ui/badge';
import { Card, CardContent, CardFooter } from '@jobify/ui/card';
import { Label } from '@jobify/ui/label';
import { Input } from '@jobify/ui/input';
import { Button } from '@jobify/ui/button';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { ChangeEvent, FormEvent, useState } from 'react';
import { User } from '@jobify/domain/user';
import { toast } from '@jobify/ui/use-toast';
import { Eye, EyeOff, Briefcase, User as UserIcon, Loader2, Lock, Mail } from 'lucide-react';
import { userStore } from '@/store';
export default function SignupPage() {
    const [formData, setFormData] = useState<User>(new User(uuidv4(), '', '', '', '', '', '', new Date().toISOString()));
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const signUp = userStore((state) => state.signup);
    const validateForm = () => {
        if (!formData.firstName?.trim()) {
            throw new Error('First name cannot be empty.');
        }
        if (!formData.lastName?.trim()) {
            throw new Error('Last name cannot be empty.');
        }
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
            await signUp({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                username: formData.username.trim(),
                email: formData.email.trim(),
                password: formData.password,
                confirmPassword: formData.confirmPassword,
            });
            toast({
                title: 'Account Created Successfully',
                description: 'Your account has been created. Redirecting to sign in...',
            });
            window.location.assign('/login');
        }
        catch (error: any) {
            let errorMessage = 'Error creating account. Please try again.';
            if (error.response) {
                try {
                    const errorData = await error.response.json();
                    errorMessage = errorData.message || errorMessage;
                }
                catch {
                    errorMessage = 'Signup failed. Please try again.';
                }
            }
            else if (error.message) {
                errorMessage = error.message;
            }
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        }
        finally {
            setLoading(false);
        }
    };
    return (
        <div className='min-h-screen bg-background flex items-center justify-center py-10 px-4'>
            <div className='w-full max-w-md'>
                <div className='text-center mb-8'>
                    <Badge variant='outline' className='mb-4 border-border bg-muted/40 text-muted-foreground'>
                        Job seeker
                    </Badge>
                    <Link href='/' className='text-2xl font-bold flex items-center justify-center gap-2 mb-3 text-foreground'>
                        <span className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-border'>
                            <Briefcase className='h-6 w-6 text-primary' />
                        </span>
                        JobConnect
                    </Link>
                    <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2'>
                        Candidate experience
                    </p>
                    <h1 className='text-2xl font-bold mb-2'>Create your account</h1>
                    <p className='text-muted-foreground text-sm'>
                        Build your profile and apply to jobs in one place
                    </p>
                </div>

                <Card className='border-muted/60 shadow-lg'>
                    <CardContent className='pt-6'>
                        <form className='space-y-4' onSubmit={handleSubmit}>
                            <div className='grid grid-cols-2 gap-3'>
                                <div>
                                    <Label htmlFor='firstName'>First name</Label>
                                    <Input
                                        id='firstName'
                                        name='firstName'
                                        value={formData.firstName}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder='First name'
                                        className='mt-1.5 bg-background'
                                        autoComplete='given-name'
                                    />
                                </div>
                                <div>
                                    <Label htmlFor='lastName'>Last name</Label>
                                    <Input
                                        id='lastName'
                                        name='lastName'
                                        value={formData.lastName}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder='Last name'
                                        className='mt-1.5 bg-background'
                                        autoComplete='family-name'
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor='username' className='flex items-center gap-1.5'>
                                    <UserIcon className='h-3.5 w-3.5'/>
                                    Username
                                </Label>
                                <div className='relative mt-1.5'>
                                    <Input name='username' value={formData.username} onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const newUser = { ...formData, username: e.target.value };
            setFormData(newUser as User);
        }} id='username' type='text' placeholder='Choose a username' autoComplete='username' className='bg-background'/>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor='email' className='flex items-center gap-1.5'>
                                    <Mail className='h-3.5 w-3.5'/>
                                    Email
                                </Label>
                                <div className='relative mt-1.5'>
                                    <Input name='email' value={formData.email} onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const newUser = { ...formData, email: e.target.value };
            setFormData(newUser as User);
        }} id='email' type='email' placeholder='name@example.com' autoComplete='email' className='bg-background'/>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor='password' className='flex items-center gap-1.5'>
                                    <Lock className='h-3.5 w-3.5'/>
                                    Password
                                </Label>
                                <div className='relative mt-1.5'>
                                    <Input name='password' value={formData.password} onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const newUser = { ...formData, password: e.target.value };
            setFormData(newUser as User);
        }} id='password' type={showPassword ? 'text' : 'password'} placeholder='Create a password' autoComplete='new-password' className='pr-10 bg-background'/>
                                    <Button type='button' variant='ghost' size='icon' className='absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground' onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff className='h-4 w-4'/> : <Eye className='h-4 w-4'/>}
                                        <span className='sr-only'>{showPassword ? 'Hide password' : 'Show password'}</span>
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor='confirmPassword' className='flex items-center gap-1.5'>
                                    <Lock className='h-3.5 w-3.5'/>
                                    Confirm Password
                                </Label>
                                <div className='relative mt-1.5'>
                                    <Input name='confirmPassword' value={formData.confirmPassword} onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const newUser = { ...formData, confirmPassword: e.target.value };
            setFormData(newUser as User);
        }} id='confirmPassword' type={showConfirmPassword ? 'text' : 'password'} placeholder='Confirm your password' autoComplete='new-password' className='pr-10 bg-background'/>
                                    <Button type='button' variant='ghost' size='icon' className='absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <EyeOff className='h-4 w-4'/> : <Eye className='h-4 w-4'/>}
                                        <span className='sr-only'>{showConfirmPassword ? 'Hide password' : 'Show password'}</span>
                                    </Button>
                                </div>
                            </div>

                            <Button disabled={loading} type='submit' className='w-full mt-6' size='lg'>
                                {loading ? (<>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin'/>
                                        Creating Account...
                                    </>) : (<>
                                        Create Account
                                    </>)}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className='flex flex-col space-y-4 pt-2'>
                        <div className='text-center w-full'>
                            <p className='text-sm text-muted-foreground'>
                                Already have an account?{' '}
                                <Link href='/login' className='text-primary font-medium hover:underline'>
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
