import { BadRequestError, NotFoundError, UnauthorizedError } from '@/model/error';
import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowById } from '@/appwrite/server/collections/workflow-collection';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const workflowId = req.nextUrl.searchParams.get('workflowId');
        if (!workflowId) {
            throw new BadRequestError('Workflow ID is required');
        }
        const workflow = await getWorkflowById(workflowId);
        if (!workflow) {
            throw new NotFoundError('Workflow not found');
        }

        return NextResponse.json(workflow);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}
