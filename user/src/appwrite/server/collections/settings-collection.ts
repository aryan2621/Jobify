import { IndexType, Permission, Role } from 'node-appwrite';
import { DB_NAME, SETTINGS_COLLECTION } from '../../name';
import { database } from '../config';
import { Settings, EmailProvider } from '@/model/settings';
import { Query } from 'appwrite';

function createSettingsCollection() {
    database
        .createCollection(DB_NAME, SETTINGS_COLLECTION, SETTINGS_COLLECTION, [
            Permission.read(Role.any()),
            Permission.write(Role.any()),
            Permission.delete(Role.any()),
            Permission.update(Role.any()),
        ])
        .then(() => {
            return Promise.all([
                database.createStringAttribute(DB_NAME, SETTINGS_COLLECTION, 'id', 50, true),
                database.createStringAttribute(DB_NAME, SETTINGS_COLLECTION, 'userId', 50, true),
                database.createEnumAttribute(DB_NAME, SETTINGS_COLLECTION, 'provider', [EmailProvider.GMAIL], true),
                database.createStringAttribute(DB_NAME, SETTINGS_COLLECTION, 'accessToken', 500, false),
                database.createStringAttribute(DB_NAME, SETTINGS_COLLECTION, 'email', 50, true),
                database.createStringAttribute(DB_NAME, SETTINGS_COLLECTION, 'refreshToken', 500, false),
                database.createDatetimeAttribute(DB_NAME, SETTINGS_COLLECTION, 'createdAt', true),
                database.createDatetimeAttribute(DB_NAME, SETTINGS_COLLECTION, 'updatedAt', true),
            ]);
        })
        .catch((error) => {
            console.log('Error creating email settings attributes', error);
            throw error;
        })
        .then(() => {
            return Promise.all([
                database.createIndex(DB_NAME, SETTINGS_COLLECTION, 'id', IndexType.Fulltext, ['id'], ['ASC']),
                database.createIndex(DB_NAME, SETTINGS_COLLECTION, 'userId', IndexType.Fulltext, ['userId'], ['ASC']),
            ]);
        })
        .catch((error) => {
            console.log('Error creating indexes of email settings collection', error);
            throw error;
        });
}

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

async function fetchSettingsByUserId(userId: string) {
    try {
        const queries = [Query.equal('userId', userId)];
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
async function fetchSettingsByUserIdPrivate(userId: string) {
    try {
        const queries = [Query.equal('userId', userId)];
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

export { createSettingsCollection, createSettingsDocument, fetchSettingsByUserId, updateSettings, fetchSettingsByUserIdPrivate };
