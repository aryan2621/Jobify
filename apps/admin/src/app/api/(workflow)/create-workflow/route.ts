import { ADMIN_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { isRecognisedError, UnauthorizedError } from '@jobify/domain/error';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createWorkflow, getWorkflowsByUserId } from '@jobify/appwrite-server/collections/workflow-collection';
import { Workflow } from '@jobify/domain/workflow';

export async function POST(req: NextRequest) {
    const token = req.cookies.get(ADMIN_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }

        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const userId = (user as any).id;
        const workflowData = await req.json();

        const existing = await getWorkflowsByUserId(userId);
        if (existing.length > 0) {
            return NextResponse.json(
                { message: 'You already have a workflow. Open it from Workflows to edit.' },
                { status: 409 }
            );
        }

        const workflow: Workflow = {
            id: workflowData.id,
            name: workflowData.name,
            description: workflowData.description || '',
            nodes: workflowData.nodes,
            edges: workflowData.edges,
            createdAt: workflowData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userId,
            status: workflowData.status || 'draft',
        };

        const created = await createWorkflow(workflow);
        return NextResponse.json(created, { status: 200 });
    } catch (error) {
        console.log('Error while saving workflow', error);
        const err = error as any;
        if (isRecognisedError(err)) {
            return NextResponse.json({ message: err.message }, { status: err.statusCode });
        }
        return NextResponse.json({ message: 'Error while saving workflow' }, { status: 500 });
    }
}
