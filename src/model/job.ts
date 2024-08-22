export enum JobType {
    FULL_TIME = 'Full Time',
    PART_TIME = 'Part Time',
    INTERNSHIP = 'Internship',
    CONTRACT = 'Contract',
    FREELANCE = 'Freelance',
    TEMPORARY = 'Temporary',
}

export enum WorkplaceTypes {
    REMOTE = 'Remote',
    HYBRID = 'Hybrid',
    ONSITE = 'Onsite',
}

export enum JobSource {
    LINKEDIN = 'LinkedIn',
    ANGEL_LIST = 'Angel List',
    REFERRAL = 'Referral',
    JOB_PORTAL = 'Job Portal',
    COMPANY_WEBSITE = 'Company Website',
    OTHER = 'Other',
}

export class Job {
    id: string;
    profile: string;
    description: string;
    type: JobType;
    workplaceType: WorkplaceTypes;
    source: JobSource;
    lastDateToApply: string;
    location: string;
    skills: string[];
    rejectionContent: string;
    selectionContent: string;
    createdAt: string;
    createdBy: string;
    applications: string[];

    constructor(
        id: string,
        profile: string,
        description: string,
        type: JobType,
        workplaceType: WorkplaceTypes,
        source: JobSource,
        lastDateToApply: string,
        location: string,
        skills: string[],
        rejectionContent: string,
        selectionContent: string,
        createdAt: string,
        createdBy: string,
        applications: string[]
    ) {
        this.id = id;
        this.profile = profile;
        this.description = description;
        this.type = type;
        this.workplaceType = workplaceType;
        this.source = source;
        this.lastDateToApply = lastDateToApply;
        this.location = location;
        this.skills = skills;
        this.rejectionContent = rejectionContent;
        this.selectionContent = selectionContent;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.applications = applications;
    }
}
