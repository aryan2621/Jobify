'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, XAxis, CartesianGrid, Label } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { TrendingUp } from 'lucide-react';
import { Application, ApplicationStatus } from '@/model/application';
import ky from 'ky';
import { LoadingAnalyticsSkeleton } from '@/elements/analytics-skeleton';

const chartConfig: { [key: string]: { label: string; color: string } } = {
    accepted: {
        label: 'Accepted',
        color: 'hsl(var(--chart-1))',
    },
    rejected: {
        label: 'Rejected',
        color: 'hsl(var(--chart-3))',
    },
    pending: {
        label: 'Pending',
        color: 'hsl(var(--chart-5))',
    },
};

export default function ApplicationAnalyticsComponent() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [total, setTotal] = useState(0);
    const [fetching, setFetching] = useState(false);

    const formatDate = (value: string | number | Date, format: 'short' | 'long') => {
        const options = format === 'short' ? { weekday: 'short' as const } : { month: 'short' as const, day: 'numeric' as const };
        return new Date(value).toLocaleDateString('en-US', options);
    };

    const fetchApplications = async () => {
        const res = await ky.get('/api/user-applications').json();
        const apps = ((res as any[]) ?? []).map(
            (app) =>
                new Application(
                    app.id,
                    app.firstName,
                    app.lastName,
                    app.email,
                    app.phone,
                    app.currentLocation,
                    app.gender,
                    JSON.parse(app.education),
                    JSON.parse(app.experience),
                    JSON.parse(app.skills),
                    app.source,
                    app.resume,
                    JSON.parse(app.socialLinks),
                    app.coverLetter,
                    app.status,
                    app.jobId,
                    app.createdAt,
                    app.createdBy
                )
        );
        setApplications(apps);
        setTotal(apps.length);
        setFetching(false);
    };

    useEffect(() => {
        setFetching(true);
        fetchApplications();
    }, []);

    const aggregateData = (apps: Application[]) => {
        const summary = {
            accepted: 0,
            rejected: 0,
            pending: 0,
        };
        const dailyData: Record<string, { accepted: number; rejected: number; pending: number }> = {};

        apps.forEach((app) => {
            const date = formatDate(app.createdAt, 'long');
            if (!dailyData[date]) {
                dailyData[date] = { accepted: 0, rejected: 0, pending: 0 };
            }
            switch (app.status) {
                case ApplicationStatus.SELECTED:
                    dailyData[date].accepted++;
                    summary.accepted++;
                    break;
                case ApplicationStatus.REJECTED:
                    dailyData[date].rejected++;
                    summary.rejected++;
                    break;
                case ApplicationStatus.APPLIED:
                    dailyData[date].pending++;
                    summary.pending++;
                    break;
            }
        });

        return { summary, dailyData: Object.entries(dailyData).map(([date, values]) => ({ date, ...values })) };
    };

    if (fetching) {
        return <LoadingAnalyticsSkeleton />;
    }

    const { summary, dailyData } = aggregateData(applications);
    console.log('summary', summary, 'dailyData', dailyData);

    return (
        <Card className='space-y-6'>
            <CardHeader>
                <CardTitle>Application Analytics</CardTitle>
                <CardDescription>Comprehensive view of application statuses</CardDescription>
            </CardHeader>

            <div className='flex flex-col space-y-0'>
                <div className='flex flex-wrap gap-4'>
                    <div className='flex-1 min-w-[300px]'>
                        <CardContent>
                            <ChartContainer config={chartConfig}>
                                <BarChart data={dailyData}>
                                    <XAxis dataKey='date' tickLine={false} tickMargin={10} axisLine={false} />
                                    <Bar dataKey='accepted' stackId='a' fill={chartConfig.accepted.color} radius={[0, 0, 4, 4]} />
                                    <Bar dataKey='rejected' stackId='a' fill={chartConfig.rejected.color} radius={[0, 0, 0, 0]} />
                                    <Bar dataKey='pending' stackId='a' fill={chartConfig.pending.color} radius={[4, 4, 0, 0]} />
                                    <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </div>
                    <div className='flex-1 min-w-[300px]'>
                        <CardContent className='flex-1 pb-0'>
                            <ChartContainer config={chartConfig} className='mx-auto aspect-square max-h-[500px]'>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Accepted', value: summary.accepted, fill: chartConfig.accepted.color },
                                            { name: 'Rejected', value: summary.rejected, fill: chartConfig.rejected.color },
                                            { name: 'Pending', value: summary.pending, fill: chartConfig.pending.color },
                                        ]}
                                        dataKey='value'
                                        nameKey='name'
                                        innerRadius={50}
                                        outerRadius={90}
                                    >
                                        <Label
                                            content={(props: any) => {
                                                const { viewBox } = props;
                                                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                                    return (
                                                        <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
                                                            <tspan x={viewBox.cx} y={viewBox.cy} className='fill-foreground text-3xl font-bold'>
                                                                {total}
                                                            </tspan>
                                                            <tspan x={viewBox.cx} y={viewBox.cy + 24} className='fill-muted-foreground'>
                                                                Total
                                                            </tspan>
                                                        </text>
                                                    );
                                                } else {
                                                    return null;
                                                }
                                            }}
                                        />
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                    </div>
                </div>

                <div className='flex flex-col space-y-4'>
                    <CardHeader className='flex items-center gap-2 space-y-0 py-5 sm:flex-row'>
                        <div className='grid flex-1 gap-1 text-center sm:text-left'>
                            <CardTitle>Application Trends Over Time</CardTitle>
                            <CardDescription>Trends in accepted, rejected, and pending applications</CardDescription>
                        </div>
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
                                    content={<ChartTooltipContent labelFormatter={(value: string | number | Date) => formatDate(value, 'long')} />}
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
                                <ChartLegend content={<ChartLegendContent payload={undefined} verticalAlign={'top'} />} />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </div>
            </div>

            <CardFooter className='flex-col gap-2 text-sm'>
                <div className='flex items-center gap-2 font-medium leading-none'>
                    Trending up by 5.2% this week
                    <TrendingUp className='h-4 w-4' />
                </div>
            </CardFooter>
        </Card>
    );
}
