import { Job } from '@/model/job';
import { database } from '../config';
import { DB_NAME, JOB_COLLECTION } from '@/appwrite/name';
import { Query } from 'appwrite';

async function createJobDocument(job: Job) {
    try {
        return await database.createDocument(DB_NAME, JOB_COLLECTION, job.id, {
            id: job.id,
            profile: job.profile,
            description: job.description,
            company: job.company,
            type: job.type,
            workplaceType: job.workplaceType,
            lastDateToApply: job.lastDateToApply,
            location: job.location,
            skills: job.skills,
            rejectionContent: job.rejectionContent,
            selectionContent: job.selectionContent,
            createdAt: job.createdAt,
            state: job.state,
            createdBy: job.createdBy,
            workflowId: job.workflowId ?? undefined,
        });
    } catch (error) {
        console.log('Error creating job document', error);
        throw error;
    }
}

async function fetchJobById(id: string) {
    try {
        return await database.getDocument(DB_NAME, JOB_COLLECTION, id);
    } catch (error) {
        console.log('Error fetching job by id', error);
        throw error;
    }
}
async function fetchJobsByUserId(userId: string) {
    try {
        const posts = await database.listDocuments(DB_NAME, JOB_COLLECTION, [Query.equal('createdBy', userId)]);
        return posts.documents;
    } catch (error) {
        console.log('Error fetching jobs by user id', error);
        throw error;
    }
}

async function fetchJobsByUserIdPaginated(userId: string, lastId?: string | null, limit?: number | null) {
    try {
        const queries = [Query.equal('createdBy', userId)];
        if (lastId) {
            queries.push(Query.cursorAfter(lastId));
        }
        if (limit) {
            queries.push(Query.limit(limit));
        }
        const posts = await database.listDocuments(DB_NAME, JOB_COLLECTION, queries);
        return posts.documents;
    } catch (error) {
        console.log('Error fetching jobs by user id (paginated)', error);
        throw error;
    }
}

async function countJobsByUserId(userId: string): Promise<number> {
    try {
        const posts = await database.listDocuments(DB_NAME, JOB_COLLECTION, [
            Query.equal('createdBy', userId),
            Query.limit(1),
        ]);
        return typeof posts.total === 'number' ? posts.total : posts.documents.length;
    } catch (error) {
        console.log('Error counting jobs by user', error);
        throw error;
    }
}

async function deleteJobDocument(jobId: string) {
    try {
        return await database.deleteDocument(DB_NAME, JOB_COLLECTION, jobId);
    } catch (error) {
        console.log('Error deleting job document', error);
        throw error;
    }
}

async function updateJobDocument(job: Job) {
    try {
        return await database.updateDocument(DB_NAME, JOB_COLLECTION, job.id, {
            profile: job.profile,
            description: job.description,
            company: job.company,
            type: job.type,
            workplaceType: job.workplaceType,
            lastDateToApply: job.lastDateToApply,
            location: job.location,
            skills: job.skills,
            rejectionContent: job.rejectionContent,
            selectionContent: job.selectionContent,
            state: job.state,
            workflowId: job.workflowId ?? undefined,
        });
    } catch (error) {
        console.log('Error updating job document', error);
        throw error;
    }
}

export {
    countJobsByUserId,
    createJobDocument,
    deleteJobDocument,
    fetchJobById,
    fetchJobsByUserId,
    fetchJobsByUserIdPaginated,
    updateJobDocument,
};
