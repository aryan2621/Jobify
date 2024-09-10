'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { BarChartIcon, BriefcaseIcon, CircleHelpIcon } from '@/elements/icon';
import Image from 'next/image';
import { userStore } from '@/store';
import { User } from '@/model/user';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { BookCopyIcon, LogOut } from 'lucide-react';

export default function Component() {
    const currentYear = new Date().getFullYear();
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
        <div className='flex flex-col min-h-[100dvh]'>
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
            <main className='flex-1'>
                <section className='w-full py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24'>
                    <div className='container px-4 sm:px-6 mx-auto'>
                        <div className='flex flex-col lg:flex-row items-center gap-8 lg:gap-12'>
                            <div className='flex flex-col justify-center space-y-4 lg:w-1/2'>
                                <div className='space-y-2'>
                                    <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tighter'>
                                        Find Your Dream Job
                                    </h1>
                                    <p className='text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-[600px]'>
                                        Discover the best job opportunities in your field and take the next step in your career.
                                    </p>
                                </div>
                                <div className='flex flex-col sm:flex-row gap-4'>
                                    <Link
                                        href='/posts'
                                        className='inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 sm:px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
                                        prefetch={false}
                                    >
                                        Apply for Jobs
                                    </Link>
                                </div>
                            </div>
                            <div className='lg:w-1/2 mt-8 lg:mt-0'>
                                <Image
                                    src='/hero.jpeg'
                                    alt='Hero'
                                    width={600}
                                    height={600}
                                    className='w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-full h-auto rounded-xl object-cover object-bottom shadow-lg mx-auto'
                                />
                            </div>
                        </div>
                    </div>
                </section>
                <section className='w-full py-12 md:py-24 lg:py-32'>
                    <div className='container px-4 md:px-6'>
                        <div className='flex flex-col items-center justify-center space-y-4 text-center'>
                            <div className='space-y-2'>
                                <div className='inline-block rounded-lg text-white px-3 py-1 text-sm'>Featured Jobs</div>
                                <h2 className='text-3xl font-bold tracking-tighter sm:text-5xl'>Explore Top Job Opportunities</h2>
                                <p className='max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
                                    Browse through our curated list of the best job openings in your industry.
                                </p>
                            </div>
                            <div className='grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3'>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Software Engineer</CardTitle>
                                        <CardDescription>Acme Inc.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className='text-muted-foreground'>
                                            Seeking a talented software engineer to join our fast-paced team. Experience with React and Node.js
                                            required.
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        <Link
                                            href='#'
                                            className='inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
                                            prefetch={false}
                                        >
                                            Apply Now
                                        </Link>
                                    </CardFooter>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Marketing Manager</CardTitle>
                                        <CardDescription>Globex Corporation</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className='text-muted-foreground'>
                                            Experienced marketing professional needed to lead our digital marketing initiatives. Strong analytical and
                                            communication skills required.
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        <Link
                                            href='#'
                                            className='inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
                                            prefetch={false}
                                        >
                                            Apply Now
                                        </Link>
                                    </CardFooter>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Product Designer</CardTitle>
                                        <CardDescription>Stark Industries</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className='text-muted-foreground'>
                                            Seeking a talented product designer to join our innovative team. Experience with Figma and user-centered
                                            design required.
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        <Link
                                            href='#'
                                            className='inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
                                            prefetch={false}
                                        >
                                            Apply Now
                                        </Link>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>
                <section className='w-full py-12 md:py-24 lg:py-32'>
                    <div className='container px-4 md:px-6'>
                        <div className='flex flex-col items-center justify-center space-y-4 text-center'>
                            <div className='space-y-1'>
                                <h2 className='text-3xl font-bold tracking-tighter sm:text-5xl text-white'>Discover the Power of Our Job Board</h2>
                                <p className='max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
                                    Our job board is designed to connect top talent with leading companies across industries. With advanced search and
                                    filtering capabilities, you can easily find the perfect candidates for your open positions.
                                </p>
                            </div>
                            <div className='grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3'>
                                {[
                                    {
                                        title: 'Powerful Search',
                                        description: 'Easily find the best candidates with our advanced search and filtering tools.',
                                    },
                                    {
                                        title: 'Seamless Hiring',
                                        description: 'Streamline your hiring process with our user-friendly platform.',
                                    },
                                    {
                                        title: 'Trusted by Thousands',
                                        description: 'Our job board is trusted by leading companies across industries.',
                                    },
                                ].map((feature, index) => (
                                    <div
                                        key={index}
                                        className='bg-slate-900 text-white rounded-lg p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300'
                                    >
                                        <div className='space-y-2'>
                                            <h3 className='text-xl font-bold'>{feature.title}</h3>
                                            <p className='text-gray-300'>{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
                <section className='w-full py-12 md:py-24 lg:py-32'>
                    <div className='container px-4 md:px-6'>
                        <div className='flex flex-col items-center justify-center space-y-4 text-center'>
                            <div className='space-y-2'>
                                <div className='inline-block rounded-lg px-3 py-1 text-sm text-white'>Trusted by Thousands</div>
                                <h2 className='text-3xl font-bold tracking-tighter sm:text-5xl'>Join the Best Companies</h2>
                                <p className='max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
                                    Our job board is trusted by leading companies across industries. Post your job and connect with top talent today.
                                </p>
                            </div>
                            <div className='divide-y rounded-lg border'>
                                <div className='grid w-full grid-cols-3 items-stretch justify-center divide-x md:grid-cols-6'>
                                    {['/c1.png', '/c2.png', '/c3.png', '/c6.png', '/c5.png', '/c4.png'].map((logo, index) => (
                                        <div
                                            key={index}
                                            className='mx-auto flex w-full items-center justify-center p-4 sm:p-8 transition-transform duration-300 hover:scale-105'
                                        >
                                            <Image
                                                src={logo}
                                                width={140}
                                                height={70}
                                                alt={`Logo ${index + 1}`}
                                                className='aspect-[2/1] overflow-hidden rounded-lg object-contain object-center opacity-80 hover:opacity-100 transition-opacity duration-300'
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className='w-full py-12 md:py-24 lg:py-32'>
                    <div className='container px-4 md:px-6'>
                        <div className='flex flex-col items-center justify-center space-y-4 text-center mb-12'>
                            <div className='space-y-2'>
                                <h2 className='text-3xl font-bold tracking-tighter sm:text-5xl text-white'>What Our Users Say</h2>
                                <p className='max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-gray-300'>
                                    Hear from our satisfied users about their experience with our job board.
                                </p>
                            </div>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
                            {[
                                {
                                    name: 'John Doe',
                                    position: 'Software Engineer',
                                    comment:
                                        'I found my dream job on this job board. The process was quick and easy, and the job listings were highly relevant to my skills.',
                                    date: 'May 2023',
                                },
                                {
                                    name: 'John Doe',
                                    position: 'Software Engineer',
                                    comment:
                                        'I found my dream job on this job board. The process was quick and easy, and the job listings were highly relevant to my skills.',
                                    date: 'May 2023',
                                },
                                {
                                    name: 'John Doe',
                                    position: 'Software Engineer',
                                    comment:
                                        'I found my dream job on this job board. The process was quick and easy, and the job listings were highly relevant to my skills.',
                                    date: 'May 2023',
                                },
                                {
                                    name: 'John Doe',
                                    position: 'Software Engineer',
                                    comment:
                                        'I found my dream job on this job board. The process was quick and easy, and the job listings were highly relevant to my skills.',
                                    date: 'May 2023',
                                },
                            ].map((testimonial, index) => (
                                <div
                                    key={index}
                                    className='bg-slate-900 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between'
                                >
                                    <div className='flex items-center mb-4'>
                                        <div>
                                            <div className='text-lg font-bold'>{testimonial.name}</div>
                                            <div className='text-blue-400'>{testimonial.position}</div>
                                        </div>
                                    </div>
                                    <p className='text-gray-300 mb-4'>&quot;{testimonial.comment}&quot;</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
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
