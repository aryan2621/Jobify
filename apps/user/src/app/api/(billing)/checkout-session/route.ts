import { USER_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { SubscriptionType, subscriptionPrices, yearlySubscriptionPrices } from '@jobify/domain/subscription';
function isValidPlan(plan: string): plan is SubscriptionType {
    return Object.values(SubscriptionType).includes(plan as SubscriptionType);
}
export async function POST(request: NextRequest) {
    const token = request.cookies.get(USER_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new Error('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!) as {
            id: string;
            email: string;
        };
        const body = await request.json();
        const { plan, isYearly } = body;
        if (!isValidPlan(plan)) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }
        if (plan === SubscriptionType.ENTERPRISE) {
            return NextResponse.json({ error: 'Enterprise plan requires contact' }, { status: 400 });
        }
        const price = isYearly ? yearlySubscriptionPrices[plan] : subscriptionPrices[plan];
        if (typeof price !== 'number' || price <= 0) {
            return NextResponse.json({ error: 'Invalid price for plan' }, { status: 400 });
        }
        const planName = plan.charAt(0).toUpperCase() + plan.slice(1);
        const description = `${planName} Plan - ${isYearly ? 'Yearly' : 'Monthly'} Subscription`;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});
        const checkoutSession: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency: 'inr',
                        unit_amount: Math.round(price * 100),
                        product_data: {
                            name: planName,
                            description,
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
                isYearly: String(isYearly),
                price: String(price),
            },
        });
        return NextResponse.json({ sessionId: checkoutSession.id, ok: true });
    }
    catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
