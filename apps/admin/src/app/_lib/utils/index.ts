import { Job, JobState, JobType, WorkplaceTypes } from '@jobify/domain/job';

export const ADMIN_NEW_JOB_DRAFT_KEY = 'jobify_admin_new_job_draft';

export type NewJobDraftPayload = {
    job: Job;
    page: number;
    newSkill: string;
};

export function parseJobFromDraft(raw: unknown): Job | null {
    if (!raw || typeof raw !== 'object') return null;
    const o = raw as Record<string, unknown>;
    try {
        return new Job(
            String(o.id ?? ''),
            String(o.profile ?? ''),
            String(o.description ?? ''),
            String(o.company ?? ''),
            (o.type as JobType) ?? JobType.FULL_TIME,
            (o.workplaceType as WorkplaceTypes) ?? WorkplaceTypes.ONSITE,
            String(o.lastDateToApply ?? ''),
            String(o.location ?? ''),
            Array.isArray(o.skills) ? (o.skills as unknown[]).map(String) : [],
            String(o.rejectionContent ?? ''),
            String(o.selectionContent ?? ''),
            String(o.createdAt ?? new Date().toISOString()),
            (o.state as JobState) ?? JobState.DRAFT,
            String(o.createdBy ?? ''),
            o.workflowId != null && o.workflowId !== '' ? String(o.workflowId) : undefined
        );
    } catch {
        return null;
    }
}

export function saveNewJobDraft(payload: NewJobDraftPayload): void {
    if (typeof window === 'undefined') return;
    try {
        const plain = {
            ...payload.job,
            skills: [...(payload.job.skills ?? [])],
        };
        localStorage.setItem(
            ADMIN_NEW_JOB_DRAFT_KEY,
            JSON.stringify({
                job: plain,
                page: payload.page,
                newSkill: payload.newSkill,
            })
        );
    } catch (e) {
        console.error('Failed to save new job draft', e);
    }
}

export function loadNewJobDraft(): NewJobDraftPayload | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(ADMIN_NEW_JOB_DRAFT_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { job?: unknown; page?: unknown; newSkill?: unknown };
        const job = parseJobFromDraft(parsed.job);
        if (!job) return null;
        const maxStep = 5;
        const page =
            typeof parsed.page === 'number' && parsed.page >= 1 && parsed.page <= maxStep ? parsed.page : 1;
        const newSkill = typeof parsed.newSkill === 'string' ? parsed.newSkill : '';
        return { job, page, newSkill };
    } catch {
        return null;
    }
}

export function clearNewJobDraft(): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(ADMIN_NEW_JOB_DRAFT_KEY);
    } catch (e) {
        console.error('Failed to clear new job draft', e);
    }
}

export const REJECTION_EMAIL_CONTENT = `Dear {applicant_name},

Thank you for applying for the {job_title} position at {company_name}. We appreciate the time and effort you've put into your application.

After careful consideration of your qualifications and experience, we have decided to move forward with other candidates who more closely match our current requirements for this role.

We encourage you to apply for future positions that match your skills and interests.

Best regards,
{company_name} HR Team`;

export const SELECTION_EMAIL_CONTENT = `Dear {applicant_name},

We are pleased to inform you that you have been selected for the {job_title} position at {company_name}.

Your qualifications and experience impressed our team, and we believe you will be a valuable addition to our organization. 

Please respond to this email to confirm your acceptance, and we will provide further details about the next steps.

Congratulations, and welcome to the team!

Best regards,
{company_name} HR Team`;

export const predefinedSkills = [
    'JavaScript',
    'TypeScript',
    'React',
    'Angular',
    'Vue.js',
    'Node.js',
    'Python',
    'Java',
    'C#',
    'C++',
    'Go',
    'Ruby',
    'Swift',
    'PHP',
    'AWS',
    'Azure',
    'GCP',
    'Docker',
    'Kubernetes',
    'CI/CD',
    'SQL',
    'NoSQL',
    'MongoDB',
    'Redis',
    'GraphQL',
    'REST API',
    'HTML',
    'CSS',
    'Sass',
    'UI/UX',
    'Figma',
    'Adobe XD',
    'Git',
    'Agile',
    'Scrum',
    'DevOps',
    'TDD',
    'Security',
];

export type ValidationState = {
    [key: string]: {
        valid: boolean;
        message: string;
        touched: boolean;
    };
};

export const FORM_STEPS = [
    { id: 1, title: 'Basic Info', description: 'Job title and description' },
    { id: 2, title: 'Job Details', description: 'Type, location and deadline' },
    { id: 3, title: 'Required Skills', description: 'Select skills needed' },
    { id: 4, title: 'Email Templates', description: 'Customize email responses' },
    { id: 5, title: 'Review', description: 'Preview and submit' },
];
export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};
