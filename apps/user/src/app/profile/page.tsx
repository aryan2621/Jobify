'use client';
import { Suspense } from 'react';
import { Button } from '@jobify/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@jobify/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@jobify/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@jobify/ui/tabs';
import { Badge } from '@jobify/ui/badge';
import { useEffect, useState, useRef } from 'react';
import ky from 'ky';
import { toast } from '@jobify/ui/use-toast';
import { Profile, User } from '@jobify/domain/user';
import NavbarLayout from '@/layouts/navbar';
import { LoadingProfileSkeleton } from '@/components/elements/profile-skeleton';
import { useRouter, useSearchParams } from 'next/navigation';
import { userStore } from '@/store';
import { LogOut, Camera, Loader2 } from 'lucide-react';
import { Application, parseApplicationStage } from '@jobify/domain/application';
import { UserSummary } from './components/summary';
import ProfilePersonalTab from './components/profile-personal-tab';
import ProfileSecurityTab from './components/profile-security-tab';
import UserDashboard from './components/user-dashboard';
import { jsonArrayFromApi } from '@/app/applications/_lib/utils';
function ProfilePageContent() {
    const [profile, setProfile] = useState<Profile>(new Profile('', '', '', '', '', ''));
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('personal');
    const [applications, setApplications] = useState<Application[]>([]);
    const [loadingApplications, setLoadingApplications] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const logout = userStore((state) => state.logout);
    const updateUser = userStore((state) => state.updateUser);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = (await ky.get('/api/me').json()) as Pick<User, 'firstName' | 'lastName' | 'email' | 'username'>;
                setProfile((prev) => ({
                    ...prev,
                    firstName: res.firstName,
                    lastName: res.lastName,
                    email: res.email,
                    username: res.username,
                }));
                setAvatarUrl((res as {
                    avatarUrl?: string | null;
                }).avatarUrl ?? null);
                fetchApplications();
            }
            catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to fetch user profile',
                    variant: 'destructive',
                });
            }
            finally {
                setLoading(false);
            }
        };
        setLoading(true);
        fetchUser();
    }, []);
    useEffect(() => {
        const tab = searchParams?.get('tab');
        if (tab === 'security' || tab === 'personal') {
            setActiveTab(tab);
        }
    }, [searchParams]);
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
                        jsonArrayFromApi(application.education),
                        jsonArrayFromApi(application.experience),
                        jsonArrayFromApi<string>(application.skills),
                        application.source,
                        application.resume,
                        jsonArrayFromApi<string>(application.socialLinks),
                        application.coverLetter,
                        application.status,
                        parseApplicationStage(application.stage),
                        application.jobId,
                        application.createdAt,
                        application.createdBy
                    )
            );
            setApplications(fetchedApplications);
        }
        catch (error) {
            console.error('Error fetching applications:', error);
            toast({
                title: 'Error',
                description: 'Failed to load applications',
                variant: 'destructive',
            });
        }
        finally {
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
        }
        catch (error: any) {
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
        if (!file)
            return;
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Invalid file',
                description: 'Please select an image file (e.g. JPG, PNG)',
                variant: 'destructive',
            });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'File too large',
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
            const res = (await ky.post('/api/me/avatar', { body: formData }).json()) as {
                avatarUrl: string;
            };
            setAvatarUrl(res.avatarUrl ? `${res.avatarUrl}?t=${Date.now()}` : null);
            toast({
                title: 'Profile picture updated',
                description: 'Your profile picture has been updated.',
            });
        }
        catch (error) {
            toast({
                title: 'Upload failed',
                description: 'Failed to upload profile picture. Please try again.',
                variant: 'destructive',
            });
        }
        finally {
            setUploadingImage(false);
        }
    };
    const getInitials = () => {
        return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`;
    };
    return (<NavbarLayout>
        <div className='container mx-auto px-4 py-6'>
            {loading ? (<LoadingProfileSkeleton />) : (<div className='space-y-6'>
                <div className='flex flex-col md:flex-row gap-6 items-start'>
                    <div className='relative'>
                        <Avatar key={avatarUrl ?? 'initials'} className='w-32 h-32 border-4 border-background cursor-pointer' onClick={!uploadingImage ? handleAvatarClick : undefined}>
                            <AvatarImage src={avatarUrl ?? undefined} alt={`${profile.firstName} ${profile.lastName}`} />
                            <AvatarFallback className='text-3xl'>{getInitials()}</AvatarFallback>
                        </Avatar>
                        {uploadingImage && (<div className='absolute inset-0 rounded-full bg-background/80 flex items-center justify-center'>
                            <Loader2 className='h-8 w-8 animate-spin text-primary' />
                        </div>)}
                        <div className='absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer shadow-sm' onClick={!uploadingImage ? handleAvatarClick : undefined}>
                            <Camera className='h-4 w-4' />
                        </div>
                        <input ref={avatarInputRef} type='file' accept='image/*' className='hidden' onChange={handleAvatarUpload} disabled={uploadingImage} />
                    </div>

                    <div className='flex-1'>
                        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                            <div>
                                <h1 className='text-3xl font-bold'>
                                    {profile.firstName} {profile.lastName}
                                </h1>
                                <p className='text-muted-foreground'>{profile.email}</p>
                                <div className='flex items-center gap-2 mt-2'>
                                    <Badge variant='secondary'>Job Seeker</Badge>
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
                                    <TabsList className='grid grid-cols-2 mb-6'>
                                        <TabsTrigger value='personal'>Personal Info</TabsTrigger>
                                        <TabsTrigger value='security'>Security</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value='personal'>
                                        <ProfilePersonalTab profile={profile} setProfile={setProfile} submitting={submitting} updateUser={updateUser} />
                                    </TabsContent>

                                    <TabsContent value='security'>
                                        <ProfileSecurityTab profile={profile} setProfile={setProfile} submitting={submitting} updateUser={updateUser} />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        <UserDashboard applications={applications} loading={loadingApplications} />
                    </div>
                    <div className='space-y-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <UserSummary applications={applications} loading={loadingApplications} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>)}
        </div>
    </NavbarLayout>);
}
export default function ProfilePage() {
    return (<Suspense fallback={<LoadingProfileSkeleton />}>
        <ProfilePageContent />
    </Suspense>);
}
