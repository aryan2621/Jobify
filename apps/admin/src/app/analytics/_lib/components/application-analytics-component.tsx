'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, XAxis, CartesianGrid, Label } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@jobify/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@jobify/ui/chart';
import ky from 'ky';
import { LoadingAnalyticsSkeleton } from '@/components/elements/analytics-skeleton';

type AnalyticsResponse = {
    total: number;
    byStatus: { applied: number; selected: number; rejected: number };
    byPeriod: { date: string; applied: number; selected: number; rejected: number }[];
};

const chartConfig: { [key: string]: { label: string; color: string } } = {
    pending: {
        label: 'In progress',
        color: 'hsl(var(--chart-5))',
    },
    rejected: {
        label: 'Rejected',
        color: 'hsl(var(--chart-3))',
    },
    selected: {
        label: 'Selected',
        color: 'hsl(var(--chart-1))',
    },
};

export default function ApplicationAnalyticsComponent() {
    const [data, setData] = useState<AnalyticsResponse | null>(null);
    const [fetching, setFetching] = useState(true);

    const formatDate = (value: string | number | Date, format: 'short' | 'long') => {
        const options =
            format === 'short' ? ({ weekday: 'short' as const } as const) : ({ month: 'short' as const, day: 'numeric' as const } as const);
        return new Date(value).toLocaleDateString('en-US', options);
    };

    useEffect(() => {
        let cancelled = false;
        async function fetchAnalytics() {
            try {
                const res = await ky.get('/api/applications-analytics').json<AnalyticsResponse>();
                if (!cancelled) setData(res);
            } catch {
                if (!cancelled) setData({ total: 0, byStatus: { applied: 0, selected: 0, rejected: 0 }, byPeriod: [] });
            } finally {
                if (!cancelled) setFetching(false);
            }
        }
        fetchAnalytics();
        return () => {
            cancelled = true;
        };
    }, []);

    if (fetching) {
        return <LoadingAnalyticsSkeleton />;
    }

    if (!data) {
        return null;
    }

    const { total, byStatus, byPeriod } = data;
    const dailyData = byPeriod.map((p) => ({
        date: p.date,
        pending: p.applied,
        selected: p.selected,
        rejected: p.rejected,
    }));

    const presentCategories = (['pending', 'rejected', 'selected'] as const).filter((cat) =>
        dailyData.some((day) => Number(day[cat]) > 0)
    );

    const getBarRadius = (category: string): [number, number, number, number] => {
        const index = (presentCategories as readonly string[]).indexOf(category);
        if (presentCategories.length === 1) return [4, 4, 4, 4];
        if (index === 0) return [0, 0, 4, 4];
        if (index === presentCategories.length - 1) return [4, 4, 0, 0];
        return [0, 0, 0, 0];
    };

    return (
        <Card className='space-y-6'>
            {total === 0 ? (
                <div className='flex h-full flex-col items-center justify-center'>
                    <CardHeader className='text-center'>
                        <CardTitle>No applications</CardTitle>
                        <CardDescription>Applications to your jobs will appear here.</CardDescription>
                    </CardHeader>
                </div>
            ) : (
                <>
                    <CardHeader>
                        <CardTitle>Application analytics</CardTitle>
                        <CardDescription>Status breakdown for applications to your jobs</CardDescription>
                    </CardHeader>

                    <div className='flex flex-col space-y-0'>
                        <div className='flex flex-wrap gap-4'>
                            <div className='flex-1 min-w-[300px]'>
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
                            </div>
                            <div className='flex-1 min-w-[300px]'>
                                <CardContent className='flex-1 pb-0'>
                                    <ChartContainer config={chartConfig} className='mx-auto aspect-square max-h-[500px]'>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Selected', value: byStatus.selected, fill: chartConfig.selected.color },
                                                    { name: 'Rejected', value: byStatus.rejected, fill: chartConfig.rejected.color },
                                                    { name: 'In progress', value: byStatus.applied, fill: chartConfig.pending.color },
                                                ]}
                                                dataKey='value'
                                                nameKey='name'
                                                innerRadius={50}
                                                outerRadius={90}
                                            >
                                                <Label
                                                    content={(props) => {
                                                        const viewBox = props.viewBox as { cx?: number; cy?: number } | undefined;
                                                        if (viewBox?.cx != null && viewBox?.cy != null) {
                                                            return (
                                                                <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
                                                                    <tspan
                                                                        x={viewBox.cx}
                                                                        y={viewBox.cy}
                                                                        className='fill-foreground text-3xl font-bold'
                                                                    >
                                                                        {total}
                                                                    </tspan>
                                                                    <tspan
                                                                        x={viewBox.cx}
                                                                        y={viewBox.cy + 24}
                                                                        className='fill-muted-foreground'
                                                                    >
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
                            </div>
                        </div>

                        <div className='flex flex-col space-y-4'>
                            <CardHeader className='flex items-center gap-2 space-y-0 py-5 sm:flex-row'>
                                <div className='grid flex-1 gap-1 text-center sm:text-left'>
                                    <CardTitle>Application trends over time</CardTitle>
                                    <CardDescription>Status over time for applications to your jobs</CardDescription>
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
                                            content={
                                                <ChartTooltipContent
                                                    labelFormatter={(value: string | number | Date) => formatDate(value, 'long')}
                                                />
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
                        </div>
                    </div>
                </>
            )}
        </Card>
    );
}
