'use client';

import { Tabs, TabsList, TabsContent,TabsTrigger } from "@/components/ui/tabs";
import NavbarLayout from "@/layouts/navbar";
import { ApplicationAnalyticsComponent } from "@/pages/analytics/application";
import { JobAnalyticsComponent } from "@/pages/analytics/job";

export default function Component() {
    return (
        <NavbarLayout>
            <Tabs defaultValue="jobs" className="w-full">
                <TabsList>
                    <TabsTrigger value="jobs">Jobs</TabsTrigger>
                    <TabsTrigger value="applications">Applications</TabsTrigger>
                </TabsList>
                <TabsContent value="jobs">
                    <JobAnalyticsComponent />
                </TabsContent>
                <TabsContent value="applications">
                    <ApplicationAnalyticsComponent />
                </TabsContent>
            </Tabs>

        </NavbarLayout>
    );
}
