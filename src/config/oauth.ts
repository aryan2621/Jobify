import { OAuthConfig } from '@/model/oauth';
export const googleDriveOAuthConfig: OAuthConfig = {
    service: 'Google',
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    scope: 'profile email https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    extraParams: {
        access_type: 'offline',
        prompt: 'consent',
    },
};

export const googleCalenderOAuthConfig: OAuthConfig = {
    service: 'Google',
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    scope: 'profile email https://www.googleapis.com/auth/calendar',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    extraParams: {
        access_type: 'offline',
        prompt: 'consent',
    },
};
export const githubOAuthConfig: OAuthConfig = {
    service: 'GitHub',
    clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
    scope: 'repo user',
    authUrl: 'https://github.com/login/oauth/authorize',
    extraParams: {
        allow_signup: 'true',
    },
};
