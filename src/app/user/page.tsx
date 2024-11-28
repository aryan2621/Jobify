'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormEvent, useEffect, useState } from 'react';
import ky from 'ky';
import { toast } from '@/components/ui/use-toast';
import { Profile, User } from '@/model/user';
import NavbarLayout from '@/layouts/navbar';
import { LoadingProfileSkeleton } from '@/elements/profile-skeleton';
import { useRouter } from 'next/navigation';
import { userStore } from '@/store';

export default function Component() {
    const [profile, setProfile] = useState<Profile>(new Profile('', '', '', '', '', '', [], [], []));
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const logout = userStore((state) => state.logout);
    const updateUser = userStore((state) => state.updateUser);

    useEffect(() => {
        const fetchUser = async () => {
            const res = (await ky.get('/api/me').json()) as User;
            setProfile((prev) => ({
                ...prev,
                firstName: res.firstName,
                lastName: res.lastName,
                roles: res.roles,
                jobs: res.jobs,
                applications: res.applications,
                email: res.email,
                username: res.username,
            }));
            setLoading(false);
        };
        setLoading(true);
        fetchUser();
    }, []);

    const validateField = (fieldValue: string, fieldName: string) => {
        if (!fieldValue) {
            throw new Error(`${fieldName} cannot be empty`);
        }
    };

    const updateProfileField = async (field: Partial<Profile>) => {
        try {
            setProfile((prev) => ({ ...prev, ...field }));
            await updateUser(field);
            toast({
                title: 'Profile Updated',
                description: 'Your profile has been updated successfully',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message ?? 'Error while updating profile',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateName = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            validateField(profile.firstName, 'First name');
            validateField(profile.lastName, 'Last name');
            await updateProfileField({ firstName: profile.firstName, lastName: profile.lastName });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message ?? 'Error while updating name',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdatePassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (profile.password !== profile.confirmPassword) {
                throw new Error('Passwords do not match');
            }
            validateField(profile.password, 'Password');
            await updateProfileField({ password: profile.password });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message ?? 'Error while updating password',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateRoles = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (profile.roles.length === 0) {
                throw new Error('Please select at least one role');
            }
            if (profile.roles.length === 2) {
                throw new Error('Cannot have both roles');
            }
            await updateProfileField({ roles: profile.roles });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message ?? 'Error while updating roles',
            });
        } finally {
            setSubmitting(false);
        }
    };
    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
            toast({
                title: 'Logged Out',
                description: 'You have been logged out successfully',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message ?? 'Error while logging out',
            });
        }
    };

    return (
        <NavbarLayout>
            <div className='container mx-auto px-4'>
                {loading ? (
                    <LoadingProfileSkeleton />
                ) : (
                    <>
                        <div className='grid gap-8 md:grid-cols-3'>
                            <Card className='col-span-1'>
                                <CardHeader>
                                    <CardTitle>Profile Picture</CardTitle>
                                </CardHeader>
                                <CardContent className='flex flex-col items-center'>
                                    <Avatar className='w-32 h-32 mb-4'>
                                        <AvatarImage src='/hero.jpeg' />
                                    </Avatar>
                                    <Label htmlFor='picture' className='cursor-pointer'>
                                        <Input id='picture' type='file' accept='image/*' className='hidden' />
                                        <Button variant='outline' className='mt-2'>
                                            Upload New Picture
                                        </Button>
                                    </Label>
                                </CardContent>
                            </Card>
                            <Card className='col-span-2'>
                                <CardHeader>
                                    <CardTitle>Update Profile</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleUpdateName} className='space-y-4'>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div>
                                                <Label htmlFor='firstName'>Email</Label>
                                                <Input id='email' name='email' value={profile.email} disabled />
                                            </div>
                                            <div>
                                                <Label htmlFor='username'>User Name</Label>
                                                <Input id='username' name='username' value={profile.username} disabled />
                                            </div>
                                        </div>
                                    </form>
                                    <div className='mt-10 mb-2'>
                                        <Tabs defaultValue='name' className='mb-2'>
                                            <TabsList>
                                                <TabsTrigger value='name'>Name</TabsTrigger>
                                                <TabsTrigger value='password'>Password</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value='name'>
                                                <form onSubmit={handleUpdateName} className='space-y-4'>
                                                    <div className='grid grid-cols-2 gap-4'>
                                                        <div>
                                                            <Label htmlFor='firstName'>First Name</Label>
                                                            <Input
                                                                id='firstName'
                                                                name='firstName'
                                                                value={profile.firstName}
                                                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor='lastName'>Last Name</Label>
                                                            <Input
                                                                id='lastName'
                                                                name='lastName'
                                                                value={profile.lastName}
                                                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className='flex justify-between'>
                                                        <Button type='submit' disabled={submitting}>
                                                            {submitting ? 'Updating...' : 'Update Name'}
                                                        </Button>
                                                        <Button
                                                            variant='destructive'
                                                            onClick={async (e) => {
                                                                e.preventDefault();
                                                                await handleLogout();
                                                            }}
                                                        >
                                                            Logout
                                                        </Button>
                                                    </div>
                                                </form>
                                            </TabsContent>

                                            <TabsContent value='password'>
                                                <form onSubmit={handleUpdatePassword} className='space-y-4'>
                                                    <div>
                                                        <Label htmlFor='password'>New Password</Label>
                                                        <Input
                                                            id='password'
                                                            name='password'
                                                            type='password'
                                                            onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor='confirmPassword'>Confirm Password</Label>
                                                        <Input
                                                            id='confirmPassword'
                                                            name='confirmPassword'
                                                            type='password'
                                                            onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className='flex justify-between'>
                                                        <Button type='submit' disabled={submitting}>
                                                            {submitting ? 'Updating...' : 'Update Password'}
                                                        </Button>
                                                        <Button
                                                            variant='destructive'
                                                            onClick={async (e) => {
                                                                e.preventDefault();
                                                                await handleLogout();
                                                            }}
                                                        >
                                                            Logout
                                                        </Button>
                                                    </div>
                                                </form>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <Tabs defaultValue='jobs' className='mt-8'>
                            <TabsList>
                                <TabsTrigger value='jobs'>Posted Jobs</TabsTrigger>
                                <TabsTrigger value='applications'>Applications</TabsTrigger>
                            </TabsList>
                            <TabsContent value='jobs'>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Posted Jobs</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className='list-disc pl-5'>{profile.jobs.length} jobs</ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value='applications'>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Job Applications</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className='list-disc pl-5'>{profile.applications.length} applications</ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </div>
        </NavbarLayout>
    );
}
