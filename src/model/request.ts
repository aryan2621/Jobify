export class LoginUserRequest {
    username: string;
    password: string;
    isAdmin: boolean;
    constructor(username: string, password: string, isAdmin: boolean) {
        this.username = username;
        this.password = password;
        this.isAdmin = isAdmin;
    }
}
