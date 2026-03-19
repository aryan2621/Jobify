export class LoginUserRequest {
    username: string;
    password: string;
    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
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
