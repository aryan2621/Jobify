import { USER_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Application } from '@jobify/domain/application';
import { fetchJobById } from '@jobify/appwrite-server/collections/job-collection';
import {
    createApplicationDocument,
    fetchApplicationById,
    updateApplicationStatus,
    hasApplicationByUserAndJob,
} from '@jobify/appwrite-server/collections/application-collection';
import {
    getWorkflowById,
    getWorkflowsByUserId,
    updateWorkflowExecutionState,
} from '@jobify/appwrite-server/collections/workflow-collection';
import { isRecognisedError, NotFoundError, UnauthorizedError, ForbiddenError } from '@jobify/domain/error';
import { toPublicApplication } from '@jobify/domain/api-serializers';
import { TaskType } from '@jobify/domain/workflow';

async function triggerWorkflow(applicationId: string, jobId: string) {
    const adminUrl = process.env.ADMIN_APP_URL;
    const workflowSecret = process.env.WORKFLOW_SECRET;
    if (!adminUrl || !workflowSecret) {
        console.warn('ADMIN_APP_URL or WORKFLOW_SECRET not set; skipping workflow trigger');
        return;
    }
    try {
        const res = await fetch(`${adminUrl}/api/trigger-workflow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-workflow-secret': workflowSecret,
            },
            body: JSON.stringify({ applicationId, jobId }),
        });
        if (!res.ok) {
            console.warn('Failed to trigger workflow for application', applicationId, await res.text());
        }
    } catch (error) {
        console.error('Error triggering workflow after application submit', error);
    }
}

export async function GET(req: NextRequest) {
    const token = req.cookies.get(USER_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const userId = (user as any).id as string;
        const applicationId = req.nextUrl.searchParams.get('id');
        if (!applicationId) {
            throw new NotFoundError('Application id is required');
        }

        const application = await fetchApplicationById(applicationId);
        if (!application) {
            throw new NotFoundError('Requested application does not exist');
        }
        if ((application.createdBy as string) !== userId) {
            throw new ForbiddenError('You are not allowed to access this application');
        }

        const nodeId = req.nextUrl.searchParams.get('nodeId');
        if (nodeId) {
            const job = await fetchJobById(application.jobId as string);
            if (!job) {
                throw new NotFoundError('Requested job does not exist');
            }
            const recruiterId = job.createdBy as string | undefined;
            if (!recruiterId) {
                throw new NotFoundError('Workflow owner not found');
            }

            const workflows = await getWorkflowsByUserId(recruiterId);
            const workflowRef = workflows?.[0] as { id?: string; $id?: string } | undefined;
            const workflowId = workflowRef?.id ?? workflowRef?.$id;
            if (!workflowId) {
                throw new NotFoundError('Workflow not found');
            }
            const workflow = await getWorkflowById(workflowId);
            if (!workflow) {
                throw new NotFoundError('Workflow not found');
            }

            const rawNodes = typeof workflow.nodes === 'string' ? JSON.parse(workflow.nodes as string) : (workflow.nodes as unknown[]);
            const node = (rawNodes as Array<Record<string, unknown>>).find((n) => String(n.id ?? '') === nodeId);
            if (!node) {
                throw new NotFoundError('Assignment step not found');
            }
            if (String(node.type ?? '') !== 'task' || String(node.taskType ?? '') !== TaskType.ASSIGNMENT) {
                throw new ForbiddenError('Requested node is not an assignment step');
            }

            return NextResponse.json(
                {
                    id: String(node.id ?? ''),
                    label: String((node.data as { label?: string } | undefined)?.label ?? 'Assignment'),
                    description: String(node.description ?? ''),
                    url: String(node.url ?? ''),
                    deadline: node.deadline ? String(node.deadline) : null,
                    submissionTracking: String(node.submissionTracking ?? 'none'),
                },
                { status: 200 }
            );
        }

        return NextResponse.json(toPublicApplication(application as unknown as Record<string, unknown>), { status: 200 });
    } catch (error: any) {
        console.log('Error while fetching application', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ message: 'Error while fetching application' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const token = req.cookies.get(USER_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const id = (user as any).id;
        const body = (await req.json()) as Application;
        body.createdBy = id;
        const job = await fetchJobById(body.jobId);
        if (!job) {
            throw new NotFoundError('Requested job does not exist');
        }
        if (job.lastDateToApply < Date.now()) {
            throw new UnauthorizedError('Application deadline has passed');
        }
        if (job.createdBy === id) {
            throw new UnauthorizedError('You cannot apply to your own job');
        }
        const alreadyApplied = await hasApplicationByUserAndJob(id, body.jobId);
        if (alreadyApplied) {
            throw new UnauthorizedError('You have already applied to this job');
        }

        await createApplicationDocument(body);
        await triggerWorkflow(body.id, body.jobId);
        return NextResponse.json({ message: 'Application posted successfully' }, { status: 201 });
    }
    catch (error: any) {
        console.log('Error while posting application', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ message: 'Error while posting application' }, { status: 500 });
    }
}
export async function PUT(req: NextRequest) {
    const token = req.cookies.get(USER_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const userId = (user as any).id;
        const body = await req.json();
        const isAssignmentSubmit = body?.action === 'submit-assignment';
        if (isAssignmentSubmit) {
            const applicationId = String(body.applicationId ?? '');
            const nodeId = String(body.nodeId ?? '');
            if (!applicationId || !nodeId) {
                throw new NotFoundError('applicationId and nodeId are required');
            }
            const application = await fetchApplicationById(applicationId);
            if (!application) {
                throw new NotFoundError('Requested application does not exist');
            }
            if ((application.createdBy as string) !== userId) {
                throw new ForbiddenError('You are not allowed to submit for this application');
            }

            const submittedAt = new Date().toISOString();
            await updateWorkflowExecutionState(applicationId, nodeId, { submitted: true, submittedAt });
            return NextResponse.json({ message: 'Assignment submitted successfully' }, { status: 200 });
        }

        const { jobId, applicationId, status } = body;
        const [job, application] = await Promise.all([fetchJobById(jobId), fetchApplicationById(applicationId)]);
        if (!job || !application) {
            throw new NotFoundError('Requested job or application does not exist');
        }
        if (job.createdBy !== userId) {
            throw new UnauthorizedError('You are not the owner of this job');
        }
        if (application.jobId !== jobId) {
            throw new ForbiddenError('Application does not belong to this job');
        }
        await updateApplicationStatus(jobId, applicationId, status);
        return NextResponse.json({ message: 'Application updated successfully' }, { status: 200 });
    }
    catch (error: any) {
        console.log('Error while updating application', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ message: 'Error while updating application' }, { status: 500 });
    }
}