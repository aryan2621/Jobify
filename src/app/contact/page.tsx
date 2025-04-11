'use client';

import { JSX, SVGProps, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Mail,
    Phone,
    MapPin,
    MessageCircle,
    Clock,
    HelpCircle,
    CheckCircle,
    Briefcase,
    FileText,
    Send,
    AlertCircle,
    Globe,
    Building,
    MailQuestion,
    Loader2,
} from 'lucide-react';
import NavbarLayout from '@/layouts/navbar';
import Link from 'next/link';
import Image from 'next/image';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        inquiryType: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulating form submission
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSubmitted(true);

        // Reset form after a delay
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({
                name: '',
                email: '',
                inquiryType: '',
                message: '',
            });
        }, 3000);
    };

    const handleChange = (e: { target: { id: any; value: any } }) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    return (
        <NavbarLayout>
            <div className='container px-4 py-8 mx-auto max-w-6xl'>
                <div className='text-center mb-10'>
                    <h1 className='text-3xl font-bold tracking-tight mb-2'>Contact & Support</h1>
                    <p className='text-muted-foreground max-w-2xl mx-auto'>
                        Have questions or need help? Our team is here to assist you with any inquiries about our job platform.
                    </p>
                </div>

                <Tabs defaultValue='contact'>
                    <div className='flex justify-center mb-8'>
                        <TabsList className='grid w-full max-w-md grid-cols-2'>
                            <TabsTrigger value='contact' className='flex items-center gap-2'>
                                <MessageCircle className='h-4 w-4' />
                                Contact Us
                            </TabsTrigger>
                            <TabsTrigger value='faq' className='flex items-center gap-2'>
                                <HelpCircle className='h-4 w-4' />
                                FAQs
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value='contact' className='space-y-8'>
                        <div className='grid gap-8 md:grid-cols-3'>
                            {/* Contact Info Card */}
                            <div className='md:col-span-1 space-y-6'>
                                <Card className='overflow-hidden'>
                                    <div className='bg-primary text-primary-foreground p-6'>
                                        <h3 className='text-xl font-semibold mb-1'>Contact Information</h3>
                                        <p className='text-primary-foreground/80 text-sm'>Reach out to our support team through multiple channels</p>
                                    </div>
                                    <CardContent className='pt-6'>
                                        <div className='space-y-4'>
                                            <div className='flex items-start space-x-3'>
                                                <Mail className='h-5 w-5 text-primary mt-0.5' />
                                                <div>
                                                    <p className='font-medium'>Email Us</p>
                                                    <a href='mailto:support@jobconnect.com' className='text-sm text-primary hover:underline'>
                                                        support@jobconnect.com
                                                    </a>
                                                </div>
                                            </div>

                                            <div className='flex items-start space-x-3'>
                                                <Phone className='h-5 w-5 text-primary mt-0.5' />
                                                <div>
                                                    <p className='font-medium'>Call Us</p>
                                                    <a href='tel:+15551234567' className='text-sm text-muted-foreground'>
                                                        +1 (555) 123-4567
                                                    </a>
                                                </div>
                                            </div>

                                            <div className='flex items-start space-x-3'>
                                                <MapPin className='h-5 w-5 text-primary mt-0.5' />
                                                <div>
                                                    <p className='font-medium'>Office Location</p>
                                                    <p className='text-sm text-muted-foreground'>
                                                        123 JobConnect Plaza
                                                        <br />
                                                        San Francisco, CA 94105
                                                    </p>
                                                </div>
                                            </div>

                                            <div className='flex items-start space-x-3'>
                                                <Clock className='h-5 w-5 text-primary mt-0.5' />
                                                <div>
                                                    <p className='font-medium'>Support Hours</p>
                                                    <p className='text-sm text-muted-foreground'>
                                                        Monday - Friday: 9AM - 6PM EST
                                                        <br />
                                                        Saturday: 10AM - 2PM EST
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className='bg-muted/50 flex flex-col items-start p-6'>
                                        <h4 className='font-medium mb-3'>Connect With Us</h4>
                                        <div className='flex space-x-3'>
                                            {['twitter', 'linkedin', 'facebook', 'instagram'].map((social) => (
                                                <Link
                                                    key={social}
                                                    href='#'
                                                    className='h-8 w-8 rounded-full bg-background flex items-center justify-center hover:bg-primary/10 transition-colors'
                                                >
                                                    <span className='sr-only'>{social}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </CardFooter>
                                </Card>

                                <Card>
                                    <CardHeader className='pb-3'>
                                        <CardTitle className='text-lg flex items-center gap-2'>
                                            <Building className='h-5 w-5' />
                                            For Employers
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className='text-sm text-muted-foreground mb-3'>
                                            Looking to fill positions or need help with your employer account?
                                        </p>
                                        <Link href='/employer-support'>
                                            <Button variant='outline' className='w-full'>
                                                Employer Support
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Contact Form Card */}
                            <div className='md:col-span-2'>
                                <Card>
                                    <CardHeader>
                                        <div className='flex justify-between items-start'>
                                            <div>
                                                <CardTitle>Send Us a Message</CardTitle>
                                                <CardDescription>Fill out the form below and our team will get back to you shortly.</CardDescription>
                                            </div>
                                            <Badge variant='outline' className='text-xs'>
                                                Response within 24hrs
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {isSubmitted ? (
                                            <div className='flex flex-col items-center justify-center py-10 text-center'>
                                                <div className='h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4'>
                                                    <CheckCircle className='h-6 w-6 text-green-600' />
                                                </div>
                                                <h3 className='text-xl font-semibold mb-2'>Message Sent Successfully!</h3>
                                                <p className='text-muted-foreground max-w-md'>
                                                    &#39;ve received your message and will respond to you shortly.
                                                </p>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleSubmit} className='space-y-5'>
                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                                    <div className='space-y-2'>
                                                        <Label htmlFor='name'>Full Name</Label>
                                                        <Input
                                                            id='name'
                                                            placeholder='Enter your name'
                                                            required
                                                            value={formData.name}
                                                            onChange={handleChange}
                                                        />
                                                    </div>

                                                    <div className='space-y-2'>
                                                        <Label htmlFor='email'>Email Address</Label>
                                                        <Input
                                                            id='email'
                                                            type='email'
                                                            placeholder='you@example.com'
                                                            required
                                                            value={formData.email}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>

                                                <div className='space-y-2'>
                                                    <Label htmlFor='inquiryType'>Inquiry Type</Label>
                                                    <Select
                                                        value={formData.inquiryType}
                                                        onValueChange={(value) => setFormData({ ...formData, inquiryType: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select inquiry type' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value='general'>General Question</SelectItem>
                                                            <SelectItem value='account'>Account Support</SelectItem>
                                                            <SelectItem value='billing'>Billing Inquiry</SelectItem>
                                                            <SelectItem value='technical'>Technical Issue</SelectItem>
                                                            <SelectItem value='feedback'>Feedback</SelectItem>
                                                            <SelectItem value='other'>Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className='space-y-2'>
                                                    <Label htmlFor='message'>Message</Label>
                                                    <Textarea
                                                        id='message'
                                                        placeholder='Please describe your inquiry in detail...'
                                                        rows={5}
                                                        required
                                                        value={formData.message}
                                                        onChange={handleChange}
                                                    />
                                                </div>

                                                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
                                                    <p className='text-xs text-muted-foreground'>
                                                        By submitting this form, you agree to our{' '}
                                                        <Link href='/privacy' className='text-primary hover:underline'>
                                                            Privacy Policy
                                                        </Link>
                                                        .
                                                    </p>
                                                    <Button type='submit' disabled={isSubmitting} className='w-full sm:w-auto'>
                                                        {isSubmitting ? (
                                                            <>
                                                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                                Sending...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Send className='mr-2 h-4 w-4' />
                                                                Send Message
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </form>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Support Categories */}
                        <div className='mt-12'>
                            <h2 className='text-xl font-semibold mb-6'>How Can We Help You?</h2>
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                                {[
                                    {
                                        title: 'Account Support',
                                        description: 'Get help with login issues, account recovery, or profile updates',
                                        icon: UserAccount,
                                        link: '/support/account',
                                    },
                                    {
                                        title: 'Job Applications',
                                        description: 'Assistance with applying for jobs and tracking applications',
                                        icon: FileText,
                                        link: '/support/applications',
                                    },
                                    {
                                        title: 'Employer Resources',
                                        description: 'Support for posting jobs and managing candidate applications',
                                        icon: Briefcase,
                                        link: '/support/employers',
                                    },
                                    {
                                        title: 'Technical Support',
                                        description: 'Resolve technical issues and bugs on our platform',
                                        icon: Globe,
                                        link: '/support/technical',
                                    },
                                ].map((category, index) => (
                                    <Card key={index} className='hover:shadow-md transition-shadow'>
                                        <CardContent className='pt-6'>
                                            <div className='flex flex-col items-center text-center'>
                                                <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
                                                    <category.icon className='h-6 w-6 text-primary' />
                                                </div>
                                                <h3 className='font-medium mb-2'>{category.title}</h3>
                                                <p className='text-sm text-muted-foreground mb-4'>{category.description}</p>
                                                <Link href={category.link}>
                                                    <Button variant='link' className='p-0 h-auto text-primary'>
                                                        Learn more →
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value='faq'>
                        <div className='grid gap-8 md:grid-cols-3'>
                            {/* FAQ Categories */}
                            <div className='md:col-span-1'>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className='text-lg'>FAQ Categories</CardTitle>
                                    </CardHeader>
                                    <CardContent className='px-2'>
                                        <div className='space-y-1'>
                                            {[
                                                { name: 'General Questions', icon: HelpCircle },
                                                { name: 'Account Management', icon: UserAccount },
                                                { name: 'Job Applications', icon: FileText },
                                                { name: 'For Employers', icon: Briefcase },
                                                { name: 'Billing & Payments', icon: CreditCard },
                                                { name: 'Technical Issues', icon: Globe },
                                            ].map((category, index) => (
                                                <Button key={index} variant='ghost' className='w-full justify-start'>
                                                    <category.icon className='mr-2 h-4 w-4' />
                                                    {category.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <CardFooter className='bg-muted/50 flex justify-between'>
                                        <div className='flex items-center text-sm text-muted-foreground'>
                                            <MailQuestion className='mr-2 h-4 w-4' />
                                            Can&#39;t find an answer?
                                        </div>
                                        <Link href='#contact-form'>
                                            <Button variant='link' className='text-primary p-0 h-auto'>
                                                Contact Us
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            </div>

                            {/* FAQ Accordion */}
                            <div className='md:col-span-2'>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Frequently Asked Questions</CardTitle>
                                        <CardDescription>Find answers to common questions about our platform.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Accordion type='single' collapsible className='w-full'>
                                            <AccordionItem value='item-1'>
                                                <AccordionTrigger>How do I create an account?</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className='space-y-3 text-muted-foreground'>
                                                        <p>To create an account, follow these steps:</p>
                                                        <ol className='list-decimal list-inside space-y-1 pl-2'>
                                                            <li>Click on the &#39;Sign Up&#39; button in the top right corner of the homepage</li>
                                                            <li>Fill in your personal details, including your name, email address, and password</li>
                                                            <li>Select your account type (Job Seeker or Employer)</li>
                                                            <li>Review and accept the Terms of Service and Privacy Policy</li>
                                                            <li>Click &#39;Create Account&#39; to complete registration</li>
                                                            <li>Verify your email address by clicking the link sent to your inbox</li>
                                                        </ol>
                                                        <p>Once completed, you can log in and access all features of the platform.</p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value='item-2'>
                                                <AccordionTrigger>How can I post a job opening?</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className='space-y-3 text-muted-foreground'>
                                                        <p>To post a job opening, follow these steps:</p>
                                                        <ol className='list-decimal list-inside space-y-1 pl-2'>
                                                            <li>Log into your employer account</li>
                                                            <li>Navigate to the &#39;Post a Job&#39; section from your dashboard</li>
                                                            <li>Fill in the job details, including title, location, job type, and salary range</li>
                                                            <li>Write a comprehensive job description and list the requirements</li>
                                                            <li>Specify application instructions and deadline</li>
                                                            <li>Review your posting and click &#39;Submit&#39; to publish it</li>
                                                        </ol>
                                                        <p>Your job posting will be reviewed and published within 24 hours.</p>
                                                        <div className='bg-muted p-3 rounded-md mt-2 flex items-start gap-2'>
                                                            <AlertCircle className='h-5 w-5 text-primary flex-shrink-0 mt-0.5' />
                                                            <p className='text-sm'>
                                                                Premium members receive priority review and additional promotion options for their job
                                                                postings.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value='item-3'>
                                                <AccordionTrigger>How do I apply for a job?</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className='space-y-3 text-muted-foreground'>
                                                        <p>To apply for a job, follow these steps:</p>
                                                        <ol className='list-decimal list-inside space-y-1 pl-2'>
                                                            <li>Browse the job listings and click on a job you&#39;re interested in</li>
                                                            <li>Review the job details, requirements, and application instructions</li>
                                                            <li>Click the &#39;Apply Now&#39; button</li>
                                                            <li>Upload your resume and cover letter (if required)</li>
                                                            <li>Complete any additional application questions</li>
                                                            <li>Review your application and click &#39;Submit&#39;</li>
                                                        </ol>
                                                        <p>
                                                            You can track the status of your applications in the &#39;My Applications&#39; section of
                                                            your dashboard.
                                                        </p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value='item-4'>
                                                <AccordionTrigger>Can I edit my job application after submitting?</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className='space-y-3 text-muted-foreground'>
                                                        <p>
                                                            Once you&#39;ve submitted an application, you typically cannot edit it directly. However,
                                                            there are options:
                                                        </p>
                                                        <ul className='list-disc list-inside space-y-1 pl-2'>
                                                            <li>Contact the employer directly through the messaging system</li>
                                                            <li>Withdraw your application and reapply (if the job is still open)</li>
                                                            <li>Contact our support team for assistance with urgent changes</li>
                                                        </ul>
                                                        <p>
                                                            To avoid this situation, we recommend reviewing all information carefully before
                                                            submitting your application.
                                                        </p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value='item-5'>
                                                <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className='space-y-3 text-muted-foreground'>
                                                        <p>To reset your password, follow these steps:</p>
                                                        <ol className='list-decimal list-inside space-y-1 pl-2'>
                                                            <li>Click on the &#39;Login&#39; button in the top right corner</li>
                                                            <li>Click on the &#39;Forgot Password?&#39; link below the login form</li>
                                                            <li>Enter the email address associated with your account</li>
                                                            <li>Click &#39;Send Reset Link&#39;</li>
                                                            <li>Check your email for a password reset link</li>
                                                            <li>Click the link and follow instructions to set a new password</li>
                                                        </ol>
                                                        <p>The reset link expires after 24 hours for security reasons.</p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value='item-6'>
                                                <AccordionTrigger>What are the subscription plans and pricing?</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className='space-y-3 text-muted-foreground'>
                                                        <p>We offer several subscription plans designed for different needs:</p>
                                                        <div className='grid gap-2 mt-2'>
                                                            <div className='bg-muted/50 p-3 rounded-md'>
                                                                <h4 className='font-medium'>Basic Plan - Free</h4>
                                                                <ul className='list-disc list-inside text-sm mt-1 pl-2'>
                                                                    <li>Create an account and profile</li>
                                                                    <li>Browse and apply to jobs</li>
                                                                    <li>Limited application tracking</li>
                                                                </ul>
                                                            </div>
                                                            <div className='bg-muted/50 p-3 rounded-md'>
                                                                <h4 className='font-medium'>Premium Plan - $15/month</h4>
                                                                <ul className='list-disc list-inside text-sm mt-1 pl-2'>
                                                                    <li>All Basic features</li>
                                                                    <li>Priority application highlighting</li>
                                                                    <li>Advanced application tracking</li>
                                                                    <li>Early access to new job postings</li>
                                                                </ul>
                                                            </div>
                                                            <div className='bg-muted/50 p-3 rounded-md'>
                                                                <h4 className='font-medium'>Business Plan - $49/month</h4>
                                                                <ul className='list-disc list-inside text-sm mt-1 pl-2'>
                                                                    <li>All Premium features</li>
                                                                    <li>Multiple job postings</li>
                                                                    <li>Advanced candidate filtering</li>
                                                                    <li>Dedicated account manager</li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                        <p>
                                                            Visit our{' '}
                                                            <Link href='/pricing' className='text-primary hover:underline'>
                                                                Pricing Page
                                                            </Link>{' '}
                                                            for more details on plan features and options.
                                                        </p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Map Section */}
                <div className='mt-16'>
                    <div className='rounded-lg overflow-hidden h-[400px] relative'>
                        <div className='absolute inset-0 bg-muted/20 flex items-center justify-center'>
                            <div className='text-center max-w-md mx-auto px-6'>
                                <MapPin className='h-12 w-12 text-primary/70 mx-auto mb-4' />
                                <h2 className='text-2xl font-bold mb-2'>Visit Our Office</h2>
                                <p className='text-muted-foreground mb-6'>123 JobConnect Plaza, San Francisco, CA 94105</p>
                                <Button className='mx-auto'>Get Directions</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </NavbarLayout>
    );
}

// Icons
function UserAccount(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <circle cx='12' cy='8' r='5' />
            <path d='M20 21a8 8 0 1 0-16 0' />
        </svg>
    );
}

function CreditCard(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <rect width='20' height='14' x='2' y='5' rx='2' />
            <line x1='2' x2='22' y1='10' y2='10' />
        </svg>
    );
}
