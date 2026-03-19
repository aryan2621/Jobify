import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { setApplicationToUser } from '@/appwrite/server/collections/user-collection';
import { Application } from '@/model/application';
import { fetchJobById, setApplicationIdToJob } from '@/appwrite/server/collections/job-collection';
import { createApplicationDocument, fetchApplicationById, updateApplicationStatus, hasApplicationByUserAndJob } from '@/appwrite/server/collections/application-collection';
import { isRecognisedError, NotFoundError, UnauthorizedError, ForbiddenError } from '@/model/error';
export async function POST(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const id = (user as any).id;
        const body = (await req.json()) as Application;
        body.createdBy = id;
        const job = await fetchJobById(body.jobId);
        if (!job) {
            throw new NotFoundError('Requested job does not exist');
        }
        if (job.lastDateToApply < Date.now()) {
            throw new UnauthorizedError('Application deadline has passed');
        }
        if (job.createdBy === id) {
            throw new UnauthorizedError('You cannot apply to your own job');
        }
        const alreadyApplied = await hasApplicationByUserAndJob(id, body.jobId);
        if (alreadyApplied) {
            throw new UnauthorizedError('You have already applied to this job');
        }
        await Promise.all([setApplicationToUser(id, body.id), setApplicationIdToJob(body.jobId, body.id), createApplicationDocument(body)]);
        return NextResponse.json({ message: 'Application posted successfully' }, { status: 201 });
    }
    catch (error: any) {
        console.log('Error while posting application', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        else {
            return NextResponse.json({ message: 'Error while posting application' }, { status: 500 });
        }
    }
}
export async function PUT(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const userId = (user as any).id;
        const body = await req.json();
        const { jobId, applicationId, status } = body;
        const [job, application] = await Promise.all([fetchJobById(jobId), fetchApplicationById(applicationId)]);
        if (!job || !application) {
            throw new NotFoundError('Requested job or application does not exist');
        }
        if (job.createdBy !== userId) {
            throw new UnauthorizedError('You are not the owner of this job');
        }
        if (application.jobId !== jobId) {
            throw new ForbiddenError('Application does not belong to this job');
        }
        await updateApplicationStatus(jobId, applicationId, status);
        return NextResponse.json({ message: 'Application updated successfully' }, { status: 200 });
    }
    catch (error: any) {
        console.log('Error while updating application', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        else {
            return NextResponse.json({ message: 'Error while updating application' }, { status: 500 });
        }
    }
}
