'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, XAxis, CartesianGrid, Label } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import NavbarLayout from '@/layouts/navbar';
import ky from 'ky';
import { BarChart as BarChartIcon, Briefcase, CheckCircle, XCircle, Clock } from 'lucide-react';

type AnalyticsResponse = {
    total: number;
    byStatus: { applied: number; selected: number; rejected: number };
    byPeriod: { date: string; applied: number; selected: number; rejected: number }[];
};

const chartConfig: { [key: string]: { label: string; color: string } } = {
    accepted: {
        label: 'Selected',
        color: 'hsl(var(--chart-1))',
    },
    rejected: {
        label: 'Rejected',
        color: 'hsl(var(--chart-3))',
    },
    pending: {
        label: 'In progress',
        color: 'hsl(var(--chart-5))',
    },
};

function formatDate(value: string | number | Date, format: 'short' | 'long') {
    const options =
        format === 'short' ? ({ weekday: 'short' as const } as const) : ({ month: 'short' as const, day: 'numeric' as const } as const);
    return new Date(value).toLocaleDateString('en-US', options);
}

export default function UserAnalyticsPage() {
    const router = useRouter();
    const [data, setData] = useState<AnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        async function fetchAnalytics() {
            try {
                setError(null);
                const res = await ky.get('/api/analytics/applications').json<AnalyticsResponse>();
                if (!cancelled) {
                    setData(res);
                }
            } catch (err: unknown) {
                if (cancelled) return;
                if (err && typeof err === 'object' && 'response' in err) {
                    const res = (err as { response: { status: number } }).response;
                    if (res.status === 401) {
                        setError('Please log in to view your analytics.');
                        return;
                    }
                }
                setError('Failed to load analytics. Please try again.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchAnalytics();
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <NavbarLayout>
                <div className='container py-8'>
                    <Skeleton className='h-8 w-64 mb-2' />
                    <Skeleton className='h-4 w-96 mb-8' />
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8'>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className='h-24' />
                        ))}
                    </div>
                    <div className='grid gap-6 lg:grid-cols-2'>
                        <Skeleton className='h-[300px]' />
                        <Skeleton className='h-[300px]' />
                    </div>
                    <Skeleton className='h-[250px] mt-8' />
                </div>
            </NavbarLayout>
        );
    }

    if (error) {
        return (
            <NavbarLayout>
                <div className='container py-8'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Unable to load analytics</CardTitle>
                            <CardDescription>{error}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {error.includes('log in') ? (
                                <Button onClick={() => router.push('/login')}>Go to Login</Button>
                            ) : (
                                <Button variant='outline' onClick={() => window.location.reload()}>
                                    Retry
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </NavbarLayout>
        );
    }

    if (!data) {
        return null;
    }

    const { total, byStatus, byPeriod } = data;
    const pending = byStatus.applied;
    const accepted = byStatus.selected;
    const rejected = byStatus.rejected;
    const successRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

    const dailyData = byPeriod.map((p) => ({
        date: p.date,
        pending: p.applied,
        accepted: p.selected,
        rejected: p.rejected,
    }));

    const presentCategories = ['pending', 'rejected', 'accepted'].filter((cat) =>
        dailyData.some((day) => Number(day[cat as keyof typeof day]) > 0)
    );

    const getBarRadius = (category: string): [number, number, number, number] => {
        const index = presentCategories.indexOf(category);
        if (presentCategories.length === 1) return [4, 4, 4, 4];
        if (index === 0) return [0, 0, 4, 4];
        if (index === presentCategories.length - 1) return [4, 4, 0, 0];
        return [0, 0, 0, 0];
    };

    return (
        <NavbarLayout>
            <div className='container py-8'>
                <div className='mb-8'>
                    <h1 className='text-2xl font-bold flex items-center gap-2'>
                        <BarChartIcon className='h-7 w-7 text-primary' />
                        Application analytics
                    </h1>
                    <p className='text-muted-foreground mt-1'>Insights into your job applications and status over time.</p>
                </div>

                {total === 0 ? (
                    <Card>
                        <CardHeader className='text-center'>
                            <CardTitle>No application data yet</CardTitle>
                            <CardDescription>Apply to jobs to see your application analytics and trends here.</CardDescription>
                        </CardHeader>
                        <CardContent className='flex justify-center'>
                            <Button asChild>
                                <Link href='/jobs'>Browse jobs</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8'>
                            <Card>
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-sm font-medium'>Total applications</CardTitle>
                                    <Briefcase className='h-4 w-4 text-muted-foreground' />
                                </CardHeader>
                                <CardContent>
                                    <span className='text-2xl font-bold'>{total}</span>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-sm font-medium'>In progress</CardTitle>
                                    <Clock className='h-4 w-4 text-muted-foreground' />
                                </CardHeader>
                                <CardContent>
                                    <span className='text-2xl font-bold'>{pending}</span>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-sm font-medium'>Selected</CardTitle>
                                    <CheckCircle className='h-4 w-4 text-muted-foreground' />
                                </CardHeader>
                                <CardContent>
                                    <span className='text-2xl font-bold'>{accepted}</span>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-sm font-medium'>Rejected</CardTitle>
                                    <XCircle className='h-4 w-4 text-muted-foreground' />
                                </CardHeader>
                                <CardContent>
                                    <span className='text-2xl font-bold'>{rejected}</span>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-sm font-medium'>Success rate</CardTitle>
                                    <BarChartIcon className='h-4 w-4 text-muted-foreground' />
                                </CardHeader>
                                <CardContent>
                                    <span className='text-2xl font-bold'>{successRate}%</span>
                                </CardContent>
                            </Card>
                        </div>

                        <div className='grid gap-6 lg:grid-cols-2 mb-8'>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Applications by date</CardTitle>
                                    <CardDescription>Stacked count by status per day</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer config={chartConfig}>
                                        <BarChart data={dailyData}>
                                            <XAxis dataKey='date' tickLine={false} tickMargin={10} axisLine={false} />
                                            {presentCategories.map((category) => (
                                                <Bar
                                                    key={category}
                                                    dataKey={category}
                                                    stackId='a'
                                                    fill={chartConfig[category].color}
                                                    radius={getBarRadius(category)}
                                                />
                                            ))}
                                            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Status distribution</CardTitle>
                                    <CardDescription>Breakdown of your application outcomes</CardDescription>
                                </CardHeader>
                                <CardContent className='pb-0'>
                                    <ChartContainer config={chartConfig} className='mx-auto aspect-square max-h-[300px]'>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Selected', value: accepted, fill: chartConfig.accepted.color },
                                                    { name: 'Rejected', value: rejected, fill: chartConfig.rejected.color },
                                                    { name: 'In progress', value: pending, fill: chartConfig.pending.color },
                                                ]}
                                                dataKey='value'
                                                nameKey='name'
                                                innerRadius={50}
                                                outerRadius={90}
                                            >
                                                <Label
                                                    content={(props: { viewBox?: { cx?: number; cy?: number } }) => {
                                                        const { viewBox } = props;
                                                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                                            return (
                                                                <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
                                                                    <tspan
                                                                        x={viewBox.cx}
                                                                        y={viewBox.cy}
                                                                        className='fill-foreground text-3xl font-bold'
                                                                    >
                                                                        {total}
                                                                    </tspan>
                                                                    <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 24} className='fill-muted-foreground'>
                                                                        Total
                                                                    </tspan>
                                                                </text>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                            </Pie>
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                        </PieChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Trends over time</CardTitle>
                                <CardDescription>Application status over time</CardDescription>
                            </CardHeader>
                            <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
                                <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
                                    <AreaChart data={dailyData}>
                                        <defs>
                                            {Object.entries(chartConfig).map(([key, value]) => (
                                                <linearGradient key={key} id={`fill${key}`} x1='0' y1='0' x2='0' y2='1'>
                                                    <stop offset='5%' stopColor={value.color} stopOpacity={0.8} />
                                                    <stop offset='95%' stopColor={value.color} stopOpacity={0.1} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey='date'
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            minTickGap={32}
                                            tickFormatter={(value: string | number | Date) => formatDate(value, 'long')}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent labelFormatter={(value: string | number | Date) => formatDate(value, 'long')} />
                                            }
                                        />
                                        {Object.keys(chartConfig).map((key) => (
                                            <Area
                                                key={key}
                                                type='monotone'
                                                dataKey={key}
                                                stackId='1'
                                                stroke={chartConfig[key].color}
                                                fill={`url(#fill${key})`}
                                            />
                                        ))}
                                        <ChartLegend content={<ChartLegendContent payload={undefined} verticalAlign='top' />} />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </NavbarLayout>
    );
}
