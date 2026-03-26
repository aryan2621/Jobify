import { ADMIN_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { isRecognisedError, UnauthorizedError } from '@jobify/domain/error';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getWorkflowExecutionEventsByExecutionId } from '@jobify/appwrite-server/collections/workflow-collection';

export async function GET(req: NextRequest) {
    const token = req.cookies.get(ADMIN_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        jwt.verify(token.value, process.env.JWT_SECRET!);
        const executionId = req.nextUrl.searchParams.get('executionId');
        if (!executionId) {
            return NextResponse.json({ message: 'executionId is required' }, { status: 400 });
        }
        const events = await getWorkflowExecutionEventsByExecutionId(executionId);
        return NextResponse.json(events, { status: 200 });
    } catch (error) {
        console.log('Error while fetching workflow execution events', error);
        const err = error as unknown;
        if (isRecognisedError(err)) {
            const e = err as { message: string; statusCode: number };
            return NextResponse.json({ message: e.message }, { status: e.statusCode });
        }
        return NextResponse.json({ message: 'Error while fetching workflow execution events' }, { status: 500 });
    }
}
