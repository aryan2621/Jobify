import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/inngest/client';
import { APPLICATION_SUBMITTED } from '@/inngest/constants';
import { fetchApplicationById } from '@jobify/appwrite-server/collections/application-collection';
import { fetchJobById } from '@jobify/appwrite-server/collections/job-collection';
import { getWorkflowsByUserId } from '@jobify/appwrite-server/collections/workflow-collection';

export async function POST(req: NextRequest) {
    try {
        const secret = req.headers.get('x-workflow-secret');
        if (!process.env.WORKFLOW_SECRET) {
            return NextResponse.json({ error: 'Workflow trigger not configured on server' }, { status: 503 });
        }
        if (!secret || secret !== process.env.WORKFLOW_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { applicationId, jobId } = body as { applicationId?: string; jobId?: string };

        if (!applicationId?.trim() || !jobId?.trim()) {
            return NextResponse.json({ error: 'applicationId and jobId are required' }, { status: 400 });
        }

        const [application, job] = await Promise.all([
            fetchApplicationById(applicationId),
            fetchJobById(jobId),
        ]);

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        let workflowId = (application as any).workflowId;
        if (!workflowId) {
            const adminId = (job as any).createdBy;
            const workflows = adminId ? await getWorkflowsByUserId(adminId) : [];
            workflowId = workflows.length > 0 ? ((workflows[0] as any).id ?? (workflows[0] as any).$id) : undefined;
        }

        if (!workflowId) {
            return NextResponse.json({ message: 'No workflow found for this job; nothing to trigger' }, { status: 200 });
        }

        await inngest.send({
            name: APPLICATION_SUBMITTED,
            data: { applicationId, jobId },
        });

        return NextResponse.json({ ok: true, applicationId, jobId }, { status: 200 });
    } catch (error) {
        console.error('Error triggering workflow', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
