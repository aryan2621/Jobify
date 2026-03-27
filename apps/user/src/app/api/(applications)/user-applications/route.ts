import { USER_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { isRecognisedError, UnauthorizedError } from '@jobify/domain/error';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { fetchApplicationsByUserId } from '@jobify/appwrite-server/collections/application-collection';
import { UserApplicationsRequest } from '@jobify/domain/request';
import { toPublicApplication } from '@jobify/domain/api-serializers';
const MAX_LIMIT = 100;
export async function GET(req: NextRequest) {
    const token = req.cookies.get(USER_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const id = (user as any).id;
        const limitParam = req?.nextUrl?.searchParams?.get('limit');
        const lastId = req?.nextUrl?.searchParams?.get('lastId');
        if (!limitParam) {
            return NextResponse.json({ message: 'Limit cannot be empty' }, { status: 400 });
        }
        const parsedLimit = parseInt(limitParam, 10);
        if (isNaN(parsedLimit)) {
            return NextResponse.json({ message: 'Limit should be a number' }, { status: 400 });
        }
        const limit = Math.min(parsedLimit, MAX_LIMIT);
        const applications = await fetchApplicationsByUserId(id, new UserApplicationsRequest(lastId, limit));
        return NextResponse.json(
            applications.map((doc) => toPublicApplication(doc as unknown as Record<string, unknown>)),
            { status: 200 }
        );
    }
    catch (error) {
        console.log('Error while fetching user applications', error);
        const err = error as any;
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: err.message }, { status: err.statusCode });
        }
        return NextResponse.json({ message: 'Error while fetching user applications' }, { status: 500 });
    }
}
