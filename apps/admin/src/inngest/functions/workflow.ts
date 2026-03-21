import { inngest } from '../client';
import { APPLICATION_SUBMITTED, WORKFLOW_STEP } from '../constants';
import { getWorkflowById } from '@jobify/appwrite-server/collections/workflow-collection';
import { fetchApplicationById, updateApplicationWorkflowProgress } from '@jobify/appwrite-server/collections/application-collection';
import { fetchJobById as getJobById } from '@jobify/appwrite-server/collections/job-collection';
import { deserializeNode } from '@/lib/utils/workflow-utils';
import { NodeType, TaskType, type WaitNode } from '@jobify/domain/workflow';
import {
    applicationFromDocument,
    getFirstNodeAfterStart,
    jobFromDocument,
    planWaitSchedule,
    resolveNextNodeId,
    runNodeStep,
} from '../steps';

type WorkflowPayload = { applicationId: string; jobId: string; currentNodeId?: string };

export const runWorkflowStep = inngest.createFunction(
    {
        id: 'run-workflow-step',
        name: 'Run workflow step',
        triggers: [
            { event: APPLICATION_SUBMITTED },
            { event: WORKFLOW_STEP },
        ],
        idempotency: 'event.data.applicationId + "-" + (event.data.currentNodeId != null ? event.data.currentNodeId : "start")',
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

        const nodes: unknown[] =
            typeof workflowDoc.nodes === 'string' ? JSON.parse(workflowDoc.nodes as string) : (workflowDoc.nodes as unknown[]);
        const edges: unknown[] =
            typeof workflowDoc.edges === 'string' ? JSON.parse(workflowDoc.edges as string) : (workflowDoc.edges as unknown[]);

        const application = applicationFromDocument(applicationDoc as Record<string, unknown>);
        const job = jobFromDocument(jobDoc as Record<string, unknown>);
        const ctx = { applicationId, jobId, application, job };

        const currentNodeId =
            incomingNodeId ?? application.currentNodeId ?? getFirstNodeAfterStart(nodes, edges);
        if (!currentNodeId) return { done: true, reason: 'no-next-node' };

        const nodeRaw = (nodes as { id?: string }[]).find((n) => n.id === currentNodeId);
        if (!nodeRaw) return { done: true, reason: 'node-not-found' };
        const node = deserializeNode(nodeRaw);

        await step.run(`node:${currentNodeId}`, async () => {
            await runNodeStep(ctx, node);
        });

        const nextNodeId = resolveNextNodeId(edges, currentNodeId, node, application);
        let nodeToRunNext = nextNodeId;

        const nextRaw = nextNodeId ? (nodes as { id?: string }[]).find((n) => n.id === nextNodeId) : null;
        const nextNode = nextRaw ? deserializeNode(nextRaw) : null;
        const isWait = nextNode?.type === NodeType.TASK && (nextNode as { taskType?: TaskType }).taskType === TaskType.WAIT;
        const waitNode = isWait ? (nextNode as WaitNode) : null;
        const isEnd = nextNode?.type === NodeType.END;

        if (isWait && waitNode) {
            nodeToRunNext = resolveNextNodeId(edges, nextNodeId!, waitNode, application) ?? nextNodeId!;
        }

        await updateApplicationWorkflowProgress(applicationId, { currentNodeId: nodeToRunNext ?? currentNodeId });

        if (!nextNodeId) return { done: true };
        if (isEnd) return { done: true };

        if (isWait && waitNode) {
            const plan = planWaitSchedule(waitNode);
            if (plan.kind === 'exact') {
                await step.sendEvent('resume-after-wait', {
                    name: WORKFLOW_STEP,
                    data: { applicationId, jobId, currentNodeId: nodeToRunNext },
                    ts: plan.ts,
                });
                return { done: false, scheduled: true };
            }
            if (plan.kind === 'relative' && plan.sleepSeconds > 0) {
                await step.sleep('wait-duration', `${plan.sleepSeconds}s`);
            }
        }

        await inngest.send({
            name: WORKFLOW_STEP,
            data: { applicationId, jobId, currentNodeId: nodeToRunNext },
        });
        return { done: false };
    }
);
