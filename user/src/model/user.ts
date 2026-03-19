export class User {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    createdAt: string;
    jobs: string[];
    applications: string[];
    tnC: boolean;
    workflows: string[];
    avatarFileId?: string;
    constructor(id: string, firstName: string, lastName: string, username: string, email: string, password: string, confirmPassword: string, createdAt: string, jobs: string[], applications: string[], tnC: boolean, workflows: string[]) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
        this.jobs = jobs;
        this.applications = applications;
        this.confirmPassword = confirmPassword;
        this.tnC = tnC;
        this.workflows = workflows;
    }
}
export class Profile {
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    email: string;
    username: string;
    jobs: string[] = [];
    applications: string[] = [];
    constructor(firstName: string, lastName: string, password: string, confirmPassword: string, email: string, username: string, jobs: string[], applications: string[]) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.email = email;
        this.username = username;
        this.jobs = jobs;
        this.applications = applications;
    }
}
