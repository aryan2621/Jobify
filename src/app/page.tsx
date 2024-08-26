'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { BriefcaseIcon } from '@/elements/icon';
import Image from 'next/image';

export default function Component() {
    const currentYear = new Date().getFullYear();
    return (
        <div className='flex flex-col min-h-[100dvh]'>
            <header className='px-4 lg:px-6 h-14 flex items-center'>
                <Link href='/' className='flex items-center justify-center' prefetch={false}>
                    <BriefcaseIcon className='h-6 w-6' />
                    <span className='sr-only'>Job Board</span>
                </Link>
                <nav className='ml-auto flex gap-4 sm:gap-6'>
                    <Link href='/posts' className='text-sm font-medium hover:underline underline-offset-4' prefetch={false}>
                        Find Jobs
                    </Link>
                    <Link href='/post' className='text-sm font-medium hover:underline underline-offset-4' prefetch={false}>
                        Post a Job
                    </Link>
                    <Link href='/contact' className='text-sm font-medium hover:underline underline-offset-4' prefetch={false}>
                        Contact
                    </Link>
                </nav>
            </header>
            <main className='flex-1'>
                <section className='w-full py-12 md:py-24 lg:py-32 bg-black'>
                    <div className='container px-4 md:px-6'>
                        <div className='grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]'>
                            <div className='flex flex-col justify-center space-y-4'>
                                <div className='space-y-2'>
                                    <h1 className='text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-white'>
                                        Find Your Dream Job
                                    </h1>
                                    <p className='max-w-[600px] text-muted-foreground md:text-xl'>
                                        Discover the best job opportunities in your field and take the next step in your career.
                                    </p>
                                </div>
                                <div className='flex flex-col gap-2 min-[400px]:flex-row'>
                                    <Link
                                        href='/posts'
                                        className='inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
                                        prefetch={false}
                                        target='_blank'
                                    >
                                        Apply for Jobs
                                    </Link>
                                    <Link
                                        href='/post'
                                        className='inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
                                        prefetch={false}
                                        target='_blank'
                                    >
                                        Post a Job
                                    </Link>
                                </div>
                            </div>
                            <Image
                                src='/hero.jpeg'
                                alt='Hero'
                                width={300}
                                height={400}
                                className='mx-auto w-full max-w-[300px] h-auto rounded-xl object-cover object-bottom shadow-lg lg:order-last lg:max-w-full lg:aspect-square'
                            />
                        </div>
                    </div>
                </section>
                <section className='w-full py-12 md:py-24 lg:py-32'>
                    <div className='container px-4 md:px-6'>
                        <div className='flex flex-col items-center justify-center space-y-4 text-center'>
                            <div className='space-y-2'>
                                <div className='inline-block rounded-lg bg-black text-white px-3 py-1 text-sm'>Featured Jobs</div>
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
                <section className='w-full py-12 md:py-24 lg:py-32 bg-black'>
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
                <section className='w-full py-12 md:py-24 lg:py-32 border-t'>
                    <div className='container px-4 md:px-6'>
                        <div className='flex flex-col items-center justify-center space-y-4 text-center'>
                            <div className='space-y-2'>
                                <div className='inline-block rounded-lg bg-black px-3 py-1 text-sm text-white'>Trusted by Thousands</div>
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
                <section className='w-full py-12 md:py-24 lg:py-32 bg-black'>
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
                                    <p className='text-gray-300 mb-4'>"{testimonial.comment}"</p>
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
