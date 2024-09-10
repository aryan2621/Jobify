'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { v4 as uuidv4 } from 'uuid';
import { EyeIcon, EyeOffIcon } from '@/elements/icon';
import { FormEvent, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, UserRoles } from '@/model/user';
import ky from 'ky';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { ReloadIcon } from '@radix-ui/react-icons';
import { userStore } from '@/store';

export default function Component() {
    const router = useRouter();
    const [formData, setFormData] = useState<User>(
        new User(uuidv4(), '', '', '', '', '', '', new Date().toISOString(), [], [], [UserRoles.USER], false)
    );
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const signUp = userStore((state) => state.signup);

    const validateUser = (user: User) => {
        if (!user.firstName) {
            throw new Error('First name cannot be empty.');
        }
        if (!user.lastName) {
            throw new Error('Last name cannot be empty.');
        }
        if (!user.username) {
            throw new Error('Username cannot be empty.');
        }
        if (!user.email) {
            throw new Error('Email cannot be empty.');
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(user.email)) {
            throw new Error('Email should be in the format, e.g., xyz@ac.in');
        }
        if (!user.password) {
            throw new Error('Password cannot be empty.');
        }
        if (!user.confirmPassword) {
            throw new Error('Confirm Password cannot be empty.');
        }
        if (user.password !== user.confirmPassword) {
            throw new Error('Password and Confirm Password do not match.');
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,15}$/;
        if (!passwordRegex.test(user.password)) {
            throw new Error(
                'Password must be 10-15 characters long, with at least one lowercase letter, one uppercase letter, one digit, and one special character.'
            );
        }

        if (!user.tnC) {
            throw new Error('You must agree to the terms and conditions');
        }
        if (user.roles.length === 0) {
            throw new Error('You must select a role');
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            validateUser(formData);
            await signUp(formData);
            toast({
                title: 'Account Created',
                description: 'Your account has been created successfully',
            });
            router.push('/login');
        } catch (error: any) {
            console.log;
            toast({
                title: 'Error while signing up',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 items-center justify-center min-h-screen bg-background'>
            <div className='h-full flex justify-center items-center hidden md:flex'>
                <Image src='/signup.jpeg' alt='Signup Image' width={500} height={400} className='object-cover rounded-lg shadow-xl' />
            </div>
            <Card className='w-full max-w-md p-6 space-y-6 mx-auto mt-8 mb-8'>
                <CardHeader>
                    <CardTitle className='text-2xl font-bold'>Create an Account</CardTitle>
                    <CardDescription>Sign up to get started</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className='space-y-6' onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <Label htmlFor='firstName'>First Name</Label>
                                <Input
                                    name='firstName'
                                    value={formData.firstName}
                                    onChange={(e) => {
                                        const { name, value } = e.currentTarget;
                                        const newUser = new User(
                                            formData.id,
                                            value,
                                            formData.lastName,
                                            formData.username,
                                            formData.email,
                                            formData.password,
                                            formData.confirmPassword,
                                            formData.createdAt,
                                            formData.jobs,
                                            formData.applications,
                                            formData.roles,
                                            formData.tnC
                                        );
                                        setFormData(newUser);
                                    }}
                                    id='firstName'
                                    placeholder='Enter your first name'
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor='lastName'>Last Name</Label>
                                <Input
                                    name='lastName'
                                    value={formData.lastName}
                                    onChange={(e) => {
                                        const { name, value } = e.currentTarget;
                                        const newUser = new User(
                                            formData.id,
                                            formData.firstName,
                                            value,
                                            formData.username,
                                            formData.email,
                                            formData.password,
                                            formData.confirmPassword,
                                            formData.createdAt,
                                            formData.jobs,
                                            formData.applications,
                                            formData.roles,
                                            formData.tnC
                                        );
                                        setFormData(newUser);
                                    }}
                                    id='lastName'
                                    placeholder='Enter your last name'
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor='username'>Username</Label>
                            <Input
                                name='username'
                                value={formData.username}
                                onChange={(e) => {
                                    const { name, value } = e.currentTarget;
                                    const newUser = new User(
                                        formData.id,
                                        formData.firstName,
                                        formData.lastName,
                                        value,
                                        formData.email,
                                        formData.password,
                                        formData.confirmPassword,
                                        formData.createdAt,
                                        formData.jobs,
                                        formData.applications,
                                        formData.roles,
                                        formData.tnC
                                    );
                                    setFormData(newUser);
                                }}
                                id='username'
                                placeholder='Choose a username'
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor='email'>Email</Label>
                            <Input
                                name='email'
                                value={formData.email}
                                onChange={(e) => {
                                    const { name, value } = e.currentTarget;
                                    const newUser = new User(
                                        formData.id,
                                        formData.firstName,
                                        formData.lastName,
                                        formData.username,
                                        value,
                                        formData.password,
                                        formData.confirmPassword,
                                        formData.createdAt,
                                        formData.jobs,
                                        formData.applications,
                                        formData.roles,
                                        formData.tnC
                                    );
                                    setFormData(newUser);
                                }}
                                id='email'
                                type='email'
                                placeholder='Enter your email'
                                required
                            />
                        </div>
                        <div className='relative'>
                            <Label htmlFor='password'>Password</Label>
                            <Input
                                name='password'
                                value={formData.password}
                                onChange={(e) => {
                                    const { name, value } = e.currentTarget;
                                    const newUser = new User(
                                        formData.id,
                                        formData.firstName,
                                        formData.lastName,
                                        formData.username,
                                        formData.email,
                                        value,
                                        formData.confirmPassword,
                                        formData.createdAt,
                                        formData.jobs,
                                        formData.applications,
                                        formData.roles,
                                        formData.tnC
                                    );
                                    setFormData(newUser);
                                }}
                                autoComplete='off'
                                id='password'
                                type={showPassword ? 'text' : 'password'}
                                placeholder='Create a password'
                                required
                                className='pr-10'
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
                        <div className='relative'>
                            <Label htmlFor='confirmPassword'>Confirm Password</Label>
                            <Input
                                name='confirmPassword'
                                value={formData.confirmPassword}
                                onChange={(e) => {
                                    const { name, value } = e.currentTarget;
                                    const newUser = new User(
                                        formData.id,
                                        formData.firstName,
                                        formData.lastName,
                                        formData.username,
                                        formData.email,
                                        formData.password,
                                        value,
                                        formData.createdAt,
                                        formData.jobs,
                                        formData.applications,
                                        formData.roles,
                                        formData.tnC
                                    );
                                    setFormData(newUser);
                                }}
                                autoComplete='off'
                                id='confirmPassword'
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder='Confirm your password'
                                required
                                className='pr-10'
                            />
                            <Button
                                variant='ghost'
                                size='icon'
                                className='absolute top-3/4 right-2 -translate-y-1/2 rounded-full'
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowConfirmPassword((prev) => !prev);
                                }}
                            >
                                {showConfirmPassword ? <EyeOffIcon className='w-5 h-5' /> : <EyeIcon className='w-5 h-5' />}
                            </Button>
                        </div>
                        <div className='flex items-center gap-4'>
                            <RadioGroup
                                value={formData.roles[0]}
                                onValueChange={(value) => {
                                    const newUser = new User(
                                        formData.id,
                                        formData.firstName,
                                        formData.lastName,
                                        formData.username,
                                        formData.email,
                                        formData.password,
                                        formData.confirmPassword,
                                        formData.createdAt,
                                        formData.jobs,
                                        formData.applications,
                                        [value as UserRoles],
                                        formData.tnC
                                    );
                                    setFormData(newUser);
                                }}
                            >
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value={UserRoles.USER} id={UserRoles.USER} />
                                    <Label htmlFor={UserRoles.USER}>Applier</Label>
                                    <RadioGroupItem value={UserRoles.ADMIN} id={UserRoles.ADMIN} />
                                    <Label htmlFor={UserRoles.ADMIN}>Admin</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className='flex items-center gap-2'>
                            <Switch
                                onCheckedChange={(checked) => {
                                    const newUser = new User(
                                        formData.id,
                                        formData.firstName,
                                        formData.lastName,
                                        formData.username,
                                        formData.email,
                                        formData.password,
                                        formData.confirmPassword,
                                        formData.createdAt,
                                        formData.jobs,
                                        formData.applications,
                                        formData.roles,
                                        checked
                                    );
                                    setFormData(newUser);
                                }}
                                checked={formData.tnC}
                                id='terms'
                                required
                            />
                            <Label htmlFor='terms'>I agree to the Terms and Conditions</Label>
                        </div>

                        <Button type='submit' className='w-full' disabled={loading}>
                            {loading ? (
                                <>
                                    <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                                    {'Signing Up...'}
                                </>
                            ) : (
                                <>Sign Up</>
                            )}
                        </Button>
                    </form>
                    <div className='text-center'>
                        <p className='mt-4'>
                            Already have an account?
                            <Link href='/login' className='hover:underline'>
                                {' '}
                                Sign In
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
