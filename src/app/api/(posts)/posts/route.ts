import { NextRequest, NextResponse } from 'next/server';
import { fetchAllJobs } from '@/appwrite/server/collections/job-collection';
import { isRecognisedError, UnauthorizedError } from '@/model/error';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const lastId = req?.nextUrl?.searchParams?.get('lastId');
        const limit = req?.nextUrl?.searchParams?.get('limit');
        if (!limit) {
            return NextResponse.json({ message: 'Limit cannot be empty' }, { status: 400 });
        }
        if (isNaN(parseInt(limit))) {
            return NextResponse.json({ message: 'Limit should be a number' }, { status: 400 });
        }
        const jobs = await fetchAllJobs(lastId, limit ? parseInt(limit) : null);
        return NextResponse.json(jobs, { status: 200 });
    } catch (error) {
        console.log('Error while fetching jobs', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ message: 'Error while fetching jobs' }, { status: 500 });
    }
}
