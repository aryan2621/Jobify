import type { InterviewNode } from '@jobify/domain/workflow';
import { EmailService } from '@/appwrite/server/services/email-service';
import { CalendarService } from '@/appwrite/server/services/calendar-service';
import type { WorkflowRunContext } from './types';
import { candidateDisplayName, expandWorkflowPlaceholders } from './workflow-email-placeholders';

function uniqueEmails(emails: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const e of emails) {
        const t = e.trim();
        if (!t) continue;
        const key = t.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(t);
    }
    return out;
}

/** Email to candidate + Google Calendar invite (when recruiter connected Calendar). */
export async function runInterviewStep(ctx: WorkflowRunContext, node: InterviewNode): Promise<void> {
    const { application, job } = ctx;
    const to = application.email?.trim();
    if (!to || !job.createdBy) return;

    const link = node.link?.trim();
    if (!link) return;

    const start = node.time instanceof Date && !Number.isNaN(node.time.getTime()) ? node.time : null;
    if (!start) return;

    const durationMinutes = node.duration != null && node.duration > 0 ? node.duration : 45;
    const subject = expandWorkflowPlaceholders(`Interview: ${node.data.label} — {{job.title}}`, application, job);

    const name = EmailService.escapeHtml(candidateDisplayName(application));
    const label = EmailService.escapeHtml(node.data.label || 'Interview');
    const role = EmailService.escapeHtml(job.profile ?? 'the role');
    const whenUtc = EmailService.escapeHtml(start.toUTCString());
    const linkEscaped = EmailService.escapeHtml(link);
    const durationLabel = EmailService.escapeHtml(String(durationMinutes));
    const descHtml = EmailService.escapeHtml(node.description || '').replace(/\n/g, '<br/>');

    const html = [
        `<p>Hi ${name},</p>`,
        `<p>Your interview for <strong>${role}</strong> is scheduled.</p>`,
        `<p><strong>${label}</strong></p>`,
        `<p><strong>Time (UTC):</strong> ${whenUtc}</p>`,
        `<p><strong>Duration:</strong> ${durationLabel} minutes</p>`,
        `<p><strong>Meeting link:</strong> <a href="${linkEscaped}">${linkEscaped}</a></p>`,
        node.description ? `<div>${descHtml}</div>` : '',
    ].join('');

    const emailResult = await EmailService.sendEmail({
        userId: job.createdBy,
        to,
        subject,
        html,
    });
    if (emailResult.error) throw emailResult.error;

    const participantList = (node.participants ?? [])
        .flatMap((p) => p.split(','))
        .map((e) => e.trim())
        .filter(Boolean);
    const attendeeEmails = uniqueEmails([to, ...participantList]);

    const calSummary = expandWorkflowPlaceholders(`${node.data.label} — {{job.title}}`, application, job);
    const calDescription = expandWorkflowPlaceholders(
        [`Interview with ${candidateDisplayName(application)}`, node.description || '', `Link: ${link}`].join('\n\n'),
        application,
        job
    );

    const cal = await CalendarService.scheduleInterviewEvent({
        userId: job.createdBy,
        summary: calSummary,
        description: calDescription,
        meetingLink: link,
        start,
        durationMinutes,
        attendeeEmails,
    });
    if (cal.error) {
        console.error('[interview-step] Calendar event failed (email was sent):', cal.error.message);
    }
}
