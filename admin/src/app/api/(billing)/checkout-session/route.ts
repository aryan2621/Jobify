import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { SubscriptionType, subscriptionPrices, yearlySubscriptionPrices } from '@/model/subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

const CHECKOUT_IMAGE =
    'https://img.etimg.com/thumb/width-1600,height-900,imgsize-6770,resizemode-75,msid-116547755/news/international/us/solo-leveling-season-2-new-trailer-release-date-and-plot-revealed.jpg';

export async function POST(request: NextRequest) {
    const token = request.cookies.get('token');
    try {
        if (!token) {
            throw new Error('You are not authorized to perform this action');
        }

        const user = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        const body = (await request.json()) as { plan?: string; billing?: string };

        const plan = body.plan;
        const billing = body.billing === 'yearly' ? 'yearly' : 'monthly';

        if (plan !== SubscriptionType.BASIC && plan !== SubscriptionType.PRO) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        const priceRupee = billing === 'yearly' ? yearlySubscriptionPrices[plan] : subscriptionPrices[plan];
        const planName = plan.charAt(0).toUpperCase() + plan.slice(1);
        const description = `${planName} plan — ${billing === 'yearly' ? 'Yearly' : 'Monthly'}`;

        const checkoutSession: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency: 'inr',
                        unit_amount: Math.round(priceRupee * 100),
                        product_data: {
                            name: planName,
                            description,
                            images: [CHECKOUT_IMAGE],
                        },
                    },
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing`,
            metadata: {
                userId: user.id,
                plan,
                billing,
                priceRupee: String(priceRupee),
            },
        });

        return NextResponse.json({ sessionId: checkoutSession.id, ok: true });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
