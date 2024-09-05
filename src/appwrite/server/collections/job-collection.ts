import { IndexType, Permission, Role } from 'node-appwrite';
import { Job, JobType, WorkplaceTypes } from '@/model/job';
import { database } from '../config';
import { DB_NAME, JOB_COLLECTION } from '@/appwrite/name';
import { Query } from 'appwrite';

function createJobCollection() {
    database
        .createCollection(DB_NAME, JOB_COLLECTION, JOB_COLLECTION, [
            Permission.read(Role.any()),
            Permission.write(Role.any()),
            Permission.delete(Role.any()),
            Permission.update(Role.any()),
        ])
        .then(() => {
            return Promise.all([
                database.createStringAttribute(DB_NAME, JOB_COLLECTION, 'id', 50, true),
                database.createStringAttribute(DB_NAME, JOB_COLLECTION, 'profile', 50, true),
                database.createStringAttribute(DB_NAME, JOB_COLLECTION, 'description', 200, false),
                database.createStringAttribute(DB_NAME, JOB_COLLECTION, 'company', 20, true),
                database.createEnumAttribute(
                    DB_NAME,
                    JOB_COLLECTION,
                    'type',
                    [JobType.FULL_TIME, JobType.PART_TIME, JobType.INTERNSHIP, JobType.CONTRACT, JobType.FREELANCE, JobType.TEMPORARY],
                    true
                ),
                database.createEnumAttribute(
                    DB_NAME,
                    JOB_COLLECTION,
                    'workplaceType',
                    [WorkplaceTypes.REMOTE, WorkplaceTypes.HYBRID, WorkplaceTypes.ONSITE],
                    true
                ),

                database.createDatetimeAttribute(DB_NAME, JOB_COLLECTION, 'lastDateToApply', true),
                database.createStringAttribute(DB_NAME, JOB_COLLECTION, 'location', 50, true),
                database.createStringAttribute(DB_NAME, JOB_COLLECTION, 'skills', 200, true),
                database.createStringAttribute(DB_NAME, JOB_COLLECTION, 'rejectionContent', 300, true),
                database.createStringAttribute(DB_NAME, JOB_COLLECTION, 'selectionContent', 300, true),
                database.createDatetimeAttribute(DB_NAME, JOB_COLLECTION, 'createdAt', true),
                database.createStringAttribute(DB_NAME, JOB_COLLECTION, 'createdBy', 50, true),
                database.createStringAttribute(DB_NAME, JOB_COLLECTION, 'applications', 200, false, undefined, true),
            ]);
        })
        .catch((error) => {
            console.log('Error creating user attributes of job collection', error);
            throw error;
        })
        .then(() => {
            return Promise.all([
                database.createIndex(DB_NAME, JOB_COLLECTION, 'id', IndexType.Fulltext, ['id'], ['ASC']),
                database.createIndex(DB_NAME, JOB_COLLECTION, 'createdBy', IndexType.Fulltext, ['createdBy'], ['ASC']),
            ]);
        })
        .catch((error) => {
            console.log('Error creating indexes of job collection', error);
            throw error;
        });
}
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
            createdBy: job.createdBy,
            applications: job.applications,
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
async function fetchAllJobs(lastId: string | null, limit: number | null) {
    try {
        const queries = [];
        if (lastId) {
            queries.push(Query.cursorAfter(lastId));
        }
        if (limit) {
            queries.push(Query.limit(limit));
        }
        const posts =
            queries.length > 0
                ? await database.listDocuments(DB_NAME, JOB_COLLECTION, queries)
                : await database.listDocuments(DB_NAME, JOB_COLLECTION);
        return posts.documents;
    } catch (error) {
        console.log('Error fetching all jobs', error);
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
async function setApplicationIdToJob(jobId: string, applicationId: string) {
    try {
        const job = await fetchJobById(jobId);
        job.applications.push(applicationId);
        return await database.updateDocument(DB_NAME, JOB_COLLECTION, job.id, {
            applications: Array.from(new Set(job.applications)),
        });
    } catch (error) {
        console.log('Error setting application id to job', error);
        throw error;
    }
}

export { createJobCollection, createJobDocument, fetchJobById, fetchAllJobs, fetchJobsByUserId, setApplicationIdToJob };
