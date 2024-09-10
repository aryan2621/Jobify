import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, Phone } from 'lucide-react';
import NavbarLayout from '@/layouts/navbar';

export default function Component() {
    return (
        <NavbarLayout>
            <div className='grid gap-8 md:grid-cols-2'>
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
                                    To create an account, click on the &quot; Sign Up &quot; button in the top right corner of the homepage. Fill in
                                    your details, including your name, email address, and password. Once completed, verify your email address to
                                    activate your account.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value='item-2'>
                                <AccordionTrigger>How can I post a job opening?</AccordionTrigger>
                                <AccordionContent>
                                    To post a job opening, log into your employer account and navigate to the &quot; Post a Job&quot; section. Fill in the job
                                    details, including title, description, requirements, and application instructions. Review your posting and click
                                    &quot;Submit&quot; to publish it.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value='item-3'>
                                <AccordionTrigger>How do I apply for a job?</AccordionTrigger>
                                <AccordionContent>
                                    To apply for a job, browse the job listings and click on the job you&apos;re interested in. Review the job details and
                                    requirements, then click the &quot;Apply Now&quot; button. Follow the application instructions provided by the employer,
                                    which may include submitting your resume, cover letter, or filling out an application form.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value='item-4'>
                                <AccordionTrigger>Can I edit my job application after submitting?</AccordionTrigger>
                                <AccordionContent>
                                    Once you&apos;ve submitted an application, you typically cannot edit it directly. However, you can contact the employer
                                    or our support team to inquire about making changes or updates to your application. It&apos;s best to double-check all
                                    information before submitting to ensure accuracy.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Contact Us</CardTitle>
                        <CardDescription>Get in touch with our support team for further assistance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <div className='flex items-center space-x-2'>
                                <Mail className='h-5 w-5' />
                                <span>support@jobplatform.com</span>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Phone className='h-5 w-5' />
                                <span>+1 (555) 123-4567</span>
                            </div>
                            <form className='space-y-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='name'>Name</Label>
                                    <Input id='name' placeholder='Your name' required />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='email'>Email</Label>
                                    <Input id='email' type='email' placeholder='Your email' required />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='message'>Message</Label>
                                    <Textarea id='message' placeholder='How can we help you?' required />
                                </div>
                                <Button type='submit'>Send Message</Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </NavbarLayout>
    );
}
