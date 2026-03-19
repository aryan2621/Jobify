import { NextRequest, NextResponse } from 'next/server';
import { deleteWorkflow } from '@/appwrite/server/collections/workflow-collection';
import { deleteWorkflowFromUser, fetchUserByUserId, updateUser } from '@/appwrite/server/collections/user-collection';
import { NotFoundError, UnauthorizedError } from '@/model/error';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }

        const details = jwt.verify(token.value, process.env.JWT_SECRET!);
        const userId = (details as any).id;

        const workflowId = req.nextUrl.searchParams.get('workflowId');

        if (!workflowId) {
            return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
        }
        const user = await fetchUserByUserId(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        if (!user.workflows || !user.workflows.includes(workflowId)) {
            throw new UnauthorizedError('Unauthorized to delete this workflow');
        }
        const promises = [deleteWorkflow(workflowId), deleteWorkflowFromUser(userId, workflowId)];
        await Promise.all(promises);
        return NextResponse.json({ message: 'Workflow deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting workflow:', error);
        return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 });
    }
}
