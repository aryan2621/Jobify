import { RESUME_BUCKET, RESUME_STORAGE } from '@/appwrite/name';
import { Permission, Role } from 'node-appwrite';
import { createHash } from 'crypto';
import { storage } from '../config';
import { v4 as uuidv4 } from 'uuid';
const RESUME_BUCKET_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'];
async function getOrCreateStorage() {
    try {
        await Promise.all([storage.getBucket(RESUME_BUCKET)]);
    }
    catch (error) {
        try {
            await Promise.all([
                storage.createBucket(RESUME_BUCKET, RESUME_BUCKET, [Permission.read(Role.any()), Permission.write(Role.any()), Permission.delete(Role.any()), Permission.update(Role.any())], false, undefined, undefined, RESUME_BUCKET_EXTENSIONS),
            ]);
        }
        catch (error) {
            console.log('Error creating storage buckets', error);
        }
    }
}
function getAvatarViewUrl(fileId: string): string {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_URL?.replace(/\/v1$/, '') || '';
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
    return `${endpoint}/v1/storage/buckets/${RESUME_BUCKET}/files/${fileId}/view?project=${project}`;
}
const AVATAR_FILE_ID_PREFIX = 'avatar-';
const AVATAR_FILE_ID_MAX_LENGTH = 36;
function toAvatarFileId(userId: string): string {
    const suffix = createHash('sha256').update(userId).digest('hex').slice(0, AVATAR_FILE_ID_MAX_LENGTH - AVATAR_FILE_ID_PREFIX.length);
    return `${AVATAR_FILE_ID_PREFIX}${suffix}`;
}
async function uploadAvatar(file: File, userId: string): Promise<string> {
    const fileId = toAvatarFileId(userId);
    try {
        const permissions = [Permission.read(Role.any()), Permission.write(Role.any()), Permission.delete(Role.any()), Permission.update(Role.any())];
        try {
            await storage.createFile(RESUME_BUCKET, fileId, file, permissions);
        }
        catch (err: unknown) {
            const code = (err as {
                code?: number;
            })?.code;
            if (code === 409) {
                await storage.deleteFile(RESUME_BUCKET, fileId);
                await storage.createFile(RESUME_BUCKET, fileId, file, permissions);
            }
            else {
                throw err;
            }
        }
        return fileId;
    }
    catch (error) {
        console.log('Error uploading avatar', error);
        throw error;
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.log('Error uploading resume to bucket', error);
        throw error;
    }
}
async function getResume(fileId: string) {
    try {
        return await storage.getFileDownload(RESUME_STORAGE, fileId);
    }
    catch (error) {
        console.log('Error getting resume', error);
        throw error;
    }
}
async function getResumeFromBucket(fileId: string) {
    try {
        return await storage.getFileDownload(RESUME_BUCKET, fileId);
    }
    catch (error) {
        console.log('Error getting resume from bucket', error);
        throw error;
    }
}
export { getOrCreateStorage, uploadResume, getResume, getResumeFromBucket, uploadResumeToBucket, uploadAvatar, getAvatarViewUrl };
