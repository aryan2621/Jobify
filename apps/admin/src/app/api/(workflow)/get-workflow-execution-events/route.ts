import { ADMIN_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { isRecognisedError, NotFoundError, UnauthorizedError } from '@jobify/domain/error';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import {
    getWorkflowExecutionByExecutionKey,
    getWorkflowExecutionEventsByExecutionId,
} from '@jobify/appwrite-server/collections/workflow-collection';
import { toPublicWorkflowExecutionEvent } from '@jobify/domain/api-serializers';

export async function GET(req: NextRequest) {
    const token = req.cookies.get(ADMIN_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const payload = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        const executionId = req.nextUrl.searchParams.get('executionId');
        if (!executionId) {
            return NextResponse.json({ message: 'executionId is required' }, { status: 400 });
        }
        const execution = await getWorkflowExecutionByExecutionKey(executionId);
        if (!execution) {
            throw new NotFoundError('Execution not found');
        }
        const recruiterId = String((execution as { recruiterId?: string }).recruiterId ?? '');
        if (recruiterId !== payload.id) {
            throw new UnauthorizedError('You do not have access to this execution');
        }
        const doc = execution as { id?: string; $id?: string; applicationId?: string };
        const eventsExecutionId = String(doc.id ?? doc.$id ?? doc.applicationId ?? executionId);
        const events = await getWorkflowExecutionEventsByExecutionId(eventsExecutionId);
        return NextResponse.json(
            events.map((e) => toPublicWorkflowExecutionEvent(e as unknown as Record<string, unknown>)),
            { status: 200 }
        );
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
