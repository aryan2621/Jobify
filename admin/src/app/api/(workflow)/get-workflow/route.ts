import { BadRequestError, NotFoundError, UnauthorizedError } from '@/model/error';
import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowById } from '@/appwrite/server/collections/workflow-collection';
import jwt from 'jsonwebtoken';
import { isRecognisedError } from '@/model/error';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token');
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const payload = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        const userId = payload.id;

        const workflowId = req.nextUrl.searchParams.get('workflowId');
        if (!workflowId) {
            throw new BadRequestError('Workflow ID is required');
        }
        const workflow = await getWorkflowById(workflowId);
        if (!workflow) {
            throw new NotFoundError('Workflow not found');
        }
        const createdBy = (workflow as { createdBy?: string }).createdBy;
        if (createdBy !== userId) {
            throw new UnauthorizedError('You do not have access to this workflow');
        }

        return NextResponse.json(workflow);
    } catch (error) {
        if (isRecognisedError(error)) {
            const err = error as { message?: string; statusCode?: number };
            return NextResponse.json({ error: err.message }, { status: err.statusCode ?? 401 });
        }
        console.error(error);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}
