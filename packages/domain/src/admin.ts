/** Employer / recruiter account stored in the `admins` collection (separate from job seekers in `users`). */
export class Admin {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    createdAt: string;
    avatarFileId?: string;

    constructor(
        id: string,
        firstName: string,
        lastName: string,
        username: string,
        email: string,
        password: string,
        confirmPassword: string,
        createdAt: string
    ) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
        this.confirmPassword = confirmPassword;
    }
}
