import React, { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, XAxis, CartesianGrid, Label } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ky from 'ky';
import { LoadingAnalyticsSkeleton } from '@/elements/analytics-skeleton';
import { Job, JobType, WorkplaceTypes } from '@/model/job';

const chartConfigJobType: { [key: string]: { label: string; color: string } } = {
    [JobType.FULL_TIME]: { label: 'Full Time', color: 'hsl(var(--chart-1))' },
    [JobType.PART_TIME]: { label: 'Part Time', color: 'hsl(var(--chart-2))' },
    [JobType.INTERNSHIP]: { label: 'Internship', color: 'hsl(var(--chart-3))' },
    [JobType.CONTRACT]: { label: 'Contract', color: 'hsl(var(--chart-4))' },
    [JobType.FREELANCE]: { label: 'Freelance', color: 'hsl(var(--chart-5))' },
    [JobType.TEMPORARY]: { label: 'Temporary', color: 'hsl(var(--chart-6))' },
};

const chartConfigWorkplaceType: { [key: string]: { label: string; color: string } } = {
    [WorkplaceTypes.REMOTE]: { label: 'Remote', color: 'hsl(var(--chart-1))' },
    [WorkplaceTypes.HYBRID]: { label: 'Hybrid', color: 'hsl(var(--chart-2))' },
    [WorkplaceTypes.ONSITE]: { label: 'Onsite', color: 'hsl(var(--chart-3))' },
};

const formatDate = (value: string | number | Date, format: 'short' | 'long') => {
    const options = format === 'short' ? { weekday: 'short' as const } : { month: 'short' as const, day: 'numeric' as const };
    return new Date(value).toLocaleDateString('en-US', options);
};

const processJobData = (jobs: Job[], filterBy: 'JobType' | 'WorkplaceType') => {
    const jobCounts = jobs.reduce(
        (acc, job) => {
            const date = job.createdAt.split('T')[0];

            if (!acc[date]) {
                acc[date] = {
                    date,
                    ...(filterBy === 'JobType'
                        ? {
                              [JobType.FULL_TIME]: 0,
                              [JobType.PART_TIME]: 0,
                              [JobType.INTERNSHIP]: 0,
                              [JobType.CONTRACT]: 0,
                              [JobType.FREELANCE]: 0,
                              [JobType.TEMPORARY]: 0,
                          }
                        : { [WorkplaceTypes.REMOTE]: 0, [WorkplaceTypes.HYBRID]: 0, [WorkplaceTypes.ONSITE]: 0 }),
                };
            }

            if (filterBy === 'JobType' && Object.values(JobType).includes(job.type)) {
                acc[date][job.type]++;
            } else if (filterBy === 'WorkplaceType' && Object.values(WorkplaceTypes).includes(job.workplaceType)) {
                acc[date][job.workplaceType]++;
            }

            return acc;
        },
        {} as { [key: string]: any }
    );
    const processedData = Object.values(jobCounts).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const data = filterBy === 'JobType' ? Object.values(JobType) : Object.values(WorkplaceTypes);
    const presentCategories = data.reverse().filter((type) => processedData.some((data) => data[type] > 0));
    console.log(presentCategories, processedData);
    return { processedData, presentCategories };
};

export default function JobAnalyticsComponent() {
    const [fetching, setFetching] = useState(true);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filterBy, setFilterBy] = useState<'JobType' | 'WorkplaceType'>('JobType');

    const fetchJobs = async () => {
        const res = await ky.get('/api/posts-analytics').json();
        const fetchedJobs = ((res as any[]) ?? []).map(
            (job) =>
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
                    job.createdBy,
                    job.applications
                )
        );
        setJobs(fetchedJobs);
        setFetching(false);
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const { processedData, presentCategories } = useMemo(() => processJobData(jobs, filterBy), [jobs, filterBy]);
    const getBarRadius = (category: any): [number, number, number, number] => {
        const index = presentCategories.indexOf(category);
        if (presentCategories.length === 1) {
            return [4, 4, 4, 4];
        }
        if (index === 0) {
            return [0, 0, 4, 4];
        }
        if (index === presentCategories.length - 1) {
            return [4, 4, 0, 0];
        }
        return [0, 0, 0, 0];
    };

    const totalJobs = jobs.length;

    if (fetching) {
        return <LoadingAnalyticsSkeleton />;
    }
    const chartConfig = filterBy === 'JobType' ? chartConfigJobType : chartConfigWorkplaceType;
    return (
        <Card className='space-y-6'>
            {jobs.length === 0 ? (
                <>
                    {' '}
                    <div className='flex h-full flex-col items-center justify-center'>
                        <CardHeader className='text-center'>
                            <CardTitle>No Applications</CardTitle>
                            <CardDescription>There are no applications to display</CardDescription>
                        </CardHeader>
                    </div>
                </>
            ) : (
                <>
                    <CardHeader className='flex items-center gap-2 space-y-0 py-5 sm:flex-row'>
                        <div className='grid flex-1 gap-1 text-center sm:text-left'>
                            <CardTitle>Job Posting Analytics</CardTitle>
                            <CardDescription>Comprehensive view of job postings over time</CardDescription>
                        </div>
                        <Select value={filterBy} onValueChange={(value) => setFilterBy(value as 'JobType' | 'WorkplaceType')}>
                            <SelectTrigger className='w-[160px] rounded-lg sm:ml-auto' aria-label='Select a value'>
                                <SelectValue placeholder='Filter by' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='JobType'>Job Type</SelectItem>
                                <SelectItem value='WorkplaceType'>Workplace Type</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>

                    <div className='flex flex-col space-y-0'>
                        <div className='flex flex-wrap gap-4'>
                            <div className='flex-1 min-w-[300px]'>
                                <CardContent>
                                    <ChartContainer config={chartConfig}>
                                        <BarChart data={processedData.slice(-7)}>
                                            <XAxis
                                                dataKey='date'
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
                                                tickFormatter={(value: string) => formatDate(value, 'short')}
                                            />
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
                                                data={Object.entries(chartConfig).map(([key, value]) => ({
                                                    name: value.label,
                                                    value: jobs.filter((job) =>
                                                        filterBy === 'JobType' ? job.type === key : job.workplaceType === key
                                                    ).length,
                                                    fill: value.color,
                                                }))}
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
                                                                    <tspan
                                                                        x={viewBox.cx}
                                                                        y={viewBox.cy}
                                                                        className='fill-foreground text-3xl font-bold'
                                                                    >
                                                                        {totalJobs}
                                                                    </tspan>
                                                                    <tspan x={viewBox.cx} y={viewBox.cy + 24} className='fill-muted-foreground'>
                                                                        Total Jobs
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
                                    <CardTitle>Job Postings Over Time</CardTitle>
                                    <CardDescription>Trends in different job types</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
                                <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
                                    <AreaChart data={processedData}>
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
                                            tickFormatter={(value: string) => formatDate(value, 'long')}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent labelFormatter={(value: string) => formatDate(value, 'long')} />}
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
                                                    payload={Object.entries(chartConfig).map(([key, value]) => ({
                                                        value: value.label,
                                                        color: value.color,
                                                    }))}
                                                />
                                            }
                                        />
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
