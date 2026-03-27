import { USER_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { NextRequest, NextResponse } from 'next/server';
import { Job, JobState } from '@jobify/domain/job';
import { createJobDocument, fetchJobById, deleteJobDocument } from '@jobify/appwrite-server/collections/job-collection';
import jwt from 'jsonwebtoken';
import { isRecognisedError, NotFoundError, UnauthorizedError } from '@jobify/domain/error';
import { toPublicJob } from '@jobify/domain/api-serializers';
export async function POST(req: NextRequest) {
    const token = req.cookies.get(USER_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const id = (user as any).id;
        const body = (await req.json()) as Job;
        const job = new Job(
            body.id,
            body.profile,
            body.description,
            body.company,
            body.type,
            body.workplaceType,
            body.lastDateToApply,
            body.location,
            body.skills,
            body.rejectionContent,
            body.selectionContent,
            body.createdAt,
            body.state,
            id,
        );
        await createJobDocument(job);
        return NextResponse.json({ message: 'Job created' }, { status: 201 });
    }
    catch (error) {
        console.log('Error while creating job', error);
        const err = error as any;
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: err.message }, { status: err.statusCode });
        }
        return NextResponse.json({ message: 'Error while creating job' }, { status: 500 });
    }
}
export async function GET(req: NextRequest) {
    const token = req.cookies.get(USER_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const userId = (user as {
            id: string;
        }).id;
        const id = req?.nextUrl?.searchParams?.get('id');
        if (!id) {
            return NextResponse.json({ message: 'Job Id cannot be empty' }, { status: 400 });
        }
        const job = await fetchJobById(id);
        const isOwner = job.createdBy === userId;
        if (!isOwner && job.state !== JobState.PUBLISHED) {
            throw new NotFoundError('Job not found');
        }
        return NextResponse.json(toPublicJob(job as unknown as Record<string, unknown>), { status: 200 });
    }
    catch (error) {
        console.log('Error while fetching job', error);
        if (isRecognisedError(error)) {
            const err = error as {
                statusCode: number;
                message: string;
            };
            return NextResponse.json({ message: err.message }, { status: err.statusCode });
        }
        return NextResponse.json({ message: 'Error while fetching job' }, { status: 500 });
    }
}
export async function DELETE(req: NextRequest) {
    const token = req.cookies.get(USER_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const userId = (user as {
            id: string;
        }).id;
        const jobId = req?.nextUrl?.searchParams?.get('id');
        if (!jobId) {
            return NextResponse.json({ message: 'Job Id cannot be empty' }, { status: 400 });
        }
        const job = await fetchJobById(jobId);
        if (job.createdBy !== userId) {
            throw new UnauthorizedError('You are not the owner of this job');
        }
        await deleteJobDocument(jobId);
        return NextResponse.json({ message: 'Job deleted successfully' }, { status: 200 });
    }
    catch (error) {
        console.log('Error while deleting job', error);
        if (isRecognisedError(error)) {
            const err = error as {
                statusCode: number;
                message: string;
            };
            return NextResponse.json({ message: err.message }, { status: err.statusCode });
        }
        return NextResponse.json({ message: 'Error while deleting job' }, { status: 500 });
    }
}
