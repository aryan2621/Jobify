import { OAuthConfig } from '@/model/oauth';
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

export const gmailOAuthConfig: OAuthConfig = {
    service: 'Gmail',
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    scope: 'profile email https://www.googleapis.com/auth/gmail.send',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    extraParams: {
        access_type: 'offline',
        prompt: 'consent',
    },
};
