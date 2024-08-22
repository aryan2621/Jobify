import { RESUME_STORAGE } from '@/appwrite/name';
import { Permission, Role } from 'node-appwrite';
import { storage } from '../config';

export default async function getOrCreateStorage() {
    try {
        await storage.getBucket(RESUME_STORAGE);
    } catch (error) {
        try {
            await storage.createBucket(
                RESUME_STORAGE,
                RESUME_STORAGE,
                [
                    Permission.read(Role.any()),
                    Permission.write(Role.any()),
                    Permission.delete(Role.any()),
                    Permission.update(Role.any()),
                ],
                false,
                undefined,
                undefined,
                ['pdf']
            );
        } catch (error) {
            console.log('Error creating storage collection', error);
            throw error;
        }
    }
}
