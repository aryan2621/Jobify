import { IndexType, Permission, Role } from 'node-appwrite';
import { DB_NAME, APPLICATION_COLLECTION } from '../../name';
import { database } from '../config';
import { ApplicationStatus, Gender } from '@/model/application';

function createApplicationCollection() {
    database
        .createCollection(
            DB_NAME,
            APPLICATION_COLLECTION,
            APPLICATION_COLLECTION,
            [
                Permission.read(Role.any()),
                Permission.write(Role.any()),
                Permission.delete(Role.any()),
                Permission.update(Role.any()),
            ]
        )
        .then(() => {
            return Promise.all([
                database.createStringAttribute(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'id',
                    50,
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'firstName',
                    50,
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'lastName',
                    50,
                    true
                ),
                database.createEmailAttribute(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'email',
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'phone',
                    50,
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'currentLocation',
                    50,
                    true
                ),
                database.createEnumAttribute(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'gender',
                    [Gender.Female, Gender.Male, Gender.Other],
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'education',
                    200,
                    false,
                    undefined,
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'experience',
                    200,
                    false,
                    undefined,
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'skills',
                    200,
                    false,
                    undefined,
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'resume',
                    50,
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'socialLinks',
                    200,
                    false,
                    undefined,
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'coverLetter',
                    50,
                    true
                ),
                database.createEnumAttribute(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'status',
                    [
                        ApplicationStatus.APPLIED,
                        ApplicationStatus.SELECTED,
                        ApplicationStatus.REJECTED,
                    ],
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'jobId',
                    50,
                    true
                ),
                database.createDatetimeAttribute(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'createdAt',
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'createdBy',
                    50,
                    true
                ),
            ]);
        })
        .catch((error) => {
            console.log(
                'Error creating user attributes of application collection',
                error
            );
            throw error;
        })
        .then(() => {
            return Promise.all([
                database.createIndex(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'id',
                    IndexType.Fulltext,
                    ['id'],
                    ['ASC']
                ),
                database.createIndex(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'jobId',
                    IndexType.Fulltext,
                    ['jobId'],
                    ['ASC']
                ),
                database.createIndex(
                    DB_NAME,
                    APPLICATION_COLLECTION,
                    'createdBy',
                    IndexType.Fulltext,
                    ['createdBy'],
                    ['ASC']
                ),
            ]);
        })
        .catch((error) => {
            console.log(
                'Error creating indexes of application collection',
                error
            );
            throw error;
        });
}

export { createApplicationCollection };
