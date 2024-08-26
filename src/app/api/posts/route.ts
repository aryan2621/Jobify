import { fetchUserByUserId } from '@/appwrite/server/collections/user-collection';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { fetchJobsByUserId } from '@/appwrite/server/collections/job-collection';

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
        const jobs = await fetchJobsByUserId(id);
        return NextResponse.json(jobs, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error while fetching user' }, { status: 500 });
    }
}
