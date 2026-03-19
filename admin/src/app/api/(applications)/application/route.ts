import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { setApplicationToUser } from '@/appwrite/server/collections/user-collection';
import { Application, ApplicationStatus } from '@/model/application';
import { fetchJobById, setApplicationIdToJob } from '@/appwrite/server/collections/job-collection';
import { createApplicationDocument, fetchApplicationById, updateApplicationStatus } from '@/appwrite/server/collections/application-collection';
import { EMAIL_SUBJECT } from '@/lib/utils/joconnect-utils';
import { isRecognisedError, NotFoundError, UnauthorizedError } from '@/model/error';
import { EmailService } from '@/appwrite/server/services/email-service';
import { inngest } from '@/inngest/client';

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
        if (job.applications.includes(id)) {
            throw new UnauthorizedError('You have already applied to this job');
        }
        const workflowId = (job as { workflowId?: string }).workflowId;
        if (workflowId) {
            body.workflowId = workflowId;
            body.stage = 'applied';
        }
        await Promise.all([setApplicationToUser(id, body.id), setApplicationIdToJob(body.jobId, body.id), createApplicationDocument(body)]);

        if (workflowId) {
            await inngest.send({
                name: 'application/submitted',
                data: { applicationId: body.id, jobId: body.jobId },
            });
        }
        return NextResponse.json({ message: 'Application posted successfully' }, { status: 201 });
    } catch (error: any) {
        console.log('Error while posting application', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        } else {
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

        let content = status === ApplicationStatus.REJECTED ? job.rejectionContent : job.selectionContent;
        content = content
            .replace('{firstName}', application.firstName)
            .replace('{lastName}', application.lastName)
            .replace('{jobTitle}', job.profile)
            .replace('{company}', job.company)
            .replace('{interviewMode}', 'Online');
        const html = `<p>${EmailService.escapeHtml(content.replace(/\n/g, '<br/>'))}</p>`;

        const sendResult = await EmailService.sendEmail({
            userId,
            to: application.email,
            subject: EMAIL_SUBJECT,
            html,
        });
        if (sendResult.error) {
            throw new Error(sendResult.error.message);
        }

        await updateApplicationStatus(jobId, applicationId, status);

        return NextResponse.json({ message: 'Application updated successfully' }, { status: 200 });
    } catch (error: any) {
        console.log('Error while updating application', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        } else {
            return NextResponse.json({ message: 'Error while updating application' }, { status: 500 });
        }
    }
}
