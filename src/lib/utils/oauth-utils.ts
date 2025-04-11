import { OAuthConfig } from '@/model/oauth';
export function getOAuthUrl(config: OAuthConfig): string {
    const redirectUrl = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL! + '/oauth';
    const params = new URLSearchParams();
    params.set('authUrl', config.authUrl);
    params.set('client_id', config.clientId);
    params.set('scope', config.scope);
    params.set('prompt', 'select_account');
    params.set('redirect_uri', redirectUrl);
    params.set('service', config.service);
    if (config.extraParams) {
        for (const [key, value] of Object.entries(config.extraParams)) {
            params.set(key, value);
        }
    }
    return redirectUrl + `?${params.toString()}`;
}
