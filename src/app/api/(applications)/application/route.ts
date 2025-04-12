import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { setApplicationToUser } from '@/appwrite/server/collections/user-collection';
import { Application, ApplicationStatus } from '@/model/application';
import { fetchJobById, setApplicationIdToJob } from '@/appwrite/server/collections/job-collection';
import { createApplicationDocument, fetchApplicationById, updateApplicationStatus } from '@/appwrite/server/collections/application-collection';
import { fetchSettingsByUserIdPrivate } from '@/appwrite/server/collections/settings-collection';
import { EMAIL_SUBJECT } from '@/lib/utils/joconnect-utils';
import { isRecognisedError, NotFoundError, UnauthorizedError } from '@/model/error';
import * as google from '@googleapis/gmail';
import { OAuth2Client } from 'google-auth-library';

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
        await Promise.all([setApplicationToUser(id, body.id), setApplicationIdToJob(body.jobId, body.id), createApplicationDocument(body)]);
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
        const emailSettings = await fetchSettingsByUserIdPrivate(userId);
        const oauth2Client = new OAuth2Client(
            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            process.env.GOOGLE_CLIENT_SECRET!,
            process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL!
        );
        oauth2Client.setCredentials({
            access_token: emailSettings.accessToken,
            refresh_token: emailSettings.refreshToken,
        });
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        let content = status === ApplicationStatus.REJECTED ? job.rejectionContent : job.selectionContent;

        content = content.replace('{firstName}', application.firstName);
        content = content.replace('{lastName}', application.lastName);
        content = content.replace('{jobTitle}', job.profile);
        content = content.replace('{company}', job.company);

        content = content.replace('{interviewMode}', 'Online');
        const subject = EMAIL_SUBJECT;
        const from = emailSettings.email;
        const to = application.email;

        const emailLines = [`From: ${from}`, `To: ${to}`, `Subject: ${subject}`, '', content];

        const email = emailLines.join('\r\n').trim();
        const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        await Promise.all([
            gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedEmail,
                },
            }),
            updateApplicationStatus(jobId, applicationId, status),
        ]);

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
