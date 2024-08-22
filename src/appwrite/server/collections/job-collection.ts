import { IndexType, Permission, Role } from 'node-appwrite';
import { JobSource, JobType, WorkplaceTypes } from '@/model/job';
import { database } from '../config';
import { DB_NAME, JOB_COLLECTION } from '@/appwrite/name';

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
                database.createStringAttribute(
                    DB_NAME,
                    JOB_COLLECTION,
                    'id',
                    50,
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    JOB_COLLECTION,
                    'profile',
                    50,
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    JOB_COLLECTION,
                    'description',
                    50,
                    false
                ),
                database.createEnumAttribute(
                    DB_NAME,
                    JOB_COLLECTION,
                    'type',
                    [
                        JobType.FULL_TIME,
                        JobType.PART_TIME,
                        JobType.INTERNSHIP,
                        JobType.CONTRACT,
                        JobType.FREELANCE,
                        JobType.TEMPORARY,
                    ],
                    true
                ),
                database.createEnumAttribute(
                    DB_NAME,
                    JOB_COLLECTION,
                    'workplaceType',
                    [
                        WorkplaceTypes.REMOTE,
                        WorkplaceTypes.HYBRID,
                        WorkplaceTypes.ONSITE,
                    ],
                    true
                ),
                database.createEnumAttribute(
                    DB_NAME,
                    JOB_COLLECTION,
                    'source',
                    [
                        JobSource.LINKEDIN,
                        JobSource.ANGEL_LIST,
                        JobSource.REFERRAL,
                        JobSource.JOB_PORTAL,
                        JobSource.COMPANY_WEBSITE,
                        JobSource.OTHER,
                    ],
                    true
                ),
                database.createDatetimeAttribute(
                    DB_NAME,
                    JOB_COLLECTION,
                    'lastDateToApply',
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    JOB_COLLECTION,
                    'location',
                    50,
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    JOB_COLLECTION,
                    'skills',
                    200,
                    false,
                    undefined,
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    JOB_COLLECTION,
                    'rejectionContent',
                    50,
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    JOB_COLLECTION,
                    'selectionContent',
                    50,
                    true
                ),
                database.createDatetimeAttribute(
                    DB_NAME,
                    JOB_COLLECTION,
                    'createdAt',
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    JOB_COLLECTION,
                    'createdBy',
                    50,
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    JOB_COLLECTION,
                    'applications',
                    200,
                    false,
                    undefined,
                    true
                ),
            ]);
        })
        .catch((error) => {
            console.log(
                'Error creating user attributes of job collection',
                error
            );
            throw error;
        })
        .then(() => {
            return Promise.all([
                database.createIndex(
                    DB_NAME,
                    JOB_COLLECTION,
                    'id',
                    IndexType.Fulltext,
                    ['id'],
                    ['ASC']
                ),
                database.createIndex(
                    DB_NAME,
                    JOB_COLLECTION,
                    'createdBy',
                    IndexType.Fulltext,
                    ['createdBy'],
                    ['ASC']
                ),
            ]);
        })
        .catch((error) => {
            console.log('Error creating indexes of job collection', error);
            throw error;
        });
}

export { createJobCollection };
