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
        console.log('Error while connecting to gmail', error);
        return NextResponse.json({ message: 'Error while connecting to gmail' }, { status: 500 });
    }
}