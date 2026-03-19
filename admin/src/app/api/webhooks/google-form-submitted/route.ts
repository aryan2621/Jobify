import { NextRequest, NextResponse } from 'next/server';
import { fetchApplicationById } from '@/appwrite/server/collections/application-collection';
import { updateApplicationWorkflowState } from '@/appwrite/server/collections/application-collection';


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const applicationId = body.applicationId as string | undefined;
        const assignmentNodeId = body.assignmentNodeId as string | undefined;

        if (!applicationId?.trim()) {
            return NextResponse.json({ error: 'applicationId is required' }, { status: 400 });
        }

        const secret = req.headers.get('x-webhook-secret');
        if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const application = await fetchApplicationById(applicationId);
        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        const nodeId = assignmentNodeId ?? body.nodeId ?? 'assignment';
        await updateApplicationWorkflowState(applicationId, nodeId, {
            submitted: true,
            submittedAt: new Date().toISOString(),
        });

        return NextResponse.json({ ok: true, applicationId, nodeId }, { status: 200 });
    } catch (error) {
        console.error('Google Form webhook error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
