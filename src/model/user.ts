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
        tnC: boolean
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
        this.tnC = tnC;
    }
}
