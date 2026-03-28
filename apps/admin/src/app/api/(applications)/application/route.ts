import { ADMIN_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Application, ApplicationStatus } from '@jobify/domain/application';
import { fetchJobById } from '@jobify/appwrite-server/collections/job-collection';
import { fetchApplicationById, updateApplicationStatus } from '@jobify/appwrite-server/collections/application-collection';
import { EMAIL_SUBJECT } from '@/lib/utils/joconnect-utils';
import { isRecognisedError, NotFoundError, UnauthorizedError } from '@jobify/domain/error';
import { EmailService } from '@/appwrite/server/services/email-service';

export async function PUT(req: NextRequest) {
    const token = req.cookies.get(ADMIN_AUTH_COOKIE_NAME);
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

        const sendResultPromise = EmailService.sendEmail({
            userId,
            to: application.email,
            subject: EMAIL_SUBJECT,
            html,
        });
        const updateStatusPromise = updateApplicationStatus(jobId, applicationId, status);
        const [sendResult] = await Promise.all([sendResultPromise, updateStatusPromise]);
        if (sendResult.error) {
            throw new Error(sendResult.error.message);
        }
        return NextResponse.json({ message: 'Application updated successfully' }, { status: 200 });
    } catch (error: any) {
        console.log('Error while updating application', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ message: 'Error while updating application' }, { status: 500 });
    }
}
