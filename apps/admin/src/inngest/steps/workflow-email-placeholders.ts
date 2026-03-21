import type { ApplicationSnapshot, JobSnapshot } from './types';

export function candidateDisplayName(application: ApplicationSnapshot): string {
    return [application.firstName, application.lastName].filter(Boolean).join(' ') || 'Candidate';
}

/** Same tokens as notification email body/subject. */
export function expandWorkflowPlaceholders(text: string, application: ApplicationSnapshot, job: JobSnapshot): string {
    const name = candidateDisplayName(application);
    return text
        .replace(/\{\{candidate\.name\}\}/g, name)
        .replace(/\{\{candidate\.email\}\}/g, application.email ?? '')
        .replace(/\{\{job\.title\}\}/g, job.profile ?? '')
        .replace(/\{\{job\.company\}\}/g, job.company ?? '');
}
