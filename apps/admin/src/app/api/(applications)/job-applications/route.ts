import { ADMIN_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { NextRequest, NextResponse } from 'next/server';
import { fetchApplicationsByJobId } from '@jobify/appwrite-server/collections/application-collection';
import { BadRequestError, isRecognisedError, UnauthorizedError } from '@jobify/domain/error';
import { fetchJobById } from '@jobify/appwrite-server/collections/job-collection';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
    const token = req.cookies.get(ADMIN_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const payload = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        const userId = payload.id;

        const jobId = req?.nextUrl?.searchParams?.get('jobId');
        if (!jobId) {
            throw new BadRequestError('Job Id cannot be empty');
        }
        const job = await fetchJobById(jobId);
        if (!job) {
            throw new BadRequestError('Job does not exist');
        }
        const createdBy = (job as { createdBy?: string }).createdBy;
        if (createdBy !== userId) {
            throw new UnauthorizedError('You do not have access to this job\'s applications');
        }
        const applications = await fetchApplicationsByJobId(jobId);
        return NextResponse.json(applications, { status: 200 });
    } catch (error: unknown) {
        console.log('Error while fetching job applications', error);
        if (isRecognisedError(error)) {
            const err = error as { message?: string; statusCode?: number };
            return NextResponse.json({ message: err.message }, { status: err.statusCode ?? 500 });
        }
        return NextResponse.json({ message: 'Error while fetching applications' }, { status: 500 });
    }
}
