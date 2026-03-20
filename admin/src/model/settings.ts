export enum ServiceProvider {
    GMAIL = 'gmail',
    GOOGLE_CALENDAR = 'calendar',
}

export class Settings {
    id: string;
    userId: string;
    provider: ServiceProvider;
    email: string;
    accessToken?: string;
    refreshToken?: string;
    createdAt: string;
    updatedAt: string;

    constructor(
        id: string,
        userId: string,
        provider: ServiceProvider,
        email: string,
        accessToken?: string,
        refreshToken?: string,
        createdAt?: string,
        updatedAt?: string,
    ) {
        this.id = id;
        this.userId = userId;
        this.provider = provider;
        this.email = email;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.createdAt = createdAt || new Date().toISOString();
        this.updatedAt = updatedAt || new Date().toISOString();
    }
}
