import { NextRequest } from 'next/server';
import { EmailService } from '@/appwrite/server/services/email-service';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            throw new Error('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const userId = (user as any).id;
        const { authCode } = await req.json();
        await EmailService.connectToGmail(authCode, userId);
        return NextResponse.json({ message: 'Gmail connected successfully' }, { status: 200 });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : 'Error while connecting to Gmail';
        const isInvalidClient =
            typeof error === 'object' &&
            error !== null &&
            'response' in error &&
            typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string' &&
            (error as { response: { data: { error: string } } }).response.data.error === 'invalid_client';

        if (isInvalidClient) {
            return NextResponse.json(
                {
                    message:
                        'Google rejected the OAuth client. Check that GOOGLE_CLIENT_SECRET in .env matches your Web application client in Google Cloud Console, and that the redirect URI is authorized.',
                },
                { status: 500 }
            );
        }
        console.error('Error while connecting to Gmail', error);
        return NextResponse.json({ message }, { status: 500 });
    }
}