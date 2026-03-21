'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@jobify/ui/card';
import { BarChartIcon, BriefcaseIcon, CircleHelpIcon } from '@/components/elements/icon';
import Image from 'next/image';
import { userStore, type SessionUser } from '@/store';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@jobify/ui/dropdown-menu';
import { Button } from '@jobify/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@jobify/ui/avatar';
import { useRouter } from 'next/navigation';
import { toast } from '@jobify/ui/use-toast';
import { Badge } from '@jobify/ui/badge';
import { BarChart, BookCopy, CheckCircle, FileText, Globe, LogOut, MessageCircle, Send, UserIcon, Workflow, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@jobify/ui/carousel';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@jobify/ui/dialog';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@jobify/ui/input';
import { Label } from '@jobify/ui/label';
import { Textarea } from '@jobify/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@jobify/ui/select';

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
                    href='/posts'
                    className='text-sm font-medium hover:text-primary transition-colors'
                    prefetch={false}
                >
                    Manage Jobs
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
                                Post · review · automate
                            </Badge>
                            <h1 className='text-4xl md:text-6xl font-bold leading-tight tracking-tighter mb-4'>
                                Hire with <span className='text-transparent bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text'>clarity</span>, not chaos
                            </h1>
                            <p className='text-lg md:text-xl text-muted-foreground max-w-lg'>
                                One workspace for listings, applicants, and workflows—so your team spends time on people, not spreadsheets.
                            </p>
                        </div>

                        <div className='flex flex-wrap gap-3 mt-2'>
                            {user && user.id ? (
                                <Button asChild>
                                    <Link href='/posts/new' prefetch={false}>
                                        Post a job
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild>
                                        <Link href='/signup' prefetch={false}>
                                            Create account
                                        </Link>
                                    </Button>
                                    <Button variant='outline' asChild>
                                        <Link href='/login' prefetch={false}>
                                            Log in
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className='relative group mt-8 lg:mt-0 max-w-lg mx-auto lg:max-w-none'>
                        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-primary/30 rounded-full blur-3xl opacity-60'></div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                        >
                            <Image
                                width={800}
                                height={600}
                                className='w-full rounded-xl shadow-2xl border border-border/50 transform translate-y-0 hover:-translate-y-1 transition-transform duration-500'
                                src='/posts.png'
                                alt='Employer hiring dashboard'
                            />
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

const STATS = [
    { label: 'Open roles', target: 3200 },
    { label: 'Teams hiring', target: 520 },
    { label: 'Candidates', target: 24000 },
    { label: 'Roles filled', target: 6100 },
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
                <p className='text-center text-xs text-muted-foreground mb-8 uppercase tracking-widest'>Activity across JobConnect</p>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
                    {STATS.map((stat) => (
                        <StatCard key={stat.label} label={stat.label} target={stat.target} inView={inView} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const reviewList = [
    {
        name: 'Jordan Lee',
        userName: 'Head of Talent',
        comment: 'We finally stopped bouncing between inboxes. One pipeline, clear owners, fewer “did anyone see this?” moments.',
        rating: 5,
    },
    {
        name: 'Marcus Chen',
        userName: 'CTO',
        comment: 'Posting is fast; the analytics page actually gets used in our weekly hiring sync—simple charts, no fluff.',
        rating: 4.9,
    },
    {
        name: 'Priya Nair',
        userName: 'People Ops',
        comment: 'Workflows took the manual follow-ups off our plate. The team talks to candidates more, not spreadsheets.',
        rating: 5,
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
                    <h2 className='text-3xl md:text-4xl font-bold mb-4'>Teams who like a calmer hiring week</h2>
                    <p className='text-muted-foreground max-w-2xl mx-auto'>Less coordination tax, more time with candidates</p>
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
                                                    className={`size-4 ${i < Math.round(review.rating) ? 'fill-primary text-primary' : 'fill-muted text-muted'}`}
                                                />
                                            ))}
                                            <span className='text-xs text-muted-foreground ml-2'>{review.rating.toFixed(1)}</span>
                                        </div>
                                        <p className='text-sm mb-6'>{`"${review.comment}"`}</p>
                                    </CardContent>

                                    <CardHeader className='pt-0'>
                                        <div className='flex flex-row items-center gap-4'>
                                            <Avatar>
                                                <AvatarFallback className='bg-primary/15 text-primary font-medium'>
                                                    {review.name
                                                        .split(' ')
                                                        .map((n) => n.charAt(0))
                                                        .join('')
                                                        .slice(0, 2)}
                                                </AvatarFallback>
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
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
                    <div className='sm:col-span-2 lg:col-span-2'>
                        <Link href='/' className='flex items-center gap-2 mb-4' prefetch={false}>
                            <BriefcaseIcon className='h-6 w-6 text-primary' />
                            <span className='font-bold text-xl'>JobConnect</span>
                        </Link>
                        <p className='text-muted-foreground mb-4 max-w-md'>
                            Hiring ops that stay out of the way—post, review, and automate without losing the human touch.
                        </p>
                    </div>

                    <div>
                        <h3 className='font-semibold mb-4'>For employers</h3>
                        <ul className='space-y-2'>
                            <li>
                                <Link href='/posts/new' className='text-sm text-muted-foreground hover:text-foreground transition-colors' prefetch={false}>
                                    Post a job
                                </Link>
                            </li>
                            <li>
                                <Link href='/posts' className='text-sm text-muted-foreground hover:text-foreground transition-colors' prefetch={false}>
                                    Manage jobs
                                </Link>
                            </li>
                            <li>
                                <Link href='/applications' className='text-sm text-muted-foreground hover:text-foreground transition-colors' prefetch={false}>
                                    Applications
                                </Link>
                            </li>
                            <li>
                                <Link href='/billing' className='text-sm text-muted-foreground hover:text-foreground transition-colors' prefetch={false}>
                                    Pricing
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className='font-semibold mb-4'>Contact</h3>
                        <ul className='space-y-2'>
                            <li>
                                <Link href='/contact' className='text-sm text-muted-foreground hover:text-foreground transition-colors' prefetch={false}>
                                    Contact us
                                </Link>
                            </li>
                            <li>
                                <p className='text-xs text-muted-foreground leading-relaxed'>
                                    Questions about billing, jobs, or workflows? Reach out—we typically reply within a day.
                                </p>
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

const employerFeatures = [
    {
        title: 'Applications in one lane',
        description: 'Every candidate, same view—status, notes, and next steps without digging through email.',
        icon: <CheckCircle className='w-8 h-8 text-purple-500' />,
        image: '/applications.png',
    },
    {
        title: 'Analytics you’ll open',
        description: 'Funnel health at a glance: volume, pace, and where applicants stall—no six-tab dashboard.',
        icon: <BarChart className='w-8 h-8 text-indigo-500' />,
        image: '/analytic.png',
    },
    {
        title: 'Workflows that nudge',
        description: 'Automate the repetitive bits—reminders, stages, handoffs—so humans handle the real conversations.',
        icon: <Workflow className='w-8 h-8 text-red-500' />,
        image: '/workflows.png',
    },
];

const FeatureSection = () => {
    const [selectedFeature, setSelectedFeature] = useState<(typeof employerFeatures)[number] | null>(null);

    return (
        <section className='w-full py-20'>
            <div className='container'>
                <div className='text-center mb-12'>
                    <Badge variant='outline' className='mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/30'>
                        Employer toolkit
                    </Badge>
                    <h2 className='text-3xl md:text-4xl font-bold mb-4'>Less ops noise, more hiring</h2>
                    <p className='text-muted-foreground max-w-2xl mx-auto'>Tap a card for detail—then open the product when you’re ready to ship a role</p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    {employerFeatures.map((feature) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Card
                                role='button'
                                tabIndex={0}
                                aria-label={`${feature.title}: view details`}
                                className='cursor-pointer hover:shadow-lg transition-all duration-300 h-full border border-border/50 hover:border-primary/20 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                                onClick={() => setSelectedFeature(feature)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setSelectedFeature(feature);
                                    }
                                }}
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
                        <Link href='/posts/new' prefetch={false}>
                            Post a job
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
                                <h3 className='font-semibold text-lg'>Why teams stick with it</h3>
                                <div className='flex items-start gap-3'>
                                    <CheckCircle className='w-5 h-5 text-primary mt-0.5 flex-shrink-0' />
                                    <p>Single source of truth for roles and applicants—onboarding new hiring managers is painless.</p>
                                </div>
                                <div className='flex items-start gap-3'>
                                    <CheckCircle className='w-5 h-5 text-primary mt-0.5 flex-shrink-0' />
                                    <p>Lightweight analytics that support decisions, not slide decks.</p>
                                </div>
                                <div className='flex items-start gap-3'>
                                    <CheckCircle className='w-5 h-5 text-primary mt-0.5 flex-shrink-0' />
                                    <p>Workflows reduce ping-pong; your brand still sounds human.</p>
                                </div>
                            </div>
                            <div className='pt-2'>
                                <Button size='sm' asChild>
                                    <Link href='/posts/new' prefetch={false}>
                                        Post a job
                                    </Link>
                                </Button>
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
        { name: 'Technology', tag: 'Engineering & product', icon: <Zap className='h-5 w-5' /> },
        { name: 'Marketing', tag: 'Growth & brand', icon: <Globe className='h-5 w-5' /> },
        { name: 'Finance', tag: 'Ops & analysis', icon: <BarChart className='h-5 w-5' /> },
        { name: 'Healthcare', tag: 'Clinical & support', icon: <CheckCircle className='h-5 w-5' /> },
        { name: 'Education', tag: 'Teaching & training', icon: <BookCopy className='h-5 w-5' /> },
        { name: 'Design', tag: 'Product & creative', icon: <Workflow className='h-5 w-5' /> },
    ];

    return (
        <section className='w-full py-20 bg-muted/30'>
            <div className='container'>
                <div className='text-center mb-12'>
                    <Badge variant='outline' className='mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/30'>
                        Where teams hire
                    </Badge>
                    <h2 className='text-3xl md:text-4xl font-bold mb-4'>Popular lanes</h2>
                    <p className='text-muted-foreground max-w-2xl mx-auto'>
                        Jump to a category when you manage or post roles—keep your pipeline organized by function
                    </p>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
                    {categories.map((category) => (
                        <Link
                            key={category.name}
                            href={`/posts?category=${category.name.toLowerCase()}`}
                            prefetch={false}
                        >
                            <Card className='h-full border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300'>
                                <CardContent className='p-6'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <div className='p-3 rounded-lg bg-background'>{category.icon}</div>
                                            <div>
                                                <h3 className='font-semibold text-lg'>{category.name}</h3>
                                                <p className='text-sm text-muted-foreground'>{category.tag}</p>
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
                        <Link href='/posts' prefetch={false}>
                            Manage Jobs
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
                            <h2 className='text-3xl md:text-4xl font-bold mb-4'>Ship your next role this week</h2>
                            <p className='text-lg mb-6 text-muted-foreground'>
                                Free to explore—post when you&apos;re ready and keep every applicant in one pipeline.
                            </p>
                            <div className='flex flex-wrap gap-4'>
                                <Button size='lg' asChild>
                                    <Link href='/posts/new' prefetch={false}>
                                        Post a job
                                    </Link>
                                </Button>
                                <Button variant='outline' size='lg' asChild>
                                    <Link href='/posts' prefetch={false}>
                                        Manage jobs
                                    </Link>
                                </Button>
                                {!user?.id && (
                                    <Button variant='ghost' size='lg' className='md:w-auto w-full' asChild>
                                        <Link href='/signup' prefetch={false}>
                                            Create employer account
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className='hidden md:block relative h-[300px]'>
                            <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-primary/20 rounded-full blur-3xl'></div>
                            <Image src='/analytic.png' alt='Hiring analytics visualization' fill className='object-contain' />
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
                            <Label htmlFor='name' className='text-xs'>
                                Name
                            </Label>
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
                            <Label htmlFor='email' className='text-xs'>
                                Email
                            </Label>
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
                                    <SelectItem value='billing'>Billing / plan</SelectItem>
                                    <SelectItem value='posting'>Posting jobs</SelectItem>
                                    <SelectItem value='applications'>Applications / pipeline</SelectItem>
                                    <SelectItem value='workflows'>Workflows</SelectItem>
                                    <SelectItem value='technical'>Technical issue</SelectItem>
                                    <SelectItem value='feedback'>Feedback</SelectItem>
                                    <SelectItem value='other'>Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-1.5'>
                            <Label htmlFor='message' className='text-xs'>
                                Message
                            </Label>
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
    user: SessionUser;
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
    const initials =
        `${user.firstName?.trim().charAt(0) ?? ''}${user.lastName?.trim().charAt(0) ?? ''}`.toUpperCase() ||
        (user.username?.trim().charAt(0) ?? user.email?.trim().charAt(0) ?? '?').toUpperCase();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                    <Avatar className='h-8 w-8'>
                        <AvatarImage src={user.avatarUrl ?? undefined} alt={`${user.firstName} ${user.lastName}`} />
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
                    <Link href='/posts' className='flex w-full items-center' prefetch={false}>
                        <BriefcaseIcon className='mr-2 h-4 w-4' />
                        <span>Manage Jobs</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link href='/applications' className='flex w-full items-center' prefetch={false}>
                        <FileText className='mr-2 h-4 w-4' />
                        <span>Applications</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link href='/workflows' className='flex w-full items-center' prefetch={false}>
                        <Workflow className='mr-2 h-4 w-4' />
                        <span>Workflows</span>
                    </Link>
                </DropdownMenuItem>
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
            <ContactChatbot />
        </div>
    );
}
