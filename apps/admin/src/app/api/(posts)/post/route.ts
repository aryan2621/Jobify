import { ADMIN_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { NextRequest, NextResponse } from 'next/server';
import { Job } from '@jobify/domain/job';
import { createJobDocument, deleteJobDocument, fetchJobById, updateJobDocument } from '@jobify/appwrite-server/collections/job-collection';
import jwt from 'jsonwebtoken';
import { isRecognisedError, UnauthorizedError } from '@jobify/domain/error';
import { toPublicJob } from '@jobify/domain/api-serializers';

export async function POST(req: NextRequest) {
    const token = req.cookies.get(ADMIN_AUTH_COOKIE_NAME);
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
    } catch (error) {
        const err = error as any;
        console.log('Error while creating job', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: err.message }, { status: err.statusCode });
        }
        return NextResponse.json({ message: 'Error while creating job' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const token = req.cookies.get(ADMIN_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const payload = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        const userId = payload.id;

        const id = req?.nextUrl?.searchParams?.get('id');
        if (!id) {
            return NextResponse.json({ message: 'Job Id cannot be empty' }, { status: 400 });
        }
        const job = await fetchJobById(id);
        if (!job) {
            return NextResponse.json({ message: 'Job not found' }, { status: 404 });
        }
        const createdBy = (job as { createdBy?: string }).createdBy;
        if (createdBy !== userId) {
            throw new UnauthorizedError('You do not have access to this job');
        }
        return NextResponse.json(toPublicJob(job as unknown as Record<string, unknown>), { status: 200 });
    } catch (error) {
        if (isRecognisedError(error)) {
            const err = error as { message?: string; statusCode?: number };
            return NextResponse.json({ message: err.message }, { status: err.statusCode ?? 401 });
        }
        console.log('Error while fetching job', error);
        return NextResponse.json({ message: 'Error while fetching job' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const token = req.cookies.get(ADMIN_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const payload = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        const userId = payload.id;

        const body = (await req.json()) as Job;
        const existingJob = await fetchJobById(body.id);
        if (!existingJob) {
            return NextResponse.json({ message: 'Job not found' }, { status: 404 });
        }
        const createdBy = (existingJob as { createdBy?: string }).createdBy;
        if (createdBy !== userId) {
            throw new UnauthorizedError('You do not have access to update this job');
        }

        const existing = existingJob as { createdAt?: string };
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
            existing.createdAt ?? body.createdAt,
            body.state,
            userId,
        );
        await updateJobDocument(job);
        return NextResponse.json(toPublicJob(job), { status: 200 });
    } catch (error) {
        console.log('Error while updating job', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: (error as { message: string }).message }, { status: (error as { statusCode?: number }).statusCode ?? 401 });
        }
        return NextResponse.json({ message: 'Error while updating job' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const token = req.cookies.get(ADMIN_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const payload = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        const userId = payload.id;

        const id = req.nextUrl.searchParams.get('id');
        if (!id) {
            return NextResponse.json({ message: 'Job Id cannot be empty' }, { status: 400 });
        }
        const job = await fetchJobById(id);
        if (!job) {
            return NextResponse.json({ message: 'Job not found' }, { status: 404 });
        }
        const createdBy = (job as { createdBy?: string }).createdBy;
        if (createdBy !== userId) {
            throw new UnauthorizedError('You do not have access to delete this job');
        }

        await deleteJobDocument(id);
        return NextResponse.json({ message: 'Job deleted' }, { status: 200 });
    } catch (error) {
        if (isRecognisedError(error)) {
            const err = error as { message?: string; statusCode?: number };
            return NextResponse.json({ message: err.message }, { status: err.statusCode ?? 401 });
        }
        console.log('Error while deleting job', error);
        return NextResponse.json({ message: 'Error while deleting job' }, { status: 500 });
    }
}
