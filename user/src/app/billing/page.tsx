'use client';
import NavbarLayout from '@/layouts/navbar';
import { loadStripe } from '@stripe/stripe-js';
import { formatPriceINR } from '@/lib/utils';
import { subscriptionPrices, SubscriptionType, yearlySubscriptionPrices } from '@/model/subscription';
import { useState } from 'react';
import ky from 'ky';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Check, X, MessageSquare, BarChart, Shield, Zap, Users } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
const basicFeatures = [
    { name: 'Apply to 30 jobs per month', included: true },
    { name: 'Basic profile visibility to recruiters', included: true },
    { name: 'Application status tracking', included: true },
    { name: 'Email job alerts', included: true },
    { name: 'Resume upload & storage', included: true },
    { name: 'Saved jobs list', included: true },
    { name: 'Standard support', included: true },
    { name: 'Resume feedback', included: false },
    { name: 'Priority in recruiter search', included: false },
    { name: '1:1 career coaching', included: false },
];
const proFeatures = [
    { name: 'Apply to 200 jobs per month', included: true },
    { name: 'Enhanced profile visibility to recruiters', included: true },
    { name: 'Application analytics & insights', included: true },
    { name: 'Email and SMS job alerts', included: true },
    { name: 'Resume feedback & tips', included: true },
    { name: 'Priority in recruiter search', included: true },
    { name: 'AI resume tips & suggestions', included: true },
    { name: 'Priority support', included: true },
    { name: 'Advanced application tracking', included: true },
    { name: '1:1 career coaching', included: false },
];
const enterpriseFeatures = [
    { name: 'Unlimited job applications', included: true },
    { name: 'Top profile visibility to recruiters', included: true },
    { name: 'Full application analytics', included: true },
    { name: 'All notification channels', included: true },
    { name: 'Unlimited resume reviews & feedback', included: true },
    { name: 'Highest priority in recruiter search', included: true },
    { name: 'Dedicated career support', included: true },
    { name: '1:1 career coaching sessions', included: true },
    { name: 'Custom career roadmap', included: true },
    { name: 'Dedicated account manager', included: true },
];
const faqs = [
    {
        question: 'Can I change plans later?',
        answer: 'Yes. You can upgrade or downgrade anytime. Changes are prorated and apply from your next billing cycle.',
    },
    {
        question: 'Is there a free trial?',
        answer: 'We offer a 14-day free trial on Basic and Pro. No credit card required to start.',
    },
    {
        question: 'How does billing work?',
        answer: 'You’re billed monthly or yearly based on your choice. Plans renew automatically; you can cancel anytime.',
    },
    {
        question: 'What payment methods do you accept?',
        answer: 'We accept UPI, credit/debit cards, netbanking, and other payment methods via our payment provider.',
    },
    {
        question: "What if I'm not satisfied?",
        answer: 'We offer a 30-day money-back guarantee. If Jobify isn’t right for you, we’ll refund you.',
    },
];
const PricingPage = () => {
    const [isYearly, setIsYearly] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const handleSubscription = async (plan: SubscriptionType) => {
        if (plan === SubscriptionType.ENTERPRISE) {
            window.location.href = '/contact';
            return;
        }
        try {
            setSelectedPlan(plan);
            setIsLoading(true);
            const stripe = await stripePromise;
            const response = await ky.post('/api/checkout-session', {
                json: { plan, isYearly },
            });
            const { sessionId } = (await response.json()) as {
                sessionId: string;
            };
            stripe?.redirectToCheckout({ sessionId });
        }
        catch (error) {
            console.error('Error while processing subscription:', error);
            toast.error('Unable to process your subscription. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const renderFeatureList = (features: {
        name: string;
        included: boolean;
    }[]) => (<ul className='space-y-3'>
            {features.map((feature, index) => (<li key={index} className='flex items-start'>
                    {feature.included ? (<Check className='mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5'/>) : (<X className='mr-2 h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5'/>)}
                    <span className={feature.included ? '' : 'text-muted-foreground'}>{feature.name}</span>
                </li>))}
        </ul>);
    const priceByPlan = (plan: SubscriptionType) => {
        if (plan === SubscriptionType.ENTERPRISE)
            return 'Custom';
        const price = isYearly ? yearlySubscriptionPrices[plan] : subscriptionPrices[plan];
        return formatPriceINR(price);
    };
    return (<div className='container mx-auto px-4 py-12 max-w-6xl'>
            <div className='text-center mb-12'>
                <Badge variant='outline' className='mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/30'>
                    Pricing Plans
                </Badge>
                <h1 className='text-3xl md:text-4xl font-bold mb-4'>Choose the Right Plan for Your Job Search</h1>
                <p className='text-muted-foreground max-w-3xl mx-auto'>
                    Get more visibility, track your applications, and land your next role. Pick a plan that fits how actively you’re job hunting.
                </p>
            </div>

            <div className='flex flex-col items-center mb-12'>
                <div className='flex items-center justify-center space-x-3 mb-4'>
                    <span className={`text-sm ${!isYearly ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
                    <Switch checked={isYearly} onCheckedChange={setIsYearly} className='data-[state=checked]:bg-primary'/>
                    <span className={`text-sm ${isYearly ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>Yearly</span>
                    {isYearly && (<Badge variant='secondary' className='ml-1 bg-green-100 text-green-800 hover:bg-green-100'>
                            Save 17%
                        </Badge>)}
                </div>
            </div>

            <div id='pricing-plans' className='grid md:grid-cols-3 gap-6 mb-16'>
                
                <Card className='relative flex flex-col border-border hover:border-primary/30 hover:shadow-md transition-all duration-300'>
                    <CardHeader className='pb-4'>
                        <CardTitle className='flex justify-between items-start'>
                            <div>
                                <div className='text-2xl font-bold'>BASIC</div>
                                <CardDescription className='mt-1.5'>For casual job seekers</CardDescription>
                            </div>
                            <Badge variant='outline' className='bg-muted/80'>
                                STARTER
                            </Badge>
                        </CardTitle>
                        <div className='mt-4'>
                            <span className='text-4xl font-bold'>{priceByPlan(SubscriptionType.BASIC)}</span>
                            <span className='text-muted-foreground ml-1'>/{isYearly ? 'year' : 'month'}</span>
                        </div>
                    </CardHeader>

                    <CardContent className='flex-grow'>
                        <div className='flex items-center mb-4 pb-4 border-b'>
                            <div className='p-2 rounded-full bg-primary/10 mr-2'>
                                <Zap className='h-5 w-5 text-primary'/>
                            </div>
                            <p className='text-sm'>Great when you’re exploring and applying to a few roles</p>
                        </div>

                        {renderFeatureList(basicFeatures)}
                    </CardContent>

                    <CardFooter className='pt-4 pb-6'>
                        <Button className='w-full h-11' onClick={() => handleSubscription(SubscriptionType.BASIC)} disabled={isLoading && selectedPlan === SubscriptionType.BASIC}>
                            {isLoading && selectedPlan === SubscriptionType.BASIC ? (<span className='flex items-center'>
                                    <svg className='animate-spin -ml-1 mr-2 h-4 w-4 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                    </svg>
                                    Processing...
                                </span>) : ('Get Started')}
                        </Button>
                    </CardFooter>
                </Card>

                
                <Card className='relative flex flex-col border-primary shadow-lg scale-[1.02] z-10'>
                    <CardHeader className='pb-4'>
                        <CardTitle className='flex justify-between items-start'>
                            <div>
                                <div className='text-2xl font-bold'>PRO</div>
                                <CardDescription className='mt-1.5'>For serious job seekers</CardDescription>
                            </div>
                        </CardTitle>
                        <div className='mt-4'>
                            <span className='text-4xl font-bold'>{priceByPlan(SubscriptionType.PRO)}</span>
                            <span className='text-muted-foreground ml-1'>/{isYearly ? 'year' : 'month'}</span>
                        </div>
                    </CardHeader>

                    <CardContent className='flex-grow'>
                        <div className='flex items-center mb-4 pb-4 border-b'>
                            <div className='p-2 rounded-full bg-primary/10 mr-2'>
                                <BarChart className='h-5 w-5 text-primary'/>
                            </div>
                            <p className='text-sm'>Best when you’re applying often and want to stand out</p>
                        </div>

                        {renderFeatureList(proFeatures)}
                    </CardContent>

                    <CardFooter className='pt-4 pb-6'>
                        <Button className='w-full h-11 bg-primary hover:bg-primary/90' onClick={() => handleSubscription(SubscriptionType.PRO)} disabled={isLoading && selectedPlan === SubscriptionType.PRO}>
                            {isLoading && selectedPlan === SubscriptionType.PRO ? (<span className='flex items-center'>
                                    <svg className='animate-spin -ml-1 mr-2 h-4 w-4 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                    </svg>
                                    Processing...
                                </span>) : ('Choose Pro')}
                        </Button>
                    </CardFooter>
                </Card>

                
                <Card className='relative flex flex-col border-border hover:border-primary/30 hover:shadow-md transition-all duration-300'>
                    <CardHeader className='pb-4'>
                        <CardTitle className='flex justify-between items-start'>
                            <div>
                                <div className='text-2xl font-bold'>ENTERPRISE</div>
                                <CardDescription className='mt-1.5'>For maximum support and visibility</CardDescription>
                            </div>
                            <Badge variant='outline' className='bg-muted/80'>
                                CUSTOM
                            </Badge>
                        </CardTitle>
                        <div className='mt-4'>
                            <span className='text-4xl font-bold'>Custom</span>
                        </div>
                    </CardHeader>

                    <CardContent className='flex-grow'>
                        <div className='flex items-center mb-4 pb-4 border-b'>
                            <div className='p-2 rounded-full bg-primary/10 mr-2'>
                                <Shield className='h-5 w-5 text-primary'/>
                            </div>
                            <p className='text-sm'>Full support and visibility for your career move</p>
                        </div>

                        {renderFeatureList(enterpriseFeatures)}
                    </CardContent>

                    <CardFooter className='pt-4 pb-6'>
                        <Button variant='outline' className='w-full h-11 border-primary text-primary hover:bg-primary/5' onClick={() => handleSubscription(SubscriptionType.ENTERPRISE)}>
                            Contact Sales
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            
            <div className='mb-16'>
                <div className='text-center mb-8'>
                    <h2 className='text-2xl font-bold mb-2'>Compare All Features</h2>
                    <p className='text-muted-foreground'>What you get in each plan</p>
                </div>

                <Card>
                    <CardContent className='p-6'>
                        <div className='w-full overflow-auto'>
                            <table className='w-full border-collapse'>
                                <thead>
                                    <tr className='border-b'>
                                        <th className='text-left py-4 px-4 font-medium text-muted-foreground'>Features</th>
                                        <th className='text-center py-4 px-4 font-medium'>Basic</th>
                                        <th className='text-center py-4 px-4 font-medium'>Pro</th>
                                        <th className='text-center py-4 px-4 font-medium'>Enterprise</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className='border-b'>
                                        <td className='py-3 px-4 text-muted-foreground'>Job applications per month</td>
                                        <td className='py-3 px-4 text-center'>30</td>
                                        <td className='py-3 px-4 text-center'>200</td>
                                        <td className='py-3 px-4 text-center'>Unlimited</td>
                                    </tr>
                                    <tr className='border-b'>
                                        <td className='py-3 px-4 text-muted-foreground'>Profile visibility to recruiters</td>
                                        <td className='py-3 px-4 text-center'>Basic</td>
                                        <td className='py-3 px-4 text-center'>Enhanced</td>
                                        <td className='py-3 px-4 text-center'>Top</td>
                                    </tr>
                                    <tr className='border-b'>
                                        <td className='py-3 px-4 text-muted-foreground'>Resume score & AI feedback</td>
                                        <td className='py-3 px-4 text-center'>
                                            <X className='mx-auto h-5 w-5 text-muted-foreground'/>
                                        </td>
                                        <td className='py-3 px-4 text-center'>
                                            <Check className='mx-auto h-5 w-5 text-green-500'/>
                                        </td>
                                        <td className='py-3 px-4 text-center'>
                                            <Check className='mx-auto h-5 w-5 text-green-500'/>
                                        </td>
                                    </tr>
                                    <tr className='border-b'>
                                        <td className='py-3 px-4 text-muted-foreground'>Application analytics</td>
                                        <td className='py-3 px-4 text-center'>Basic</td>
                                        <td className='py-3 px-4 text-center'>Advanced</td>
                                        <td className='py-3 px-4 text-center'>Full</td>
                                    </tr>
                                    <tr className='border-b'>
                                        <td className='py-3 px-4 text-muted-foreground'>Job alerts</td>
                                        <td className='py-3 px-4 text-center'>Email only</td>
                                        <td className='py-3 px-4 text-center'>Email & SMS</td>
                                        <td className='py-3 px-4 text-center'>All channels</td>
                                    </tr>
                                    <tr className='border-b'>
                                        <td className='py-3 px-4 text-muted-foreground'>Priority in recruiter search</td>
                                        <td className='py-3 px-4 text-center'>
                                            <X className='mx-auto h-5 w-5 text-muted-foreground'/>
                                        </td>
                                        <td className='py-3 px-4 text-center'>
                                            <Check className='mx-auto h-5 w-5 text-green-500'/>
                                        </td>
                                        <td className='py-3 px-4 text-center'>
                                            <Check className='mx-auto h-5 w-5 text-green-500'/>
                                        </td>
                                    </tr>
                                    <tr className='border-b'>
                                        <td className='py-3 px-4 text-muted-foreground'>Support</td>
                                        <td className='py-3 px-4 text-center'>Standard</td>
                                        <td className='py-3 px-4 text-center'>Priority</td>
                                        <td className='py-3 px-4 text-center'>Dedicated</td>
                                    </tr>
                                    <tr>
                                        <td className='py-3 px-4 text-muted-foreground'>1:1 career coaching</td>
                                        <td className='py-3 px-4 text-center'>
                                            <X className='mx-auto h-5 w-5 text-muted-foreground'/>
                                        </td>
                                        <td className='py-3 px-4 text-center'>
                                            <X className='mx-auto h-5 w-5 text-muted-foreground'/>
                                        </td>
                                        <td className='py-3 px-4 text-center'>
                                            <Check className='mx-auto h-5 w-5 text-green-500'/>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            
            <div className='grid md:grid-cols-3 gap-8 mb-16'>
                <Card className='bg-muted/30 hover:shadow-md transition-all duration-300'>
                    <CardContent className='pt-6'>
                        <div className='flex flex-col items-center text-center'>
                            <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
                                <Zap className='h-6 w-6 text-primary'/>
                            </div>
                            <h3 className='font-medium mb-2'>Get Noticed by Recruiters</h3>
                            <p className='text-sm text-muted-foreground'>
                                Higher visibility and priority placement help your profile surface when recruiters search for candidates.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className='bg-muted/30 hover:shadow-md transition-all duration-300'>
                    <CardContent className='pt-6'>
                        <div className='flex flex-col items-center text-center'>
                            <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
                                <Users className='h-6 w-6 text-primary'/>
                            </div>
                            <h3 className='font-medium mb-2'>Track Your Progress</h3>
                            <p className='text-sm text-muted-foreground'>
                                See how your applications are performing and get insights to improve your job search.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className='bg-muted/30 hover:shadow-md transition-all duration-300'>
                    <CardContent className='pt-6'>
                        <div className='flex flex-col items-center text-center'>
                            <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
                                <BarChart className='h-6 w-6 text-primary'/>
                            </div>
                            <h3 className='font-medium mb-2'>Land Interviews Faster</h3>
                            <p className='text-sm text-muted-foreground'>
                                Resume feedback and AI tips help you tailor applications and stand out to hiring managers.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            
            <div className='mb-16'>
                <div className='text-center mb-8'>
                    <h2 className='text-2xl font-bold mb-2'>Frequently Asked Questions</h2>
                    <p className='text-muted-foreground'>Common questions about plans and billing</p>
                </div>

                <Accordion type='single' collapsible className='w-full max-w-2xl mx-auto'>
                    {faqs.map((faq, index) => (<AccordionItem key={index} value={`faq-${index}`}>
                            <AccordionTrigger className='text-left'>{faq.question}</AccordionTrigger>
                            <AccordionContent>
                                <p className='text-muted-foreground'>{faq.answer}</p>
                            </AccordionContent>
                        </AccordionItem>))}
                </Accordion>
            </div>

            
            <div className='text-center'>
                <Card className='bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20'>
                    <CardContent className='py-10'>
                        <div className='max-w-2xl mx-auto'>
                            <h2 className='text-2xl font-bold mb-4'>Ready to Level Up Your Job Search?</h2>
                            <p className='text-muted-foreground mb-6'>
                                Get more visibility and better tools to land your next role. Start your 14-day free trial — no credit card
                                required.
                            </p>
                            <div className='flex flex-col sm:flex-row justify-center gap-4'>
                                <Button size='lg' className='px-8' asChild>
                                    <Link href='#pricing-plans'>Start Free Trial</Link>
                                </Button>
                                <Button variant='outline' size='lg' className='px-8' asChild>
                                    <Link href='/contact'>
                                        <MessageSquare className='mr-2 h-4 w-4'/>
                                        Contact Us
                                    </Link>
                                </Button>
                            </div>
                            <p className='text-xs text-muted-foreground mt-6 flex items-center justify-center'>
                                <Shield className='h-3 w-3 mr-1'/>
                                Secure payment processing via Stripe
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>);
};
export default function Component() {
    return (<NavbarLayout>
            <PricingPage />
        </NavbarLayout>);
}
