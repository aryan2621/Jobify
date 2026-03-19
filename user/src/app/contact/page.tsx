'use client';
import { Suspense, JSX, SVGProps, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Phone, MapPin, MessageCircle, Clock, HelpCircle, CheckCircle, Briefcase, FileText, Send, Globe, MailQuestion, Loader2, } from 'lucide-react';
import NavbarLayout from '@/layouts/navbar';
import Link from 'next/link';
import { userStore } from '@/store';
function ContactPageContent() {
    const searchParams = useSearchParams();
    const user = userStore((state) => state.user);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        inquiryType: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                name: [user.firstName, user.lastName].filter(Boolean).join(' ').trim(),
                email: user.email || '',
            }));
        }
        else {
            setFormData((prev) => ({ ...prev, name: '', email: '' }));
        }
    }, [user]);
    useEffect(() => {
        const inquiryType = searchParams.get('inquiryType');
        const message = searchParams.get('message');
        if (inquiryType || message) {
            setFormData((prev) => ({
                ...prev,
                ...(inquiryType && { inquiryType }),
                ...(message && { message }),
            }));
        }
    }, [searchParams]);
    const handleSubmit = async (e: {
        preventDefault: () => void;
    }) => {
        e.preventDefault();
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setIsSubmitted(true);
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData((prev) => ({
                inquiryType: '',
                message: '',
                name: user ? [user.firstName, user.lastName].filter(Boolean).join(' ').trim() : '',
                email: user?.email ?? '',
            }));
        }, 3000);
    };
    const handleChange = (e: {
        target: {
            id: any;
            value: any;
        };
    }) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };
    return (<NavbarLayout>
            <div className='container px-4 py-8 mx-auto max-w-6xl'>
                <div className='text-center mb-10'>
                    <h1 className='text-3xl font-bold tracking-tight mb-2'>Contact & Support</h1>
                    <p className='text-muted-foreground max-w-2xl mx-auto'>
                        Have questions about finding jobs or managing your applications? We&apos;re here to help you get the most out of your job search.
                    </p>
                </div>

                <Tabs defaultValue='contact'>
                    <div className='flex justify-center mb-8'>
                        <TabsList className='grid w-full max-w-md grid-cols-2'>
                            <TabsTrigger value='contact' className='flex items-center gap-2'>
                                <MessageCircle className='h-4 w-4'/>
                                Contact Us
                            </TabsTrigger>
                            <TabsTrigger value='faq' className='flex items-center gap-2'>
                                <HelpCircle className='h-4 w-4'/>
                                FAQs
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value='contact' className='space-y-8'>
                        <div className='grid gap-8 md:grid-cols-3'>
                            
                            <div className='md:col-span-1 space-y-6'>
                                <Card className='overflow-hidden'>
                                    <div className='bg-primary text-primary-foreground p-6'>
                                        <h3 className='text-xl font-semibold mb-1'>Contact Information</h3>
                                        <p className='text-primary-foreground/80 text-sm'>Reach out to our support team through multiple channels</p>
                                    </div>
                                    <CardContent className='pt-6'>
                                        <div className='space-y-4'>
                                            <div className='flex items-start space-x-3'>
                                                <Mail className='h-5 w-5 text-primary mt-0.5'/>
                                                <div>
                                                    <p className='font-medium'>Email Us</p>
                                                    <a href='mailto:support@jobconnect.com' className='text-sm text-primary hover:underline'>
                                                        support@jobconnect.com
                                                    </a>
                                                </div>
                                            </div>

                                            <div className='flex items-start space-x-3'>
                                                <Phone className='h-5 w-5 text-primary mt-0.5'/>
                                                <div>
                                                    <p className='font-medium'>Call Us</p>
                                                    <a href='tel:+15551234567' className='text-sm text-muted-foreground'>
                                                        +1 (555) 123-4567
                                                    </a>
                                                </div>
                                            </div>

                                            <div className='flex items-start space-x-3'>
                                                <MapPin className='h-5 w-5 text-primary mt-0.5'/>
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
                                                <Clock className='h-5 w-5 text-primary mt-0.5'/>
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
                                </Card>
                            </div>

                            
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
                                        {isSubmitted ? (<div className='flex flex-col items-center justify-center py-10 text-center'>
                                                <div className='h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4'>
                                                    <CheckCircle className='h-6 w-6 text-green-600'/>
                                                </div>
                                                <h3 className='text-xl font-semibold mb-2'>Message Sent Successfully!</h3>
                                                <p className='text-muted-foreground max-w-md'>
                                                    We&apos;ve received your message and will respond to you shortly.
                                                </p>
                                            </div>) : (<form onSubmit={handleSubmit} className='space-y-5'>
                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                                    <div className='space-y-2'>
                                                        <Label htmlFor='name'>Full Name</Label>
                                                        <Input id='name' placeholder='Enter your name' required value={formData.name} onChange={handleChange} disabled={!!user} className={user ? 'bg-muted' : undefined}/>
                                                    </div>

                                                    <div className='space-y-2'>
                                                        <Label htmlFor='email'>Email Address</Label>
                                                        <Input id='email' type='email' placeholder='you@example.com' required value={formData.email} onChange={handleChange} disabled={!!user} className={user ? 'bg-muted' : undefined}/>
                                                    </div>
                                                </div>

                                                <div className='space-y-2'>
                                                    <Label htmlFor='inquiryType'>Inquiry Type</Label>
                                                    <Select value={formData.inquiryType} onValueChange={(value) => setFormData({ ...formData, inquiryType: value })}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select inquiry type'/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value='general'>General question</SelectItem>
                                                            <SelectItem value='account'>Account or profile</SelectItem>
                                                            <SelectItem value='applications'>Applications or jobs</SelectItem>
                                                            <SelectItem value='technical'>Technical issue</SelectItem>
                                                            <SelectItem value='feedback'>Feedback</SelectItem>
                                                            <SelectItem value='other'>Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className='space-y-2'>
                                                    <Label htmlFor='message'>Message</Label>
                                                    <Textarea id='message' placeholder='Please describe your inquiry in detail...' rows={5} required value={formData.message} onChange={handleChange}/>
                                                </div>

                                                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
                                                    <p className='text-xs text-muted-foreground'>
                                                        By submitting, you agree to our terms and privacy practices.
                                                    </p>
                                                    <Button type='submit' disabled={isSubmitting} className='w-full sm:w-auto'>
                                                        {isSubmitting ? (<>
                                                                <Loader2 className='mr-2 h-4 w-4 animate-spin'/>
                                                                Sending...
                                                            </>) : (<>
                                                                <Send className='mr-2 h-4 w-4'/>
                                                                Send Message
                                                            </>)}
                                                    </Button>
                                                </div>
                                            </form>)}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                    </TabsContent>

                    <TabsContent value='faq'>
                        <div className='grid gap-8 md:grid-cols-3'>
                            
                            <div className='md:col-span-1'>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className='text-lg'>FAQ Categories</CardTitle>
                                    </CardHeader>
                                    <CardContent className='px-2'>
                                        <div className='space-y-1'>
                                            {[
            { name: 'General', icon: HelpCircle },
            { name: 'Account & profile', icon: UserAccount },
            { name: 'Applications', icon: FileText },
            { name: 'Finding jobs', icon: Briefcase },
            { name: 'Technical help', icon: Globe },
        ].map((category, index) => (<Button key={index} variant='ghost' className='w-full justify-start'>
                                                    <category.icon className='mr-2 h-4 w-4'/>
                                                    {category.name}
                                                </Button>))}
                                        </div>
                                    </CardContent>
                                    <CardFooter className='bg-muted/50'>
                                        <div className='flex items-center text-sm text-muted-foreground'>
                                            <MailQuestion className='mr-2 h-4 w-4'/>
                                            Can&apos;t find an answer? Use the Contact Us tab to send a message.
                                        </div>
                                    </CardFooter>
                                </Card>
                            </div>

                            
                            <div className='md:col-span-2'>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Frequently Asked Questions</CardTitle>
                                        <CardDescription>Answers to common questions for job seekers.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Accordion type='single' collapsible className='w-full'>
                                            <AccordionItem value='item-1'>
                                                <AccordionTrigger>How do I create an account?</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className='space-y-3 text-muted-foreground'>
                                                        <p>To sign up as a job seeker:</p>
                                                        <ol className='list-decimal list-inside space-y-1 pl-2'>
                                                            <li>Click &quot;Sign Up&quot; in the top right corner</li>
                                                            <li>Enter your name, email, and password</li>
                                                            <li>Accept the Terms of Service and Privacy Policy</li>
                                                            <li>Click &quot;Create Account&quot;</li>
                                                            <li>Verify your email using the link we send you</li>
                                                        </ol>
                                                        <p>After that, you can log in, complete your profile, and start applying to jobs.</p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value='item-2'>
                                                <AccordionTrigger>How do I search and filter jobs?</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className='space-y-3 text-muted-foreground'>
                                                        <p>From the job listings page you can:</p>
                                                        <ol className='list-decimal list-inside space-y-1 pl-2'>
                                                            <li>Use the search bar to find jobs by title, company, or keywords</li>
                                                            <li>Filter by location, job type, or other criteria</li>
                                                            <li>Open any listing to see full details and requirements</li>
                                                            <li>Click &quot;Apply Now&quot; when you find a role you want</li>
                                                        </ol>
                                                        <p>You can also check &quot;My Applications&quot; in your profile to see all applications and their status.</p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value='item-3'>
                                                <AccordionTrigger>How do I apply for a job?</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className='space-y-3 text-muted-foreground'>
                                                        <p>To apply for a job:</p>
                                                        <ol className='list-decimal list-inside space-y-1 pl-2'>
                                                            <li>Open a job you&apos;re interested in from the listings</li>
                                                            <li>Read the job details and application instructions</li>
                                                            <li>Click &quot;Apply Now&quot;</li>
                                                            <li>Upload your resume and add any required info (e.g. cover letter)</li>
                                                            <li>Submit your application</li>
                                                        </ol>
                                                        <p>
                                                            You can track the status of your applications under &quot;My Applications&quot; in your profile.
                                                        </p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value='item-4'>
                                                <AccordionTrigger>Can I edit my job application after submitting?</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className='space-y-3 text-muted-foreground'>
                                                        <p>
                                                            After you submit, you usually can&apos;t edit the application. You can:
                                                        </p>
                                                        <ul className='list-disc list-inside space-y-1 pl-2'>
                                                            <li>Withdraw your application and submit a new one if the job is still open</li>
                                                            <li>Contact support if you need to correct something urgent</li>
                                                        </ul>
                                                        <p>
                                                            We recommend double-checking your details and attachments before you submit.
                                                        </p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value='item-5'>
                                                <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className='space-y-3 text-muted-foreground'>
                                                        <p>To reset your password:</p>
                                                        <ol className='list-decimal list-inside space-y-1 pl-2'>
                                                            <li>Go to the login page and click &quot;Forgot Password?&quot;</li>
                                                            <li>Enter the email address for your account</li>
                                                            <li>Click to send the reset link</li>
                                                            <li>Open the email and use the link to set a new password</li>
                                                        </ol>
                                                        <p>The reset link expires after 24 hours for security.</p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value='item-6'>
                                                <AccordionTrigger>What can I do for free as a job seeker?</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className='space-y-3 text-muted-foreground'>
                                                        <p>As a job seeker you can:</p>
                                                        <ul className='list-disc list-inside space-y-1 pl-2'>
                                                            <li>Create an account and build your profile</li>
                                                            <li>Browse and search job listings</li>
                                                            <li>Apply to jobs and track your applications</li>
                                                            <li>View application status and updates</li>
                                                        </ul>
                                                        <p>
                                                            For more on plans and features, see our{' '}
                                                            <Link href='/billing' className='text-primary hover:underline'>
                                                                Billing
                                                            </Link>{' '}
                                                            page.
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
            </div>
        </NavbarLayout>);
}
export default function ContactPage() {
    return (<Suspense fallback={<NavbarLayout>
                <div className='container px-4 py-8 mx-auto max-w-6xl flex justify-center'>
                    <Loader2 className='h-8 w-8 animate-spin text-primary'/>
                </div>
            </NavbarLayout>}>
            <ContactPageContent />
        </Suspense>);
}
function UserAccount(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
    return (<svg {...props} xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <circle cx='12' cy='8' r='5'/>
            <path d='M20 21a8 8 0 1 0-16 0'/>
        </svg>);
}
