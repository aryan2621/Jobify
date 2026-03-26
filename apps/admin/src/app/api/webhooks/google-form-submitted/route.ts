import { NextRequest, NextResponse } from 'next/server';
import { fetchApplicationById } from '@jobify/appwrite-server/collections/application-collection';
import { updateWorkflowExecutionState } from '@jobify/appwrite-server/collections/workflow-collection';

export async function POST(req: NextRequest) {
    try {
        if (!process.env.WEBHOOK_SECRET) {
            return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
        }
        const secret = req.headers.get('x-webhook-secret');
        if (secret !== process.env.WEBHOOK_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const applicationId = body.applicationId as string | undefined;
        const assignmentNodeId = body.assignmentNodeId as string | undefined;

        if (!applicationId?.trim()) {
            return NextResponse.json({ error: 'applicationId is required' }, { status: 400 });
        }

        const application = await fetchApplicationById(applicationId);
        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        const nodeId = assignmentNodeId ?? body.nodeId ?? 'assignment';
        await updateWorkflowExecutionState(applicationId, nodeId, {
            submitted: true,
            submittedAt: new Date().toISOString(),
        });

        return NextResponse.json({ ok: true, applicationId, nodeId }, { status: 200 });
    } catch (error) {
        console.error('Google Form webhook error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
