import { DB_NAME, APPLICATION_COLLECTION } from '../name';
import { database } from '../config';
import { Application, ApplicationStatus } from '@jobify/domain/application';
import { Query } from 'appwrite';
import { UserApplicationsRequest } from '@jobify/domain/request';

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
            education: JSON.stringify(application.education ?? []),
            experience: JSON.stringify(application.experience ?? []),
            skills: JSON.stringify(application.skills ?? []),
            source: application.source,
            resume: application.resume,
            socialLinks: JSON.stringify(application.socialLinks ?? []),
            coverLetter: application.coverLetter,
            status: application.status,
            jobId: application.jobId,
            createdAt: application.createdAt,
            createdBy: application.createdBy,
            workflowId: application.workflowId ?? undefined,
            stage: application.stage ?? undefined,
            currentNodeId: application.currentNodeId ?? undefined,
            workflowState: application.workflowState ? JSON.stringify(application.workflowState) : undefined,
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

async function hasApplicationByUserAndJob(userId: string, jobId: string): Promise<boolean> {
    try {
        const records = await database.listDocuments(DB_NAME, APPLICATION_COLLECTION, [
            Query.equal('createdBy', userId),
            Query.equal('jobId', jobId),
            Query.limit(1),
        ]);
        return records.documents.length > 0;
    } catch (error) {
        console.log('Error checking application by user and job', error);
        throw error;
    }
}

const DEFAULT_APPLICATIONS_LIMIT = 5000;

async function updateApplicationWorkflowProgress(
    applicationId: string,
    updates: { currentNodeId?: string; stage?: string }
) {
    try {
        const payload: Record<string, string> = {};
        if (updates.currentNodeId !== undefined) payload.currentNodeId = updates.currentNodeId;
        if (updates.stage !== undefined) payload.stage = updates.stage;
        if (Object.keys(payload).length === 0) return await fetchApplicationById(applicationId);
        return await database.updateDocument(DB_NAME, APPLICATION_COLLECTION, applicationId, payload);
    } catch (error) {
        console.log('Error updating application workflow progress', error);
        throw error;
    }
}

async function updateApplicationWorkflowState(
    applicationId: string,
    nodeId: string,
    payload: { submitted: boolean; submittedAt?: string }
) {
    try {
        const doc = await database.getDocument(DB_NAME, APPLICATION_COLLECTION, applicationId);
        const workflowState: Record<string, { submitted?: boolean; submittedAt?: string }> = doc.workflowState
            ? JSON.parse(doc.workflowState as string)
            : {};
        workflowState[nodeId] = { ...workflowState[nodeId], ...payload };
        return await database.updateDocument(DB_NAME, APPLICATION_COLLECTION, applicationId, {
            workflowState: JSON.stringify(workflowState),
        });
    } catch (error) {
        console.log('Error updating application workflow state', error);
        throw error;
    }
}

async function fetchApplicationsByJobIds(jobIds: string[], limit: number = DEFAULT_APPLICATIONS_LIMIT) {
    if (jobIds.length === 0) return [];
    const jobIdSet = new Set(jobIds);
    try {
        const queries = [Query.limit(limit)];
        const records = await database.listDocuments(DB_NAME, APPLICATION_COLLECTION, queries);
        return records.documents.filter((doc) => jobIdSet.has(doc.jobId));
    } catch (error) {
        console.log('Error fetching applications by job ids', error);
        throw error;
    }
}

export {
    createApplicationDocument,
    fetchApplicationById,
    fetchApplicationsByJobId,
    fetchApplicationsByJobIds,
    fetchApplicationsByUserId,
    hasApplicationByUserAndJob,
    updateApplicationStatus,
    updateApplicationWorkflowProgress,
    updateApplicationWorkflowState,
};
