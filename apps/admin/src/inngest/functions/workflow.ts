import { inngest } from '../client';
import { APPLICATION_SUBMITTED, WORKFLOW_STEP } from '../constants';
import {
    createWorkflowExecutionEvent,
    getActiveWorkflowForRecruiter,
    getWorkflowById,
    getWorkflowExecutionByApplicationId,
    updateWorkflowExecutionProgress,
    upsertWorkflowExecution,
} from '@jobify/appwrite-server/collections/workflow-collection';
import { fetchApplicationById } from '@jobify/appwrite-server/collections/application-collection';
import { fetchJobById as getJobById } from '@jobify/appwrite-server/collections/job-collection';
import { deserializeNode } from '@/lib/utils/workflow-utils';
import { NodeType, TaskType, type ConditionNode, type WaitNode, type WorkflowNode } from '@jobify/domain/workflow';
import {
    applicationFromDocument,
    executionFromDocument,
    getConditionOutgoingEdges,
    getFirstNodeAfterStart,
    jobFromDocument,
    planWaitSchedule,
    resolveNextNodeId,
    runNodeStep,
} from '../steps';
import type { WaitSchedulePlan } from '../steps/wait-step';

type WorkflowPayload = { applicationId: string; jobId: string; currentNodeId?: string };

function parseExecutionState(raw: unknown): Record<string, unknown> {
    if (typeof raw === 'string' && raw.length > 0) {
        try {
            return JSON.parse(raw) as Record<string, unknown>;
        } catch {
            return {};
        }
    }
    if (raw && typeof raw === 'object') return raw as Record<string, unknown>;
    return {};
}

function assertValidWaitPlan(plan: WaitSchedulePlan): void {
    if (plan.kind === 'skip') {
        throw new Error('Wait node has no valid schedule (set a duration or exact date/time)');
    }
    if (plan.kind === 'relative' && plan.sleepSeconds <= 0) {
        throw new Error('Wait node relative delay must be greater than zero');
    }
}

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
        const { applicationId, jobId: incomingJobId, currentNodeId: incomingNodeId } = data;

        const [workflowDoc, applicationDoc, jobDoc, executionDoc] = await step.run('load-data', async () => {
            const application = await fetchApplicationById(applicationId);
            if (!application) throw new Error('Application not found');

            const applicationJobId = (application as { jobId?: string }).jobId;
            if (!applicationJobId) throw new Error('Application has no job');
            if (incomingJobId && incomingJobId !== applicationJobId) {
                throw new Error('Application/job mismatch');
            }

            const job = await getJobById(applicationJobId);
            if (!job) throw new Error('Job not found');
            const recruiterId = (job as { createdBy?: string }).createdBy;
            if (!recruiterId) throw new Error('Job has no recruiter');

            const existingExecution = await getWorkflowExecutionByApplicationId(applicationId);
            const execStatus = String((existingExecution as { status?: string } | null)?.status ?? '');
            const isStepContinuation =
                incomingNodeId != null || execStatus === 'running' || execStatus === 'waiting';

            let workflowIdToLoad: string | null = null;
            if (isStepContinuation && existingExecution) {
                const wid = (existingExecution as { workflowId?: string }).workflowId;
                if (wid) workflowIdToLoad = String(wid);
            }
            if (!workflowIdToLoad) {
                const active = await getActiveWorkflowForRecruiter(recruiterId);
                const id = (active as { id?: string; $id?: string } | null)?.id ?? (active as { $id?: string } | null)?.$id;
                workflowIdToLoad = id ? String(id) : null;
            }

            if (!workflowIdToLoad) {
                return [null, application, job, existingExecution];
            }

            const workflow = await getWorkflowById(workflowIdToLoad);
            if (!workflow) return [null, application, job, existingExecution];

            const wfStatus = String((workflow as { status?: string }).status ?? '');
            if (wfStatus !== 'active') {
                if (isStepContinuation && existingExecution) {
                    await updateWorkflowExecutionProgress(applicationId, {
                        status: 'cancelled',
                        error: 'Workflow is no longer active',
                        nextRunAt: null,
                    });
                }
                return [null, application, job, existingExecution];
            }

            await upsertWorkflowExecution({
                id: applicationId,
                applicationId,
                jobId: applicationJobId,
                recruiterId,
                workflowId: workflowIdToLoad,
                status: 'running',
            });
            const execution = await getWorkflowExecutionByApplicationId(applicationId);

            return [workflow, application, job, execution];
        });

        if (!workflowDoc) {
            return { done: true, reason: 'no-workflow-for-recruiter' };
        }
        if (!applicationDoc || !jobDoc) {
            return { done: true, reason: 'missing-run-data' };
        }

        const nodes: unknown[] =
            typeof workflowDoc.nodes === 'string' ? JSON.parse(workflowDoc.nodes as string) : (workflowDoc.nodes as unknown[]);
        const edges: unknown[] =
            typeof workflowDoc.edges === 'string' ? JSON.parse(workflowDoc.edges as string) : (workflowDoc.edges as unknown[]);

        const application = applicationFromDocument(applicationDoc as Record<string, unknown>);
        const job = jobFromDocument(jobDoc as Record<string, unknown>);
        const execution = executionDoc as Record<string, unknown> | null;
        const executionState = execution ? parseExecutionState(execution.state) : {};
        const workflowState = (executionState.workflowState as Record<string, unknown> | undefined) ?? {};
        const executionSnapshot = executionFromDocument({
            stage: execution?.stage,
            status: applicationDoc.status,
            currentNodeId: execution?.currentNodeId,
            workflowState,
        });

        const ctx = { applicationId, jobId: job.id, application, execution: executionSnapshot, job };
        const executionId = String(execution?.id ?? execution?.$id ?? applicationId);
        const recruiterId = String(job.createdBy ?? '');
        const workflowId = String(workflowDoc.id ?? workflowDoc.$id ?? '');

        const currentNodeId =
            incomingNodeId ?? executionSnapshot.currentNodeId ?? getFirstNodeAfterStart(nodes, edges);
        if (!currentNodeId) return { done: true, reason: 'no-next-node' };

        const nodeRaw = (nodes as { id?: string }[]).find((n) => n.id === currentNodeId);
        if (!nodeRaw) return { done: true, reason: 'node-not-found' };
        const node = deserializeNode(nodeRaw);

        await createWorkflowExecutionEvent({
            executionId,
            applicationId,
            jobId: job.id,
            recruiterId,
            workflowId,
            nodeId: currentNodeId,
            nodeType: String(node.type),
            stepType: node.type === NodeType.TASK ? String(node.taskType) : String(node.type),
            status: 'started',
            input: { applicationId, jobId: job.id, currentNodeId },
        });

        try {
            await step.run(`node:${currentNodeId}`, async () => {
                await runNodeStep(ctx, node);
            });
            await createWorkflowExecutionEvent({
                executionId,
                applicationId,
                jobId: job.id,
                recruiterId,
                workflowId,
                nodeId: currentNodeId,
                nodeType: String(node.type),
                stepType: node.type === NodeType.TASK ? String(node.taskType) : String(node.type),
                status: 'completed',
                output: { ok: true },
            });
        } catch (error) {
            await createWorkflowExecutionEvent({
                executionId,
                applicationId,
                jobId: job.id,
                recruiterId,
                workflowId,
                nodeId: currentNodeId,
                nodeType: String(node.type),
                stepType: node.type === NodeType.TASK ? String(node.taskType) : String(node.type),
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown step error',
            });
            await updateWorkflowExecutionProgress(applicationId, {
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown step error',
            });
            throw error;
        }

        const nextNodeId = resolveNextNodeId(edges, currentNodeId, node, executionSnapshot);

        if (node.type === NodeType.TASK && node.taskType === TaskType.CONDITION && nextNodeId === null) {
            const branchCount = ((node as ConditionNode).conditions ?? []).length;
            const conditionOutgoing = getConditionOutgoingEdges(edges, currentNodeId, branchCount);
            if (conditionOutgoing.length === 0) {
                throw new Error('Condition node has no outgoing edges');
            }
            throw new Error('Condition node had no matching branch and no default (else) edge');
        }

        let nodeToRunNext = nextNodeId;

        const nextRaw = nextNodeId ? (nodes as { id?: string }[]).find((n) => n.id === nextNodeId) : null;
        const nextNode = nextRaw ? deserializeNode(nextRaw) : null;

        const currentIsWait =
            node.type === NodeType.TASK && (node as WorkflowNode).taskType === TaskType.WAIT;
        const nextIsWait =
            nextNode?.type === NodeType.TASK && (nextNode as WorkflowNode).taskType === TaskType.WAIT;
        const isEnd = nextNode?.type === NodeType.END;

        if (currentIsWait && !nextNodeId) {
            throw new Error('Wait node must have an outgoing edge');
        }

        if (!currentIsWait && nextIsWait && nextNodeId && nextNode) {
            nodeToRunNext = resolveNextNodeId(edges, nextNodeId, nextNode as WaitNode, executionSnapshot) ?? nextNodeId;
        }

        let waitNodeToSchedule: WaitNode | null = null;
        if (currentIsWait) {
            waitNodeToSchedule = node as WaitNode;
        } else if (nextIsWait && nextNode) {
            waitNodeToSchedule = nextNode as WaitNode;
        }

        await updateWorkflowExecutionProgress(applicationId, {
            currentNodeId: nodeToRunNext ?? currentNodeId,
            status: 'running',
            error: null,
        });

        if (!nextNodeId) {
            await updateWorkflowExecutionProgress(applicationId, {
                status: 'completed',
                completedAt: new Date().toISOString(),
                nextRunAt: null,
            });
            return { done: true };
        }
        if (isEnd) {
            await updateWorkflowExecutionProgress(applicationId, {
                status: 'completed',
                completedAt: new Date().toISOString(),
                nextRunAt: null,
            });
            return { done: true };
        }

        if (waitNodeToSchedule) {
            const plan = planWaitSchedule(waitNodeToSchedule);
            assertValidWaitPlan(plan);
            if (plan.kind === 'exact') {
                await updateWorkflowExecutionProgress(applicationId, {
                    status: 'waiting',
                    nextRunAt: new Date(plan.ts).toISOString(),
                });
                await step.sendEvent('resume-after-wait', {
                    name: WORKFLOW_STEP,
                    data: { applicationId, jobId: job.id, currentNodeId: nodeToRunNext },
                    ts: plan.ts,
                });
                return { done: false, scheduled: true };
            }
            if (plan.kind === 'relative') {
                await updateWorkflowExecutionProgress(applicationId, {
                    status: 'waiting',
                    nextRunAt: new Date(Date.now() + plan.sleepSeconds * 1000).toISOString(),
                });
                await step.sleep('wait-duration', `${plan.sleepSeconds}s`);
            }
        }

        await inngest.send({
            name: WORKFLOW_STEP,
            data: { applicationId, jobId: job.id, currentNodeId: nodeToRunNext },
        });
        return { done: false };
    }
);
