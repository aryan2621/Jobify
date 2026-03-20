import { Workflow } from '@/model/workflow';
import { database } from '../config';
import { DB_NAME, WORKFLOW_COLLECTION } from '@/appwrite/name';
import { Query } from 'appwrite';

export async function createWorkflow(workflow: Workflow) {
    try {
        
        if (!workflow.createdAt) {
            workflow.createdAt = new Date().toISOString();
        }

        
        workflow.updatedAt = new Date().toISOString();

        return await database.createDocument(DB_NAME, WORKFLOW_COLLECTION, workflow.id, {
            id: workflow.id,
            name: workflow.name,
            description: workflow.description || '',
            nodes: JSON.stringify(workflow.nodes),
            edges: JSON.stringify(workflow.edges),
            createdAt: workflow.createdAt,
            updatedAt: workflow.updatedAt,
            createdBy: workflow.createdBy,
            status: workflow.status || 'draft',
        });
    } catch (error) {
        console.log('Error creating workflow document', error);
        throw error;
    }
}


export async function updateWorkflow(workflow: Workflow) {
    try {
        
        workflow.updatedAt = new Date().toISOString();

        return await database.updateDocument(DB_NAME, WORKFLOW_COLLECTION, workflow.id, {
            name: workflow.name,
            description: workflow.description || '',
            nodes: JSON.stringify(workflow.nodes),
            edges: JSON.stringify(workflow.edges),
            updatedAt: workflow.updatedAt,
            status: workflow.status || 'draft',
        });
    } catch (error) {
        console.log('Error updating workflow document', error);
        throw error;
    }
}


export async function getWorkflowById(id: string) {
    try {
        return await database.getDocument(DB_NAME, WORKFLOW_COLLECTION, id);
    } catch (error) {
        console.log('Error fetching workflow by id', error);
        throw error;
    }
}


export async function getWorkflowsByUserId(userId: string) {
    try {
        const workflows = await database.listDocuments(DB_NAME, WORKFLOW_COLLECTION, [
            Query.equal('createdBy', userId),
            Query.orderDesc('updatedAt'),
        ]);
        return workflows.documents;
    } catch (error) {
        console.log('Error fetching workflows by user id', error);
        throw error;
    }
}

export async function countWorkflowsByUserId(userId: string): Promise<number> {
    try {
        const workflows = await database.listDocuments(DB_NAME, WORKFLOW_COLLECTION, [
            Query.equal('createdBy', userId),
            Query.limit(1),
        ]);
        return typeof workflows.total === 'number' ? workflows.total : workflows.documents.length;
    } catch (error) {
        console.log('Error counting workflows by user', error);
        throw error;
    }
}

export async function deleteWorkflow(id: string) {
    try {
        return await database.deleteDocument(DB_NAME, WORKFLOW_COLLECTION, id);
    } catch (error) {
        console.log('Error deleting workflow', error);
        throw error;
    }
}
