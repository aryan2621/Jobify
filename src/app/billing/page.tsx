'use client';

import NavbarLayout from '@/layouts/navbar';
import { loadStripe } from '@stripe/stripe-js';
import { convertToSubcurrency } from '@/lib/utils';
import { subscriptionPrices, SubscriptionType, yearlySubscriptionPrices } from '@/model/subscription';
import { useState } from 'react';
import ky from 'ky';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
const pricingPlans: {
    name: string;
    monthlyPrice: string;
    yearlyPrice: string;
    description: string;
    features: string[];
}[] = [
    {
        name: SubscriptionType.BASIC,
        monthlyPrice: `${convertToSubcurrency(subscriptionPrices[SubscriptionType.BASIC])}`,
        yearlyPrice: `${convertToSubcurrency(yearlySubscriptionPrices[SubscriptionType.BASIC])}`,
        description: 'For starters and beginners',
        features: ['30 Job postings per month', 'Notifications Node', 'Limited AI support'],
    },
    {
        name: SubscriptionType.PRO,
        monthlyPrice: `${convertToSubcurrency(subscriptionPrices[SubscriptionType.PRO])}`,
        yearlyPrice: `${convertToSubcurrency(yearlySubscriptionPrices[SubscriptionType.PRO])}`,
        description: 'For hiring managers and professionals',
        features: [
            '200 Job postings per month',
            'Access of each Node',
            'Multiple AI Model supports',
            'Priority email and chat support',
            'Acess of Assessment section',
        ],
    },
    {
        name: SubscriptionType.ENTERPRISE,
        monthlyPrice: 'Custom',
        yearlyPrice: 'Custom',
        description: 'For large teams and organizations',
        features: [
            'Unlimited Job postings per month',
            'Unlimited workflow Node and Executions',
            'Assesment and Resource sections',
            'Priority email and chat support',
        ],
    },
];

const Pricing = () => {
    const [isYearly, setIsYearly] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscription = async (plan: { name: string; monthlyPrice: string; yearlyPrice: string; description: string; features: string[] }) => {
        const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
        if (plan.name === SubscriptionType.ENTERPRISE) {
            window.location.href = '/contact';
            return;
        }
        try {
            setIsLoading(true);
            const stripe = await stripePromise;
            const response = await ky.post('/api/checkout-session', {
                json: {
                    image: 'https://www-animeherald-com.exactdn.com/wp-content/uploads/2016/06/KochiKame-Header-001-20160616.jpg?strip=all&lossy=1&ssl=1',
                    name: plan.name,
                    price: price,
                    description: plan.description,
                    quantity: 1,
                },
            });
            const { sessionId } = (await response.json()) as { sessionId: string };
            stripe?.redirectToCheckout({ sessionId });
        } catch (error) {
            console.log('Error while checkout sunscription', error);
            toast.error('Error while checkout sunscription');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className='mb-8'>
            <CardHeader>
                <div className='flex items-center justify-center space-x-2 mt-4'>
                    <span className={!isYearly ? 'font-bold' : ''}>Monthly</span>
                    <Switch checked={isYearly} onCheckedChange={setIsYearly} />
                    <span className={isYearly ? 'font-bold' : ''}>Yearly</span>
                    {isYearly && <span className='text-sm text-primary ml-2'>(Save 17%)</span>}
                </div>
            </CardHeader>
            <CardContent>
                <div className='grid md:grid-cols-3 gap-8'>
                    {pricingPlans.map((plan, index) => (
                        <Card key={index} className={index === 1 ? 'border-primary' : ''}>
                            <CardHeader>
                                <CardTitle className='text-2xl'>{plan.name.toUpperCase()}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className='text-4xl font-bold mb-4'>
                                    {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                                    {plan.name !== SubscriptionType.ENTERPRISE && (
                                        <span className='text-lg font-normal'>{isYearly ? ' /year' : ' /month'}</span>
                                    )}
                                </p>
                                <ul className='space-y-2'>
                                    {plan.features.map((feature, fIndex) => (
                                        <li key={fIndex} className='flex items-center'>
                                            <Check className='mr-2 h-4 w-4 text-primary' />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className='w-full' onClick={() => handleSubscription(plan)} disabled={isLoading}>
                                    {index === 2 ? 'Contact Sales' : 'Choose Plan'}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default function Component() {
    return (
        <NavbarLayout>
            <Pricing />
        </NavbarLayout>
    );
}
