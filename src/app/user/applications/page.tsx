'use client';

import { useCallback, useEffect, useRef, useState, useMemo, memo } from 'react';
import ky from 'ky';
import { AnimatePresence, motion } from 'framer-motion';
import NavbarLayout from '@/layouts/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

import {
    User as UserIcon,
    Briefcase,
    MapPin,
    Phone,
    Building,
    GraduationCap,
    Lightbulb,
    Globe,
    FileText,
    Calendar,
    ChevronDown,
    Filter,
    SortAsc,
    SortDesc,
    Search,
    Download,
    Star,
    StarOff,
    Mail,
    AlertCircle,
    Info,
    CheckCircle,
    XCircle,
    Clock,
} from 'lucide-react';

// Models
import { Application, ApplicationStatus } from '@/model/application';
import { User } from '@/model/user';

// Utilities
import { getResume } from '@/appwrite/server/storage';
import { useVirtualizer } from '@tanstack/react-virtual'; // Would need to be installed
import FiltersPage from '@/components/elements/filters';
import { formatDate } from '@/app/admin/_lib/utils';

// Types
type SortOption = 'newest' | 'oldest' | 'nameAsc' | 'nameDesc';
type FilterOptions = {
    status: ApplicationStatus | 'all';
    searchQuery: string;
};

const StatusBadge = memo(({ status }: { status: ApplicationStatus }) => {
    const variants = {
        [ApplicationStatus.APPLIED]: {
            variant: 'secondary' as const,
            icon: <Clock className='w-3 h-3 mr-1' />,
        },
        [ApplicationStatus.SELECTED]: {
            variant: 'success' as const,
            icon: <CheckCircle className='w-3 h-3 mr-1' />,
        },
        [ApplicationStatus.REJECTED]: {
            variant: 'destructive' as const,
            icon: <XCircle className='w-3 h-3 mr-1' />,
        },
    };

    const { variant, icon } = variants[status];

    return (
        <Badge variant={variant as 'default' | 'secondary' | 'destructive' | 'outline' | null} className='flex items-center'>
            {icon}
            {status}
        </Badge>
    );
});

StatusBadge.displayName = 'StatusBadge';
const ApplicationCard = memo(
    ({
        application,
        isSelected,
        onClick,
        onFavoriteToggle,
    }: {
        application: Application;
        isSelected: boolean;
        onClick: () => void;
        onFavoriteToggle?: () => void;
    }) => {
        const yearsOfExperience = application.experience.reduce((total, exp) => {
            const start = new Date(exp.startDate);
            const end = exp.isCurrent ? new Date() : new Date(exp.endDate);
            const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
            return total + years;
        }, 0);

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                <Card
                    onClick={onClick}
                    className={`cursor-pointer mb-3 transition-all hover:shadow-md ${isSelected ? 'border-2 border-primary shadow-md' : ''}`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            onClick();
                            e.preventDefault();
                        }
                    }}
                    role='button'
                    aria-pressed={isSelected}
                >
                    <CardHeader className='flex flex-row items-center justify-between py-3 px-4'>
                        <div className='flex items-center space-x-3'>
                            <Avatar className='border'>
                                <AvatarFallback>{`${application.firstName[0]}${application.lastName[0]}`}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className='text-base'>{`${application.firstName} ${application.lastName}`}</CardTitle>
                                <p className='text-xs text-muted-foreground'>{application.email}</p>
                            </div>
                        </div>
                        <div className='flex items-center space-x-1'>
                            <StatusBadge status={application.status} />
                            {onFavoriteToggle && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='h-7 w-7'
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onFavoriteToggle();
                                                }}
                                            >
                                                <Star className='w-4 h-4 text-amber-400' />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Add to favorites</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className='pt-0 pb-3 px-4'>
                        <div className='grid grid-cols-2 gap-1 text-xs'>
                            <div className='flex items-center space-x-1'>
                                <Briefcase className='w-3 h-3 text-muted-foreground' />
                                <span>{application.experience[0]?.profile || 'Not specified'}</span>
                            </div>
                            <div className='flex items-center space-x-1'>
                                <MapPin className='w-3 h-3 text-muted-foreground' />
                                <span>{application.currentLocation}</span>
                            </div>
                            <div className='flex items-center space-x-1'>
                                <GraduationCap className='w-3 h-3 text-muted-foreground' />
                                <span>{application.education[0]?.degree || 'Not specified'}</span>
                            </div>
                            <div className='flex items-center space-x-1'>
                                <Clock className='w-3 h-3 text-muted-foreground' />
                                <span>{yearsOfExperience.toFixed(1)} years</span>
                            </div>
                        </div>
                        <div className='mt-2 flex flex-wrap gap-1'>
                            {application.skills.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant='outline' className='text-xs py-0'>
                                    {skill}
                                </Badge>
                            ))}
                            {application.skills.length > 3 && (
                                <Badge variant='outline' className='text-xs py-0'>
                                    +{application.skills.length - 3}
                                </Badge>
                            )}
                        </div>
                        <div className='mt-2 text-xs text-muted-foreground'>Applied {formatDate(application.createdAt)}</div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }
);

ApplicationCard.displayName = 'ApplicationCard';
const DetailSection = memo(({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div className='mb-4'>
        <h3 className='font-semibold flex items-center mb-3'>
            {icon}
            <span className='ml-2'>{title}</span>
        </h3>
        <div className='pl-7'>{children}</div>
        <Separator className='mt-4' />
    </div>
));

DetailSection.displayName = 'DetailSection';
const ApplicationDetail = memo(({ application }: { application: Application | null }) => {
    const [fetchingResume, setFetchingResume] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    if (!application) {
        return (
            <Card className='h-full flex items-center justify-center'>
                <CardContent>
                    <p className='text-center text-muted-foreground'>Select an application to see details</p>
                </CardContent>
            </Card>
        );
    }

    const fetchResume = async (resume: string) => {
        try {
            setFetchingResume(true);
            const file = await getResume(resume);
            const blob = new Blob([file], { type: 'application/octet-binary;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'resume.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.log('Error fetching resume', error);
        } finally {
            setFetchingResume(false);
        }
    };

    return (
        <Card className='h-full overflow-auto'>
            <CardHeader className='sticky top-0 z-10 bg-card pb-2 border-b'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                        <Avatar className='w-16 h-16 border'>
                            <AvatarFallback className='text-2xl'>{`${application.firstName[0]}${application.lastName[0]}`}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className='text-2xl'>{`${application.firstName} ${application.lastName}`}</CardTitle>
                            <div className='flex items-center space-x-2 mt-1'>
                                <StatusBadge status={application.status} />
                                <span className='text-sm text-muted-foreground'>Applied {formatDate(application.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size='sm' variant='outline' onClick={() => fetchResume(application.resume)} disabled={fetchingResume}>
                                        <Download className='w-4 h-4 mr-2' />
                                        {fetchingResume ? 'Downloading...' : 'Resume'}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Download candidate&#39;s resume</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='p-6'>
                <Tabs value={activeTab} onValueChange={setActiveTab} className='mt-4'>
                    <TabsList>
                        <TabsTrigger value='profile'>Profile</TabsTrigger>
                        <TabsTrigger value='experience'>Experience</TabsTrigger>
                        <TabsTrigger value='education'>Education</TabsTrigger>
                        <TabsTrigger value='documents'>Documents</TabsTrigger>
                    </TabsList>
                    <TabsContent value='profile' className='mt-4'>
                        <div className='grid grid-cols-2 gap-y-4 gap-x-6 text-sm mb-6'>
                            {[
                                { icon: <Phone className='w-4 h-4 text-muted-foreground' />, label: 'Phone', value: application.phone },
                                {
                                    icon: <MapPin className='w-4 h-4 text-muted-foreground' />,
                                    label: 'Location',
                                    value: application.currentLocation,
                                },
                                { icon: <UserIcon className='w-4 h-4 text-muted-foreground' />, label: 'Gender', value: application.gender },
                                { icon: <Building className='w-4 h-4 text-muted-foreground' />, label: 'Source', value: application.source },
                            ].map((item, index) => (
                                <div key={index} className='flex flex-col'>
                                    <span className='text-xs text-muted-foreground flex items-center mb-1'>
                                        {item.icon}
                                        <span className='ml-2'>{item.label}</span>
                                    </span>
                                    <span className='font-medium'>{item.value}</span>
                                </div>
                            ))}
                        </div>

                        <DetailSection title='Skills' icon={<Lightbulb className='w-5 h-5 text-primary' />}>
                            <div className='flex flex-wrap gap-2'>
                                {application.skills.map((skill, index) => (
                                    <Badge key={index} variant='secondary'>
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </DetailSection>

                        <DetailSection title='Social Links' icon={<Globe className='w-5 h-5 text-primary' />}>
                            <div className='grid grid-cols-1 gap-2'>
                                {application.socialLinks.length > 0 ? (
                                    application.socialLinks.map((link, index) => (
                                        <a
                                            key={index}
                                            href={link}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-primary hover:underline flex items-center'
                                        >
                                            <Globe className='w-4 h-4 mr-2' />
                                            {link.replace(/^https?:\/\/(www\.)?/, '')}
                                        </a>
                                    ))
                                ) : (
                                    <p className='text-sm text-muted-foreground'>No social links provided</p>
                                )}
                            </div>
                        </DetailSection>

                        <DetailSection title='Cover Letter' icon={<FileText className='w-5 h-5 text-primary' />}>
                            <div className='bg-muted/30 p-4 rounded-md'>
                                {application.coverLetter ? (
                                    <p className='text-sm whitespace-pre-line'>{application.coverLetter}</p>
                                ) : (
                                    <p className='text-sm text-muted-foreground italic'>No cover letter provided</p>
                                )}
                            </div>
                        </DetailSection>
                    </TabsContent>

                    <TabsContent value='experience' className='mt-4'>
                        {application.experience.length > 0 ? (
                            application.experience.map((exp, index) => (
                                <div key={index} className='mb-6'>
                                    <div className='flex justify-between items-start'>
                                        <div>
                                            <h4 className='font-semibold text-base'>{exp.profile}</h4>
                                            <p className='text-sm'>{exp.company}</p>
                                        </div>
                                        <Badge variant='outline'>
                                            {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                                        </Badge>
                                    </div>
                                    <p className='text-sm text-muted-foreground mt-1'>{`${exp.employer} • ${exp.yoe} years`}</p>
                                    <Separator className='my-4' />
                                </div>
                            ))
                        ) : (
                            <div className='flex flex-col items-center justify-center py-8'>
                                <AlertCircle className='w-12 h-12 text-muted-foreground mb-4' />
                                <p className='text-muted-foreground'>No experience information available</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value='education' className='mt-4'>
                        {application.education.length > 0 ? (
                            application.education.map((edu, index) => (
                                <div key={index} className='mb-6'>
                                    <div className='flex justify-between items-start'>
                                        <div>
                                            <h4 className='font-semibold text-base'>{`${edu.degree} (${edu.degreeType})`}</h4>
                                            <p className='text-sm'>{edu.college}</p>
                                        </div>
                                    </div>
                                    <div className='flex items-center mt-1'>
                                        <Badge variant='secondary' className='mr-2'>
                                            SGPA: {edu.sgpa}
                                        </Badge>
                                    </div>
                                    <Separator className='my-4' />
                                </div>
                            ))
                        ) : (
                            <div className='flex flex-col items-center justify-center py-8'>
                                <AlertCircle className='w-12 h-12 text-muted-foreground mb-4' />
                                <p className='text-muted-foreground'>No education information available</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value='documents' className='mt-4'>
                        <div className='grid gap-4'>
                            <Card>
                                <CardHeader className='py-3'>
                                    <CardTitle className='text-base flex items-center'>
                                        <FileText className='w-5 h-5 mr-2' />
                                        Resume
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={() => fetchResume(application.resume)} disabled={fetchingResume} className='w-full'>
                                        <Download className='w-4 h-4 mr-2' />
                                        {fetchingResume ? 'Downloading...' : 'Download Resume'}
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className='py-3'>
                                    <CardTitle className='text-base flex items-center'>
                                        <FileText className='w-5 h-5 mr-2' />
                                        Cover Letter
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='bg-muted/30 p-4 rounded-md max-h-96 overflow-auto'>
                                        {application.coverLetter ? (
                                            <p className='text-sm whitespace-pre-line'>{application.coverLetter}</p>
                                        ) : (
                                            <p className='text-sm text-muted-foreground italic'>No cover letter provided</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
});

ApplicationDetail.displayName = 'ApplicationDetail';

function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number): T {
    const callbackRef = useRef(callback);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback(
        ((...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
                timeoutRef.current = null;
            }, delay);
        }) as T,
        [delay]
    );
}

// Component for empty state
const EmptyState = memo(({ message }: { message: string }) => (
    <Card className='p-6'>
        <CardContent className='flex flex-col items-center justify-center py-10'>
            <UserIcon className='w-16 h-16 text-muted-foreground mb-4 opacity-40' />
            <h2 className='text-lg font-semibold text-center'>{message}</h2>
            <p className='text-sm text-muted-foreground text-center mt-2'>Try adjusting your filters or search criteria.</p>
        </CardContent>
    </Card>
));

EmptyState.displayName = 'EmptyState';
// Loading skeleton for application cards
const ApplicationCardSkeleton = memo(() => (
    <Card className='mb-3'>
        <CardHeader className='py-3 px-4'>
            <div className='flex items-center space-x-3'>
                <Skeleton className='w-10 h-10 rounded-full' />
                <div>
                    <Skeleton className='h-5 w-40' />
                    <Skeleton className='h-3 w-32 mt-1' />
                </div>
            </div>
        </CardHeader>
        <CardContent className='pt-0 pb-3 px-4'>
            <div className='grid grid-cols-2 gap-1'>
                <Skeleton className='h-3 w-24' />
                <Skeleton className='h-3 w-20' />
                <Skeleton className='h-3 w-28' />
                <Skeleton className='h-3 w-16' />
            </div>
            <div className='mt-2 flex space-x-1'>
                <Skeleton className='h-5 w-16 rounded-full' />
                <Skeleton className='h-5 w-16 rounded-full' />
                <Skeleton className='h-5 w-16 rounded-full' />
            </div>
            <Skeleton className='h-3 w-24 mt-2' />
        </CardContent>
    </Card>
));

ApplicationCardSkeleton.displayName = 'ApplicationCardSkeleton';

export default function ApplicationsPage() {
    const limit = 20;
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastId, setLastId] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const loadingRef = useRef(false);
    const parentRef = useRef<HTMLDivElement>(null);

    const [sortOption, setSortOption] = useState<SortOption>('newest');
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        status: 'all',
        searchQuery: '',
    });

    const [error, setError] = useState<string | null>(null);

    const fetchApplications = useCallback(async () => {
        if (loadingRef.current || !hasMore) return;

        setLoading(true);
        loadingRef.current = true;
        setError(null);

        try {
            const url = `/api/user-applications?limit=${limit}${lastId ? `&lastId=${lastId}` : ''}`;
            const res = (await ky.get(url).json()) as any[];

            if (!Array.isArray(res)) {
                throw new Error('Invalid response format');
            }

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
                        JSON.parse(application.education),
                        JSON.parse(application.experience),
                        JSON.parse(application.skills),
                        application.source,
                        application.resume,
                        JSON.parse(application.socialLinks),
                        application.coverLetter,
                        application.status,
                        application.jobId,
                        application.createdAt,
                        application.createdBy
                    )
            );

            setApplications((prevApplications) => [...prevApplications, ...fetchedApplications]);
            setLastId(fetchedApplications.length ? fetchedApplications[fetchedApplications.length - 1].id : null);
            setHasMore(fetchedApplications.length === limit);

            if (selectedApplication === null && fetchedApplications.length > 0) {
                setSelectedApplication(fetchedApplications[0]);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError('Failed to fetch applications. Please try again.');
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [lastId, limit, selectedApplication]);

    const debouncedFetchApplications = useDebounce(fetchApplications, 300);

    // Initial fetch
    useEffect(() => {
        debouncedFetchApplications();
    }, [debouncedFetchApplications]);

    useEffect(() => {
        if (!parentRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    debouncedFetchApplications();
                }
            },
            {
                rootMargin: '200px',
                threshold: 0.1,
            }
        );

        const currentElement = parentRef.current;
        observer.observe(currentElement);

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, [debouncedFetchApplications, hasMore, loading]);
    const toggleFavorite = useCallback((applicationId: string) => {
        setFavorites((prev) => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(applicationId)) {
                newFavorites.delete(applicationId);
            } else {
                newFavorites.add(applicationId);
            }
            return newFavorites;
        });
    }, []);

    const filteredAndSortedApplications = useMemo(() => {
        let result = [...applications];

        if (filterOptions.status !== 'all') {
            result = result.filter((app) => app.status === filterOptions.status);
        }

        if (filterOptions.searchQuery) {
            const query = filterOptions.searchQuery.toLowerCase();
            result = result.filter(
                (app) =>
                    app.firstName.toLowerCase().includes(query) ||
                    app.lastName.toLowerCase().includes(query) ||
                    app.email.toLowerCase().includes(query) ||
                    app.skills.some((skill) => skill.toLowerCase().includes(query)) ||
                    app.experience.some((exp) => exp.profile.toLowerCase().includes(query) || exp.company.toLowerCase().includes(query))
            );
        }

        result.sort((a, b) => {
            switch (sortOption) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'nameAsc':
                    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
                case 'nameDesc':
                    return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
                default:
                    return 0;
            }
        });

        return result;
    }, [applications, filterOptions, sortOption]);

    const handleSearchChange = useDebounce((value: string) => {
        setFilterOptions((prev) => ({ ...prev, searchQuery: value }));
    }, 500);

    const rowVirtualizer = useVirtualizer({
        count: filteredAndSortedApplications.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 144,
        overscan: 5,
    });

    useEffect(() => {
        if (
            filteredAndSortedApplications.length > 0 &&
            (!selectedApplication || !filteredAndSortedApplications.some((app) => app.id === selectedApplication.id))
        ) {
            setSelectedApplication(filteredAndSortedApplications[0]);
        } else if (filteredAndSortedApplications.length === 0) {
            setSelectedApplication(null);
        }
    }, [filteredAndSortedApplications, selectedApplication]);

    return (
        <NavbarLayout>
            <div className='px-4 sm:px-6 py-6'>
                <div className='flex flex-col space-y-6'>
                    <div className='flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0'>
                        <div>
                            <h1 className='text-2xl font-bold'>Applications</h1>
                            <p className='text-muted-foreground'>Manage and review candidate applications</p>
                        </div>

                        <div className='flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2'>
                            <div className='relative w-full sm:w-64'>
                                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                                <input
                                    type='text'
                                    placeholder='Search applications...'
                                    className='w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant='outline' className='flex-shrink-0'>
                                        <Filter className='w-4 h-4 mr-2' />
                                        Filter
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setFilterOptions((prev) => ({ ...prev, status: 'all' }))}>All</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterOptions((prev) => ({ ...prev, status: ApplicationStatus.APPLIED }))}>
                                        <Clock className='w-4 h-4 mr-2' />
                                        Applied
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterOptions((prev) => ({ ...prev, status: ApplicationStatus.SELECTED }))}>
                                        <CheckCircle className='w-4 h-4 mr-2' />
                                        Selected
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterOptions((prev) => ({ ...prev, status: ApplicationStatus.REJECTED }))}>
                                        <XCircle className='w-4 h-4 mr-2' />
                                        Rejected
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant='outline' className='flex-shrink-0'>
                                        {sortOption === 'newest' || sortOption === 'oldest' ? (
                                            <Calendar className='w-4 h-4 mr-2' />
                                        ) : (
                                            <UserIcon className='w-4 h-4 mr-2' />
                                        )}
                                        Sort
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setSortOption('newest')}>
                                        <SortDesc className='w-4 h-4 mr-2' />
                                        Newest First
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortOption('oldest')}>
                                        <SortAsc className='w-4 h-4 mr-2' />
                                        Oldest First
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortOption('nameAsc')}>
                                        <SortAsc className='w-4 h-4 mr-2' />
                                        Name (A-Z)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortOption('nameDesc')}>
                                        <SortDesc className='w-4 h-4 mr-2' />
                                        Name (Z-A)
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Filters summary */}
                    {(filterOptions.status !== 'all' || filterOptions.searchQuery) && (
                        <div className='flex flex-wrap items-center gap-2 text-sm'>
                            <span className='text-muted-foreground'>Active filters:</span>

                            {filterOptions.status !== 'all' && (
                                <Badge variant='secondary' className='flex items-center'>
                                    Status: {filterOptions.status}
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='h-4 w-4 ml-1'
                                        onClick={() => setFilterOptions((prev) => ({ ...prev, status: 'all' }))}
                                    >
                                        <XCircle className='h-3 w-3' />
                                    </Button>
                                </Badge>
                            )}

                            {filterOptions.searchQuery && (
                                <Badge variant='secondary' className='flex items-center'>
                                    Search: {filterOptions.searchQuery}
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='h-4 w-4 ml-1'
                                        onClick={() => setFilterOptions((prev) => ({ ...prev, searchQuery: '' }))}
                                    >
                                        <XCircle className='h-3 w-3' />
                                    </Button>
                                </Badge>
                            )}

                            <Button
                                variant='ghost'
                                size='sm'
                                className='text-xs'
                                onClick={() => setFilterOptions({ status: 'all', searchQuery: '' })}
                            >
                                Clear all
                            </Button>
                        </div>
                    )}
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                        <div className='lg:col-span-1 h-[calc(100vh-220px)] overflow-hidden flex flex-col'>
                            {error && (
                                <Card className='mb-4 border-destructive'>
                                    <CardContent className='p-4 flex items-center text-destructive'>
                                        <AlertCircle className='w-5 h-5 mr-2' />
                                        {error}
                                    </CardContent>
                                </Card>
                            )}

                            <Card className='flex-1 overflow-hidden'>
                                <CardHeader className='py-3 px-4 border-b'>
                                    <div className='flex items-center justify-between'>
                                        <CardTitle className='text-base'>
                                            {filterOptions.status !== 'all'
                                                ? `${filterOptions.status} Applications (${filteredAndSortedApplications.length})`
                                                : `All Applications (${filteredAndSortedApplications.length})`}
                                        </CardTitle>
                                        {applications.length > 0 && (
                                            <Badge variant='outline'>
                                                {filteredAndSortedApplications.length} of {applications.length}
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>

                                <div
                                    ref={parentRef}
                                    className='h-[calc(100%-57px)] overflow-auto p-3'
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                                            e.preventDefault();
                                            const currentIndex = filteredAndSortedApplications.findIndex((app) => app.id === selectedApplication?.id);
                                            if (currentIndex === -1) return;

                                            const newIndex =
                                                e.key === 'ArrowDown'
                                                    ? Math.min(currentIndex + 1, filteredAndSortedApplications.length - 1)
                                                    : Math.max(currentIndex - 1, 0);

                                            setSelectedApplication(filteredAndSortedApplications[newIndex]);
                                            rowVirtualizer.scrollToIndex(newIndex);
                                        }
                                    }}
                                >
                                    {loading && applications.length === 0 ? (
                                        // Initial loading state
                                        [...Array(5)].map((_, index) => <ApplicationCardSkeleton key={index} />)
                                    ) : filteredAndSortedApplications.length === 0 ? (
                                        // Empty state
                                        <EmptyState
                                            message={
                                                filterOptions.status !== 'all' || filterOptions.searchQuery
                                                    ? 'No applications match your filters'
                                                    : 'No applications found'
                                            }
                                        />
                                    ) : (
                                        // Virtualized list of applications
                                        <div
                                            style={{
                                                height: `${rowVirtualizer.getTotalSize()}px`,
                                                width: '100%',
                                                position: 'relative',
                                            }}
                                        >
                                            <AnimatePresence>
                                                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                                    const application = filteredAndSortedApplications[virtualRow.index];
                                                    return (
                                                        <div
                                                            key={application.id}
                                                            style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                width: '100%',
                                                                transform: `translateY(${virtualRow.start}px)`,
                                                            }}
                                                        >
                                                            <ApplicationCard
                                                                application={application}
                                                                isSelected={selectedApplication?.id === application.id}
                                                                onClick={() => setSelectedApplication(application)}
                                                                onFavoriteToggle={() => toggleFavorite(application.id)}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </div>
                                    )}

                                    {/* Loading more indicator */}
                                    {loading && applications.length > 0 && hasMore && (
                                        <div className='py-2 flex justify-center'>
                                            <div className='animate-pulse flex space-x-2'>
                                                <div className='h-2 w-2 bg-muted-foreground rounded-full'></div>
                                                <div className='h-2 w-2 bg-muted-foreground rounded-full'></div>
                                                <div className='h-2 w-2 bg-muted-foreground rounded-full'></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                        <div className='lg:col-span-2 h-[calc(100vh-220px)]'>
                            <TooltipProvider>
                                <ApplicationDetail application={selectedApplication} />
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            </div>
        </NavbarLayout>
    );
}
