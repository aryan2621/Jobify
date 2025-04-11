export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}
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
    role: UserRole;
    workflows: string[];
    constructor(
        id: string,
        firstName: string,
        lastName: string,
        username: string,
        email: string,
        password: string,
        confirmPassword: string,
        createdAt: string,
        jobs: string[],
        applications: string[],
        role: UserRole,
        tnC: boolean,
        workflows: string[]
    ) {
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
        this.role = role;
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
    role: UserRole;
    jobs: string[] = [];
    applications: string[] = [];

    constructor(
        firstName: string,
        lastName: string,
        password: string,
        confirmPassword: string,
        email: string,
        username: string,
        role: UserRole,
        jobs: string[],
        applications: string[]
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.email = email;
        this.username = username;
        this.role = role;
        this.jobs = jobs;
        this.applications = applications;
    }
}
