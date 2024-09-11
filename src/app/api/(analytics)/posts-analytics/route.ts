import { NextRequest, NextResponse } from 'next/server';
import { fetchAllJobs } from '@/appwrite/server/collections/job-collection';
import { isRecognisedError, UnauthorizedError } from '@/model/error';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const jobs = await fetchAllJobs();
        return NextResponse.json(jobs, { status: 200 });
    } catch (error) {
        console.log('Error while fetching jobs', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ message: 'Error while fetching jobs' }, { status: 500 });
    }
}
