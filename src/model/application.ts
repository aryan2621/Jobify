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

export enum JobSource {
    LINKEDIN = 'LinkedIn',
    ANGEL_LIST = 'Angel List',
    REFERRAL = 'Referral',
    JOB_PORTAL = 'Job Portal',
    COMPANY_WEBSITE = 'Company Website',
    OTHER = 'Other',
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
        jobId: string,
        createdAt: string,
        createdBy: string
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
        this.jobId = jobId;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
    }
}
