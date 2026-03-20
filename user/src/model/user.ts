export class User {
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
