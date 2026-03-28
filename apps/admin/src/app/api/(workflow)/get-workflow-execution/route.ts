import { ADMIN_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { isRecognisedError, NotFoundError, UnauthorizedError } from '@jobify/domain/error';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getWorkflowExecutionByExecutionKey } from '@jobify/appwrite-server/collections/workflow-collection';
import { toPublicWorkflowExecution } from '@jobify/domain/api-serializers';

export async function GET(req: NextRequest) {
    const token = req.cookies.get(ADMIN_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const payload = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        const executionId = req.nextUrl.searchParams.get('executionId')?.trim();
        if (!executionId) {
            return NextResponse.json({ message: 'executionId is required' }, { status: 400 });
        }
        const doc = await getWorkflowExecutionByExecutionKey(executionId);
        if (!doc) {
            throw new NotFoundError('Execution not found');
        }
        const recruiterId = String((doc as { recruiterId?: string }).recruiterId ?? '');
        if (recruiterId !== payload.id) {
            throw new UnauthorizedError('You do not have access to this execution');
        }
        return NextResponse.json(toPublicWorkflowExecution(doc as unknown as Record<string, unknown>), { status: 200 });
    } catch (error) {
        if (isRecognisedError(error)) {
            const e = error as { message: string; statusCode: number };
            return NextResponse.json({ message: e.message }, { status: e.statusCode });
        }
        console.error('get-workflow-execution', error);
        return NextResponse.json({ message: 'Error while fetching execution' }, { status: 500 });
    }
}
