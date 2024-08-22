export class Education {
    college: string;
    degree: string;
    degreeType: DegreeType;
    sgpa: string;

    constructor(
        college: string,
        degree: string,
        degreeType: DegreeType,
        sgpa: string
    ) {
        this.college = college;
        this.degree = degree;
        this.degreeType = degreeType;
        this.sgpa = sgpa;
    }
}

export enum Gender {
    Male = 'Male',
    Female = 'Female',
    Other = 'Other',
}
export enum DegreeType {
    BACHELOR = 'Bachelor',
    MASTER = 'Master',
    DOCTORATE = 'Doctorate',
    HIGH_SCHOOL = 'High School',
    DIPLOMA = 'Diploma',
    CERTIFICATE = 'Certificate',
    INTERMEDIATE = 'Intermediate',
}
export class Experience {
    profile: string;
    company: string;
    employer: string;
    isCurrent: boolean;
    startDate: string;
    endDate: string;
    yoe: number;

    constructor(
        profile: string,
        company: string,
        employer: string,
        isCurrent: boolean,
        startDate: string,
        endDate: string,
        yoe: number
    ) {
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
    resume: string;
    socialLinks: string[];
    coverLetter: string;
    status: ApplicationStatus;
    jobId: string;
    createdAt: string;
    createdBy: string;
}
