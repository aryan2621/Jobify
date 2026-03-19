import { NextRequest, NextResponse } from 'next/server';
import { fetchApplicationById } from '@/appwrite/server/collections/application-collection';
import { fetchJobById } from '@/appwrite/server/collections/job-collection';
import { getResume } from '@/appwrite/server/storage';
import { UnauthorizedError } from '@/model/error';
import { isRecognisedError } from '@/model/error';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const payload = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        const userId = payload.id;

        const applicationId = req.nextUrl.searchParams.get('applicationId');
        if (!applicationId) {
            return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
        }

        const application = await fetchApplicationById(applicationId);
        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }
        const jobId = (application as { jobId?: string }).jobId;
        if (!jobId) {
            return NextResponse.json({ error: 'Application has no linked job' }, { status: 400 });
        }

        const job = await fetchJobById(jobId);
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }
        const createdBy = (job as { createdBy?: string }).createdBy;
        if (createdBy !== userId) {
            throw new UnauthorizedError('You do not have access to this application');
        }

        const fileId = (application as { resume?: string }).resume;
        if (!fileId) {
            return NextResponse.json({ error: 'No resume file for this application' }, { status: 404 });
        }

        const buffer = await getResume(fileId);
        const firstName = (application as { firstName?: string }).firstName ?? 'Applicant';
        const lastName = (application as { lastName?: string }).lastName ?? '';
        const filename = `${firstName}_${lastName}_Resume.pdf`.replace(/\s+/g, '_');

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        if (isRecognisedError(error)) {
            const err = error as { message?: string; statusCode?: number };
            return NextResponse.json({ error: err.message }, { status: err.statusCode ?? 401 });
        }
        console.error('Error fetching resume', error);
        return NextResponse.json({ error: 'Failed to fetch resume' }, { status: 500 });
    }
}
