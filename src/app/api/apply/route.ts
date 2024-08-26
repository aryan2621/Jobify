import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { fetchUserByUserId, setApplicationToUser } from '@/appwrite/server/collections/user-collection';
import { Application } from '@/model/application';
import { setApplicationIdToJob } from '@/appwrite/server/collections/job-collection';
import { createApplicationDocument } from '@/appwrite/server/collections/application-collection';

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
        const body = (await req.json()) as Application;
        body.createdBy = id;
        await Promise.all([setApplicationToUser(id, body.id), setApplicationIdToJob(body.jobId, body.id), createApplicationDocument(body)]);
        return NextResponse.json({ message: 'Application posted successfully' }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            {
                message: 'Error while posting application',
            },
            { status: 500 }
        );
    }
}
