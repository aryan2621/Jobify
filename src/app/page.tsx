'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChartIcon, BriefcaseIcon, CircleHelpIcon } from '@/elements/icon';
import Image from 'next/image';
import { userStore } from '@/store';
import { User } from '@/model/user';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { toast, useToast } from '@/components/ui/use-toast';
import { BarChart, BookCopy, BookCopyIcon, CheckCircle, Globe, LogOut, Workflow, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Star } from 'lucide-react';
import { MessageCircle, Upload } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogOverlay, DialogTitle } from '@/components/ui/dialog';
import { useState, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { uploadResumeToBucket } from '@/appwrite/server/storage';
import ky from 'ky';
import { cn } from '@/lib/utils';

const HeaderSection = () => {
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
    return (
        <header className='px-4 lg:px-6 h-14 flex items-center border-b'>
            <Link href='/' className='flex items-center justify-center' prefetch={false}>
                <BriefcaseIcon className='h-6 w-6' />
                <span className='sr-only'>Job Board</span>
            </Link>
            <nav className='ml-auto flex gap-4 sm:gap-6'>
                <Link href='/posts' className='text-sm font-medium hover:underline underline-offset-4' prefetch={false}>
                    Find Jobs
                </Link>
                <Link href='/contact' className='text-sm font-medium hover:underline underline-offset-4' prefetch={false}>
                    Contact
                </Link>
                {user ? (
                    <ProfileMenu user={user} />
                ) : (
                    <Link href='/login' className='text-sm font-medium hover:underline underline-offset-4' prefetch={false}>
                        Login
                    </Link>
                )}
            </nav>
        </header>
    );
};

const HeroSection = () => {
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
    return (
        <section className='w-full py-12 md:py-20 lg:py-25'>
            <div className='grid place-items-center lg:max-w-screen-xl gap-8 mx-auto py-10 md:py-15'>
                <div className='text-center space-y-8'>
                    <div className='max-w-screen-md mx-auto text-center text-4xl md:text-6xl font-bold'>
                        <h1>
                            Find your
                            <span className='text-transparent px-2 bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text'>Dream Job</span>
                        </h1>
                    </div>

                    <p className='max-w-screen-sm mx-auto text-xl text-muted-foreground'>
                        Discover the best job opportunities in your field and take the next step in your career.
                    </p>

                    <div className='space-y-4 md:space-y-0 md:space-x-4'>
                        {user.poster && (
                            <Button asChild variant='secondary' className='w-5/6 md:w-1/4 font-bold'>
                                <Link href='/post' prefetch={false}>
                                    Post a Job
                                </Link>
                            </Button>
                        )}
                        {user.applier && (
                            <Button asChild variant='secondary' className='w-5/6 md:w-1/4 font-bold'>
                                <Link href='/posts' prefetch={false}>
                                    Find Jobs
                                </Link>
                            </Button>
                        )}

                        <Button asChild variant='secondary' className='w-5/6 md:w-1/4 font-bold'>
                            <Link href='/contact' prefetch={false}>
                                Contact
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className='relative group mt-14'>
                    <div className='absolute top-2 lg:-top-8 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-24 lg:h-80 bg-primary/50 rounded-full blur-3xl'></div>
                    <Image
                        width={1200}
                        height={1200}
                        className='w-full md:w-[1200px] mx-auto rounded-lg relative rouded-lg leading-none flex items-center border border-t-2 border-secondary  border-t-primary/30'
                        src='/posts.png'
                        alt='dashboard'
                    />

                    <div className='absolute bottom-0 left-0 w-full h-20 md:h-28 bg-gradient-to-b from-background/0 via-background/50 to-background rounded-lg'></div>
                </div>
            </div>
        </section>
    );
};
const reviewList: {
    image: string;
    name: string;
    userName: string;
    comment: string;
    rating: number;
}[] = [
    {
        image: 'https://github.com/shadcn.png',
        name: 'John Doe',
        userName: 'Product Manager',
        comment: 'Wow NextJs + Shadcn is awesome!. This template lets me change colors, fonts and images to match my brand identity. ',
        rating: 5.0,
    },
    {
        image: 'https://github.com/shadcn.png',
        name: 'Sophia Collins',
        userName: 'Cybersecurity Analyst',
        comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. ',
        rating: 4.8,
    },

    {
        image: 'https://github.com/shadcn.png',
        name: 'Adam Johnson',
        userName: 'Chief Technology Officer',
        comment:
            'Lorem ipsum dolor sit amet,exercitation. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
        rating: 4.9,
    },
    {
        image: 'https://github.com/shadcn.png',
        name: 'Ethan Parker',
        userName: 'Data Scientist',
        comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod labore et dolore magna aliqua. Ut enim ad minim veniam.',
        rating: 5.0,
    },
    {
        image: 'https://github.com/shadcn.png',
        name: 'Ava Mitchell',
        userName: 'IT Project Manager',
        comment:
            'Lorem ipsum dolor sit amet, tempor incididunt  aliqua. Ut enim ad minim veniam, quis nostrud incididunt consectetur adipiscing elit.',
        rating: 5.0,
    },
    {
        image: 'https://github.com/shadcn.png',
        name: 'Isabella Reed',
        userName: 'DevOps Engineer',
        comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        rating: 4.9,
    },
];

const TestimonialSection = () => {
    return (
        <section className='w-full py-12 md:py-20 lg:py-25'>
            <div className='container px-4 md:px-6 text-center mb-8'>
                <h2 className='text-lg text-primary text-center mb-2 tracking-wider'>Testimonials</h2>
                <h2 className='text-3xl md:text-4xl text-center font-bold mb-4'>Hear What Our 1000+ Clients Say</h2>
            </div>
            <Carousel
                opts={{
                    align: 'start',
                }}
                className='relative w-[80%] sm:w-[90%] lg:max-w-screen-xl mx-auto'
            >
                <CarouselContent>
                    {reviewList.map((review) => (
                        <CarouselItem key={review.name} className='md:basis-1/2 lg:basis-1/3'>
                            <Card className='bg-muted/50 dark:bg-card'>
                                <CardContent className='pt-6 pb-0'>
                                    <div className='flex gap-1 pb-6'>
                                        <Star className='size-4 fill-primary text-primary' />
                                        <Star className='size-4 fill-primary text-primary' />
                                        <Star className='size-4 fill-primary text-primary' />
                                        <Star className='size-4 fill-primary text-primary' />
                                        <Star className='size-4 fill-primary text-primary' />
                                    </div>
                                    {`"${review.comment}"`}
                                </CardContent>

                                <CardHeader>
                                    <div className='flex flex-row items-center gap-4'>
                                        <Avatar>
                                            <AvatarImage src='https://avatars.githubusercontent.com/u/75042455?v=4' alt='radix' />
                                            <AvatarFallback>SV</AvatarFallback>
                                        </Avatar>

                                        <div className='flex flex-col'>
                                            <CardTitle className='text-lg'>{review.name}</CardTitle>
                                            <CardDescription>{review.userName}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </section>
    );
};

const FooterSection = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className='flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t'>
            <p className='text-xs text-muted-foreground'>&copy; {currentYear} Job Board. All rights reserved.</p>
            <nav className='sm:ml-auto flex gap-4 sm:gap-6'>
                <Link href='#' className='text-xs hover:underline underline-offset-4' prefetch={false}>
                    Terms of Service
                </Link>
                <Link href='#' className='text-xs hover:underline underline-offset-4' prefetch={false}>
                    Privacy
                </Link>
            </nav>
        </footer>
    );
};
const FeatureSection = () => {
    const [selectedFeature, setSelectedFeature] = useState<(typeof features)[0] | null>(null);
    const features = [
        {
            title: 'Streamlined Job Posting',
            description: 'Effortlessly create and publish job listings with our intelligent platform.',
            icon: <Zap className='w-8 h-8 text-blue-500' />,
            image: '/post.png',
        },
        {
            title: 'Advanced Job Matching',
            description: 'AI-powered candidate matching to find the perfect talent instantly.',
            icon: <Globe className='w-8 h-8 text-green-500' />,
            image: '/posts.png',
        },
        {
            title: 'Application Tracking',
            description: 'Comprehensive tracking and real-time notifications for every application.',
            icon: <CheckCircle className='w-8 h-8 text-purple-500' />,
            image: '/applications.png',
        },
        {
            title: 'Comprehensive Analytics',
            description: 'Powerful insights and detailed analytics to optimize your hiring process.',
            icon: <BarChart className='w-8 h-8 text-indigo-500' />,
            image: '/analytic.png',
        },
        {
            title: 'Automated Workflows',
            description: 'Intelligent automation to streamline your entire recruitment workflow.',
            icon: <Workflow className='w-8 h-8 text-red-500' />,
            image: '/workflows.png',
        },
    ];

    return (
        <section className='w-full py-12 md:py-20 lg:py-25'>
            <div className='container mx-auto px-4 max-w-6xl'>
                <div className='text-center mb-12'>
                    <h2 className='text-4xl font-bold mb-4'>Revolutionize Your Hiring Process</h2>
                    <p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
                        Discover a comprehensive platform that transforms how you recruit, track, and manage talent.
                    </p>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {features.map((feature, index) => (
                        <div key={feature.title}>
                            <Card
                                className='cursor-pointer hover:shadow-lg transition-all duration-300 h-full'
                                onClick={() => setSelectedFeature(feature)}
                            >
                                <CardHeader className='space-y-4'>
                                    <div className='flex items-center gap-3'>
                                        <div className='p-2 rounded-lg bg-muted'>{feature.icon}</div>
                                        <CardTitle className='text-xl'>{feature.title}</CardTitle>
                                    </div>
                                    <CardDescription className='text-base'>{feature.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className='relative group'>
                                        <div className='absolute top-2 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-32 bg-primary/50 rounded-full blur-3xl'></div>
                                        <div className='relative h-[300px] rounded-lg overflow-hidden'>
                                            <Image
                                                src={feature.image}
                                                alt={feature.title}
                                                fill
                                                className='object-cover transition-transform duration-300 group-hover:scale-105'
                                            />
                                            <div className='absolute bottom-0 left-0 w-full h-20 bg-gradient-to-b from-background/0 via-background/50 to-background rounded-lg'></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>

            <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
                <DialogContent className='max-w-5xl h-[80vh] overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-3 text-3xl'>
                            <div className='p-2 rounded-lg bg-muted'>{selectedFeature?.icon}</div>
                            {selectedFeature?.title}
                        </DialogTitle>
                    </DialogHeader>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className='grid md:grid-cols-2 gap-8 mt-6'
                    >
                        <div className='space-y-6'>
                            <p className='text-lg'>{selectedFeature?.description}</p>

                            <div className='space-y-4'>
                                <div className='flex items-start gap-3'>
                                    <CheckCircle className='w-6 h-6 text-primary mt-1' />
                                    <p>Advanced AI algorithms ensure precise matching between job requirements and candidate qualifications.</p>
                                </div>
                                <div className='flex items-start gap-3'>
                                    <CheckCircle className='w-6 h-6 text-primary mt-1' />
                                    <p>Real-time analytics and insights help optimize your recruitment process.</p>
                                </div>
                                <div className='flex items-start gap-3'>
                                    <CheckCircle className='w-6 h-6 text-primary mt-1' />
                                    <p>Automated workflow reduces manual tasks and improves efficiency.</p>
                                </div>
                            </div>
                        </div>

                        <div className='relative group'>
                            <div className='absolute top-2 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-32 bg-primary/50 rounded-full blur-3xl'></div>
                            <div className='relative h-[400px] rounded-lg overflow-hidden'>
                                <Image src={selectedFeature?.image ?? ''} alt={selectedFeature?.title ?? ''} fill className='object-cover' />
                                <div className='absolute bottom-0 left-0 w-full h-20 bg-gradient-to-b from-background/0 via-background/50 to-background rounded-lg'></div>
                            </div>
                        </div>
                    </motion.div>
                </DialogContent>
            </Dialog>
        </section>
    );
};
const ResumeChecker = () => {
    const [open, setOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [score, setScore] = useState<number | null>(null);
    const [suggestions, setSuggestions] = useState<{ heading: string; suggestion: string }[]>([]);
    const [fetching, setFetching] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const { toast } = useToast();

    const handleUploadButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleOnChange = (open: boolean) => {
        if (!open) {
            setScore(null);
            setSuggestions([]);
        }
        setOpen(open);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.includes('pdf')) {
            toast({
                title: 'Error',
                description: 'Please upload a PDF file',
                variant: 'destructive',
            });
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast({
                title: 'Error',
                description: 'File size must be less than 10MB',
                variant: 'destructive',
            });
            return;
        }

        try {
            setFetching(true);
            setScore(null);

            setUploadStatus('Uploading resume to server...');
            const fileId = await uploadResumeToBucket(file);

            setUploadStatus('Analyzing resume with ATS system...');
            const response = await ky.post<{
                score: number;
                suggestions: string[];
            }>('/api/resume-score', {
                json: { fileId },
                timeout: 30000,
            });

            setUploadStatus('Calculating final score...');
            const json = await response.json();
            setScore(json.score);
            setSuggestions(
                json.suggestions.map((suggestion) => ({
                    heading: suggestion.split(':')[0].trim(),
                    suggestion: suggestion.split(':')[1]?.trim() || '',
                }))
            );
            toast({
                title: 'Success',
                description: 'Resume analysis completed successfully',
            });
        } catch (error: any) {
            console.error('Resume processing error:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to process resume. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setFetching(false);
            setUploadStatus('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className='fixed bottom-4 right-4 h-14 w-14 rounded-full p-0 shadow-lg'
                aria-label='Open Resume Checker'
            >
                <MessageCircle className='h-6 w-6' />
            </Button>

            <Dialog open={open} onOpenChange={handleOnChange}>
                <DialogContent className='sm:max-w-[900px] h-[90vh] overflow-hidden'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2 text-2xl'>
                            <Upload className='h-6 w-6' />
                            Resume ATS Checker
                        </DialogTitle>
                        <DialogDescription>Upload your resume to check its compatibility with Applicant Tracking Systems (ATS)</DialogDescription>
                    </DialogHeader>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-hidden'>
                        <div className='space-y-6'>
                            <Card className={cn('border-2 border-dashed transition-colors', fetching ? 'opacity-50' : 'hover:border-primary/50')}>
                                <CardContent className='flex flex-col items-center justify-center py-10'>
                                    <Upload className='h-16 w-16 text-muted-foreground mb-6' />
                                    <Button variant='secondary' onClick={handleUploadButtonClick} disabled={fetching} className='relative'>
                                        {fetching ? (
                                            <>
                                                <span className='animate-pulse'>Processing...</span>
                                                <span className='absolute bottom-[-24px] text-xs text-muted-foreground whitespace-nowrap'>
                                                    {uploadStatus}
                                                </span>
                                            </>
                                        ) : (
                                            'Upload Resume (PDF)'
                                        )}
                                    </Button>
                                    <input
                                        id='resume-upload'
                                        ref={fileInputRef}
                                        type='file'
                                        accept='.pdf'
                                        onChange={handleFileUpload}
                                        disabled={fetching}
                                        className='hidden'
                                        aria-label='Upload PDF resume'
                                    />
                                    <p className='text-sm text-muted-foreground mt-8'>Maximum file size: 10MB</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className='flex items-center gap-2'>
                                        <BarChart className='h-5 w-5' />
                                        ATS Score
                                    </CardTitle>
                                    <CardDescription>Your resume&apos;s compatibility with ATS systems</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {fetching ? (
                                        <div className='space-y-4'>
                                            <Progress value={undefined} className='h-3' />
                                            <p className='text-center text-sm text-muted-foreground'>{uploadStatus}</p>
                                        </div>
                                    ) : score !== null ? (
                                        <div className='space-y-4'>
                                            <div className='flex justify-between items-center'>
                                                <span className='text-sm font-medium'>Compatibility Score</span>
                                                <span className='text-2xl font-bold'>{score}%</span>
                                            </div>
                                            <Progress value={score} className='h-3' />
                                            <p className='text-sm text-muted-foreground mt-4'>
                                                {score >= 80
                                                    ? 'Excellent! Your resume is well-optimized for ATS systems.'
                                                    : score >= 60
                                                      ? "Good, but there's room for improvement in ATS optimization."
                                                      : 'Consider revising your resume to better match ATS requirements.'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className='text-center text-muted-foreground py-8'>
                                            <Upload className='h-12 w-12 mx-auto mb-4 opacity-50' />
                                            <p>Upload your resume to see the ATS compatibility score</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className='space-y-4 h-full overflow-hidden'>
                            <div className='flex items-center gap-2 mb-2'>
                                <BookCopy className='h-5 w-5' />
                                <h3 className='text-lg font-semibold'>Improvement Tips</h3>
                            </div>
                            <ScrollArea className='h-[calc(100%-40px)] pr-4'>
                                {suggestions.length > 0 ? (
                                    <ul className='space-y-6'>
                                        {suggestions.map((suggestion, index) => (
                                            <li key={index} className='bg-muted p-4 rounded-lg'>
                                                <div className='flex items-start gap-3 mb-2'>
                                                    <CheckCircle className='h-5 w-5 mt-0.5 text-green-500 flex-shrink-0' />
                                                    <span className='font-medium'>{suggestion.heading}</span>
                                                </div>
                                                <p className='text-sm text-muted-foreground ml-8'>{suggestion.suggestion}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className='text-center text-muted-foreground py-8'>
                                        <BookCopy className='h-12 w-12 mx-auto mb-4 opacity-50' />
                                        <p>Upload your resume to see improvement suggestions</p>
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default function Component() {
    return (
        <div className='flex flex-col min-h-[100dvh]'>
            <HeaderSection />
            <div className='container'>
                <HeroSection />
                <FeatureSection />
                <TestimonialSection />
            </div>
            <FooterSection />
            <ResumeChecker />
        </div>
    );
}

interface ProfileMenuProps {
    user: User;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ user }) => {
    const router = useRouter();
    const logout = userStore((state) => state.logout);
    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
            toast({
                title: 'Logged Out',
                description: 'You have been logged out successfully',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message ?? 'Error while logging out',
            });
        }
    };
    const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                    <Avatar className='h-8 w-8'>
                        <AvatarImage src='/avatars/01.png' alt={user.firstName} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56' align='end' forceMount>
                <DropdownMenuItem className='flex flex-col items-start'>
                    <div className='font-medium'>{`${user.firstName} ${user.lastName}`}</div>
                    <div className='text-xs text-muted-foreground'>{user.email}</div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link href='/contact' className='flex w-full items-center'>
                        <CircleHelpIcon className='mr-2 h-4 w-4' />
                        <span>Help and Support</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link href='/posts' className='flex w-full items-center'>
                        <BookCopyIcon className='mr-2 h-4 w-4' />
                        <span>Posts</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link href='/analytics' className='flex w-full items-center'>
                        <BarChartIcon className='mr-2 h-4 w-4' />
                        <span>Analytics</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <button
                        className='flex w-full items-center'
                        onClick={async (e) => {
                            e.preventDefault();
                            await handleLogout();
                        }}
                    >
                        <LogOut className='mr-2 h-4 w-4' />
                        <span>Log out</span>
                    </button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
