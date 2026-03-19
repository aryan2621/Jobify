import { isRecognisedError, UnauthorizedError } from '@/model/error';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getWorkflowById, updateWorkflow } from '@/appwrite/server/collections/workflow-collection';
import { Workflow } from '@/model/workflow';

export async function POST(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }

        jwt.verify(token.value, process.env.JWT_SECRET!);
        const workflowData = await req.json();

        if (!workflowData.id) {
            return NextResponse.json({ message: 'Workflow id is required' }, { status: 400 });
        }

        const existing = await getWorkflowById(workflowData.id);
        if (!existing) {
            return NextResponse.json({ message: 'Workflow not found' }, { status: 404 });
        }

        const workflow: Workflow = {
            id: workflowData.id,
            name: workflowData.name ?? existing.name,
            description: workflowData.description ?? existing.description ?? '',
            nodes: workflowData.nodes,
            edges: workflowData.edges,
            createdAt: existing.createdAt,
            updatedAt: new Date().toISOString(),
            createdBy: existing.createdBy,
            isTemplate: workflowData.isTemplate ?? existing.isTemplate ?? false,
            templateCategory: workflowData.templateCategory ?? existing.templateCategory ?? '',
            status: workflowData.status ?? existing.status ?? 'draft',
            tags: workflowData.tags ?? existing.tags ?? [],
        };

        await updateWorkflow(workflow);
        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        console.log('Error while updating workflow', error);
        const err = error as any;
        if (isRecognisedError(err)) {
            return NextResponse.json({ message: err.message }, { status: err.statusCode });
        }
        return NextResponse.json({ message: 'Error while updating workflow' }, { status: 500 });
    }
}
