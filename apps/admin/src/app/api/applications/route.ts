import { ADMIN_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { NextRequest, NextResponse } from 'next/server';
import { fetchJobsByUserId } from '@jobify/appwrite-server/collections/job-collection';
import { fetchApplicationsByRecruiterJobIdsPaginated } from '@jobify/appwrite-server/collections/application-collection';
import { isRecognisedError, UnauthorizedError } from '@jobify/domain/error';
import { toPublicApplication } from '@jobify/domain/api-serializers';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
    const token = req.cookies.get(ADMIN_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const payload = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        const userId = payload.id;

        const jobs = await fetchJobsByUserId(userId);
        const jobIds = jobs.map((j: { $id?: string }) => j.$id).filter(Boolean) as string[];
        if (jobIds.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        const limitParam = req.nextUrl.searchParams.get('limit');
        const lastId = req.nextUrl.searchParams.get('lastId');
        const parsed = limitParam ? parseInt(limitParam, 10) : 100;
        const limit = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 100) : 100;

        const applications = await fetchApplicationsByRecruiterJobIdsPaginated(jobIds, lastId, limit);
        return NextResponse.json(
            applications.map((doc) => toPublicApplication(doc as unknown as Record<string, unknown>)),
            { status: 200 }
        );
    } catch (error) {
        if (isRecognisedError(error)) {
            const err = error as { message?: string; statusCode?: number };
            return NextResponse.json({ message: err.message }, { status: err.statusCode ?? 401 });
        }
        console.error('Error fetching applications', error);
        return NextResponse.json({ message: 'Error while fetching applications' }, { status: 500 });
    }
}
