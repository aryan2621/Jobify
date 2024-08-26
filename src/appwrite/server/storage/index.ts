import { RESUME_STORAGE } from '@/appwrite/name';
import { Permission, Role } from 'node-appwrite';
import { storage } from '../config';
import { v4 as uuidv4 } from 'uuid';

async function getOrCreateStorage() {
    try {
        await storage.getBucket(RESUME_STORAGE);
    } catch (error) {
        try {
            await storage.createBucket(
                RESUME_STORAGE,
                RESUME_STORAGE,
                [Permission.read(Role.any()), Permission.write(Role.any()), Permission.delete(Role.any()), Permission.update(Role.any())],
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

async function uploadResume(file: File) {
    try {
        const fileId = uuidv4();
        await storage.createFile(RESUME_STORAGE, fileId, file, [
            Permission.read(Role.any()),
            Permission.write(Role.any()),
            Permission.delete(Role.any()),
            Permission.update(Role.any()),
        ]);
        return fileId;
    } catch (error) {
        console.log('Error uploading resume', error);
        throw error;
    }
}
async function getResume(fileId: string) {
    try {
        return await storage.getFile(RESUME_STORAGE, fileId);
    } catch (error) {
        console.log('Error getting resume', error);
        throw error;
    }
}

export { getOrCreateStorage, uploadResume, getResume };
