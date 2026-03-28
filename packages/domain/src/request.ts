export class LoginUserRequest {
    username: string;
    password: string;
    recaptchaToken: string;
    constructor(username: string, password: string, recaptchaToken: string) {
        this.username = username;
        this.password = password;
        this.recaptchaToken = recaptchaToken;
    }
}
export class UserApplicationsRequest {
    lastId: string | null;
    limit: number | null;
    constructor(lastId: string | null, limit: number | null) {
        this.lastId = lastId;
        this.limit = limit;
    }
}
