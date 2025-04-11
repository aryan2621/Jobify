import { DB_NAME } from '@/appwrite/name';
import { database } from '../config';
import { createApplicationCollection } from '../collections/application-collection';
import { createUserCollection } from '../collections/user-collection';
import { createJobCollection } from '../collections/job-collection';
import { createWorkflowCollection } from '../collections/workflow-collection';
export default async function getOrCreateDatabase() {
    try {
        return await database.get(DB_NAME);
    } catch (error) {
        try {
            await database.create(DB_NAME, DB_NAME);
            await Promise.all([createApplicationCollection(), createUserCollection(), createJobCollection(), createWorkflowCollection()]);
            return await database.get(DB_NAME);
        } catch (error) {
            console.log('Error creating database', error);
        }
    }
}
