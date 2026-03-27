import { ADMIN_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { fetchJobsByUserIdPaginated } from '@jobify/appwrite-server/collections/job-collection';
import { isRecognisedError, UnauthorizedError } from '@jobify/domain/error';
import { toPublicJob } from '@jobify/domain/api-serializers';

export async function GET(req: NextRequest) {
    const token = req.cookies.get(ADMIN_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const payload = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        const userId = payload.id;

        const lastId = req?.nextUrl?.searchParams?.get('lastId') ?? null;
        const limitParam = req?.nextUrl?.searchParams?.get('limit');
        if (!limitParam) {
            return NextResponse.json({ message: 'Limit cannot be empty' }, { status: 400 });
        }
        const parsedLimit = parseInt(limitParam, 10);
        if (isNaN(parsedLimit)) {
            return NextResponse.json({ message: 'Limit should be a number' }, { status: 400 });
        }

        const jobs = await fetchJobsByUserIdPaginated(userId, lastId, parsedLimit);
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
