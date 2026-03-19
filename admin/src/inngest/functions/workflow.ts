import { inngest } from '../client';
import { getWorkflowById } from '@/appwrite/server/collections/workflow-collection';
import { fetchApplicationById, updateApplicationWorkflowProgress } from '@/appwrite/server/collections/application-collection';
import { fetchJobById as getJobById } from '@/appwrite/server/collections/job-collection';
import { EmailService } from '@/appwrite/server/services/email-service';
import { deserializeNode } from '@/lib/utils/workflow-utils';
import { NodeType, TaskType } from '@/model/workflow';

const APPLICATION_SUBMITTED = 'application/submitted';
const WORKFLOW_STEP = 'workflow/step';

type WorkflowPayload = { applicationId: string; jobId: string; currentNodeId?: string };

function getNextNodeId(nodes: any[], edges: any[], currentNodeId: string): string | null {
    const outgoing = edges.filter((e: any) => e.source === currentNodeId);
    if (outgoing.length === 0) return null;
    return outgoing[0].target;
}

function getFirstNodeAfterStart(nodes: any[], edges: any[]): string | null {
    const start = nodes.find((n: any) => n.type === NodeType.START);
    if (!start) return null;
    return getNextNodeId(nodes, edges, start.id);
}

export const runWorkflowStep = inngest.createFunction(
    {
        id: 'run-workflow-step',
        name: 'Run workflow step',
        triggers: [
            { event: APPLICATION_SUBMITTED },
            { event: WORKFLOW_STEP },
        ],
        idempotency: 'event.data.applicationId + "-" + (event.data.currentNodeId ?? "start")',
    },
    async ({ event, step }) => {
        const data = event.data as WorkflowPayload;
        const { applicationId, jobId, currentNodeId: incomingNodeId } = data;

        const [workflowDoc, applicationDoc, jobDoc] = await step.run('load-data', async () => {
            const application = await fetchApplicationById(applicationId);
            if (!application) throw new Error('Application not found');
            const workflowId = (application as { workflowId?: string }).workflowId;
            if (!workflowId) throw new Error('Application has no workflow');
            const workflow = await getWorkflowById(workflowId);
            if (!workflow) throw new Error('Workflow not found');
            const job = await getJobById(jobId);
            if (!job) throw new Error('Job not found');
            return [workflow, application, job];
        });

        const nodes: any[] = typeof workflowDoc.nodes === 'string' ? JSON.parse(workflowDoc.nodes) : workflowDoc.nodes;
        const edges: any[] = typeof workflowDoc.edges === 'string' ? JSON.parse(workflowDoc.edges) : workflowDoc.edges;
        const application = applicationDoc as { id: string; email?: string; firstName?: string; lastName?: string; workflowId?: string; stage?: string; currentNodeId?: string };
        const job = jobDoc as { id: string; profile?: string; company?: string; createdBy?: string };

        const currentNodeId =
            incomingNodeId ?? (application.currentNodeId as string | undefined) ?? getFirstNodeAfterStart(nodes, edges);
        if (!currentNodeId) return { done: true, reason: 'no-next-node' };

        const nodeRaw = nodes.find((n: any) => n.id === currentNodeId);
        if (!nodeRaw) return { done: true, reason: 'node-not-found' };
        const node = deserializeNode(nodeRaw);

        await step.run('execute-node', async () => {
            if (node.type === NodeType.TASK) {
                const task = node as any;
                if (task.taskType === TaskType.NOTIFY && task.data?.emailConfig?.to) {
                    const to = task.data.emailConfig.to.replace('{{candidate.email}}', application.email ?? '').trim() || application.email;
                    const subject = (task.data.emailConfig.subject ?? '')
                        .replace(/\{\{candidate\.name\}\}/g, [application.firstName, application.lastName].filter(Boolean).join(' ') || 'Candidate')
                        .replace(/\{\{job\.title\}\}/g, job.profile ?? '')
                        .replace(/\{\{job\.company\}\}/g, job.company ?? '');
                    const body = (task.data.emailConfig.body ?? '')
                        .replace(/\{\{candidate\.name\}\}/g, [application.firstName, application.lastName].filter(Boolean).join(' ') || 'Candidate')
                        .replace(/\{\{candidate\.email\}\}/g, application.email ?? '')
                        .replace(/\{\{job\.title\}\}/g, job.profile ?? '')
                        .replace(/\{\{job\.company\}\}/g, job.company ?? '');
                    if (to && job.createdBy) {
                        const result = await EmailService.sendEmail({
                            userId: job.createdBy,
                            to,
                            subject,
                            html: body.replace(/\n/g, '<br/>'),
                        });
                        if (result.error) throw result.error;
                    }
                } else if (task.taskType === TaskType.UPDATE_STATUS && task.stage) {
                    await updateApplicationWorkflowProgress(applicationId, { stage: task.stage });
                }
            }
        });

        let nextNodeId = getNextNodeId(nodes, edges, currentNodeId);
        let nodeToRunNext = nextNodeId;

        const nextRaw = nextNodeId ? nodes.find((n: any) => n.id === nextNodeId) : null;
        const nextNode = nextRaw ? deserializeNode(nextRaw) : null;
        const isWait = nextNode?.type === NodeType.TASK && (nextNode as any).taskType === TaskType.WAIT;
        const waitNode = isWait ? (nextNode as any) : null;
        const isEnd = nextNode?.type === NodeType.END;

        if (isWait && waitNode) {
            nodeToRunNext = getNextNodeId(nodes, edges, nextNodeId) ?? nextNodeId;
        }

        await updateApplicationWorkflowProgress(applicationId, { currentNodeId: nodeToRunNext ?? currentNodeId });

        if (!nextNodeId) return { done: true };
        if (isEnd) return { done: true };

        if (isWait && waitNode?.exactDateTime) {
            await step.sendEvent('resume-after-wait', {
                name: WORKFLOW_STEP,
                data: { applicationId, jobId, currentNodeId: nodeToRunNext },
                ts: new Date(waitNode.exactDateTime).getTime(),
            });
            return { done: false, scheduled: true };
        }
        if (isWait && waitNode?.duration != null && waitNode?.unit) {
            const ms = { minutes: 60e3, hours: 3600e3, days: 86400e3, weeks: 604800e3 }[waitNode.unit] ?? 86400e3;
            await step.sleep('wait-duration', `${(waitNode.duration * ms) / 1000}s`);
        }

        await inngest.send({
            name: WORKFLOW_STEP,
            data: { applicationId, jobId, currentNodeId: nodeToRunNext },
        });
        return { done: false };
    }
);
</think>
Fixing the workflow function: loading application first to obtain workflowId.
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
StrReplace