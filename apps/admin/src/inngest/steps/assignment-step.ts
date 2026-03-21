import type { AssignmentNode } from '@jobify/domain/workflow';
import { EmailService } from '@/appwrite/server/services/email-service';
import type { WorkflowRunContext } from './types';
import { candidateDisplayName, expandWorkflowPlaceholders } from './workflow-email-placeholders';

function getUserAppBaseUrl(): string {
    const configured = process.env.NEXT_PUBLIC_USER_APP_URL?.trim().replace(/\/$/, '');
    if (configured) return configured;
    if (process.env.NODE_ENV === 'development') return 'http://localhost:3000';
    return '';
}

/** Sends assignment instructions to the candidate via the job owner's Gmail. */
export async function runAssignmentStep(ctx: WorkflowRunContext, node: AssignmentNode): Promise<void> {
    const { application, job, applicationId } = ctx;
    const to = application.email?.trim();
    if (!to || !job.createdBy) return;

    const url = node.url?.trim();
    if (!url) return;

    const subject = expandWorkflowPlaceholders(`Assignment: ${node.data.label} — {{job.title}}`, application, job);
    const deadlineStr = node.deadline && !Number.isNaN(node.deadline.getTime()) ? node.deadline.toUTCString() : '';

    const base = getUserAppBaseUrl();
    const submitOnPortal = base
        ? `${base}/applications/${encodeURIComponent(applicationId)}/assignment/${encodeURIComponent(node.id)}`
        : '';

    const name = EmailService.escapeHtml(candidateDisplayName(application));
    const label = EmailService.escapeHtml(node.data.label || 'Assignment');
    const role = EmailService.escapeHtml(job.profile ?? 'the role');
    const deadlineHtml = EmailService.escapeHtml(deadlineStr);
    const briefUrlEscaped = EmailService.escapeHtml(url);
    const submitEscaped = submitOnPortal ? EmailService.escapeHtml(submitOnPortal) : '';
    const descHtml = EmailService.escapeHtml(node.description || '').replace(/\n/g, '<br/>');

    const submitBlock = submitOnPortal
        ? [
              `<p><strong>Where to submit your work:</strong></p>`,
              `<p>Open this page, sign in with the same email you used to apply, and upload your submission before the deadline:</p>`,
              `<p><a href="${submitEscaped}">${submitEscaped}</a></p>`,
          ].join('')
        : `<p><strong>Where to submit:</strong> Log in to the candidate portal, open <strong>My applications</strong>, select this job, and use the assignment submission page for this task. (Ask the employer if you need the portal link.)</p>`;

    const html = [
        `<p>Hi ${name},</p>`,
        `<p>Please complete the following assignment for <strong>${role}</strong>.</p>`,
        `<p><strong>${label}</strong></p>`,
        deadlineStr ? `<p><strong>Deadline (UTC):</strong> ${deadlineHtml}</p>` : '',
        `<p><strong>Assignment brief / materials (read &amp; complete here):</strong></p>`,
        `<p><a href="${briefUrlEscaped}">${briefUrlEscaped}</a></p>`,
        submitBlock,
        node.description ? `<p><strong>Instructions from the team:</strong></p><div>${descHtml}</div>` : '',
    ].join('');

    const result = await EmailService.sendEmail({
        userId: job.createdBy,
        to,
        subject,
        html,
    });
    if (result.error) throw result.error;
}
