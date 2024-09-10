'use client';

import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import NavbarLayout from '@/layouts/navbar';
import { User } from '@/model/user';
import ApplicationAnalyticsComponent from '@/pages/analytics/application';
import JobAnalyticsComponent from '@/pages/analytics/job';
import { userStore } from '@/store';

export default function Component() {
    const user = userStore(
        (state) =>
            new User(
                state.user?.id ?? '',
                state.user?.firstName ?? '',
                state.user?.lastName ?? '',
                state.user?.username ?? '',
                state.user?.email ?? '',
                state.user?.password ?? '',
                state.user?.confirmPassword ?? '',
                state.user?.createdAt ?? '',
                state.user?.jobs ?? [],
                state.user?.applications ?? [],
                state.user?.roles ?? [],
                state.user?.tnC ?? false
            )
    );

    const showJobs = user?.isSuperUser || user?.canAcessJobs;
    const showApplications = user?.isSuperUser || user?.canAccessApplications;

    return (
        <NavbarLayout>
            <Tabs defaultValue={showJobs ? 'jobs' : 'applications'} className='w-full'>
                <TabsList>
                    {showJobs && <TabsTrigger value='jobs'>Jobs</TabsTrigger>}
                    {showApplications && <TabsTrigger value='applications'>Applications</TabsTrigger>}
                </TabsList>
                {showJobs && (
                    <TabsContent value='jobs'>
                        <JobAnalyticsComponent />
                    </TabsContent>
                )}
                {showApplications && (
                    <TabsContent value='applications'>
                        <ApplicationAnalyticsComponent />
                    </TabsContent>
                )}
            </Tabs>
        </NavbarLayout>
    );
}
