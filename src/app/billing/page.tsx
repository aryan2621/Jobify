'use client';

import NavbarLayout from '@/layouts/navbar';
import { loadStripe } from '@stripe/stripe-js';
import { convertToSubcurrency } from '@/lib/utils';
import { subscriptionPrices, SubscriptionType, yearlySubscriptionPrices } from '@/model/subscription';
import { useState } from 'react';
import ky from 'ky';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, HelpCircle, Briefcase, Users, MessageSquare, BarChart, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const basicFeatures = [
    { name: '30 Job postings per month', included: true },
    { name: 'Basic candidate filtering', included: true },
    { name: 'Standard job listing visibility', included: true },
    { name: 'Email notifications', included: true },
    { name: 'Basic analytics dashboard', included: true },
    { name: 'Limited AI matching support', included: true },
    { name: 'Standard customer support', included: true },
    { name: 'Assessment creation', included: false },
    { name: 'Custom branding options', included: false },
    { name: 'Dedicated account manager', included: false },
];

const proFeatures = [
    { name: '200 Job postings per month', included: true },
    { name: 'Advanced candidate filtering', included: true },
    { name: 'Enhanced job listing visibility', included: true },
    { name: 'Email and SMS notifications', included: true },
    { name: 'Advanced analytics dashboard', included: true },
    { name: 'Multiple AI model support', included: true },
    { name: 'Priority email and chat support', included: true },
    { name: 'Assessment creation and tracking', included: true },
    { name: 'Custom branding options', included: true },
    { name: 'Dedicated account manager', included: false },
];

const enterpriseFeatures = [
    { name: 'Unlimited job postings', included: true },
    { name: 'Enterprise-grade candidate filtering', included: true },
    { name: 'Premium job listing visibility', included: true },
    { name: 'Comprehensive notification system', included: true },
    { name: 'Custom analytics and reporting', included: true },
    { name: 'Unlimited AI workflow and executions', included: true },
    { name: 'Dedicated 24/7 support', included: true },
    { name: 'Advanced assessment tools', included: true },
    { name: 'Custom branding and white-labeling', included: true },
    { name: 'Dedicated account manager', included: true },
];

const faqs = [
    {
        question: 'Can I change plans later?',
        answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.',
    },
    {
        question: 'Is there a free trial available?',
        answer: 'We offer a 14-day free trial for our Basic and Pro plans. No credit card is required to start your trial.',
    },
    {
        question: 'How does billing work?',
        answer: "You'll be billed either monthly or annually depending on your selected billing cycle. All plans include automatic renewal, which you can disable at any time.",
    },
    {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, including Visa, MasterCard, American Express, as well as PayPal for supported countries.',
    },
    {
        question: "Can I get a refund if I'm not satisfied?",
        answer: "We offer a 30-day money-back guarantee if you're not completely satisfied with our service.",
    },
];

const PricingPage = () => {
    const [isYearly, setIsYearly] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [userType, setUserType] = useState<'employer' | 'recruiter'>('employer');

    const handleSubscription = async (plan: SubscriptionType) => {
        if (plan === SubscriptionType.ENTERPRISE) {
            window.location.href = '/contact';
            return;
        }

        try {
            setIsLoading(true);
            setSelectedPlan(plan);

            const price = isYearly ? yearlySubscriptionPrices[plan] : subscriptionPrices[plan];
            const planName = plan.charAt(0).toUpperCase() + plan.slice(1);
            const stripe = await stripePromise;
            const response = await ky.post('/api/checkout-session', {
                json: {
                    image: 'https://img.etimg.com/thumb/width-1600,height-900,imgsize-6770,resizemode-75,msid-116547755/news/international/us/solo-leveling-season-2-new-trailer-release-date-and-plot-revealed.jpg',
                    name: planName,
                    price: convertToSubcurrency(price),
                    description: `${planName} Plan - ${isYearly ? 'Yearly' : 'Monthly'} Subscription`,
                    quantity: 1,
                },
            });

            const { sessionId } = (await response.json()) as { sessionId: string };
            stripe?.redirectToCheckout({ sessionId });
        } catch (error) {
            console.error('Error while processing subscription:', error);
            toast.error('Unable to process your subscription. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderFeatureList = (features: { name: string; included: boolean }[]) => (
        <ul className='space-y-3'>
            {features.map((feature, index) => (
                <li key={index} className='flex items-start'>
                    {feature.included ? (
                        <Check className='mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5' />
                    ) : (
                        <X className='mr-2 h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5' />
                    )}
                    <span className={feature.included ? '' : 'text-muted-foreground'}>{feature.name}</span>
                </li>
            ))}
        </ul>
    );

    const priceByPlan = (plan: SubscriptionType) => {
        if (plan === SubscriptionType.ENTERPRISE) return 'Custom';
        const price = isYearly ? yearlySubscriptionPrices[plan] : subscriptionPrices[plan];
        return convertToSubcurrency(price);
    };

    return (
        <div className='container mx-auto px-4 py-12 max-w-6xl'>
            <div className='text-center mb-12'>
                <Badge variant='outline' className='mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/30'>
                    Pricing Plans
                </Badge>
                <h1 className='text-3xl md:text-4xl font-bold mb-4'>Choose the Right Plan for Your Business</h1>
                <p className='text-muted-foreground max-w-3xl mx-auto'>
                    Select a plan that best fits your recruitment needs. All plans include access to our core features, with premium options for
                    growing teams.
                </p>
            </div>

            <div className='flex flex-col items-center mb-12'>
                <Tabs defaultValue='employer' className='mb-8'>
                    <TabsList className='grid w-[400px] grid-cols-2'>
                        <TabsTrigger value='employer' onClick={() => setUserType('employer')} className='flex items-center justify-center gap-2'>
                            <Briefcase className='h-4 w-4' />
                            For Employers
                        </TabsTrigger>
                        <TabsTrigger value='recruiter' onClick={() => setUserType('recruiter')} className='flex items-center justify-center gap-2'>
                            <Users className='h-4 w-4' />
                            For Recruiters
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className='flex items-center justify-center space-x-3 mb-4'>
                    <span className={`text-sm ${!isYearly ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
                    <Switch checked={isYearly} onCheckedChange={setIsYearly} className='data-[state=checked]:bg-primary' />
                    <span className={`text-sm ${isYearly ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>Yearly</span>
                    {isYearly && (
                        <Badge variant='secondary' className='ml-1 bg-green-100 text-green-800 hover:bg-green-100'>
                            Save 17%
                        </Badge>
                    )}
                </div>
            </div>

            <div className='grid md:grid-cols-3 gap-6 mb-16'>
                {/* Basic Plan */}
                <Card className='relative flex flex-col border-border hover:border-primary/30 hover:shadow-md transition-all duration-300'>
                    <CardHeader className='pb-4'>
                        <CardTitle className='flex justify-between items-start'>
                            <div>
                                <div className='text-2xl font-bold'>BASIC</div>
                                <CardDescription className='mt-1.5'>For starters and beginners</CardDescription>
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
                                <Zap className='h-5 w-5 text-primary' />
                            </div>
                            <p className='text-sm'>Perfect for small businesses starting their hiring journey</p>
                        </div>

                        {renderFeatureList(basicFeatures)}
                    </CardContent>

                    <CardFooter className='pt-4 pb-6'>
                        <Button
                            className='w-full h-11'
                            onClick={() => handleSubscription(SubscriptionType.BASIC)}
                            disabled={isLoading && selectedPlan === SubscriptionType.BASIC}
                        >
                            {isLoading && selectedPlan === SubscriptionType.BASIC ? (
                                <span className='flex items-center'>
                                    <svg
                                        className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                                        xmlns='http://www.w3.org/2000/svg'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                    >
                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                        <path
                                            className='opacity-75'
                                            fill='currentColor'
                                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                        ></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                'Get Started'
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Pro Plan */}
                <Card className='relative flex flex-col border-primary shadow-lg scale-[1.02] z-10'>
                    <Badge variant='default' className='absolute -top-4 left-0 right-0 mx-auto w-fit px-3 py-1  text-xs font-semibold rounded-full'>
                        MOST POPULAR
                    </Badge>
                    <CardHeader className='pb-4'>
                        <CardTitle className='flex justify-between items-start'>
                            <div>
                                <div className='text-2xl font-bold'>PRO</div>
                                <CardDescription className='mt-1.5'>For hiring managers and professionals</CardDescription>
                            </div>
                            <Badge variant='default' className='bg-primary'>
                                RECOMMENDED
                            </Badge>
                        </CardTitle>
                        <div className='mt-4'>
                            <span className='text-4xl font-bold'>{priceByPlan(SubscriptionType.PRO)}</span>
                            <span className='text-muted-foreground ml-1'>/{isYearly ? 'year' : 'month'}</span>
                        </div>
                    </CardHeader>

                    <CardContent className='flex-grow'>
                        <div className='flex items-center mb-4 pb-4 border-b'>
                            <div className='p-2 rounded-full bg-primary/10 mr-2'>
                                <BarChart className='h-5 w-5 text-primary' />
                            </div>
                            <p className='text-sm'>Advanced features for growing teams and active hiring</p>
                        </div>

                        {renderFeatureList(proFeatures)}
                    </CardContent>

                    <CardFooter className='pt-4 pb-6'>
                        <Button
                            className='w-full h-11 bg-primary hover:bg-primary/90'
                            onClick={() => handleSubscription(SubscriptionType.PRO)}
                            disabled={isLoading && selectedPlan === SubscriptionType.PRO}
                        >
                            {isLoading && selectedPlan === SubscriptionType.PRO ? (
                                <span className='flex items-center'>
                                    <svg
                                        className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                                        xmlns='http://www.w3.org/2000/svg'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                    >
                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                        <path
                                            className='opacity-75'
                                            fill='currentColor'
                                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                        ></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                'Choose Pro'
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Enterprise Plan */}
                <Card className='relative flex flex-col border-border hover:border-primary/30 hover:shadow-md transition-all duration-300'>
                    <CardHeader className='pb-4'>
                        <CardTitle className='flex justify-between items-start'>
                            <div>
                                <div className='text-2xl font-bold'>ENTERPRISE</div>
                                <CardDescription className='mt-1.5'>For large teams and organizations</CardDescription>
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
                                <Shield className='h-5 w-5 text-primary' />
                            </div>
                            <p className='text-sm'>Tailored solutions for enterprise-level recruitment needs</p>
                        </div>

                        {renderFeatureList(enterpriseFeatures)}
                    </CardContent>

                    <CardFooter className='pt-4 pb-6'>
                        <Button
                            variant='outline'
                            className='w-full h-11 border-primary text-primary hover:bg-primary/5'
                            onClick={() => handleSubscription(SubscriptionType.ENTERPRISE)}
                            disabled={isLoading && selectedPlan === SubscriptionType.ENTERPRISE}
                        >
                            {isLoading && selectedPlan === SubscriptionType.ENTERPRISE ? (
                                <span className='flex items-center'>
                                    <svg
                                        className='animate-spin -ml-1 mr-2 h-4 w-4 text-primary'
                                        xmlns='http://www.w3.org/2000/svg'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                    >
                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                        <path
                                            className='opacity-75'
                                            fill='currentColor'
                                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                        ></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                'Contact Sales'
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Compare All Features */}
            <div className='mb-16'>
                <div className='text-center mb-8'>
                    <h2 className='text-2xl font-bold mb-2'>Compare All Features</h2>
                    <p className='text-muted-foreground'>Detailed breakdown of what&#39;s included in each plan</p>
                </div>

                <Card>
                    <CardContent className='p-6'>
                        <div className='w-full overflow-auto'>
                            <table className='w-full border-collapse'>
                                <thead>
                                    <tr className='border-b'>
                                        <th className='text-left py-4 px-4 font-medium text-muted-foreground'>Features</th>
                                        <th className='text-center py-4 px-4 font-medium'>Basic</th>
                                        <th className='text-center py-4 px-4 font-medium relative'>
                                            <div className='absolute -top-3 left-0 right-0 mx-auto w-fit'>
                                                <Badge variant='secondary' className='bg-primary/10 text-primary border-primary/20'>
                                                    POPULAR
                                                </Badge>
                                            </div>
                                            Pro
                                        </th>
                                        <th className='text-center py-4 px-4 font-medium'>Enterprise</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className='border-b'>
                                        <td className='py-3 px-4 text-muted-foreground'>Job postings per month</td>
                                        <td className='py-3 px-4 text-center'>30</td>
                                        <td className='py-3 px-4 text-center'>200</td>
                                        <td className='py-3 px-4 text-center'>Unlimited</td>
                                    </tr>
                                    <tr className='border-b'>
                                        <td className='py-3 px-4 text-muted-foreground'>Candidate filtering</td>
                                        <td className='py-3 px-4 text-center'>Basic</td>
                                        <td className='py-3 px-4 text-center'>Advanced</td>
                                        <td className='py-3 px-4 text-center'>Enterprise-grade</td>
                                    </tr>
                                    <tr className='border-b'>
                                        <td className='py-3 px-4 text-muted-foreground'>AI matching support</td>
                                        <td className='py-3 px-4 text-center'>Limited</td>
                                        <td className='py-3 px-4 text-center'>Multiple models</td>
                                        <td className='py-3 px-4 text-center'>Unlimited</td>
                                    </tr>
                                    <tr className='border-b'>
                                        <td className='py-3 px-4 text-muted-foreground'>Analytics dashboard</td>
                                        <td className='py-3 px-4 text-center'>Basic</td>
                                        <td className='py-3 px-4 text-center'>Advanced</td>
                                        <td className='py-3 px-4 text-center'>Custom</td>
                                    </tr>
                                    <tr className='border-b'>
                                        <td className='py-3 px-4 text-muted-foreground'>Assessment creation</td>
                                        <td className='py-3 px-4 text-center'>
                                            <X className='mx-auto h-5 w-5 text-muted-foreground' />
                                        </td>
                                        <td className='py-3 px-4 text-center'>
                                            <Check className='mx-auto h-5 w-5 text-green-500' />
                                        </td>
                                        <td className='py-3 px-4 text-center'>
                                            <Check className='mx-auto h-5 w-5 text-green-500' />
                                        </td>
                                    </tr>
                                    <tr className='border-b'>
                                        <td className='py-3 px-4 text-muted-foreground'>Notification system</td>
                                        <td className='py-3 px-4 text-center'>Email only</td>
                                        <td className='py-3 px-4 text-center'>Email & SMS</td>
                                        <td className='py-3 px-4 text-center'>Comprehensive</td>
                                    </tr>
                                    <tr className='border-b'>
                                        <td className='py-3 px-4 text-muted-foreground'>Customer support</td>
                                        <td className='py-3 px-4 text-center'>Standard</td>
                                        <td className='py-3 px-4 text-center'>Priority</td>
                                        <td className='py-3 px-4 text-center'>Dedicated 24/7</td>
                                    </tr>
                                    <tr className='border-b'>
                                        <td className='py-3 px-4 text-muted-foreground'>Branding options</td>
                                        <td className='py-3 px-4 text-center'>
                                            <X className='mx-auto h-5 w-5 text-muted-foreground' />
                                        </td>
                                        <td className='py-3 px-4 text-center'>Basic</td>
                                        <td className='py-3 px-4 text-center'>Custom & White-label</td>
                                    </tr>
                                    <tr>
                                        <td className='py-3 px-4 text-muted-foreground'>Dedicated account manager</td>
                                        <td className='py-3 px-4 text-center'>
                                            <X className='mx-auto h-5 w-5 text-muted-foreground' />
                                        </td>
                                        <td className='py-3 px-4 text-center'>
                                            <X className='mx-auto h-5 w-5 text-muted-foreground' />
                                        </td>
                                        <td className='py-3 px-4 text-center'>
                                            <Check className='mx-auto h-5 w-5 text-green-500' />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Value Proposition Section */}
            <div className='grid md:grid-cols-3 gap-8 mb-16'>
                <Card className='bg-muted/30 hover:shadow-md transition-all duration-300'>
                    <CardContent className='pt-6'>
                        <div className='flex flex-col items-center text-center'>
                            <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
                                <Zap className='h-6 w-6 text-primary' />
                            </div>
                            <h3 className='font-medium mb-2'>Save Time & Resources</h3>
                            <p className='text-sm text-muted-foreground'>
                                Our platform automates repetitive recruitment tasks, so you can focus on meaningful candidate interactions.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className='bg-muted/30 hover:shadow-md transition-all duration-300'>
                    <CardContent className='pt-6'>
                        <div className='flex flex-col items-center text-center'>
                            <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
                                <Users className='h-6 w-6 text-primary' />
                            </div>
                            <h3 className='font-medium mb-2'>Find Better Candidates</h3>
                            <p className='text-sm text-muted-foreground'>
                                Our AI-powered matching helps you identify the most qualified candidates for your open positions.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className='bg-muted/30 hover:shadow-md transition-all duration-300'>
                    <CardContent className='pt-6'>
                        <div className='flex flex-col items-center text-center'>
                            <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
                                <BarChart className='h-6 w-6 text-primary' />
                            </div>
                            <h3 className='font-medium mb-2'>Data-Driven Decisions</h3>
                            <p className='text-sm text-muted-foreground'>
                                Comprehensive analytics provide insights to optimize your hiring process and improve outcomes.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* FAQs */}
            <div className='mb-16'>
                <div className='text-center mb-8'>
                    <h2 className='text-2xl font-bold mb-2'>Frequently Asked Questions</h2>
                    <p className='text-muted-foreground'>Find answers to common questions about our pricing plans</p>
                </div>

                <div className='grid md:grid-cols-2 gap-6'>
                    {faqs.map((faq, index) => (
                        <Card key={index} className='hover:border-primary/30 transition-colors'>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-lg flex items-start'>
                                    <HelpCircle className='h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5' />
                                    <span>{faq.question}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-muted-foreground'>{faq.answer}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Call to Action */}
            <div className='text-center'>
                <Card className='bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20'>
                    <CardContent className='py-10'>
                        <div className='max-w-2xl mx-auto'>
                            <h2 className='text-2xl font-bold mb-4'>Ready to Transform Your Hiring Process?</h2>
                            <p className='text-muted-foreground mb-6'>
                                Join thousands of companies that have streamlined their recruitment with JobConnect. Start your 14-day free trial
                                today — no credit card required.
                            </p>
                            <div className='flex flex-col sm:flex-row justify-center gap-4'>
                                <Button size='lg' className='px-8'>
                                    Start Free Trial
                                </Button>
                                <Button variant='outline' size='lg' className='px-8' asChild>
                                    <Link href='/contact'>
                                        <MessageSquare className='mr-2 h-4 w-4' />
                                        Talk to Sales
                                    </Link>
                                </Button>
                            </div>
                            <p className='text-xs text-muted-foreground mt-6 flex items-center justify-center'>
                                <Shield className='h-3 w-3 mr-1' />
                                Secure payment processing via Stripe
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default function Component() {
    return (
        <NavbarLayout>
            <PricingPage />
        </NavbarLayout>
    );
}
