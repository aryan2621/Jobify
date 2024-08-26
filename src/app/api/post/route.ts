import { NextRequest, NextResponse } from 'next/server';
import { Job } from '@/model/job';
import { createJobDocument, fetchJobById } from '@/appwrite/server/collections/job-collection';
import jwt from 'jsonwebtoken';
import { fetchUserByUserId, setJobToUser } from '@/appwrite/server/collections/user-collection';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token');
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const user = jwt.verify(token.value, process.env.NEXT_PUBLIC_JWT_SECRET!);
        const id = (user as any).id;
        const dbUser = await fetchUserByUserId(id);
        if (!dbUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
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
            id,
            body.applications ?? []
        );
        await Promise.all([createJobDocument(job), setJobToUser(id, job.id)]);
        return NextResponse.json({ message: 'Job created' }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error while creating job' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const id = req?.nextUrl?.searchParams?.get('id');
        if (!id) {
            return NextResponse.json({ message: 'Job Id cannot be empty' }, { status: 400 });
        }
        const job = await fetchJobById(id);
        return NextResponse.json(job, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error while fetching user' }, { status: 500 });
    }
}
