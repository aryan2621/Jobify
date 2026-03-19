import { NextRequest, NextResponse } from 'next/server';
import { fetchJobsByUserId } from '@/appwrite/server/collections/job-collection';
import { fetchApplicationsByJobIds } from '@/appwrite/server/collections/application-collection';
import { isRecognisedError, UnauthorizedError } from '@/model/error';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token');
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const payload = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        const userId = payload.id;

        const jobs = await fetchJobsByUserId(userId);
        const jobIds = jobs.map((j: { id?: string }) => j.id ?? (j as { $id?: string }).$id).filter(Boolean) as string[];
        if (jobIds.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        const applications = await fetchApplicationsByJobIds(jobIds);
        return NextResponse.json(applications, { status: 200 });
    } catch (error) {
        if (isRecognisedError(error)) {
            const err = error as { message?: string; statusCode?: number };
            return NextResponse.json({ message: err.message }, { status: err.statusCode ?? 401 });
        }
        console.error('Error fetching applications', error);
        return NextResponse.json({ message: 'Error while fetching applications' }, { status: 500 });
    }
}
