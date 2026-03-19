'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BriefcaseIcon, CircleHelpIcon } from '@/components/elements/icon';
import Image from 'next/image';
import { userStore } from '@/store';
import { User } from '@/model/user';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { BarChart, BookCopy, CheckCircle, FileText, Globe, LogOut, Search, UserIcon, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Star } from 'lucide-react';
import { Facebook, Instagram, Linkedin, MessageCircle, Send, Twitter } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ky from 'ky';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
                    href='/jobs'
                    className='text-sm font-medium hover:text-primary transition-colors'
                    prefetch={false}
                >
                    Browse Jobs
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
        window.location.href = `/jobs?q=${searchQuery}&location=${location}`;
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
                                    <Badge
                                        key={tag}
                                        variant='secondary'
                                        className='text-xs cursor-pointer hover:bg-secondary/80'
                                        onClick={() => window.location.assign(`/jobs?q=${encodeURIComponent(tag)}`)}
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className='flex flex-wrap gap-4 mt-2'>
                            <Button asChild>
                                <Link href='/jobs' prefetch={false}>
                                    Browse Jobs
                                </Link>
                            </Button>
                            {!user?.id && (
                                <Button variant='outline' asChild>
                                    <Link href='/signup' prefetch={false}>
                                        Sign Up
                                    </Link>
                                </Button>
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
            </motion.div>
        </section>
    );
};

const STATS = [
    { label: 'Active Jobs', target: 10000 },
    { label: 'Companies', target: 2500 },
    { label: 'Job Seekers', target: 1000000 },
    { label: 'Successful Hires', target: 500000 },
] as const;

function formatStatValue(current: number, target: number): string {
    if (target >= 1e6) return `${Math.round(current / 1e6)}M+`;
    if (target >= 100000) return `${Math.round(current / 1e3)}K+`;
    return `${Math.round(current).toLocaleString()}+`;
}

function useCountUp(target: number, inView: boolean, durationMs = 2000) {
    const [value, setValue] = useState(0);
    const startRef = useRef<number | null>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        if (!inView) return;
        startRef.current = null;

        const tick = (timestamp: number) => {
            if (startRef.current === null) startRef.current = timestamp;
            const elapsed = timestamp - startRef.current;
            const t = Math.min(elapsed / durationMs, 1);
            const easeOut = 1 - (1 - t) ** 3;
            setValue(easeOut * target);
            if (t < 1) rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [inView, target, durationMs]);

    useEffect(() => {
        if (!inView) setValue(0);
    }, [inView]);

    return value;
}

const StatsSection = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) setInView(true);
            },
            { threshold: 0.2 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className='w-full py-16 bg-muted/40'>
            <div className='container'>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
                    {STATS.map((stat, index) => (
                        <StatCard key={stat.label} label={stat.label} target={stat.target} inView={inView} />
                    ))}
                </div>
            </div>
        </section>
    );
};

function StatCard({ label, target, inView }: { label: string; target: number; inView: boolean }) {
    const value = useCountUp(target, inView);
    return (
        <div className='flex flex-col items-center text-center'>
            <p className='text-3xl md:text-4xl font-bold text-primary tabular-nums'>
                {formatStatValue(value, target)}
            </p>
            <p className='text-sm text-muted-foreground'>{label}</p>
        </div>
    );
}
const reviewList = [
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
        name: 'Ethan Parker',
        userName: 'Data Scientist',
        comment:
            'The resume ATS checker was invaluable. It helped me fine-tune my application materials and I received responses from 8 out of 10 jobs I applied for.',
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
                        Join thousands of job seekers who&#39;ve found success with our platform
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
                                                <AvatarImage src={review.image} alt={review.name} />
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
                <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
                    <div className='md:col-span-2'>
                        <Link href='/' className='flex items-center gap-2 mb-4 text-foreground' prefetch={false}>
                            <BriefcaseIcon className='h-6 w-6 text-primary' />
                            <span className='font-bold text-xl'>JobConnect</span>
                        </Link>
                        <p className='text-muted-foreground mb-4 max-w-md'>
                            Connecting talented professionals with innovative companies. Your career journey starts here.
                        </p>
                        <div className='flex gap-3'>
                            <Link
                                href='#'
                                className='h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors'
                                prefetch={false}
                                aria-label='Twitter'
                            >
                                <Twitter className='h-5 w-5' />
                            </Link>
                            <Link
                                href='#'
                                className='h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors'
                                prefetch={false}
                                aria-label='LinkedIn'
                            >
                                <Linkedin className='h-5 w-5' />
                            </Link>
                            <Link
                                href='#'
                                className='h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors'
                                prefetch={false}
                                aria-label='Facebook'
                            >
                                <Facebook className='h-5 w-5' />
                            </Link>
                            <Link
                                href='#'
                                className='h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors'
                                prefetch={false}
                                aria-label='Instagram'
                            >
                                <Instagram className='h-5 w-5' />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className='font-semibold mb-4'>For Job Seekers</h3>
                        <ul className='space-y-2'>
                            <li>
                                <Link href='/jobs' className='text-sm text-muted-foreground hover:text-foreground transition-colors' prefetch={false}>
                                    Browse Jobs
                                </Link>
                            </li>
                            <li>
                                <Link href='/contact' className='text-sm text-muted-foreground hover:text-foreground transition-colors' prefetch={false}>
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className='font-semibold mb-4'>Company</h3>
                        <ul className='space-y-2'>
                            <li>
                                <Link href='/contact' className='text-sm text-muted-foreground hover:text-foreground transition-colors' prefetch={false}>
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className='border-t py-6'>
                <div className='container'>
                    <p className='text-xs text-muted-foreground text-center'>&copy; {currentYear} JobConnect. All rights reserved.</p>
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
];

const FeatureSection = () => {
    const [selectedFeature, setSelectedFeature] = useState<(typeof features)[number] | null>(null);

    return (
        <section className='w-full py-20'>
            <div className='container'>
                <div className='text-center mb-12'>
                    <Badge variant='outline' className='mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/30'>
                        Platform Features
                    </Badge>
                    <h2 className='text-3xl md:text-4xl font-bold mb-4'>Powerful Tools for Job Seekers</h2>
                    <p className='text-muted-foreground max-w-2xl mx-auto'>
                        Our comprehensive platform offers specialized features to help you find your dream job
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                    {features.map((feature) => (
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

                <div className='flex justify-center mt-8'>
                    <Button size='lg' className='font-medium' asChild>
                        <Link href='/jobs' prefetch={false}>
                            Explore Job Opportunities
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
                                    <Link href='/jobs' prefetch={false}>
                                        Browse Jobs
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

const ContactChatbot = () => {
    const user = userStore((state) => state.user);
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', inquiryType: '', message: '' });

    useEffect(() => {
        if (user && open) {
            setFormData((prev) => ({
                ...prev,
                name: [user.firstName, user.lastName].filter(Boolean).join(' ').trim(),
                email: user.email || '',
            }));
        }
    }, [user, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (formData.inquiryType) params.set('inquiryType', formData.inquiryType);
        if (formData.message) params.set('message', formData.message);
        setOpen(false);
        setFormData({ name: '', email: '', inquiryType: '', message: '' });
        router.push(`/contact?${params.toString()}`);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className='fixed bottom-4 right-4 h-14 w-14 rounded-full p-0 shadow-lg z-40'
                aria-label='Contact us'
            >
                <MessageCircle className='h-6 w-6' />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='fixed left-auto top-auto right-4 bottom-20 translate-x-0 translate-y-0 w-full max-w-[380px] max-h-[calc(100vh-6rem)] overflow-y-auto p-4 rounded-lg shadow-xl data-[state=open]:slide-in-from-bottom-4 data-[state=open]:slide-in-from-right-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:slide-out-to-right-0'>
                    <DialogHeader className='space-y-1'>
                        <DialogTitle className='text-lg flex items-center gap-2'>
                            <MessageCircle className='h-5 w-5' />
                            Contact
                        </DialogTitle>
                        <DialogDescription>Send a quick message. We&apos;ll respond within 24 hours.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className='space-y-3'>
                            <div className='space-y-1.5'>
                                <Label htmlFor='name' className='text-xs'>Name</Label>
                                <Input
                                    id='name'
                                    placeholder='Your name'
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!!user}
                                    className='h-9 text-sm'
                                />
                            </div>
                            <div className='space-y-1.5'>
                                <Label htmlFor='email' className='text-xs'>Email</Label>
                                <Input
                                    id='email'
                                    type='email'
                                    placeholder='you@example.com'
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!!user}
                                    className='h-9 text-sm'
                                />
                            </div>
                            <div className='space-y-1.5'>
                                <Label className='text-xs'>Inquiry</Label>
                                <Select value={formData.inquiryType} onValueChange={(v) => setFormData((p) => ({ ...p, inquiryType: v }))}>
                                    <SelectTrigger className='h-9 text-sm'>
                                        <SelectValue placeholder='Select type' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='general'>General</SelectItem>
                                        <SelectItem value='account'>Account / profile</SelectItem>
                                        <SelectItem value='applications'>Applications / jobs</SelectItem>
                                        <SelectItem value='technical'>Technical issue</SelectItem>
                                        <SelectItem value='feedback'>Feedback</SelectItem>
                                        <SelectItem value='other'>Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='space-y-1.5'>
                                <Label htmlFor='message' className='text-xs'>Message</Label>
                                <Textarea
                                    id='message'
                                    placeholder='Your message...'
                                    rows={3}
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                    className='text-sm resize-none'
                                />
                            </div>
                            <Button type='submit' size='sm' className='w-full'>
                                <Send className='mr-2 h-4 w-4' />
                                Continue to contact form
                            </Button>
                            <p className='text-center'>
                                <Link href='/contact' className='text-xs text-muted-foreground hover:text-foreground' prefetch={false}>
                                    Full contact page →
                                </Link>
                            </p>
                        </form>
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
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;
        ky.get('/api/me')
            .json<{ avatarUrl?: string | null }>()
            .then((res: { avatarUrl?: string | null }) => setAvatarUrl(res.avatarUrl ?? null))
            .catch(() => {});
    }, [user?.id]);

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
                        <AvatarImage src={avatarUrl ?? undefined} alt={`${user.firstName} ${user.lastName}`} />
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
                <DropdownMenuItem>
                    <Link href='/jobs' className='flex w-full items-center' prefetch={false}>
                        <BriefcaseIcon className='mr-2 h-4 w-4' />
                        <span>Browse Jobs</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link href='/applications' className='flex w-full items-center' prefetch={false}>
                        <FileText className='mr-2 h-4 w-4' />
                        <span>My Applications</span>
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
                <TestimonialSection />
                <CTASection />
            </main>
            <FooterSection />
            <ContactChatbot />
        </div>
    );
}
