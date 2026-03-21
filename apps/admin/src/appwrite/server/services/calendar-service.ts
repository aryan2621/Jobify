import { createHash } from 'crypto';
import { ServiceProvider, Settings } from '@jobify/domain/settings';
import { OAuth2Client } from 'google-auth-library';
import * as googleCalendar from '@googleapis/calendar';
import * as googlePeople from '@googleapis/people';
import {
    createSettingsDocument,
    fetchSettingsByUserId,
    fetchSettingsByUserIdPrivate,
    updateSettings,
} from '@jobify/appwrite-server/collections/settings-collection';

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

    /**
     * Creates an event on the recruiter's primary calendar and notifies attendees (sendUpdates: all).
     * Returns without error when Calendar is not connected — caller should still send email separately.
     */
    public static async scheduleInterviewEvent(params: {
        userId: string;
        summary: string;
        description: string;
        meetingLink: string;
        start: Date;
        durationMinutes: number;
        attendeeEmails: string[];
    }): Promise<{ error?: Error }> {
        try {
            let settings: { email: string; refreshToken: string };
            try {
                settings = await fetchSettingsByUserIdPrivate(params.userId, ServiceProvider.GOOGLE_CALENDAR);
            } catch {
                return {};
            }
            if (!settings?.refreshToken) return {};

            const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
            const redirectUri = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL;
            if (!clientId?.trim() || !clientSecret?.trim() || !redirectUri?.trim()) {
                return { error: new Error('Google OAuth env vars missing for Calendar API') };
            }

            const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
            oauth2Client.setCredentials({ refresh_token: settings.refreshToken });
            const calendar = googleCalendar.calendar({ version: 'v3', auth: oauth2Client });

            const end = new Date(params.start.getTime() + Math.max(1, params.durationMinutes) * 60_000);
            const uniqueEmails = [...new Set(params.attendeeEmails.map((e) => e.trim().toLowerCase()).filter(Boolean))];

            await calendar.events.insert({
                calendarId: 'primary',
                sendUpdates: 'all',
                requestBody: {
                    summary: params.summary,
                    description: params.description,
                    location: params.meetingLink,
                    start: { dateTime: params.start.toISOString(), timeZone: 'UTC' },
                    end: { dateTime: end.toISOString(), timeZone: 'UTC' },
                    attendees: uniqueEmails.map((email) => ({ email })),
                },
            });
            return {};
        } catch (err) {
            if (err instanceof Error) return { error: err };
            return { error: new Error('Failed to create Google Calendar event') };
        }
    }
}
