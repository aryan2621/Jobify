import { IndexType, Permission, Role } from 'node-appwrite';
import { DB_NAME, APPLICATION_COLLECTION } from '../../name';
import { database } from '../config';
import { Application, ApplicationStatus, Gender, JobSource } from '@/model/application';
import { Query } from 'appwrite';
import { UserApplicationsRequest } from '@/model/request';

function createApplicationCollection() {
    database
        .createCollection(DB_NAME, APPLICATION_COLLECTION, APPLICATION_COLLECTION, [
            Permission.read(Role.any()),
            Permission.write(Role.any()),
            Permission.delete(Role.any()),
            Permission.update(Role.any()),
        ])
        .then(() => {
            return Promise.all([
                database.createStringAttribute(DB_NAME, APPLICATION_COLLECTION, 'id', 50, true),
                database.createStringAttribute(DB_NAME, APPLICATION_COLLECTION, 'firstName', 50, true),
                database.createStringAttribute(DB_NAME, APPLICATION_COLLECTION, 'lastName', 50, true),
                database.createEmailAttribute(DB_NAME, APPLICATION_COLLECTION, 'email', true),
                database.createStringAttribute(DB_NAME, APPLICATION_COLLECTION, 'phone', 50, true),
                database.createStringAttribute(DB_NAME, APPLICATION_COLLECTION, 'currentLocation', 50, true),
                database.createEnumAttribute(DB_NAME, APPLICATION_COLLECTION, 'gender', [Gender.Female, Gender.Male, Gender.Other], true),
                database.createStringAttribute(DB_NAME, APPLICATION_COLLECTION, 'education', 200, true),
                database.createStringAttribute(DB_NAME, APPLICATION_COLLECTION, 'experience', 200, true),
                database.createStringAttribute(DB_NAME, APPLICATION_COLLECTION, 'skills', 200, true),
                database.createEnumAttribute(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'source',
                    [JobSource.LINKEDIN, JobSource.ANGEL_LIST, JobSource.REFERRAL, JobSource.JOB_PORTAL, JobSource.COMPANY_WEBSITE, JobSource.OTHER],
                    true
                ),
                database.createStringAttribute(DB_NAME, APPLICATION_COLLECTION, 'resume', 50, true),
                database.createStringAttribute(DB_NAME, APPLICATION_COLLECTION, 'socialLinks', 200, true),
                database.createStringAttribute(DB_NAME, APPLICATION_COLLECTION, 'coverLetter', 300, true),
                database.createEnumAttribute(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'status',
                    [ApplicationStatus.APPLIED, ApplicationStatus.SELECTED, ApplicationStatus.REJECTED],
                    true
                ),
                database.createStringAttribute(DB_NAME, APPLICATION_COLLECTION, 'jobId', 50, true),
                database.createDatetimeAttribute(DB_NAME, APPLICATION_COLLECTION, 'createdAt', true),
                database.createStringAttribute(DB_NAME, APPLICATION_COLLECTION, 'createdBy', 50, true),
            ]);
        })
        .catch((error) => {
            console.log('Error creating user attributes of application collection', error);
            throw error;
        })
        .then(() => {
            return Promise.all([
                database.createIndex(DB_NAME, APPLICATION_COLLECTION, 'id', IndexType.Fulltext, ['id'], ['ASC']),
                database.createIndex(DB_NAME, APPLICATION_COLLECTION, 'jobId', IndexType.Fulltext, ['jobId'], ['ASC']),
                database.createIndex(DB_NAME, APPLICATION_COLLECTION, 'createdBy', IndexType.Fulltext, ['createdBy'], ['ASC']),
            ]);
        })
        .catch((error) => {
            console.log('Error creating indexes of application collection', error);
            throw error;
        });
}

async function createApplicationDocument(application: Application) {
    try {
        return await database.createDocument(DB_NAME, APPLICATION_COLLECTION, application.id, {
            id: application.id,
            firstName: application.firstName,
            lastName: application.lastName,
            email: application.email,
            phone: application.phone,
            currentLocation: application.currentLocation,
            gender: application.gender,
            education: application.education ?? [],
            experience: application.experience ?? [],
            skills: application.skills ?? [],
            source: application.source,
            resume: application.resume,
            socialLinks: application.socialLinks ?? [],
            coverLetter: application.coverLetter,
            status: application.status,
            jobId: application.jobId,
            createdAt: application.createdAt,
            createdBy: application.createdBy,
        });
    } catch (error) {
        console.log('Error creating application document', error);
        throw error;
    }
}

async function fetchApplicationById(id: string) {
    try {
        return await database.getDocument(DB_NAME, APPLICATION_COLLECTION, id);
    } catch (error) {
        console.log('Error fetching application by id', error);
        throw error;
    }
}

async function fetchApplicationsByJobId(jobId: string, request?: UserApplicationsRequest) {
    try {
        const queries = [Query.equal('jobId', jobId)];
        if (request?.lastId) {
            queries.push(Query.cursorAfter(request.lastId));
        }
        if (request?.limit) {
            queries.push(Query.limit(request.limit));
        }
        const records = await database.listDocuments(DB_NAME, APPLICATION_COLLECTION, queries);
        return records.documents;
    } catch (error) {
        console.log('Error fetching application by job id', error);
        throw error;
    }
}

async function updateApplicationStatus(jobId: string, applicationId: string, status: ApplicationStatus) {
    try {
        return await database.updateDocument(DB_NAME, APPLICATION_COLLECTION, applicationId, {
            status: status,
        });
    } catch (error) {
        console.log('Error updating application status', error);
        throw error;
    }
}

async function fetchApplicationsByUserId(userId: string, request?: UserApplicationsRequest) {
    try {
        const queries = [Query.equal('createdBy', userId)];
        if (request?.lastId) {
            queries.push(Query.cursorAfter(request.lastId));
        }
        if (request?.limit) {
            queries.push(Query.limit(request.limit));
        }
        const records = await database.listDocuments(DB_NAME, APPLICATION_COLLECTION, queries);
        return records.documents;
    } catch (error) {
        console.log('Error fetching applications by user id', error);
        throw error;
    }
}

export {
    createApplicationCollection,
    createApplicationDocument,
    fetchApplicationsByJobId,
    fetchApplicationById,
    updateApplicationStatus,
    fetchApplicationsByUserId,
};
