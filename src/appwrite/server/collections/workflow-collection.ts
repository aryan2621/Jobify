import { IndexType, Permission, Role } from 'node-appwrite';
import { Workflow } from '@/model/workflow';
import { database } from '../config';
import { DB_NAME, WORKFLOW_COLLECTION } from '@/appwrite/name';
import { Query } from 'appwrite';

export function createWorkflowCollection() {
    database
        .createCollection(DB_NAME, WORKFLOW_COLLECTION, WORKFLOW_COLLECTION, [
            Permission.read(Role.any()),
            Permission.write(Role.any()),
            Permission.delete(Role.any()),
            Permission.update(Role.any()),
        ])
        .then(() => {
            console.log('here');
            return Promise.all([
                database.createStringAttribute(DB_NAME, WORKFLOW_COLLECTION, 'id', 50, true),
                database.createStringAttribute(DB_NAME, WORKFLOW_COLLECTION, 'name', 100, true),
                database.createStringAttribute(DB_NAME, WORKFLOW_COLLECTION, 'description', 500, false),
                database.createStringAttribute(DB_NAME, WORKFLOW_COLLECTION, 'nodes', 500, true),
                database.createStringAttribute(DB_NAME, WORKFLOW_COLLECTION, 'edges', 500, true),
                database.createDatetimeAttribute(DB_NAME, WORKFLOW_COLLECTION, 'createdAt', true),
                database.createDatetimeAttribute(DB_NAME, WORKFLOW_COLLECTION, 'updatedAt', true),
                database.createStringAttribute(DB_NAME, WORKFLOW_COLLECTION, 'createdBy', 50, true),
                database.createBooleanAttribute(DB_NAME, WORKFLOW_COLLECTION, 'isTemplate', false),
                database.createStringAttribute(DB_NAME, WORKFLOW_COLLECTION, 'templateCategory', 50, false),
                database.createEnumAttribute(DB_NAME, WORKFLOW_COLLECTION, 'status', ['draft', 'active', 'archived'], true),
                database.createStringAttribute(DB_NAME, WORKFLOW_COLLECTION, 'tags', 200, false, undefined, true),
            ]);
        })
        .catch((error) => {
            console.log('Error creating workflow collection', error);
            throw error;
        })
        .then(() => {
            return Promise.all([
                database.createIndex(DB_NAME, WORKFLOW_COLLECTION, 'createdBy', IndexType.Fulltext, ['createdBy'], ['ASC']),
                database.createIndex(DB_NAME, WORKFLOW_COLLECTION, 'status', IndexType.Key, ['status'], ['ASC']),
                database.createIndex(DB_NAME, WORKFLOW_COLLECTION, 'isTemplate', IndexType.Key, ['isTemplate'], ['ASC']),
            ]);
        })
        .catch((error) => {
            console.log('Error creating indexes of workflow collection', error);
            throw error;
        });
}

// Create a new workflow
export async function createWorkflow(workflow: Workflow) {
    try {
        // Ensure we have a createdAt timestamp if not provided
        if (!workflow.createdAt) {
            workflow.createdAt = new Date().toISOString();
        }

        // Always update the updatedAt timestamp
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
            isTemplate: workflow.isTemplate || false,
            templateCategory: workflow.templateCategory || '',
            status: workflow.status || 'draft',
            tags: workflow.tags || [],
        });
    } catch (error) {
        console.log('Error creating workflow document', error);
        throw error;
    }
}

// Update an existing workflow
export async function updateWorkflow(workflow: Workflow) {
    try {
        // Always update the updatedAt timestamp
        workflow.updatedAt = new Date().toISOString();

        return await database.updateDocument(DB_NAME, WORKFLOW_COLLECTION, workflow.id, {
            name: workflow.name,
            description: workflow.description || '',
            nodes: JSON.stringify(workflow.nodes),
            edges: JSON.stringify(workflow.edges),
            updatedAt: workflow.updatedAt,
            isTemplate: workflow.isTemplate || false,
            templateCategory: workflow.templateCategory || '',
            status: workflow.status || 'draft',
            tags: workflow.tags || [],
        });
    } catch (error) {
        console.log('Error updating workflow document', error);
        throw error;
    }
}

// Get workflow by ID
export async function getWorkflowById(id: string) {
    try {
        return await database.getDocument(DB_NAME, WORKFLOW_COLLECTION, id);
    } catch (error) {
        console.log('Error fetching workflow by id', error);
        throw error;
    }
}

// Get all workflows
export async function getAllWorkflows(lastId?: string | null, limit?: number | null) {
    try {
        const queries = [];
        if (lastId) {
            queries.push(Query.cursorAfter(lastId));
        }
        if (limit) {
            queries.push(Query.limit(limit));
        }

        // Order by most recent first
        queries.push(Query.orderDesc('updatedAt'));

        const workflows =
            queries.length > 0
                ? await database.listDocuments(DB_NAME, WORKFLOW_COLLECTION, queries)
                : await database.listDocuments(DB_NAME, WORKFLOW_COLLECTION);

        return workflows.documents;
    } catch (error) {
        console.log('Error fetching all workflows', error);
        throw error;
    }
}

// Get workflows by user ID
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

// Get workflow templates
export async function getWorkflowTemplates() {
    try {
        const templates = await database.listDocuments(DB_NAME, WORKFLOW_COLLECTION, [Query.equal('isTemplate', true), Query.orderDesc('updatedAt')]);
        return templates.documents;
    } catch (error) {
        console.log('Error fetching workflow templates', error);
        throw error;
    }
}

// Delete a workflow
export async function deleteWorkflow(id: string) {
    try {
        return await database.deleteDocument(DB_NAME, WORKFLOW_COLLECTION, id);
    } catch (error) {
        console.log('Error deleting workflow', error);
        throw error;
    }
}
