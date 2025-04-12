import { EmailProvider, Settings } from '@/model/settings';
import { OAuth2Client } from 'google-auth-library';
import * as google from '@googleapis/people';
import { createSettingsDocument } from '../collections/settings-collection';

export class EmailService {
    public static async connectToGmail(authCode: string, userId: string): Promise<void> {
        try {
            const client = new OAuth2Client(
                process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                process.env.GOOGLE_CLIENT_SECRET!,
                process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL!
            );

            const { tokens } = await client.getToken(authCode);
            client.setCredentials(tokens);

            const people = google.people({ version: 'v1', auth: client });
            const userInfo = await people.people.get({
                resourceName: 'people/me',
                personFields: 'emailAddresses,names',
            });

            const primaryEmail = userInfo.data.emailAddresses?.[0]?.value || '';
            const settings = new Settings(
                userId,
                userId,
                EmailProvider.GMAIL,
                primaryEmail,
                tokens.access_token!!,
                tokens.refresh_token!!,
                new Date().toISOString(),
                new Date().toISOString()
            );
            await createSettingsDocument(settings);
        } catch (error) {
            console.error('Error connecting to Gmail:', JSON.stringify(error, null, 2));
            throw error;
        }
    }
}
