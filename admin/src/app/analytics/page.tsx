'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Users, Briefcase, TrendingUp, BarChart as BarChartIcon } from 'lucide-react';
import NavbarLayout from '@/layouts/navbar';
import ky from 'ky';
import JobAnalyticsComponent from './_lib/components/job-analytics-component';
import ApplicationAnalyticsComponent from './_lib/components/application-analytics-component';

type ApplicationsAnalyticsResponse = {
    total: number;
    byStatus: { applied: number; selected: number; rejected: number };
    byPeriod: { date: string; applied: number; selected: number; rejected: number }[];
};

type JobDoc = { id: string; createdAt: string; [key: string]: unknown };

function getRangeBounds(range: string): { start: Date; end: Date } | null {
    const end = new Date();
    const start = new Date();
    switch (range) {
        case '7d':
            start.setDate(start.getDate() - 7);
            return { start, end };
        case '30d':
            start.setDate(start.getDate() - 30);
            return { start, end };
        case '90d':
            start.setDate(start.getDate() - 90);
            return { start, end };
        case 'ytd':
            start.setMonth(0, 1);
            start.setHours(0, 0, 0, 0);
            return { start, end };
        case 'all':
        default:
            return null;
    }
}

function inRange(dateStr: string, bounds: { start: Date; end: Date } | null): boolean {
    if (!bounds) return true;
    const t = new Date(dateStr).getTime();
    return t >= bounds.start.getTime() && t <= bounds.end.getTime();
}

interface AnalyticsSummaryCardProps {
    title: string;
    value: string | number;
    trend: number;
    description: string;
    icon: React.ElementType;
    trendType: 'positive' | 'negative' | 'neutral';
    isLoading: boolean;
}

const AnalyticsSummaryCard = ({
    title,
    value,
    trend,
    description,
    icon: Icon,
    trendType = 'neutral',
    isLoading = false,
}: AnalyticsSummaryCardProps) => {
    return (
        <Card className='h-full'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-medium'>{title}</CardTitle>
                <div className='h-8 w-8 rounded-md bg-primary/10 p-1.5 text-primary'>
                    <Icon className='h-full w-full' />
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <>
                        <Skeleton className='h-8 w-24 mb-2' />
                        <Skeleton className='h-4 w-32' />
                    </>
                ) : (
                    <>
                        <div className='text-2xl font-bold'>{value}</div>
                        <div className='flex items-center mt-1'>
                            <Badge
                                variant={trendType === 'positive' ? 'default' : trendType === 'negative' ? 'destructive' : 'outline'}
                                className='px-1.5 py-0.5 text-xs font-semibold'
                            >
                                {trend > 0 ? '+' : ''}
                                {trend}%
                            </Badge>
                            <span className='text-xs text-muted-foreground ml-2'>{description}</span>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

interface DateRangeSelectorProps {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
}

const DateRangeSelector = ({ value, onChange, disabled = false }: DateRangeSelectorProps) => (
    <div className='flex items-center'>
        <Calendar className='mr-2 h-4 w-4 text-muted-foreground' />
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className='w-[180px] h-9'>
                <SelectValue placeholder='Select date range' />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value='7d'>Last 7 days</SelectItem>
                <SelectItem value='30d'>Last 30 days</SelectItem>
                <SelectItem value='90d'>Last 90 days</SelectItem>
                <SelectItem value='ytd'>Year to date</SelectItem>
                <SelectItem value='all'>All time</SelectItem>
            </SelectContent>
        </Select>
    </div>
);

export default function AnalyticsDashboard() {
    const router = useRouter();
    const [dateRange, setDateRange] = useState('30d');
    const [jobs, setJobs] = useState<JobDoc[]>([]);
    const [applicationsData, setApplicationsData] = useState<ApplicationsAnalyticsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setError(null);
        setIsLoading(true);
        try {
            const [jobsRes, appsRes] = await Promise.all([
                ky.get('/api/posts-analytics').json<JobDoc[]>(),
                ky.get('/api/applications-analytics').json<ApplicationsAnalyticsResponse>(),
            ]);
            setJobs(Array.isArray(jobsRes) ? jobsRes : []);
            setApplicationsData(appsRes);
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const res = (err as { response: { status: number } }).response;
                if (res.status === 401) {
                    setError('Please log in to view analytics.');
                    return;
                }
            }
            setError('Failed to load analytics. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const bounds = getRangeBounds(dateRange);
    const filteredJobs = bounds ? jobs.filter((j) => inRange(j.createdAt, bounds)) : jobs;
    const totalJobs = filteredJobs.length;
    const totalApplications = applicationsData
        ? bounds
            ? applicationsData.byPeriod
                  .filter((p) => inRange(p.date, bounds))
                  .reduce((sum, p) => sum + p.applied + p.selected + p.rejected, 0)
            : applicationsData.total
        : 0;
    const selectedInRange = applicationsData
        ? bounds
            ? applicationsData.byPeriod
                  .filter((p) => inRange(p.date, bounds))
                  .reduce((sum, p) => sum + p.selected, 0)
            : applicationsData.byStatus.selected
        : 0;
    const acceptanceRate = totalApplications > 0 ? Math.round((selectedInRange / totalApplications) * 100) : 0;

    if (error) {
        return (
            <NavbarLayout>
                <div className='flex flex-col gap-6 pb-10'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Unable to load analytics</CardTitle>
                            <CardDescription>{error}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {error.includes('log in') ? (
                                <Button onClick={() => router.push('/login')}>Go to Login</Button>
                            ) : (
                                <Button variant='outline' onClick={() => fetchData()}>
                                    Retry
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </NavbarLayout>
        );
    }

    const isEmpty = !isLoading && totalJobs === 0 && (applicationsData?.total ?? 0) === 0;

    return (
        <NavbarLayout>
            <div className='flex flex-col gap-6 pb-10'>
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2'>
                    <div>
                        <h1 className='text-3xl font-bold tracking-tight flex items-center gap-2'>
                            <BarChartIcon className='h-8 w-8 text-primary' />
                            Analytics
                        </h1>
                        <p className='text-muted-foreground mt-1'>
                            Insights into your job posts and applications
                        </p>
                    </div>
                    <DateRangeSelector value={dateRange} onChange={setDateRange} disabled={isLoading} />
                </div>

                {isEmpty ? (
                    <Card>
                        <CardHeader className='text-center'>
                            <CardTitle>No analytics data yet</CardTitle>
                            <CardDescription>
                                Post jobs and receive applications to see analytics here.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='flex justify-center'>
                            <Button asChild>
                                <Link href='/posts'>Post a job</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                            <AnalyticsSummaryCard
                                title='Total jobs posted'
                                value={totalJobs}
                                trend={0}
                                description='in selected range'
                                icon={Briefcase}
                                trendType='neutral'
                                isLoading={isLoading}
                            />
                            <AnalyticsSummaryCard
                                title='Total applications'
                                value={totalApplications}
                                trend={0}
                                description='in selected range'
                                icon={Users}
                                trendType='neutral'
                                isLoading={isLoading}
                            />
                            <AnalyticsSummaryCard
                                title='Acceptance rate'
                                value={totalApplications > 0 ? `${acceptanceRate}%` : '—'}
                                trend={0}
                                description='selected / total'
                                icon={TrendingUp}
                                trendType='neutral'
                                isLoading={isLoading}
                            />
                        </div>

                        <Card className='mt-2'>
                            <CardHeader className='px-6'>
                                <CardTitle>Detailed analytics</CardTitle>
                                <CardDescription>
                                    Jobs and applications breakdown
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='px-6'>
                                <Tabs defaultValue='jobs' className='w-full'>
                                    <TabsList className='grid w-full max-w-md grid-cols-2 mb-6'>
                                        <TabsTrigger value='jobs'>Jobs analytics</TabsTrigger>
                                        <TabsTrigger value='applications'>Applications analytics</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value='jobs' className='mt-0 border-0 p-0'>
                                        <JobAnalyticsComponent />
                                    </TabsContent>
                                    <TabsContent value='applications' className='mt-0 border-0 p-0'>
                                        <ApplicationAnalyticsComponent />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </NavbarLayout>
    );
}
