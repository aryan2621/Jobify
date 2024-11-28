import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

export async function POST(request: NextRequest) {
    const token = request.cookies.get('token');
    try {
        if (!token) {
            throw new Error('You are not authorized to perform this action');
        }

        const user = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string; email: string };
        const { image, name, price, description, quantity } = await request.json();

        const checkoutSession: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    quantity: quantity,
                    price_data: {
                        currency: 'usd',
                        unit_amount: price * 100,
                        product_data: {
                            name: name,
                            description: description,
                            images: [image],
                        },
                    },
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing`,
            metadata: {
                userId: user.id,
                image,
                name,
                price,
                description,
                quantity,
            },
        });

        return NextResponse.json({ sessionId: checkoutSession.id, ok: true });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
