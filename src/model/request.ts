export class LoginUserRequest {
    username: string;
    password: string;
    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }
}
export class UserApplicationsRequest {
    pageSize: number;
    lastRecordId: string;
    foward: boolean;

    constructor(pageSize: number, lastRecordId: string, foward: boolean) {
        this.pageSize = pageSize;
        this.lastRecordId = lastRecordId;
        this.foward = foward;
    }
}
