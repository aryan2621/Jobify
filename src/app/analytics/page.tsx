'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ChevronDown, Download, Filter, Users, Briefcase, BarChart2, TrendingUp, CalendarClock, PieChart } from 'lucide-react';
import NavbarLayout from '@/layouts/navbar';
import { User, UserRole } from '@/model/user';
import { userStore } from '@/store';

interface AnalyticsSummaryCardProps {
    title: string;
    value: string | number;
    trend: number;
    description: string;
    icon: React.ElementType;
    trendType: 'positive' | 'negative' | 'neutral';
    isLoading: boolean;
}

// Summary card component for key metrics
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
    onChange: (value: string) => void;
    disabled: boolean;
}

// Date range selector component
const DateRangeSelector = ({ onChange, disabled = false }: DateRangeSelectorProps) => {
    const [range, setRange] = useState('30d');

    const handleChange = (value: string) => {
        setRange(value);
        onChange && onChange(value);
    };

    return (
        <div className='flex items-center'>
            <Calendar className='mr-2 h-4 w-4 text-muted-foreground' />
            <Select value={range} onValueChange={handleChange} disabled={disabled}>
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
};

// Recruitment funnel component
const RecruitmentFunnel = ({ isLoading = false }) => {
    // Sample data - in a real app this would come from your API
    const funnelData = [
        { stage: 'Applications', count: 2540, color: 'hsl(var(--chart-1))' },
        { stage: 'Screened', count: 1250, color: 'hsl(var(--chart-2))' },
        { stage: 'Interviewed', count: 580, color: 'hsl(var(--chart-3))' },
        { stage: 'Offered', count: 120, color: 'hsl(var(--chart-4))' },
        { stage: 'Hired', count: 85, color: 'hsl(var(--chart-5))' },
    ];

    if (isLoading) {
        return (
            <div className='space-y-4 w-full'>
                <Skeleton className='h-8 w-full' />
                <Skeleton className='h-8 w-11/12' />
                <Skeleton className='h-8 w-10/12' />
                <Skeleton className='h-8 w-8/12' />
                <Skeleton className='h-8 w-7/12' />
            </div>
        );
    }

    // Calculate the widest bar (100%) - typically the first stage
    const maxCount = Math.max(...funnelData.map((item) => item.count));

    return (
        <div className='space-y-4 w-full'>
            {funnelData.map((item, index) => (
                <div key={index} className='space-y-1.5'>
                    <div className='flex justify-between text-sm'>
                        <span>{item.stage}</span>
                        <span className='font-medium'>{item.count.toLocaleString()}</span>
                    </div>
                    <div className='h-2.5 w-full bg-muted rounded-full overflow-hidden'>
                        <div
                            className='h-full rounded-full'
                            style={{
                                width: `${(item.count / maxCount) * 100}%`,
                                backgroundColor: item.color,
                            }}
                        ></div>
                    </div>
                    {index < funnelData.length - 1 && (
                        <div className='text-xs text-muted-foreground'>
                            {Math.round((funnelData[index + 1].count / item.count) * 100)}% conversion to next stage
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// Top performing channels component
const TopPerformingChannels = ({ isLoading = false }) => {
    // Sample data - in a real app this would come from your API
    const channelData = [
        { source: 'LinkedIn', count: 845, quality: 8.7 },
        { source: 'Indeed', count: 765, quality: 7.4 },
        { source: 'Referrals', count: 340, quality: 9.2 },
        { source: 'Company Website', count: 295, quality: 8.1 },
        { source: 'Job Fairs', count: 125, quality: 7.8 },
    ];

    if (isLoading) {
        return (
            <div className='w-full'>
                <div className='border rounded-md overflow-hidden'>
                    <div className='bg-muted px-4 py-2.5'>
                        <Skeleton className='h-4 w-full' />
                    </div>
                    <div className='divide-y'>
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className='px-4 py-3 flex items-center justify-between'>
                                <Skeleton className='h-4 w-24' />
                                <Skeleton className='h-4 w-16' />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='w-full'>
            <div className='border rounded-md overflow-hidden'>
                <div className='bg-muted px-4 py-2.5 text-sm font-medium flex'>
                    <div className='w-1/2'>Source</div>
                    <div className='w-1/4 text-right'>Applications</div>
                    <div className='w-1/4 text-right'>Quality Score</div>
                </div>
                <div className='divide-y'>
                    {channelData.map((channel, index) => (
                        <div key={index} className='px-4 py-3 text-sm flex hover:bg-muted/50'>
                            <div className='w-1/2 font-medium'>{channel.source}</div>
                            <div className='w-1/4 text-right'>{channel.count}</div>
                            <div className='w-1/4 text-right flex justify-end items-center'>
                                <span
                                    className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                        channel.quality >= 9
                                            ? 'bg-green-100 text-green-800'
                                            : channel.quality >= 8
                                              ? 'bg-blue-100 text-blue-800'
                                              : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                >
                                    {channel.quality.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Main analytics dashboard component
export default function AnalyticsDashboard() {
    const [summaryData, setSummaryData] = useState({
        totalJobs: { value: 0, trend: 0 },
        totalApplications: { value: 0, trend: 0 },
        acceptanceRate: { value: 0, trend: 0 },
        averageTimeToFill: { value: 0, trend: 0 },
    });

    const [dateRange, setDateRange] = useState('30d');
    const [isLoading, setIsLoading] = useState(true);

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
                state.user?.role ?? UserRole.USER,
                state.user?.tnC ?? false,
                state.user?.workflows ?? []
            )
    );

    useEffect(() => {
        const fetchSummaryData = async () => {
            setIsLoading(true);
            try {
                // In a real application, we would fetch this data from the API
                // For now, we'll simulate it with some sample data

                // Example of how to fetch real data:
                // const response = await ky.get(`/api/analytics/summary?range=${dateRange}`).json();
                // setSummaryData(response);

                // Simulated data for demonstration
                setTimeout(() => {
                    setSummaryData({
                        totalJobs: {
                            value: Math.floor(Math.random() * 1000) + 100,
                            trend: Math.floor(Math.random() * 20) - 5,
                        },
                        totalApplications: {
                            value: Math.floor(Math.random() * 5000) + 500,
                            trend: Math.floor(Math.random() * 30) + 5,
                        },
                        acceptanceRate: {
                            value: Math.floor(Math.random() * 50) + 20,
                            trend: Math.floor(Math.random() * 15) - 5,
                        },
                        averageTimeToFill: {
                            value: Math.floor(Math.random() * 20) + 5,
                            trend: Math.floor(Math.random() * 10) - 5,
                        },
                    });
                    setIsLoading(false);
                }, 800);
            } catch (error) {
                console.error('Error fetching summary data:', error);
                setIsLoading(false);
            }
        };

        fetchSummaryData();
    }, [dateRange]);

    const handleExport = () => {
        // Helper function to convert data to CSV
        const convertToCSV = (objArray: any) => {
            const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
            let str = `${Object.keys(array[0])
                .map((value) => `"${value}"`)
                .join(',')}\r\n`;

            return array.reduce((str: string, next: any) => {
                str += `${Object.values(next)
                    .map((value) => `"${value}"`)
                    .join(',')}\r\n`;
                return str;
            }, str);
        };

        // In a real app, you would fetch all data and convert it to CSV
        const dummyData = [
            { date: '2023-01-01', jobs: 15, applications: 120, acceptance: '22%' },
            { date: '2023-01-02', jobs: 12, applications: 95, acceptance: '18%' },
            // More data rows...
        ];

        const csvContent = 'data:text/csv;charset=utf-8,' + convertToCSV(dummyData);
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `analytics_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDateRangeChange = (range: string) => {
        setDateRange(range);
    };

    return (
        <NavbarLayout>
            <div className='flex flex-col gap-6 pb-10'>
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2'>
                    <div>
                        <h1 className='text-3xl font-bold tracking-tight'>Analytics Dashboard</h1>
                        <p className='text-muted-foreground mt-1'>Comprehensive insights into your recruitment activities and performance</p>
                    </div>

                    <div className='flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto'>
                        <DateRangeSelector onChange={handleDateRangeChange} disabled={isLoading} />

                        <Button variant='outline' size='sm' className='gap-1' onClick={handleExport} disabled={isLoading}>
                            <Download className='h-4 w-4' />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                    <AnalyticsSummaryCard
                        title='Total Jobs Posted'
                        value={summaryData.totalJobs.value}
                        trend={summaryData.totalJobs.trend}
                        description='vs previous period'
                        icon={Briefcase}
                        trendType={summaryData.totalJobs.trend > 0 ? 'positive' : summaryData.totalJobs.trend < 0 ? 'negative' : 'neutral'}
                        isLoading={isLoading}
                    />

                    <AnalyticsSummaryCard
                        title='Total Applications'
                        value={summaryData.totalApplications.value}
                        trend={summaryData.totalApplications.trend}
                        description='vs previous period'
                        icon={Users}
                        trendType={
                            summaryData.totalApplications.trend > 0 ? 'positive' : summaryData.totalApplications.trend < 0 ? 'negative' : 'neutral'
                        }
                        isLoading={isLoading}
                    />

                    <AnalyticsSummaryCard
                        title='Acceptance Rate'
                        value={`${summaryData.acceptanceRate.value}%`}
                        trend={summaryData.acceptanceRate.trend}
                        description='vs previous period'
                        icon={TrendingUp}
                        trendType={summaryData.acceptanceRate.trend > 0 ? 'positive' : summaryData.acceptanceRate.trend < 0 ? 'negative' : 'neutral'}
                        isLoading={isLoading}
                    />

                    <AnalyticsSummaryCard
                        title='Avg. Time to Fill'
                        value={`${summaryData.averageTimeToFill.value} days`}
                        trend={summaryData.averageTimeToFill.trend}
                        description='vs previous period'
                        icon={CalendarClock}
                        trendType={
                            summaryData.averageTimeToFill.trend < 0 ? 'positive' : summaryData.averageTimeToFill.trend > 0 ? 'negative' : 'neutral'
                        }
                        isLoading={isLoading}
                    />
                </div>

                {/* Detailed Analytics */}
                <Card className='mt-2'>
                    <CardHeader className='px-6'>
                        <CardTitle>Detailed Analytics</CardTitle>
                        <CardDescription>Explore specific metrics and trends for your recruitment activities</CardDescription>
                    </CardHeader>
                    {/* <CardContent className='px-6'>
                        <Tabs defaultValue={showJobs ? 'jobs' : 'applications'} className='w-full'>
                            <TabsList className={`grid w-full max-w-md ${showJobs && showApplications ? 'grid-cols-2' : 'grid-cols-1'} mb-6`}>
                                {showJobs && <TabsTrigger value='jobs'>Jobs Analytics</TabsTrigger>}
                                {showApplications && <TabsTrigger value='applications'>Applications Analytics</TabsTrigger>}
                            </TabsList>

                            {showJobs && (
                                <TabsContent value='jobs' className='mt-0 border-0 p-0'>
                                    <JobAnalyticsComponent />
                                </TabsContent>
                            )}

                            {showApplications && (
                                <TabsContent value='applications' className='mt-0 border-0 p-0'>
                                    <ApplicationAnalyticsComponent />
                                </TabsContent>
                            )}
                        </Tabs>
                    </CardContent> */}
                </Card>

                {/* Additional Insights */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2'>
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between'>
                            <div>
                                <CardTitle className='text-lg'>Recruitment Funnel</CardTitle>
                                <CardDescription>Conversion rates at each stage of the recruitment process</CardDescription>
                            </div>
                            <PieChart className='h-5 w-5 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                            <RecruitmentFunnel isLoading={isLoading} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between'>
                            <div>
                                <CardTitle className='text-lg'>Top Performing Channels</CardTitle>
                                <CardDescription>Sources bringing the most successful candidates</CardDescription>
                            </div>
                            <BarChart2 className='h-5 w-5 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                            <TopPerformingChannels isLoading={isLoading} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </NavbarLayout>
    );
}
