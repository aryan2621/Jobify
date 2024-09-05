import { NextRequest, NextResponse } from 'next/server';
import { fetchApplicationsByJobId } from '@/appwrite/server/collections/application-collection';
import { BadRequestError, isRecognisedError, UnauthorizedError } from '@/model/error';
import { fetchJobById } from '@/appwrite/server/collections/job-collection';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token');
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const jobId = req?.nextUrl?.searchParams?.get('jobId');
        if (!jobId) {
            throw new BadRequestError('Job Id cannot be empty');
        }
        const job = await fetchJobById(jobId);
        if (!job) {
            throw new BadRequestError('Job does not exist');
        }
        const applications = await fetchApplicationsByJobId(jobId);
        return NextResponse.json(applications, { status: 200 });
    } catch (error: any) {
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ message: 'Error while fetching applications' }, { status: 500 });
    }
}
