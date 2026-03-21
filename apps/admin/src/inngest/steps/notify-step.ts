import type { NotificationNode } from '@jobify/domain/workflow';
import { EmailService } from '@/appwrite/server/services/email-service';
import type { WorkflowRunContext } from './types';
import { expandWorkflowPlaceholders } from './workflow-email-placeholders';

export async function runNotifyStep(ctx: WorkflowRunContext, node: NotificationNode): Promise<void> {
    const toRaw = node.data?.emailConfig?.to;
    if (!toRaw) return;

    const { application, job } = ctx;
    const to = expandWorkflowPlaceholders(toRaw, application, job).trim() || (application.email ?? '');
    const subject = expandWorkflowPlaceholders(node.data.emailConfig?.subject ?? '', application, job);
    const body = expandWorkflowPlaceholders(node.data.emailConfig?.body ?? '', application, job);

    if (!to || !job.createdBy) return;

    const result = await EmailService.sendEmail({
        userId: job.createdBy,
        to,
        subject,
        html: body.replace(/\n/g, '<br/>'),
    });
    if (result.error) throw result.error;
}
