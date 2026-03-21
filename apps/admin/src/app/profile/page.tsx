'use client';

import { Button } from '@jobify/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@jobify/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@jobify/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@jobify/ui/tabs';
import { useEffect, useState, useRef } from 'react';
import ky from 'ky';
import { toast } from '@jobify/ui/use-toast';
import { Profile, User } from '@jobify/domain/user';
import NavbarLayout from '@/layouts/navbar';
import { LoadingProfileSkeleton } from '@/components/elements/profile-skeleton';
import { useRouter } from 'next/navigation';
import { userStore } from '@/store';
import { LogOut, Camera, Loader2 } from 'lucide-react';
import { Job } from '@jobify/domain/job';
import { Application } from '@jobify/domain/application';
import { AdminSummary } from './components/summary';
import ProfilePersonalTab from './components/profile-personal-tab';
import ProfileSecurityTab from './components/profile-security-tab';
import ProfileSettingsTab from './components/profile-settings-tab';
import AdminDashboard from './components/admin-dashboard';

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile>(new Profile('', '', '', '', '', ''));
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('personal');
    const [postedJobs, setPostedJobs] = useState<Job[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [loadingApplications, setLoadingApplications] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const logout = userStore((state) => state.logout);
    const updateUser = userStore((state) => state.updateUser);
    const setStoreAvatarUrl = userStore((state) => state.setAvatarUrl);

    const handleUpdateUser = async (data: Partial<Profile>) => {
        setSubmitting(true);
        try {
            await updateUser(data);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = (await ky.get('/api/me').json()) as User;
                setProfile((prev) => ({
                    ...prev,
                    firstName: res.firstName,
                    lastName: res.lastName,
                    email: res.email,
                    username: res.username,
                }));
                const url = (res as { avatarUrl?: string | null }).avatarUrl ?? null;
                setAvatarUrl(url);
                setStoreAvatarUrl(url);
                fetchJobs();
                fetchApplications();
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to fetch user profile',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        setLoading(true);
        fetchUser();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoadingJobs(true);
            const url = '/api/posts?limit=10';
            const res = (await ky.get(url).json()) as Job[];
            const fetchedJobs = (res ?? []).map((job: Job & { $id?: string }) =>
                new Job(
                    job.id ?? job.$id ?? '',
                    job.profile,
                    job.description,
                    job.company,
                    job.type,
                    job.workplaceType,
                    job.lastDateToApply,
                    job.location,
                    job.skills,
                    job.rejectionContent,
                    job.selectionContent,
                    job.createdAt,
                    job.state,
                    job.createdBy,
                    job.workflowId
                )
            );
            setPostedJobs(fetchedJobs);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast({
                title: 'Error',
                description: 'Failed to load job listings',
                variant: 'destructive',
            });
        } finally {
            setLoadingJobs(false);
        }
    };

    const fetchApplications = async () => {
        try {
            setLoadingApplications(true);
            const url = '/api/user-applications?limit=10';
            const res = (await ky.get(url).json()) as any[];
            const fetchedApplications = (res ?? []).map(
                (application: any) =>
                    new Application(
                        application.id,
                        application.firstName,
                        application.lastName,
                        application.email,
                        application.phone,
                        application.currentLocation,
                        application.gender,
                        JSON.parse(application.education),
                        JSON.parse(application.experience),
                        JSON.parse(application.skills),
                        application.source,
                        application.resume,
                        JSON.parse(application.socialLinks),
                        application.coverLetter,
                        application.status,
                        application.jobId,
                        application.createdAt,
                        application.createdBy
                    )
            );
            setApplications(fetchedApplications);
        } catch (error) {
            console.error('Error fetching applications:', error);
            toast({
                title: 'Error',
                description: 'Failed to load applications',
                variant: 'destructive',
            });
        } finally {
            setLoadingApplications(false);
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
                variant: 'destructive',
            });
        }
    };

    const handleAvatarClick = () => {
        if (avatarInputRef.current) {
            avatarInputRef.current.click();
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Invalid File',
                description: 'Please select an image file',
                variant: 'destructive',
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'File Too Large',
                description: 'Image must be less than 5MB',
                variant: 'destructive',
            });
            return;
        }

        setUploadingImage(true);
        e.target.value = '';
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = (await ky.post('/api/me/avatar', { body: formData }).json()) as { avatarUrl: string };
            const url = res.avatarUrl ? `${res.avatarUrl}?t=${Date.now()}` : null;
            setAvatarUrl(url);
            setStoreAvatarUrl(url);
            toast({
                title: 'Profile picture updated',
                description: 'Your profile picture has been updated.',
            });
        } catch (error) {
            toast({
                title: 'Upload failed',
                description: 'Failed to upload profile picture. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setUploadingImage(false);
        }
    };

    const getInitials = () => {
        return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`;
    };

    return (
        <NavbarLayout>
            <div className='container mx-auto px-4 py-6'>
                {loading ? (
                    <LoadingProfileSkeleton />
                ) : (
                    <div className='space-y-6'>
                        <div className='flex flex-col md:flex-row gap-6 items-start'>
                            <div className='relative'>
                                <Avatar
                                    key={avatarUrl ?? 'initials'}
                                    className='w-32 h-32 border-4 border-background cursor-pointer'
                                    onClick={!uploadingImage ? handleAvatarClick : undefined}
                                >
                                    <AvatarImage src={avatarUrl ?? undefined} alt={`${profile.firstName} ${profile.lastName}`} />
                                    <AvatarFallback className='text-3xl'>{getInitials()}</AvatarFallback>
                                </Avatar>
                                {uploadingImage && (
                                    <div className='absolute inset-0 rounded-full bg-background/80 flex items-center justify-center'>
                                        <Loader2 className='h-8 w-8 animate-spin text-primary' />
                                    </div>
                                )}
                                <div
                                    className='absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer shadow-sm'
                                    onClick={!uploadingImage ? handleAvatarClick : undefined}
                                >
                                    <Camera className='h-4 w-4' />
                                </div>
                                <input
                                    ref={avatarInputRef}
                                    type='file'
                                    accept='image/*'
                                    className='hidden'
                                    onChange={handleAvatarUpload}
                                    disabled={uploadingImage}
                                />
                            </div>

                            <div className='flex-1'>
                                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                                    <div>
                                        <h1 className='text-3xl font-bold'>
                                            {profile.firstName} {profile.lastName}
                                        </h1>
                                        <p className='text-muted-foreground'>{profile.email}</p>
                                        <div className='flex items-center gap-2 mt-2'>
                                            <span className='text-sm text-muted-foreground'>@{profile.username}</span>
                                        </div>
                                    </div>

                                    <Button variant='outline' size='sm' className='gap-2' onClick={handleLogout}>
                                        <LogOut className='h-4 w-4' />
                                        Logout
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                            <div className='lg:col-span-2 space-y-6'>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Profile Information</CardTitle>
                                        <CardDescription>Manage your personal information and account settings</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                                            <TabsList className='grid grid-cols-3 mb-6'>
                                                <TabsTrigger value='personal'>Personal Info</TabsTrigger>
                                                <TabsTrigger value='security'>Security</TabsTrigger>
                                                <TabsTrigger value='settings'>Settings</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value='personal'>
                                                <ProfilePersonalTab
                                                    profile={profile}
                                                    setProfile={setProfile}
                                                    submitting={submitting}
                                                    updateUser={handleUpdateUser}
                                                />
                                            </TabsContent>

                                            <TabsContent value='security'>
                                                <ProfileSecurityTab
                                                    profile={profile}
                                                    setProfile={setProfile}
                                                    submitting={submitting}
                                                    updateUser={handleUpdateUser}
                                                />
                                            </TabsContent>

                                            <TabsContent value='settings'>
                                                <ProfileSettingsTab
                                                    profile={profile}
                                                    setProfile={setProfile}
                                                    submitting={submitting}
                                                    updateUser={handleUpdateUser}
                                                />
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>

                                <AdminDashboard postedJobs={postedJobs} loading={loadingJobs} />
                            </div>
                            <div className='space-y-6'>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Account Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <AdminSummary jobs={postedJobs} />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </NavbarLayout>
    );
}
