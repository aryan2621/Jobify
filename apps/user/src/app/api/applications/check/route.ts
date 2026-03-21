import { USER_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { hasApplicationByUserAndJob } from '@jobify/appwrite-server/collections/application-collection';
import { isRecognisedError, UnauthorizedError } from '@jobify/domain/error';

export async function GET(req: NextRequest) {
    const token = req.cookies.get(USER_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const { id: userId } = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        const jobId = req.nextUrl.searchParams.get('jobId')?.trim();
        if (!jobId) {
            return NextResponse.json({ message: 'jobId is required' }, { status: 400 });
        }
        const applied = await hasApplicationByUserAndJob(userId, jobId);
        return NextResponse.json({ applied }, { status: 200 });
    } catch (error) {
        console.log('Error checking application', error);
        if (isRecognisedError(error)) {
            const err = error as { message?: string; statusCode?: number };
            return NextResponse.json({ message: err.message }, { status: err.statusCode ?? 401 });
        }
        return NextResponse.json({ message: 'Error checking application' }, { status: 500 });
    }
}
