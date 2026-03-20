'use client';

import NavbarLayout from '@/layouts/navbar';
import { loadStripe } from '@stripe/stripe-js';
import { subscriptionPrices, SubscriptionType, yearlySubscriptionPrices } from '@/model/subscription';
import { useState } from 'react';
import ky from 'ky';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check, X, MessageSquare, BarChart, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const basicFeatures = [
    { name: '30 job postings per month', included: true },
    { name: 'Basic candidate filtering', included: true },
    { name: 'Standard job visibility', included: true },
    { name: 'Email notifications', included: true },
    { name: 'Basic analytics', included: true },
    { name: 'Limited AI matching', included: true },
    { name: 'Standard support', included: true },
    { name: 'Assessment creation', included: false },
    { name: 'Custom branding', included: false },
    { name: 'Dedicated account manager', included: false },
];

const proFeatures = [
    { name: '200 job postings per month', included: true },
    { name: 'Advanced candidate filtering', included: true },
    { name: 'Enhanced job visibility', included: true },
    { name: 'Email and SMS notifications', included: true },
    { name: 'Advanced analytics', included: true },
    { name: 'Multiple AI workflows', included: true },
    { name: 'Priority support', included: true },
    { name: 'Assessment creation and tracking', included: true },
    { name: 'Custom branding', included: true },
    { name: 'Dedicated account manager', included: false },
];

const enterpriseFeatures = [
    { name: 'Unlimited job postings', included: true },
    { name: 'Enterprise candidate filtering', included: true },
    { name: 'Premium visibility', included: true },
    { name: 'Full notification system', included: true },
    { name: 'Custom analytics and reporting', included: true },
    { name: 'Unlimited AI workflows', included: true },
    { name: '24/7 dedicated support', included: true },
    { name: 'Advanced assessments', included: true },
    { name: 'Custom branding and white-labeling', included: true },
    { name: 'Dedicated account manager', included: true },
];

const faqs = [
    {
        question: 'Can I change plans later?',
        answer: 'Yes. You can upgrade or downgrade anytime. Changes are prorated and apply from the next billing cycle.',
    },
    {
        question: 'Is there a free trial?',
        answer: 'We offer a 14-day free trial on Basic and Pro. No card required to start.',
    },
    {
        question: 'How does billing work?',
        answer: 'You are billed monthly or annually based on your choice. You can turn off auto-renewal anytime.',
    },
    {
        question: 'What payment methods do you accept?',
        answer: 'We accept major credit and debit cards (Visa, MasterCard, RuPay) and UPI.',
    },
    {
        question: 'Refund policy?',
        answer: 'We offer a 30-day money-back guarantee if you are not satisfied.',
    },
];

const formatRupee = (amount: number) => (amount === 0 ? '' : `₹${amount.toLocaleString('en-IN')}`);

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
            setIsLoading(true);
            setSelectedPlan(plan);

            const price = isYearly ? yearlySubscriptionPrices[plan] : subscriptionPrices[plan];
            const planName = plan.charAt(0).toUpperCase() + plan.slice(1);
            const stripe = await stripePromise;
            const response = await ky.post('/api/checkout-session', {
                json: {
                    image: 'https://img.etimg.com/thumb/width-1600,height-900,imgsize-6770,resizemode-75,msid-116547755/news/international/us/solo-leveling-season-2-new-trailer-release-date-and-plot-revealed.jpg',
                    name: planName,
                    price,
                    description: `${planName} Plan - ${isYearly ? 'Yearly' : 'Monthly'} Subscription`,
                    quantity: 1,
                },
            });

            const { sessionId } = (await response.json()) as { sessionId: string };
            stripe?.redirectToCheckout({ sessionId });
        } catch (error) {
            console.error('Error while processing subscription:', error);
            toast({
                title: 'Subscription failed',
                description: 'Unable to process your subscription. Please try again.',
                variant: 'destructive',
            });
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
        return formatRupee(price);
    };

    return (
        <div className='container mx-auto px-4 py-12 max-w-6xl'>
            <div className='text-center mb-12'>
                <Badge variant='outline' className='mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/30'>
                    Pricing
                </Badge>
                <h1 className='text-3xl md:text-4xl font-bold mb-4'>Plans for Recruiters</h1>
                <p className='text-muted-foreground max-w-3xl mx-auto'>
                    Choose a plan that fits your hiring volume. All plans include core recruiting features; upgrade for more roles and AI workflows.
                </p>
            </div>

            <div className='flex flex-col items-center mb-12'>
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
                
                <Card className='relative flex flex-col border-border hover:border-primary/30 hover:shadow-md transition-all duration-300'>
                    <CardHeader className='pb-4'>
                        <CardTitle className='flex justify-between items-start'>
                            <div>
                                <div className='text-2xl font-bold'>BASIC</div>
                                <CardDescription className='mt-1.5'>For recruiters getting started</CardDescription>
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
                            <p className='text-sm'>For recruiters posting a few roles and managing candidates</p>
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

                {}
                <Card className='relative flex flex-col border-primary shadow-lg scale-[1.02] z-10'>
                    <Badge variant='default' className='absolute -top-4 left-0 right-0 mx-auto w-fit px-3 py-1  text-xs font-semibold rounded-full'>
                        MOST POPULAR
                    </Badge>
                    <CardHeader className='pb-4'>
                        <CardTitle className='flex justify-between items-start'>
                            <div>
                                <div className='text-2xl font-bold'>PRO</div>
                                <CardDescription className='mt-1.5'>For recruiters with active pipelines</CardDescription>
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
                            <p className='text-sm'>More postings, AI workflows, and analytics for serious recruiters</p>
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

                {}
                <Card className='relative flex flex-col border-border hover:border-primary/30 hover:shadow-md transition-all duration-300'>
                    <CardHeader className='pb-4'>
                        <CardTitle className='flex justify-between items-start'>
                            <div>
                                <div className='text-2xl font-bold'>ENTERPRISE</div>
                                <CardDescription className='mt-1.5'>For agencies and large teams</CardDescription>
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
                            <p className='text-sm'>Unlimited postings and dedicated support for recruitment agencies</p>
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

            {}
            <div className='mb-16'>
                <div className='text-center mb-8'>
                    <h2 className='text-2xl font-bold mb-2'>Frequently Asked Questions</h2>
                </div>
                <Accordion type='single' collapsible className='w-full max-w-2xl mx-auto'>
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`faq-${index}`}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent className='text-muted-foreground'>{faq.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            
            <div className='text-center'>
                <Card className='bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20'>
                    <CardContent className='py-10'>
                        <div className='max-w-2xl mx-auto'>
                            <h2 className='text-2xl font-bold mb-4'>Ready to scale your recruiting?</h2>
                            <p className='text-muted-foreground mb-6'>
                                Start your 14-day free trial — no card required. Need custom volume? Talk to us.
                            </p>
                            <div className='flex flex-col sm:flex-row justify-center gap-4'>
                                <Button size='lg' className='px-8'>
                                    Start Free Trial
                                </Button>
                                <Button variant='outline' size='lg' className='px-8' asChild>
                                    <Link href='/contact'>
                                        <MessageSquare className='mr-2 h-4 w-4' />
                                        Contact Sales
                                    </Link>
                                </Button>
                            </div>
                            <p className='text-xs text-muted-foreground mt-6 flex items-center justify-center'>
                                <Shield className='h-3 w-3 mr-1' />
                                Secure payments via Stripe
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
