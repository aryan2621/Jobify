'use client';

import { useState } from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    XAxis,
    CartesianGrid,
    Label,
} from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { TrendingUp } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const combinedData = [
    { date: '2024-07-15', desktop: 450, mobile: 300, tablet: 200 },
    { date: '2024-07-16', desktop: 380, mobile: 420, tablet: 300 },
    { date: '2024-07-17', desktop: 520, mobile: 120, tablet: 400 },
    { date: '2024-07-18', desktop: 140, mobile: 550, tablet: 500 },
    { date: '2024-07-19', desktop: 600, mobile: 350, tablet: 200 },
    { date: '2024-07-20', desktop: 480, mobile: 400, tablet: 300 },
];

const chartConfig: { [key: string]: { label: string; color: string } } = {
    desktop: {
        label: 'Desktop',
        color: 'hsl(var(--chart-1))',
    },
    mobile: {
        label: 'Mobile',
        color: 'hsl(var(--chart-3))',
    },
    tablet: {
        label: 'Tablet',
        color: 'hsl(var(--chart-5))',
    },
};

function JobAnalyticsComponent() {
    const totalVisitors = combinedData.reduce(
        (acc, curr) => acc + curr.desktop + curr.mobile + curr.tablet,
        0
    );
    const [timeRange, setTimeRange] = useState('7d');

    const formatDate = (
        value: string | number | Date,
        format: 'short' | 'long'
    ) => {
        const options =
            format === 'short'
                ? { weekday: 'short' as const }
                : { month: 'short' as const, day: 'numeric' as const };
        return new Date(value).toLocaleDateString('en-US', options);
    };

    return (
        <Card className='space-y-6'>
            <CardHeader>
                <CardTitle>Device Usage Analytics</CardTitle>
                <CardDescription>
                    Comprehensive view of desktop, mobile, and tablet data
                </CardDescription>
            </CardHeader>

            <div className='flex flex-col space-y-0'>
                <div className='flex flex-wrap gap-4'>
                    <div className='flex-1 min-w-[300px]'>
                        <CardContent>
                            <ChartContainer config={chartConfig}>
                                <BarChart data={combinedData}>
                                    <XAxis
                                        dataKey='date'
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={(
                                            value: string | number | Date
                                        ) => formatDate(value, 'short')}
                                    />
                                    <Bar
                                        dataKey='desktop'
                                        stackId='a'
                                        fill={chartConfig.desktop.color}
                                        radius={[0, 0, 4, 4]}
                                    />
                                    <Bar
                                        dataKey='mobile'
                                        stackId='a'
                                        fill={chartConfig.mobile.color}
                                        radius={[0, 0, 0, 0]}
                                    />
                                    <Bar
                                        dataKey='tablet'
                                        stackId='a'
                                        fill={chartConfig.tablet.color}
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                        cursor={false}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </div>
                    <div className='flex-1 min-w-[300px]'>
                        <CardContent className='flex-1 pb-0'>
                            <ChartContainer
                                config={chartConfig}
                                className='mx-auto aspect-square max-h-[500px]'
                            >
                                <PieChart>
                                    <Pie
                                        data={[
                                            {
                                                name: 'Desktop',
                                                value: combinedData.reduce(
                                                    (acc, curr) =>
                                                        acc + curr.desktop,
                                                    0
                                                ),
                                                fill: 'hsl(var(--chart-1))',
                                            },
                                            {
                                                name: 'Mobile',
                                                value: combinedData.reduce(
                                                    (acc, curr) =>
                                                        acc + curr.mobile,
                                                    0
                                                ),
                                                fill: 'hsl(var(--chart-3))',
                                            },
                                            {
                                                name: 'Tablet',
                                                value: combinedData.reduce(
                                                    (acc, curr) =>
                                                        acc + curr.tablet,
                                                    0
                                                ),
                                                fill: 'hsl(var(--chart-5))',
                                            },
                                        ]}
                                        dataKey='value'
                                        nameKey='name'
                                        innerRadius={50}
                                        outerRadius={90}
                                    >
                                        <Label
                                            content={({
                                                viewBox,
                                            }: {
                                                viewBox: {
                                                    cx: number;
                                                    cy: number;
                                                };
                                            }) => {
                                                if (
                                                    viewBox &&
                                                    'cx' in viewBox &&
                                                    'cy' in viewBox
                                                ) {
                                                    return (
                                                        <text
                                                            x={viewBox.cx}
                                                            y={viewBox.cy}
                                                            textAnchor='middle'
                                                            dominantBaseline='middle'
                                                        >
                                                            <tspan
                                                                x={
                                                                    viewBox.cx
                                                                }
                                                                y={
                                                                    viewBox.cy
                                                                }
                                                                className='fill-foreground text-3xl font-bold'
                                                            >
                                                                {
                                                                    totalVisitors
                                                                }
                                                            </tspan>
                                                            <tspan
                                                                x={
                                                                    viewBox.cx
                                                                }
                                                                y={
                                                                    viewBox.cy +
                                                                    24
                                                                }
                                                                className='fill-muted-foreground'
                                                            >
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
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                    </div>
                </div>

                <div className='flex flex-col space-y-4'>
                    <CardHeader className='flex items-center gap-2 space-y-0 py-5 sm:flex-row'>
                        <div className='grid flex-1 gap-1 text-center sm:text-left'>
                            <CardTitle>Device Usage Over Time</CardTitle>
                            <CardDescription>
                                Trends in desktop, mobile, and tablet usage
                            </CardDescription>
                        </div>
                        <Select
                            value={timeRange}
                            onValueChange={setTimeRange}
                        >
                            <SelectTrigger
                                className='w-[160px] rounded-lg sm:ml-auto'
                                aria-label='Select a value'
                            >
                                <SelectValue placeholder='Last 7 days' />
                            </SelectTrigger>
                            <SelectContent className='rounded-xl'>
                                <SelectItem
                                    value='7d'
                                    className='rounded-lg'
                                >
                                    Last 7 days
                                </SelectItem>
                                <SelectItem
                                    value='30d'
                                    className='rounded-lg'
                                >
                                    Last 30 days
                                </SelectItem>
                                <SelectItem
                                    value='90d'
                                    className='rounded-lg'
                                >
                                    Last 3 months
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
                        <ChartContainer
                            config={chartConfig}
                            className='aspect-auto h-[250px] w-full'
                        >
                            <AreaChart data={combinedData}>
                                <defs>
                                    {Object.entries(chartConfig).map(
                                        ([key, value]) => (
                                            <linearGradient
                                                key={key}
                                                id={`fill${key}`}
                                                x1='0'
                                                y1='0'
                                                x2='0'
                                                y2='1'
                                            >
                                                <stop
                                                    offset='5%'
                                                    stopColor={value.color}
                                                    stopOpacity={0.8}
                                                />
                                                <stop
                                                    offset='95%'
                                                    stopColor={value.color}
                                                    stopOpacity={0.1}
                                                />
                                            </linearGradient>
                                        )
                                    )}
                                </defs>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey='date'
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={32}
                                    tickFormatter={(
                                        value: string | number | Date
                                    ) => formatDate(value, 'long')}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            labelFormatter={(
                                                value:
                                                    | string
                                                    | number
                                                    | Date
                                            ) => formatDate(value, 'long')}
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
                                <ChartLegend
                                    content={
                                        <ChartLegendContent
                                            payload={undefined}
                                            verticalAlign={'top'}
                                        />
                                    }
                                />
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

export { JobAnalyticsComponent };