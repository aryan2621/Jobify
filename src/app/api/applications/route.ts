import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { fetchUserByUserId } from '@/appwrite/server/collections/user-collection';
import { fetchApplicationsByJobId } from '@/appwrite/server/collections/application-collection';

export async function GET(req: NextRequest) {
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
        const jobId = req?.nextUrl?.searchParams?.get('jobId');
        if (!jobId) {
            return NextResponse.json({ message: 'Job Id cannot be empty' }, { status: 400 });
        }
        const applications = await fetchApplicationsByJobId(jobId);
        return NextResponse.json(applications, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error while fetching applications' }, { status: 500 });
    }
}
