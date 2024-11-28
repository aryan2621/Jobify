import { RESUME_BUCKET, RESUME_STORAGE } from '@/appwrite/name';
import { Permission, Role } from 'node-appwrite';
import { storage } from '../config';
import { v4 as uuidv4 } from 'uuid';

async function getOrCreateStorage() {
    try {
        await Promise.all([storage.getBucket(RESUME_STORAGE), storage.getBucket(RESUME_BUCKET)]);
    } catch (error) {
        try {
            await Promise.all([
                storage.createBucket(
                    RESUME_STORAGE,
                    RESUME_STORAGE,
                    [Permission.read(Role.any()), Permission.write(Role.any()), Permission.delete(Role.any()), Permission.update(Role.any())],
                    false,
                    undefined,
                    undefined,
                    ['pdf']
                ),
                storage.createBucket(
                    RESUME_BUCKET,
                    RESUME_BUCKET,
                    [Permission.read(Role.any()), Permission.write(Role.any()), Permission.delete(Role.any()), Permission.update(Role.any())],
                    false,
                    undefined,
                    undefined,
                    ['pdf']
                ),
            ]);
        } catch (error) {
            console.log('Error creating storage collection', error);
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

async function uploadResumeToBucket(file: File) {
    try {
        const fileId = uuidv4();
        await storage.createFile(RESUME_BUCKET, fileId, file, [
            Permission.read(Role.any()),
            Permission.write(Role.any()),
            Permission.delete(Role.any()),
            Permission.update(Role.any()),
        ]);
        return fileId;
    } catch (error) {
        console.log('Error uploading resume to bucket', error);
        throw error;
    }
}

async function getResume(fileId: string) {
    try {
        return await storage.getFileDownload(RESUME_STORAGE, fileId);
    } catch (error) {
        console.log('Error getting resume', error);
        throw error;
    }
}

async function getResumeFromBucket(fileId: string) {
    try {
        return await storage.getFileDownload(RESUME_BUCKET, fileId);
    } catch (error) {
        console.log('Error getting resume from bucket', error);
        throw error;
    }
}

export { getOrCreateStorage, uploadResume, getResume, getResumeFromBucket, uploadResumeToBucket };
