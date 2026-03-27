import { USER_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { NextRequest, NextResponse } from 'next/server';
import { fetchAllJobs } from '@jobify/appwrite-server/collections/job-collection';
import { JobState } from '@jobify/domain/job';
import { isRecognisedError, UnauthorizedError } from '@jobify/domain/error';
import { toPublicJob } from '@jobify/domain/api-serializers';
const MAX_LIMIT = 100;
export async function GET(req: NextRequest) {
    const token = req.cookies.get(USER_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const lastId = req?.nextUrl?.searchParams?.get('lastId');
        const limitParam = req?.nextUrl?.searchParams?.get('limit');
        if (!limitParam) {
            return NextResponse.json({ message: 'Limit cannot be empty' }, { status: 400 });
        }
        const parsedLimit = parseInt(limitParam, 10);
        if (isNaN(parsedLimit)) {
            return NextResponse.json({ message: 'Limit should be a number' }, { status: 400 });
        }
        const limit = Math.min(parsedLimit, MAX_LIMIT);
        const jobs = await fetchAllJobs(lastId, limit, JobState.PUBLISHED);
        return NextResponse.json(
            jobs.map((doc) => toPublicJob(doc as unknown as Record<string, unknown>)),
            { status: 200 }
        );
    }
    catch (error) {
        console.log('Error while fetching jobs', error);
        const err = error as any;
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: err.message }, { status: err.statusCode });
        }
        return NextResponse.json({ message: 'Error while fetching jobs' }, { status: 500 });
    }
}
