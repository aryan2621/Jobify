import { RESUME_STORAGE } from '@/appwrite/name';
import { storage } from '../config';

function getResumeFromClient(fileId: string) {
    try {
        return storage.getFileDownload(RESUME_STORAGE, fileId);
    } catch (error) {
        console.log('Error getting resume', error);
        throw error;
    }
}

export { getResumeFromClient };
