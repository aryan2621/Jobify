import { createHash } from 'crypto';
import { ServiceProvider, Settings } from '@/model/settings';
import { OAuth2Client } from 'google-auth-library';
import * as googlePeople from '@googleapis/people';
import * as googleGmail from '@googleapis/gmail';
import { createSettingsDocument, fetchSettingsByUserId, fetchSettingsByUserIdPrivate, updateSettings } from '../collections/settings-collection';

/** Appwrite documentId: max 36 chars, [a-zA-Z0-9._-], must not start with special char. */
function gmailDocumentId(userId: string): string {
    const hash = createHash('sha256').update(`${userId}_gmail`).digest('hex');
    return hash.slice(0, 36);
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function makeEmail(to: string, from: string, subject: string, html: string): string {
    const str = [
        `To: ${to}`,
        `From: ${from}`,
        `Subject: ${subject}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        '',
        html,
    ].join('\r\n');

    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}


async function getGmailClient(userId: string): Promise<{ gmail: googleGmail.gmail_v1.Gmail; fromEmail: string } | null> {
    let settings: { email: string; refreshToken: string };
    try {
        settings = await fetchSettingsByUserIdPrivate(userId);
    } catch {
        return null;
    }
    if (!settings?.refreshToken) return null;

    const oauth2Client = new OAuth2Client(
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        process.env.GOOGLE_CLIENT_SECRET!,
        process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL!
    );
    oauth2Client.setCredentials({ refresh_token: settings.refreshToken });
    const gmail = googleGmail.gmail({ version: 'v1', auth: oauth2Client });
    return { gmail, fromEmail: settings.email };
}

export class EmailService {
    
    public static async connectToGmail(authCode: string, userId: string): Promise<void> {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL;

        if (!clientId?.trim() || !clientSecret?.trim() || !redirectUri?.trim()) {
            throw new Error(
                'Gmail OAuth is misconfigured: ensure NEXT_PUBLIC_GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and NEXT_PUBLIC_OAUTH_REDIRECT_URL are set in .env. Use a Web application OAuth client in Google Cloud Console.'
            );
        }

        const client = new OAuth2Client(clientId, clientSecret, redirectUri);

        const { tokens } = await client.getToken(authCode);

        if (!tokens.refresh_token) {
            throw new Error(
                'No refresh token from Google. Revoke this app’s access in your Google Account (Security → Third-party access), then connect again to get a new refresh token.'
            );
        }

        client.setCredentials(tokens);

        const people = googlePeople.people({ version: 'v1', auth: client });
        const userInfo = await people.people.get({
            resourceName: 'people/me',
            personFields: 'emailAddresses,names',
        });
        const primaryEmail = userInfo.data.emailAddresses?.[0]?.value ?? '';

        const now = new Date().toISOString();
        const settings = new Settings(
            gmailDocumentId(userId),
            userId,
            ServiceProvider.GMAIL,
            primaryEmail,
            tokens.access_token ?? undefined,
            tokens.refresh_token,
            now,
            now
        );

        try {
            const existing = await fetchSettingsByUserId(userId, ServiceProvider.GMAIL);
            await updateSettings(
                new Settings(
                    existing.id,
                    userId,
                    ServiceProvider.GMAIL,
                    primaryEmail,
                    tokens.access_token ?? undefined,
                    tokens.refresh_token,
                    existing.createdAt ?? now,
                    now
                )
            );
        } catch {
            await createSettingsDocument(settings);
        }
    }

    
    public static async sendEmail(params: {
        userId: string;
        to: string;
        subject: string;
        html: string;
    }): Promise<{ error?: Error }> {
        try {
            const client = await getGmailClient(params.userId);
            if (!client) {
                return { error: new Error('Gmail not connected for this user') };
            }

            const raw = makeEmail(params.to, client.fromEmail, params.subject, params.html);
            await client.gmail.users.messages.send({
                userId: 'me',
                requestBody: { raw },
            });
            return {};
        } catch (err) {
            if (err instanceof Error) return { error: err };
            return { error: new Error('Failed to send email via Gmail API') };
        }
    }

    
    public static escapeHtml(s: string): string {
        return escapeHtml(s);
    }
}
