import { ADMIN_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { NextRequest, NextResponse } from 'next/server';
import { fetchJobsByUserId } from '@jobify/appwrite-server/collections/job-collection';
import { isRecognisedError, UnauthorizedError } from '@jobify/domain/error';
import { toPublicJob } from '@jobify/domain/api-serializers';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
    const token = req.cookies.get(ADMIN_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const userId = (user as { id: string }).id;
        const jobs = await fetchJobsByUserId(userId);
        return NextResponse.json(
            jobs.map((doc) => toPublicJob(doc as unknown as Record<string, unknown>)),
            { status: 200 }
        );
    } catch (error) {
        const err = error as any;
        console.log('Error while fetching jobs', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: err.message }, { status: err.statusCode });
        }
        return NextResponse.json({ message: 'Error while fetching jobs' }, { status: 500 });
    }
}
