'use client';

import { JSX, SVGProps, useEffect, useState } from 'react';
import ky from 'ky';
import { Button } from '@jobify/ui/button';
import { Input } from '@jobify/ui/input';
import { Textarea } from '@jobify/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@jobify/ui/accordion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@jobify/ui/card';
import { Label } from '@jobify/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@jobify/ui/select';
import { Badge } from '@jobify/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@jobify/ui/tabs';
import {
    Mail,
    MessageCircle,
    Clock,
    HelpCircle,
    CheckCircle,
    Briefcase,
    FileText,
    Send,
    Globe,
    Users,
    MailQuestion,
    Loader2,
    CreditCard,
} from 'lucide-react';
import NavbarLayout from '@/layouts/navbar';
import Link from 'next/link';

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

interface CurrentUser {
    name: string;
    email: string;
}

export default function ContactPage() {
    const [activeTab, setActiveTab] = useState('contact');
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        inquiryType: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = (await ky.get('/api/me').json()) as { firstName?: string; lastName?: string; email?: string };
                const name = [res.firstName, res.lastName].filter(Boolean).join(' ').trim() || '';
                const email = res.email ?? '';
                setCurrentUser({ name, email });
                setFormData((prev) => ({ ...prev, name, email }));
            } catch {
                setCurrentUser(null);
            }
        };
        loadUser();
    }, []);

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setIsSubmitting(true);

        
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSubmitted(true);

        setTimeout(() => {
            setIsSubmitted(false);
            setFormData((prev) => ({
                ...prev,
                inquiryType: '',
                message: '',
                ...(currentUser && { name: currentUser.name, email: currentUser.email }),
            }));
        }, 3000);
    };

    const handleChange = (e: { target: { id: string; value: string } }) => {
        const { id, value } = e.target;
        if (id === 'name' || id === 'email') return;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    return (
        <NavbarLayout>
            <div className='container px-4 py-8 mx-auto max-w-6xl'>
                <div className='text-center mb-10'>
                    <h1 className='text-3xl font-bold tracking-tight mb-2'>Contact & Support</h1>
                    <p className='text-muted-foreground max-w-2xl mx-auto'>
                        Support for hiring managers and recruiters: job posts, candidate pipeline, workflows, and screening. We’re here to help you fill roles and hire great talent.
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                            {}
                            <div className='md:col-span-1 space-y-6'>
                                <Card className='overflow-hidden'>
                                    <div className='bg-primary text-primary-foreground p-6'>
                                        <h3 className='text-xl font-semibold mb-1'>Contact Information</h3>
                                        <p className='text-primary-foreground/80 text-sm'>Reach out for help with recruiting, pipelines, workflows, or your account</p>
                                    </div>
                                    <CardContent className='pt-6'>
                                        <div className='space-y-4'>
                                            <div className='flex items-start space-x-3'>
                                                <Mail className='h-5 w-5 text-primary mt-0.5' />
                                                <div>
                                                    <p className='font-medium'>Email</p>
                                                    <a href='mailto:support@jobconnect.com' className='text-sm text-primary hover:underline'>
                                                        support@jobconnect.com
                                                    </a>
                                                </div>
                                            </div>
                                            <div className='flex items-start space-x-3'>
                                                <Clock className='h-5 w-5 text-primary mt-0.5' />
                                                <div>
                                                    <p className='font-medium'>Support Hours</p>
                                                    <p className='text-sm text-muted-foreground'>
                                                        Monday – Friday: 9AM – 6PM (your timezone)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            
                            <div className='md:col-span-2'>
                                <Card>
                                    <CardHeader>
                                        <div className='flex justify-between items-start'>
                                            <div>
                                                <CardTitle>Send Us a Message</CardTitle>
                                                <CardDescription>
                                                    Describe your question or issue. This form is not yet connected to a backend; for immediate help, email support@jobconnect.com.
                                                </CardDescription>
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
                                                <h3 className='text-xl font-semibold mb-2'>Demo submitted</h3>
                                                <p className='text-muted-foreground max-w-md'>
                                                    This form is not yet wired to our support system. For real requests, please email support@jobconnect.com.
                                                </p>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleSubmit} className='space-y-5'>
                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                                    <div className='space-y-2'>
                                                        <Label htmlFor='name'>Full Name</Label>
                                                        <Input
                                                            id='name'
                                                            placeholder='Your name'
                                                            required
                                                            disabled
                                                            value={formData.name}
                                                            className='bg-muted'
                                                        />
                                                    </div>

                                                    <div className='space-y-2'>
                                                        <Label htmlFor='email'>Email Address</Label>
                                                        <Input
                                                            id='email'
                                                            type='email'
                                                            placeholder='your@email.com'
                                                            required
                                                            disabled
                                                            value={formData.email}
                                                            className='bg-muted'
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
                                                            <SelectValue placeholder='Select topic' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value='posting'>Posting roles / job requisitions</SelectItem>
                                                            <SelectItem value='applications'>Managing applications & candidate pipeline</SelectItem>
                                                            <SelectItem value='workflows'>Recruiting workflows & automation</SelectItem>
                                                            <SelectItem value='account'>Recruiter account & settings</SelectItem>
                                                            <SelectItem value='billing'>Billing & subscription</SelectItem>
                                                            <SelectItem value='technical'>Technical issue</SelectItem>
                                                            <SelectItem value='other'>Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className='space-y-2'>
                                                    <Label htmlFor='message'>Message</Label>
                                                    <Textarea
                                                        id='message'
                                                        placeholder='Describe your question (e.g. posting a role, pipeline, workflows, or account)...'
                                                        rows={5}
                                                        required
                                                        value={formData.message}
                                                        onChange={handleChange}
                                                    />
                                                </div>

                                                <div className='flex flex-col sm:flex-row sm:justify-end sm:items-center gap-4'>
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

                        
                        <div className='mt-12'>
                            <h2 className='text-xl font-semibold mb-6'>How We Can Help Recruiters & Hiring Managers</h2>
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                                {[
                                    {
                                        title: 'Job posts & requisitions',
                                        description: 'Create, edit, or close roles; manage visibility and deadlines',
                                        icon: Briefcase,
                                    },
                                    {
                                        title: 'Candidate pipeline',
                                        description: 'Review applicants, shortlist, and move candidates through your hiring stages',
                                        icon: FileText,
                                    },
                                    {
                                        title: 'Recruiting workflows',
                                        description: 'Set up stages, automated notifications, and team assignments',
                                        icon: Users,
                                    },
                                    {
                                        title: 'Account & technical',
                                        description: 'Recruiter login, settings, integrations, and platform issues',
                                        icon: Globe,
                                    },
                                ].map((category, index) => (
                                    <Card key={index} className='hover:shadow-md transition-shadow'>
                                        <CardContent className='pt-6'>
                                            <div className='flex flex-col items-center text-center'>
                                                <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
                                                    <category.icon className='h-6 w-6 text-primary' />
                                                </div>
                                                <h3 className='font-medium mb-2'>{category.title}</h3>
                                                <p className='text-sm text-muted-foreground'>{category.description}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value='faq'>
                        <div className='grid gap-8 md:grid-cols-3'>
                            
                            <div className='md:col-span-1'>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className='text-lg'>For Recruiters & Hiring Managers</CardTitle>
                                    </CardHeader>
                                    <CardContent className='px-2'>
                                        <div className='space-y-1'>
                                            {[
                                                { name: 'Posting roles', icon: Briefcase },
                                                { name: 'Candidate pipeline', icon: FileText },
                                                { name: 'Recruiting workflows', icon: Users },
                                                { name: 'Account & settings', icon: UserAccount },
                                                { name: 'Billing & subscription', icon: CreditCard },
                                                { name: 'Technical issues', icon: Globe },
                                            ].map((category, index) => (
                                                <Button key={index} variant='ghost' className='w-full justify-start' type='button'>
                                                    <category.icon className='mr-2 h-4 w-4' />
                                                    {category.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <CardFooter className='bg-muted/50 flex justify-between'>
                                        <div className='flex items-center text-sm text-muted-foreground'>
                                            <MailQuestion className='mr-2 h-4 w-4' />
                                            Can’t find an answer?
                                        </div>
                                        <Button variant='link' className='text-primary p-0 h-auto' type='button' onClick={() => setActiveTab('contact')}>
                                            Contact support
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>

                            
                            <div className='md:col-span-2'>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Frequently Asked Questions</CardTitle>
                                        <CardDescription>Common questions for hiring managers and recruiters: posting roles, candidate pipeline, and recruiting workflows.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Accordion type='single' collapsible className='w-full'>
                                            <AccordionItem value='item-1'>
                                                <AccordionTrigger>How do I post a new role (job requisition)?</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className='space-y-3 text-muted-foreground'>
                                                        <p>From your dashboard, go to <strong>Posts</strong> → <strong>New post</strong>. Enter the role title, location, type, description, and requirements. Save as draft or publish. Published roles appear on the job board for candidates to apply.</p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value='item-2'>
                                                <AccordionTrigger>How do I review and manage my candidate pipeline?</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className='space-y-3 text-muted-foreground'>
                                                        <p>Open <strong>Applications</strong> from the admin menu. Filter by role, status, or date. Open an application to view the candidate’s details and resume, and move them through your stages (e.g. screening, interview, offer).</p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value='item-3'>
                                                <AccordionTrigger>What are recruiting workflows and how do I use them?</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className='space-y-3 text-muted-foreground'>
                                                        <p>Workflows automate your recruiting pipeline: stages (e.g. screen → interview → offer), automated notifications to candidates, and assignments to your recruiting team. Go to <strong>Workflows</strong> to create or edit a workflow and attach it to a role so new applications follow that pipeline.</p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value='item-4'>
                                                <AccordionTrigger>Can I edit or close a role after publishing?</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className='space-y-3 text-muted-foreground'>
                                                        <p>Yes. Open the role from <strong>Posts</strong>, edit the details, and save. To stop receiving applications, close or archive the role. Existing applications stay in <strong>Applications</strong> for your pipeline.</p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value='item-5'>
                                                <AccordionTrigger>How do I reset my recruiter account password?</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className='space-y-3 text-muted-foreground'>
                                                        <p>
                                                            Self-serve password reset isn&apos;t available yet. Use the contact form on this page and choose an appropriate topic so we can verify your account and help you set a new password.
                                                        </p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value='item-6'>
                                                <AccordionTrigger>Where can I manage billing and subscription for my team?</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className='space-y-3 text-muted-foreground'>
                                                        <p>Go to <strong>Billing</strong> in the app to view your plan, update payment method, or change subscription. For invoicing or plan questions, use the contact form and choose “Billing & subscription”.</p>
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

            </div>
        </NavbarLayout>
    );
}
