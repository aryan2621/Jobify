export interface OAuthConfig {
    service: string;
    clientId: string;
    scope: string;
    authUrl: string;
    extraParams?: Record<string, string>;
}
