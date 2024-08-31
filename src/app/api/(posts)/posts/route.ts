import { fetchUserByUserId } from '@/appwrite/server/collections/user-collection';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { fetchAllJobs } from '@/appwrite/server/collections/job-collection';
import { isRecognisedError, UnauthorizedError } from '@/model/error';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token');
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.NEXT_PUBLIC_JWT_SECRET!);
        const id = (user as any).id;
        const dbUser = await fetchUserByUserId(id);
        if (!dbUser) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const jobs = await fetchAllJobs();
        return NextResponse.json(jobs, { status: 200 });
    } catch (error) {
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ message: 'Error while fetching jobs' }, { status: 500 });
    }
}
