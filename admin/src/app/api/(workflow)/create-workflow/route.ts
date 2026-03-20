import { isRecognisedError, UnauthorizedError } from '@/model/error';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createWorkflow } from '@/appwrite/server/collections/workflow-collection';
import { Workflow } from '@/model/workflow';

export async function POST(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }

        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const userId = (user as any).id;
        const workflowData = await req.json();

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
