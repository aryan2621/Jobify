import { ADMIN_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { isRecognisedError, UnauthorizedError } from '@jobify/domain/error';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getWorkflowsByUserId } from '@jobify/appwrite-server/collections/workflow-collection';

export async function GET(req: NextRequest) {
    const token = req.cookies.get(ADMIN_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }

        const payload = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        const workflows = await getWorkflowsByUserId(payload.id);

        return NextResponse.json(workflows, { status: 200 });
    } catch (error) {
        console.log('Error while fetching workflows', error);
        const err = error as any;
        if (isRecognisedError(err)) {
            return NextResponse.json({ message: err.message }, { status: err.statusCode });
        }
        return NextResponse.json({ message: 'Error while fetching workflows' }, { status: 500 });
    }
}
