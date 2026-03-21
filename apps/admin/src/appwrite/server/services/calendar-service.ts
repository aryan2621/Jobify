import { createHash } from 'crypto';
import { ServiceProvider, Settings } from '@jobify/domain/settings';
import { OAuth2Client } from 'google-auth-library';
import * as googlePeople from '@googleapis/people';
import { createSettingsDocument, fetchSettingsByUserId, updateSettings } from '@jobify/appwrite-server/collections/settings-collection';

/** Appwrite documentId: max 36 chars, [a-zA-Z0-9._-], must not start with special char. */
function calendarDocumentId(userId: string): string {
    const hash = createHash('sha256').update(`${userId}_google_calendar`).digest('hex');
    return hash.slice(0, 36);
}

export class CalendarService {
    public static async connectToCalendar(authCode: string, userId: string): Promise<void> {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL;

        if (!clientId?.trim() || !clientSecret?.trim() || !redirectUri?.trim()) {
            throw new Error(
                'Calendar OAuth is misconfigured: ensure NEXT_PUBLIC_GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and NEXT_PUBLIC_OAUTH_REDIRECT_URL are set in .env.'
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
            calendarDocumentId(userId),
            userId,
            ServiceProvider.GOOGLE_CALENDAR,
            primaryEmail,
            tokens.access_token ?? undefined,
            tokens.refresh_token,
            now,
            now
        );

        try {
            const existing = await fetchSettingsByUserId(userId, ServiceProvider.GOOGLE_CALENDAR);
            await updateSettings(
                new Settings(
                    existing.id,
                    userId,
                    ServiceProvider.GOOGLE_CALENDAR,
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
}
