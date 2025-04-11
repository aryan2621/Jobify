'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChartIcon, BriefcaseIcon, CircleHelpIcon } from '@/components/elements/icon';
import Image from 'next/image';
import { userStore } from '@/store';
import { User, UserRole } from '@/model/user';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { toast, useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, BookCopy, BookCopyIcon, CheckCircle, FileText, Globe, LogOut, Search, UserIcon, Workflow, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Star } from 'lucide-react';
import { MessageCircle, Upload } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogOverlay, DialogTitle } from '@/components/ui/dialog';
import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { uploadResumeToBucket } from '@/appwrite/server/storage';
import ky from 'ky';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const HeaderSection = () => {
    const [scrolled, setScrolled] = useState(false);
    const user = userStore((state) => state.user);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`px-4 lg:px-6 h-16 flex items-center fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}
        >
            <Link href='/' className='flex items-center justify-center' prefetch={false}>
                <BriefcaseIcon className='h-6 w-6 text-primary' />
                <span className='font-bold text-lg ml-2 hidden sm:inline'>JobConnect</span>
                <span className='sr-only'>Job Board</span>
            </Link>
            <nav className='ml-auto flex gap-4 sm:gap-6 items-center'>
                <Link
                    href={user?.role === UserRole.ADMIN ? '/admin/posts' : '/user/posts'}
                    className='text-sm font-medium hover:text-primary transition-colors'
                    prefetch={false}
                >
                    {user?.role === UserRole.ADMIN ? 'Manage Jobs' : 'Browse Jobs'}
                </Link>
                <Link href='/contact' className='text-sm font-medium hover:text-primary transition-colors' prefetch={false}>
                    Contact
                </Link>
                {user && user.id ? (
                    <ProfileMenu user={user} />
                ) : (
                    <div className='flex gap-2'>
                        <Link href='/login' prefetch={false}>
                            <Button variant='outline' size='sm'>
                                Login
                            </Button>
                        </Link>
                        <Link href='/signup' prefetch={false}>
                            <Button size='sm'>Sign Up</Button>
                        </Link>
                    </div>
                )}
            </nav>
        </header>
    );
};

const HeroSection = () => {
    const user = userStore((state) => state.user);
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState('');

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        window.location.href = `/posts?q=${searchQuery}&location=${location}`;
    };
    return (
        <section className='w-full pt-32 pb-20 md:pt-40 md:pb-28 relative'>
            <div className='absolute inset-0 bg-gradient-to-br from-primary/10 to-background z-0'></div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className='container relative z-10'
            >
                <div className='grid lg:grid-cols-2 gap-12 items-center'>
                    <div className='flex flex-col gap-6'>
                        <div>
                            <Badge variant='outline' className='mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/30'>
                                #1 Job Board Platform
                            </Badge>
                            <h1 className='text-4xl md:text-6xl font-bold leading-tight tracking-tighter mb-4'>
                                Find Your <span className='text-transparent bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text'>Dream Job</span>{' '}
                                Today
                            </h1>
                            <p className='text-xl text-muted-foreground max-w-md'>
                                Connect with top employers and discover opportunities that match your skills, experience, and career goals.
                            </p>
                        </div>

                        <div className='bg-card shadow-lg rounded-xl p-4 border border-border/60'>
                            <form onSubmit={handleSearch} className='flex flex-col md:flex-row gap-3'>
                                <div className='relative flex-1'>
                                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                                    <Input
                                        placeholder='Job title, keywords, or company'
                                        className='pl-9 w-full'
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className='relative flex-1'>
                                    <Globe className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                                    <Input
                                        placeholder='Location'
                                        className='pl-9 w-full'
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                </div>
                                <Button type='submit' className='whitespace-nowrap'>
                                    Search Jobs
                                </Button>
                            </form>
                            <div className='flex flex-wrap gap-2 mt-3'>
                                <span className='text-xs text-muted-foreground'>Trending:</span>
                                {['Remote', 'Software Engineer', 'Marketing', 'Data Science', 'Design'].map((tag) => (
                                    <Badge key={tag} variant='secondary' className='text-xs cursor-pointer hover:bg-secondary/80'>
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className='flex flex-wrap gap-4 mt-2'>
                            {user && user.id ? (
                                <>
                                    {user.role === UserRole.ADMIN && (
                                        <Button asChild variant='outline'>
                                            <Link href='/admin/posts/new' prefetch={false}>
                                                Post a Job
                                            </Link>
                                        </Button>
                                    )}
                                    {user.role === UserRole.USER && (
                                        <Button asChild>
                                            <Link href='/user/posts' prefetch={false}>
                                                Browse Jobs
                                            </Link>
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>

                    <div className='relative group hidden lg:block'>
                        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-primary/30 rounded-full blur-3xl opacity-60'></div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Image
                                width={800}
                                height={600}
                                className='w-full rounded-lg shadow-2xl border border-border/50 transform translate-y-0 hover:-translate-y-2 transition-transform duration-500'
                                src='/posts.png'
                                alt='Job board dashboard'
                            />
                        </motion.div>
                    </div>
                </div>

                <div className='mt-16 pt-8 border-t flex flex-wrap justify-center md:justify-between gap-8 items-center'>
                    <div className='text-center md:text-left text-muted-foreground'>
                        <p className='font-medium mb-1'>Trusted by leading companies</p>
                    </div>
                    <div className='flex flex-wrap justify-center gap-8'>
                        {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'].map((company) => (
                            <div key={company} className='text-lg font-bold text-muted-foreground/70'>
                                {company}
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

const StatsSection = () => {
    return (
        <section className='w-full py-16 bg-muted/40'>
            <div className='container'>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
                    {[
                        { label: 'Active Jobs', value: '10,000+' },
                        { label: 'Companies', value: '2,500+' },
                        { label: 'Job Seekers', value: '1M+' },
                        { label: 'Successful Hires', value: '500K+' },
                    ].map((stat, index) => (
                        <div key={index} className='flex flex-col items-center text-center'>
                            <p className='text-3xl md:text-4xl font-bold text-primary'>{stat.value}</p>
                            <p className='text-sm text-muted-foreground'>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
const reviewList = [
    {
        image: 'https://github.com/shadcn.png',
        name: 'John Doe',
        userName: 'Product Manager',
        comment:
            'JobConnect transformed our hiring process completely. The AI matching feature saved us countless hours by connecting us with candidates who truly fit our requirements.',
        rating: 5.0,
    },
    {
        image: 'https://github.com/shadcn.png',
        name: 'Sophia Collins',
        userName: 'Cybersecurity Analyst',
        comment:
            'As someone in a specialized field, finding the right position was always challenging. JobConnect matched me with my dream company within two weeks!',
        rating: 4.8,
    },
    {
        image: 'https://github.com/shadcn.png',
        name: 'Adam Johnson',
        userName: 'Chief Technology Officer',
        comment:
            'The analytics insights provided by JobConnect helped us optimize our job descriptions and improve our application rates by 45%. Outstanding platform!',
        rating: 4.9,
    },
    {
        image: 'https://github.com/shadcn.png',
        name: 'Ethan Parker',
        userName: 'Data Scientist',
        comment:
            'The resume ATS checker was invaluable. It helped me fine-tune my application materials and I received responses from 8 out of 10 jobs I applied for.',
        rating: 5.0,
    },
    {
        image: 'https://github.com/shadcn.png',
        name: 'Ava Mitchell',
        userName: 'IT Project Manager',
        comment:
            'JobConnect streamlined our entire recruitment workflow. The automated screening process reduced our time-to-hire by 60%. Absolutely worth every penny!',
        rating: 5.0,
    },
    {
        image: 'https://github.com/shadcn.png',
        name: 'Isabella Reed',
        userName: 'DevOps Engineer',
        comment:
            "I landed a role with a 30% salary increase thanks to JobConnect. The platform suggested positions I wouldn't have considered but that perfectly matched my skillset.",
        rating: 4.9,
    },
];

const TestimonialSection = () => {
    return (
        <section className='w-full py-20 bg-gradient-to-b from-background to-muted/30'>
            <div className='container'>
                <div className='text-center mb-12'>
                    <Badge variant='outline' className='mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/30'>
                        Success Stories
                    </Badge>
                    <h2 className='text-3xl md:text-4xl font-bold mb-4'>What Our Community Says</h2>
                    <p className='text-muted-foreground max-w-2xl mx-auto'>
                        Join thousands of satisfied job seekers and employers who&#39;ve found success with our platform
                    </p>
                </div>

                <Carousel
                    opts={{
                        align: 'start',
                    }}
                    className='w-full mx-auto'
                >
                    <CarouselContent>
                        {reviewList.map((review) => (
                            <CarouselItem key={review.name} className='md:basis-1/2 lg:basis-1/3 p-2'>
                                <Card className='h-full border border-border/50 hover:border-primary/20 transition-colors duration-300 hover:shadow-md'>
                                    <CardContent className='pt-6'>
                                        <div className='flex gap-1 mb-4'>
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`size-4 ${i < Math.floor(review.rating) ? 'fill-primary text-primary' : 'fill-muted text-muted'}`}
                                                />
                                            ))}
                                            <span className='text-xs text-muted-foreground ml-2'>{review.rating.toFixed(1)}</span>
                                        </div>
                                        <p className='text-sm mb-6'>{`"${review.comment}"`}</p>
                                    </CardContent>

                                    <CardHeader className='pt-0'>
                                        <div className='flex flex-row items-center gap-4'>
                                            <Avatar>
                                                <AvatarImage src='https://avatars.githubusercontent.com/u/75042455?v=4' alt={review.name} />
                                                <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                                            </Avatar>

                                            <div className='flex flex-col'>
                                                <CardTitle className='text-base'>{review.name}</CardTitle>
                                                <CardDescription>{review.userName}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className='flex justify-center mt-8'>
                        <CarouselPrevious className='static transform-none mx-2' />
                        <CarouselNext className='static transform-none mx-2' />
                    </div>
                </Carousel>
            </div>
        </section>
    );
};

const FooterSection = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className='border-t bg-card'>
            <div className='container py-12'>
                <div className='grid grid-cols-1 md:grid-cols-5 gap-8'>
                    <div className='md:col-span-2'>
                        <Link href='/' className='flex items-center gap-2 mb-4' prefetch={false}>
                            <BriefcaseIcon className='h-6 w-6 text-primary' />
                            <span className='font-bold text-xl'>JobConnect</span>
                        </Link>
                        <p className='text-muted-foreground mb-4 max-w-md'>
                            Connecting talented professionals with innovative companies. Your career journey starts here.
                        </p>
                        <div className='flex gap-4'>
                            {['Twitter', 'LinkedIn', 'Facebook', 'Instagram'].map((social) => (
                                <Link
                                    key={social}
                                    href='#'
                                    className='h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors'
                                    prefetch={false}
                                >
                                    <span className='sr-only'>{social}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className='font-semibold mb-4'>For Job Seekers</h3>
                        <ul className='space-y-2'>
                            {['Browse Jobs', 'Career Resources', 'Resume Builder', 'Salary Guide', 'Job Alerts'].map((item) => (
                                <li key={item}>
                                    <Link href='#' className='text-sm text-muted-foreground hover:text-foreground transition-colors' prefetch={false}>
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className='font-semibold mb-4'>For Employers</h3>
                        <ul className='space-y-2'>
                            {['Post a Job', 'Pricing', 'Recruitment Solutions', 'Candidate Search', 'Enterprise'].map((item) => (
                                <li key={item}>
                                    <Link href='#' className='text-sm text-muted-foreground hover:text-foreground transition-colors' prefetch={false}>
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className='font-semibold mb-4'>Company</h3>
                        <ul className='space-y-2'>
                            {['About Us', 'Blog', 'Press', 'Careers', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((item) => (
                                <li key={item}>
                                    <Link href='#' className='text-sm text-muted-foreground hover:text-foreground transition-colors' prefetch={false}>
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className='border-t py-6'>
                <div className='container flex flex-col sm:flex-row justify-between items-center gap-4'>
                    <p className='text-xs text-muted-foreground'>&copy; {currentYear} JobConnect. All rights reserved.</p>
                    <div className='flex gap-6'>
                        <Link href='#' className='text-xs text-muted-foreground hover:text-foreground transition-colors' prefetch={false}>
                            Privacy Policy
                        </Link>
                        <Link href='#' className='text-xs text-muted-foreground hover:text-foreground transition-colors' prefetch={false}>
                            Terms of Service
                        </Link>
                        <Link href='#' className='text-xs text-muted-foreground hover:text-foreground transition-colors' prefetch={false}>
                            Cookie Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const features = [
    {
        title: 'AI-Powered Job Matching',
        description: 'Our intelligent algorithms analyze your skills, experience, and preferences to connect you with the perfect opportunities.',
        icon: <Zap className='w-8 h-8 text-blue-500' />,
        image: '/post.png',
    },
    {
        title: 'Advanced Resume Analysis',
        description: "Get instant feedback on your resume's ATS compatibility and receive personalized tips to improve your chances of success.",
        icon: <Globe className='w-8 h-8 text-green-500' />,
        image: '/posts.png',
    },
    {
        title: 'Streamlined Applications',
        description: 'Apply to multiple positions with a single click and track your applications in real-time from start to finish.',
        icon: <CheckCircle className='w-8 h-8 text-purple-500' />,
        image: '/applications.png',
    },
    {
        title: 'Comprehensive Analytics',
        description: 'Gain valuable insights into your job search performance with detailed analytics and actionable recommendations.',
        icon: <BarChart className='w-8 h-8 text-indigo-500' />,
        image: '/analytic.png',
    },
    {
        title: 'Automated Workflows',
        description: 'Save time with intelligent automation that streamlines every aspect of the recruitment process for employers and job seekers.',
        icon: <Workflow className='w-8 h-8 text-red-500' />,
        image: '/workflows.png',
    },
];

const FeatureSection = () => {
    const [selectedFeature, setSelectedFeature] = useState<(typeof features)[number] | null>(null);
    const [activeTab, setActiveTab] = useState('jobseekers');
    const user = userStore((state) => state.user);
    const jobSeekerFeatures = features.slice(0, 3);
    const employerFeatures = features.slice(2, 5);

    return (
        <section className='w-full py-20'>
            <div className='container'>
                <div className='text-center mb-12'>
                    <Badge variant='outline' className='mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/30'>
                        Platform Features
                    </Badge>
                    <h2 className='text-3xl md:text-4xl font-bold mb-4'>Powerful Tools for Everyone</h2>
                    <p className='text-muted-foreground max-w-2xl mx-auto'>
                        Our comprehensive platform offers specialized features for both job seekers and employers
                    </p>
                </div>

                <Tabs defaultValue='jobseekers' className='w-full mb-10' onValueChange={setActiveTab}>
                    <div className='flex justify-center mb-8'>
                        <TabsList className='grid w-full max-w-md grid-cols-2'>
                            <TabsTrigger value='jobseekers'>For Job Seekers</TabsTrigger>
                            <TabsTrigger value='employers'>For Employers</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value='jobseekers' className='w-full'>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                            {jobSeekerFeatures.map((feature) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <Card
                                        className='cursor-pointer hover:shadow-lg transition-all duration-300 h-full border border-border/50 hover:border-primary/20'
                                        onClick={() => setSelectedFeature(feature)}
                                    >
                                        <CardHeader className='space-y-4'>
                                            <div className='p-3 rounded-lg bg-muted w-fit'>{feature.icon}</div>
                                            <CardTitle className='text-xl'>{feature.title}</CardTitle>
                                            <CardDescription className='text-base'>{feature.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className='relative group rounded-md overflow-hidden'>
                                                <div className='absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                                                <Image
                                                    src={feature.image}
                                                    alt={feature.title}
                                                    width={400}
                                                    height={250}
                                                    className='w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105'
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value='employers' className='w-full'>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                            {employerFeatures.map((feature) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <Card
                                        className='cursor-pointer hover:shadow-lg transition-all duration-300 h-full border border-border/50 hover:border-primary/20'
                                        onClick={() => setSelectedFeature(feature)}
                                    >
                                        <CardHeader className='space-y-4'>
                                            <div className='p-3 rounded-lg bg-muted w-fit'>{feature.icon}</div>
                                            <CardTitle className='text-xl'>{feature.title}</CardTitle>
                                            <CardDescription className='text-base'>{feature.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className='relative group rounded-md overflow-hidden'>
                                                <div className='absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                                                <Image
                                                    src={feature.image}
                                                    alt={feature.title}
                                                    width={400}
                                                    height={250}
                                                    className='w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105'
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                <div className='flex justify-center mt-8'>
                    <Button size='lg' className='font-medium' asChild>
                        <Link href={user?.role === UserRole.ADMIN ? '/admin/posts/new' : '/user/posts'} prefetch={false}>
                            {activeTab === 'jobseekers' ? 'Explore Job Opportunities' : 'Post a Job'}
                        </Link>
                    </Button>
                </div>
            </div>

            <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
                <DialogContent className='max-w-4xl overflow-hidden'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-3 text-2xl'>
                            <div className='p-2 rounded-lg bg-muted'>{selectedFeature?.icon}</div>
                            {selectedFeature?.title}
                        </DialogTitle>
                        <DialogDescription>{selectedFeature?.description}</DialogDescription>
                    </DialogHeader>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className='grid md:grid-cols-2 gap-8 mt-6'
                    >
                        <div className='space-y-6'>
                            <div className='space-y-4'>
                                <h3 className='font-semibold text-lg'>Key Benefits</h3>
                                <div className='flex items-start gap-3'>
                                    <CheckCircle className='w-5 h-5 text-primary mt-0.5 flex-shrink-0' />
                                    <p>Save time and effort with smart automation and intelligent matching.</p>
                                </div>
                                <div className='flex items-start gap-3'>
                                    <CheckCircle className='w-5 h-5 text-primary mt-0.5 flex-shrink-0' />
                                    <p>Increase efficiency with personalized recommendations and insights.</p>
                                </div>
                                <div className='flex items-start gap-3'>
                                    <CheckCircle className='w-5 h-5 text-primary mt-0.5 flex-shrink-0' />
                                    <p>Improve outcomes with data-driven decision making and analytics.</p>
                                </div>
                            </div>

                            <div>
                                <Button size='sm'>Learn More</Button>
                            </div>
                        </div>

                        <div className='relative group'>
                            <div className='absolute top-2 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-32 bg-primary/30 rounded-full blur-3xl opacity-60'></div>
                            <div className='relative h-[300px] rounded-lg overflow-hidden'>
                                <Image src={selectedFeature?.image ?? ''} alt={selectedFeature?.title ?? ''} fill className='object-cover' />
                            </div>
                        </div>
                    </motion.div>
                </DialogContent>
            </Dialog>
        </section>
    );
};

const JobCategoriesSection = () => {
    const categories = [
        { name: 'Technology', count: 1450, icon: <Zap className='h-5 w-5' /> },
        { name: 'Marketing', count: 873, icon: <Globe className='h-5 w-5' /> },
        { name: 'Finance', count: 645, icon: <BarChart className='h-5 w-5' /> },
        { name: 'Healthcare', count: 921, icon: <CheckCircle className='h-5 w-5' /> },
        { name: 'Education', count: 432, icon: <BookCopy className='h-5 w-5' /> },
        { name: 'Design', count: 518, icon: <Workflow className='h-5 w-5' /> },
    ];

    const user = userStore((state) => state.user);

    return (
        <section className='w-full py-20 bg-muted/30'>
            <div className='container'>
                <div className='text-center mb-12'>
                    <Badge variant='outline' className='mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/30'>
                        Browse By Category
                    </Badge>
                    <h2 className='text-3xl md:text-4xl font-bold mb-4'>Popular Job Categories</h2>
                    <p className='text-muted-foreground max-w-2xl mx-auto'>
                        Explore opportunities across various industries and find your perfect career match
                    </p>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
                    {categories.map((category) => (
                        <Link
                            key={category.name}
                            href={`${user?.role === UserRole.ADMIN ? '/admin/posts' : '/user/posts'}?category=${category.name.toLowerCase()}`}
                            prefetch={false}
                        >
                            <Card className='h-full border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300'>
                                <CardContent className='p-6'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <div className='p-3 rounded-lg bg-background'>{category.icon}</div>
                                            <div>
                                                <h3 className='font-semibold text-lg'>{category.name}</h3>
                                                <p className='text-sm text-muted-foreground'>{category.count} open positions</p>
                                            </div>
                                        </div>
                                        <div className='text-muted-foreground hover:text-primary transition-colors'>→</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className='flex justify-center mt-8'>
                    <Button variant='outline' asChild>
                        <Link href={user?.role === UserRole.ADMIN ? '/admin/posts' : '/user/posts'} prefetch={false}>
                            {user?.role === UserRole.ADMIN ? 'Manage Jobs' : 'View All Categories'}
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};

const CTASection = () => {
    const user = userStore((state) => state.user);
    return (
        <section className='py-20 w-full'>
            <div className='container'>
                <div className='bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 relative overflow-hidden'>
                    <div className='absolute inset-0 bg-grid-white/5 mask-gradient-to-r' />

                    <div className='grid md:grid-cols-2 gap-10 items-center relative z-10'>
                        <div>
                            <h2 className='text-3xl md:text-4xl font-bold mb-4'>Ready to Take the Next Step in Your Career?</h2>
                            <p className='text-lg mb-6'>
                                Join thousands of professionals who have found their dream jobs through JobConnect. Sign up today and let us help you
                                discover your next opportunity.
                            </p>
                            <div className='flex flex-wrap gap-4'>
                                <Button variant='outline' size='lg' asChild>
                                    <Link href={user?.role === UserRole.ADMIN ? '/admin/posts' : '/user/posts'} prefetch={false}>
                                        {user?.role === UserRole.ADMIN ? 'Manage Jobs' : 'View All Categories'}
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className='hidden md:block relative h-[300px]'>
                            <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-primary/20 rounded-full blur-3xl'></div>
                            <Image src='/analytic.png' alt='Career growth visualization' fill className='object-contain' />
                        </div>
                    </div>
                </div>
            </div>
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
                className='fixed bottom-4 right-4 h-14 w-14 rounded-full p-0 shadow-lg z-40'
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
                    <Link href='/profile' className='flex w-full items-center' prefetch={false}>
                        <UserIcon className='mr-2 h-4 w-4' />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                {user.role === UserRole.ADMIN ? (
                    <>
                        <DropdownMenuItem>
                            <Link href='/admin/posts' className='flex w-full items-center' prefetch={false}>
                                <BriefcaseIcon className='mr-2 h-4 w-4' />
                                <span>Manage Jobs</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href='/admin/applications' className='flex w-full items-center' prefetch={false}>
                                <FileText className='mr-2 h-4 w-4' />
                                <span>Applications</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href='/admin/workflows' className='flex w-full items-center' prefetch={false}>
                                <Workflow className='mr-2 h-4 w-4' />
                                <span>Workflows</span>
                            </Link>
                        </DropdownMenuItem>
                    </>
                ) : (
                    <>
                        <DropdownMenuItem>
                            <Link href='/user/posts' className='flex w-full items-center' prefetch={false}>
                                <BriefcaseIcon className='mr-2 h-4 w-4' />
                                <span>Browse Jobs</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href='/user/applications' className='flex w-full items-center' prefetch={false}>
                                <FileText className='mr-2 h-4 w-4' />
                                <span>My Applications</span>
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}
                <DropdownMenuItem>
                    <Link href='/analytics' className='flex w-full items-center' prefetch={false}>
                        <BarChartIcon className='mr-2 h-4 w-4' />
                        <span>Analytics</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link href='/contact' className='flex w-full items-center' prefetch={false}>
                        <CircleHelpIcon className='mr-2 h-4 w-4' />
                        <span>Contact</span>
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

export default function Component() {
    return (
        <div className='flex flex-col min-h-[100dvh]'>
            <HeaderSection />
            <main className='flex-1 pt-16'>
                <HeroSection />
                <StatsSection />
                <FeatureSection />
                <JobCategoriesSection />
                <TestimonialSection />
                <CTASection />
            </main>
            <FooterSection />
            <ResumeChecker />
        </div>
    );
}
