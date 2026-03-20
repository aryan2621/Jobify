import { DB_NAME, SETTINGS_COLLECTION } from '../../name';
import { database } from '../config';
import { Settings, ServiceProvider } from '@/model/settings';
import { Query } from 'appwrite';

async function createSettingsDocument(settings: Settings) {
    try {
        return await database.createDocument(DB_NAME, SETTINGS_COLLECTION, settings.id, {
            id: settings.id,
            userId: settings.userId,
            provider: settings.provider,
            email: settings.email,
            accessToken: settings.accessToken,
            refreshToken: settings.refreshToken,
            createdAt: settings.createdAt,
            updatedAt: settings.updatedAt,
        });
    } catch (error) {
        console.log('Error creating email settings document', error);
        throw error;
    }
}

async function fetchSettingsByUserId(userId: string, provider?: ServiceProvider) {
    try {
        const queries = [Query.equal('userId', userId)];
        if (provider === ServiceProvider.GOOGLE_CALENDAR) {
            queries.push(Query.equal('provider', ServiceProvider.GOOGLE_CALENDAR));
        } else if (provider) {
            queries.push(Query.equal('provider', provider));
        }
        const records = await database.listDocuments(DB_NAME, SETTINGS_COLLECTION, queries);
        if (records.documents.length > 0) {
            const doc = records.documents[0];
            return {
                id: doc.id,
                userId: doc.userId,
                provider: doc.provider,
                email: doc.email,
                accessToken: doc.accessToken,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            };
        }
        throw new Error('Email settings not found');
    } catch (error) {
        console.log('Error fetching email settings by user id', error);
        throw error;
    }
}

async function fetchSettingsByUserIdPrivate(userId: string, provider: ServiceProvider = ServiceProvider.GMAIL) {
    try {
        const queries = [Query.equal('userId', userId)];
        if (provider === ServiceProvider.GOOGLE_CALENDAR) {
            queries.push(Query.equal('provider', ServiceProvider.GOOGLE_CALENDAR));
        } else {
            queries.push(Query.equal('provider', provider));
        }
        const records = await database.listDocuments(DB_NAME, SETTINGS_COLLECTION, queries);
        if (records.documents.length > 0) {
            return {
                email: records.documents[0].email,
                accessToken: records.documents[0].accessToken,
                refreshToken: records.documents[0].refreshToken,
            };
        }
        throw new Error('Email settings not found');
    } catch (error) {
        console.log('Error fetching email settings by user id', error);
        throw error;
    }
}

async function updateSettings(settings: Settings) {
    try {
        return await database.updateDocument(DB_NAME, SETTINGS_COLLECTION, settings.id, {
            provider: settings.provider,
            email: settings.email,
            accessToken: settings.accessToken,
            refreshToken: settings.refreshToken,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.log('Error updating email settings', error);
        throw error;
    }
}

export { createSettingsDocument, fetchSettingsByUserId, updateSettings, fetchSettingsByUserIdPrivate };
