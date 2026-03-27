import { ADMIN_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { isRecognisedError, UnauthorizedError } from '@jobify/domain/error';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { fetchApplicationsByUserId } from '@jobify/appwrite-server/collections/application-collection';
import { UserApplicationsRequest } from '@jobify/domain/request';
import { toPublicApplication } from '@jobify/domain/api-serializers';

export async function GET(req: NextRequest) {
    const token = req.cookies.get(ADMIN_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const id = (user as any).id;
        const limit = req?.nextUrl?.searchParams?.get('limit');
        const lastId = req?.nextUrl?.searchParams?.get('lastId');

        if (!limit) {
            return NextResponse.json({ message: 'Limit cannot be empty' }, { status: 400 });
        }
        if (isNaN(parseInt(limit))) {
            return NextResponse.json({ message: 'Limit should be a number' }, { status: 400 });
        }
        const applications = await fetchApplicationsByUserId(id, new UserApplicationsRequest(lastId, limit ? parseInt(limit) : null));
        return NextResponse.json(
            applications.map((doc) => toPublicApplication(doc as unknown as Record<string, unknown>)),
            { status: 200 }
        );
    } catch (error) {
        const err = error as any;
        console.log('Error while fetching user applications', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: err.message }, { status: err.statusCode });
        }
        return NextResponse.json({ message: 'Error while fetching user applications' }, { status: 500 });
    }
}
