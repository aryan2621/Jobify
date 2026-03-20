export class User {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    createdAt: string;
    jobCount: number;
    workflowCount: number;
    avatarFileId?: string;

    avatarUrl?: string | null;
    constructor(
        id: string,
        firstName: string,
        lastName: string,
        username: string,
        email: string,
        password: string,
        confirmPassword: string,
        createdAt: string,
        jobCount = 0,
        workflowCount = 0
    ) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
        this.confirmPassword = confirmPassword;
        this.jobCount = jobCount;
        this.workflowCount = workflowCount;
    }
}

export class Profile {
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    email: string;
    username: string;

    constructor(
        firstName: string,
        lastName: string,
        password: string,
        confirmPassword: string,
        email: string,
        username: string
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.email = email;
        this.username = username;
    }
}
