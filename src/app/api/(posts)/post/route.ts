import { NextRequest, NextResponse } from 'next/server';
import { Job } from '@/model/job';
import { createJobDocument, fetchJobById } from '@/appwrite/server/collections/job-collection';
import jwt from 'jsonwebtoken';
import { setJobToUser } from '@/appwrite/server/collections/user-collection';
import { isRecognisedError, UnauthorizedError } from '@/model/error';

export async function POST(req: NextRequest) {
    const token = req.cookies.get('token');
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
            body.applications ?? []
        );
        await Promise.all([createJobDocument(job), setJobToUser(id, job.id)]);
        return NextResponse.json({ message: 'Job created' }, { status: 201 });
    } catch (error) {
        console.log('Error while creating job', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ message: 'Error while creating job' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const id = req?.nextUrl?.searchParams?.get('id');
        if (!id) {
            return NextResponse.json({ message: 'Job Id cannot be empty' }, { status: 400 });
        }
        const job = await fetchJobById(id);
        return NextResponse.json(job, { status: 200 });
    } catch (error) {
        console.log('Error while fetching job', error);
        return NextResponse.json({ message: 'Error while fetching job' }, { status: 500 });
    }
}
