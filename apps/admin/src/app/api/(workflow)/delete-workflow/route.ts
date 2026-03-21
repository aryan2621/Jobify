import { ADMIN_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { NextRequest, NextResponse } from 'next/server';
import { deleteWorkflow, getWorkflowById } from '@jobify/appwrite-server/collections/workflow-collection';
import { NotFoundError, UnauthorizedError } from '@jobify/domain/error';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
    const token = req.cookies.get(ADMIN_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }

        const details = jwt.verify(token.value, process.env.JWT_SECRET!);
        const userId = (details as { id: string }).id;

        const workflowId = req.nextUrl.searchParams.get('workflowId');

        if (!workflowId) {
            return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
        }
        const workflow = await getWorkflowById(workflowId);
        if (!workflow) {
            throw new NotFoundError('Workflow not found');
        }
        const ownerId = (workflow as { createdBy?: string }).createdBy;
        if (ownerId !== userId) {
            throw new UnauthorizedError('Unauthorized to delete this workflow');
        }
        await deleteWorkflow(workflowId);
        return NextResponse.json({ message: 'Workflow deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting workflow:', error);
        return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 });
    }
}
