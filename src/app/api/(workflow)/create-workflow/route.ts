import { isRecognisedError, UnauthorizedError } from '@/model/error';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createWorkflow } from '@/appwrite/server/collections/workflow-collection';
import { addWorkflowToUser } from '@/appwrite/server/collections/user-collection';
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
            isTemplate: workflowData.isTemplate || false,
            templateCategory: workflowData.templateCategory || '',
            status: workflowData.status || 'draft',
            tags: workflowData.tags || [],
        };

        const promises = [createWorkflow(workflow), addWorkflowToUser(userId, workflow.id)];
        const result = await Promise.all(promises);

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.log('Error while saving workflow', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ message: 'Error while saving workflow' }, { status: 500 });
    }
}
