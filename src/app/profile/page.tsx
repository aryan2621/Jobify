'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState, useRef } from 'react';
import ky from 'ky';
import { toast } from '@/components/ui/use-toast';
import { Profile, User, UserRole } from '@/model/user';
import NavbarLayout from '@/layouts/navbar';
import { LoadingProfileSkeleton } from '@/components/elements/profile-skeleton';
import { useRouter } from 'next/navigation';
import { userStore } from '@/store';
import { LogOut, Camera } from 'lucide-react';
import { Job } from '@/model/job';
import { Application } from '@/model/application';
import { UserSummary } from './components/summary';
import { AdminSummary } from './components/summary';
import ProfilePersonalTab from './components/profile-personal-tab';
import ProfileSecurityTab from './components/profile-security-tab';
import UserDashboard from './components/user-dashboard';
import AdminDashboard from './components/admin-dashboard';

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile>(new Profile('', '', '', '', '', '', UserRole.USER, [], []));
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [profileCompletion, setProfileCompletion] = useState(65);
    const [activeTab, setActiveTab] = useState('personal');
    const [postedJobs, setPostedJobs] = useState<Job[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [loadingApplications, setLoadingApplications] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const logout = userStore((state) => state.logout);
    const updateUser = userStore((state) => state.updateUser);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = (await ky.get('/api/me').json()) as User;
                setProfile((prev) => ({
                    ...prev,
                    firstName: res.firstName,
                    lastName: res.lastName,
                    role: res.role,
                    jobs: res.jobs,
                    applications: res.applications,
                    email: res.email,
                    username: res.username,
                }));

                calculateProfileCompletion(res);

                if (res.role === UserRole.ADMIN) {
                    fetchJobs();
                }
                if (res.role === UserRole.USER) {
                    fetchApplications();
                }
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
            const fetchedJobs = (res ?? []).map(
                (job: Job) =>
                    new Job(
                        job.id,
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
                        job.applications
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

    const calculateProfileCompletion = (user: User) => {
        let completedFields = 0;
        const totalFields = 5;

        if (user.firstName) completedFields++;
        if (user.lastName) completedFields++;
        if (user.email) completedFields++;
        if (user.username) completedFields++;
        if (user.role) completedFields++;

        const percentage = Math.round((completedFields / totalFields) * 100);
        setProfileCompletion(percentage);
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
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            toast({
                title: 'Profile Picture Updated',
                description: 'Your profile picture has been updated successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to upload profile picture',
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
                                <Avatar className='w-32 h-32 border-4 border-background' onClick={handleAvatarClick}>
                                    <AvatarImage src='/hero.jpeg' />
                                    <AvatarFallback className='text-3xl'>{getInitials()}</AvatarFallback>
                                </Avatar>
                                <div
                                    className='absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer shadow-sm'
                                    onClick={handleAvatarClick}
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
                                            {profile.role === UserRole.ADMIN && <Badge variant='secondary'>Employer</Badge>}
                                            {profile.role === UserRole.USER && <Badge variant='secondary'>Job Seeker</Badge>}
                                            <span className='text-sm text-muted-foreground'>@{profile.username}</span>
                                        </div>
                                    </div>

                                    <Button variant='outline' size='sm' className='gap-2' onClick={handleLogout}>
                                        <LogOut className='h-4 w-4' />
                                        Logout
                                    </Button>
                                </div>

                                <div className='mt-6 space-y-2'>
                                    <div className='flex justify-between items-center'>
                                        <div className='text-sm'>
                                            Profile Completion
                                            <span className='ml-2 font-medium'>{profileCompletion}%</span>
                                        </div>
                                        {profileCompletion < 100 && (
                                            <Button
                                                variant='link'
                                                size='sm'
                                                className='h-auto p-0 text-primary text-xs'
                                                onClick={() => setActiveTab('personal')}
                                            >
                                                Complete Your Profile
                                            </Button>
                                        )}
                                    </div>
                                    <Progress value={profileCompletion} className='h-2' />
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
                                            <TabsList className='grid grid-cols-2 mb-6'>
                                                <TabsTrigger value='personal'>Personal Info</TabsTrigger>
                                                <TabsTrigger value='security'>Security</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value='personal'>
                                                <ProfilePersonalTab
                                                    profile={profile}
                                                    setProfile={setProfile}
                                                    submitting={submitting}
                                                    updateUser={updateUser}
                                                />
                                            </TabsContent>

                                            <TabsContent value='security'>
                                                <ProfileSecurityTab
                                                    profile={profile}
                                                    setProfile={setProfile}
                                                    submitting={submitting}
                                                    updateUser={updateUser}
                                                />
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>

                                {profile.role === UserRole.ADMIN ? (
                                    <AdminDashboard postedJobs={postedJobs} loading={loadingJobs} />
                                ) : (
                                    <UserDashboard applications={applications} loading={loadingApplications} />
                                )}
                            </div>
                            <div className='space-y-6'>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Account Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {profile.role === UserRole.ADMIN ? (
                                            <AdminSummary jobs={postedJobs} />
                                        ) : (
                                            <UserSummary applications={applications} />
                                        )}
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
