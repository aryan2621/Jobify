export interface OAuthConfig {
    service: string;
    clientId: string;
    scope: string;
    authUrl: string;
    extraParams?: Record<string, string>;
    /** If set, used as redirect_uri (origin + path). Otherwise NEXT_PUBLIC_OAUTH_REDIRECT_URL is used. */
    redirectPath?: string;
}
