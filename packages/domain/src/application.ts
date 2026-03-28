export class Education {
    college: string;
    degree: string;
    degreeType: DegreeType;
    sgpa: number;
    constructor(college: string, degree: string, degreeType: DegreeType, sgpa: number) {
        this.college = college;
        this.degree = degree;
        this.degreeType = degreeType;
        this.sgpa = sgpa;
    }
}
export enum Gender {
    Male = 'Male',
    Female = 'Female',
    Other = 'Other'
}
export enum DegreeType {
    BACHELOR = 'Bachelor',
    MASTER = 'Master',
    DOCTORATE = 'Doctorate',
    HIGH_SCHOOL = 'High School',
    DIPLOMA = 'Diploma',
    CERTIFICATE = 'Certificate',
    INTERMEDIATE = 'Intermediate'
}
export class Experience {
    profile: string;
    company: string;
    employer: string;
    isCurrent: boolean;
    startDate: string;
    endDate: string;
    yoe: number;
    constructor(profile: string, company: string, employer: string, isCurrent: boolean, startDate: string, endDate: string, yoe: number) {
        this.profile = profile;
        this.company = company;
        this.employer = employer;
        this.isCurrent = isCurrent;
        this.startDate = startDate;
        this.endDate = endDate;
        this.yoe = yoe;
    }
}
export enum ApplicationStatus {
    APPLIED = 'Applied',
    REJECTED = 'Rejected',
    SELECTED = 'Selected',
}

const APPLICATION_STATUS_VALUES = new Set<string>(Object.values(ApplicationStatus));

/** Normalizes persisted values for the application document `status` field. */
export function parseApplicationStatus(raw: unknown): ApplicationStatus {
    if (typeof raw !== 'string') return ApplicationStatus.APPLIED;
    const v = raw.trim();
    return APPLICATION_STATUS_VALUES.has(v) ? (v as ApplicationStatus) : ApplicationStatus.APPLIED;
}

/** Detailed pipeline position for a candidacy (per job application). */
export enum ApplicationStage {
    APPLIED = 'applied',
    REJECTED = 'rejected',
    SHORTLISTED = 'shortlisted',
    ASSIGNMENT_SENT = 'assignment_sent',
    ASSIGNMENT_SUBMITTED = 'assignment_submitted',
    INTERVIEW_SCHEDULED = 'interview_scheduled',
    INTERVIEW_DONE = 'interview_done',
    OFFER_SENT = 'offer_sent',
    HIRED = 'hired',
    WITHDRAWN = 'withdrawn',
}

const APPLICATION_STAGE_VALUES = new Set<string>(Object.values(ApplicationStage));

/** Normalizes persisted values for the application document `stage` field. */
export function parseApplicationStage(raw: unknown): ApplicationStage {
    if (typeof raw !== 'string') return ApplicationStage.APPLIED;
    const v = raw.trim();
    return APPLICATION_STAGE_VALUES.has(v) ? (v as ApplicationStage) : ApplicationStage.APPLIED;
}

/** Typical funnel order for recruiter-facing dropdowns. */
export const APPLICATION_STAGE_PIPELINE_ORDER: ApplicationStage[] = [
    ApplicationStage.APPLIED,
    ApplicationStage.SHORTLISTED,
    ApplicationStage.ASSIGNMENT_SENT,
    ApplicationStage.ASSIGNMENT_SUBMITTED,
    ApplicationStage.INTERVIEW_SCHEDULED,
    ApplicationStage.INTERVIEW_DONE,
    ApplicationStage.OFFER_SENT,
    ApplicationStage.HIRED,
    ApplicationStage.REJECTED,
    ApplicationStage.WITHDRAWN,
];

export enum JobSource {
    LINKEDIN = 'LinkedIn',
    ANGEL_LIST = 'Angel List',
    REFERRAL = 'Referral',
    JOB_PORTAL = 'Job Portal',
    COMPANY_WEBSITE = 'Company Website',
    OTHER = 'Other'
}
export class Application {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    currentLocation: string;
    gender: Gender;
    education: Education[];
    experience: Experience[];
    skills: string[];
    source: JobSource;
    resume: string;
    socialLinks: string[];
    coverLetter: string;
    status: ApplicationStatus;
    /** Pipeline detail (shortlisted, assignment submitted, …). */
    stage: ApplicationStage;
    jobId: string;
    createdAt: string;
    createdBy: string;
    constructor(
        id: string,
        firstName: string,
        lastName: string,
        email: string,
        phone: string,
        currentLocation: string,
        gender: Gender,
        education: Education[],
        experience: Experience[],
        skills: string[],
        source: JobSource,
        resume: string,
        socialLinks: string[],
        coverLetter: string,
        status: ApplicationStatus,
        stage: ApplicationStage,
        jobId: string,
        createdAt: string,
        createdBy: string,
    ) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.currentLocation = currentLocation;
        this.gender = gender;
        this.education = education;
        this.experience = experience;
        this.skills = skills;
        this.source = source;
        this.resume = resume;
        this.socialLinks = socialLinks;
        this.coverLetter = coverLetter;
        this.status = status;
        this.stage = stage;
        this.jobId = jobId;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
    }
}
