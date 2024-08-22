import { IndexType, Permission, Role } from 'node-appwrite';
import { database } from '../config';
import { DB_NAME, USER_COLLECTION } from '@/appwrite/name';
import { User } from '@/model/user';
import { Query } from 'appwrite';
import { DuplicateError, InternalServerError } from '@/model/error';

function createUserCollection() {
    database
        .createCollection(DB_NAME, USER_COLLECTION, USER_COLLECTION, [
            Permission.read(Role.any()),
            Permission.write(Role.any()),
            Permission.delete(Role.any()),
            Permission.update(Role.any()),
        ])
        .then(() => {
            return Promise.all([
                database.createStringAttribute(
                    DB_NAME,
                    USER_COLLECTION,
                    'id',
                    50,
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    USER_COLLECTION,
                    'firstName',
                    50,
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    USER_COLLECTION,
                    'lastName',
                    50,
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    USER_COLLECTION,
                    'username',
                    50,
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    USER_COLLECTION,
                    'email',
                    50,
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    USER_COLLECTION,
                    'password',
                    50,
                    true
                ),
                database.createBooleanAttribute(
                    DB_NAME,
                    USER_COLLECTION,
                    'isAdmin',
                    true
                ),
                database.createDatetimeAttribute(
                    DB_NAME,
                    USER_COLLECTION,
                    'createdAt',
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    USER_COLLECTION,
                    'jobs',
                    200,
                    false,
                    undefined,
                    true
                ),
                database.createStringAttribute(
                    DB_NAME,
                    USER_COLLECTION,
                    'applications',
                    200,
                    false,
                    undefined,
                    true
                ),
                database.createBooleanAttribute(
                    DB_NAME,
                    USER_COLLECTION,
                    'tnC',
                    true
                ),
            ]);
        })
        .catch((error) => {
            console.log(
                'Error creating user attributes of user collection',
                error
            );
            throw error;
        })
        .then(() => {
            return Promise.all([
                database.createIndex(
                    DB_NAME,
                    USER_COLLECTION,
                    'id',
                    IndexType.Fulltext,
                    ['id'],
                    ['ASC']
                ),
                database.createIndex(
                    DB_NAME,
                    USER_COLLECTION,
                    'email',
                    IndexType.Fulltext,
                    ['email'],
                    ['ASC']
                ),
                database.createIndex(
                    DB_NAME,
                    USER_COLLECTION,
                    'username',
                    IndexType.Fulltext,
                    ['username'],
                    ['ASC']
                ),
            ]);
        })
        .catch((error) => {
            console.log('Error creating indexes of user collection', error);
            throw error;
        });
}

async function createUserDocument(user: User) {
    try {
        let user1, user2, user3;
        try {
            [user1, user2, user3] = await Promise.all([
                fetchUserByEmail(user.email)
                    .then((res) => {
                        if (res.documents.length > 0) {
                            throw new DuplicateError('Email already exists');
                        }
                    })
                    .catch((error) => {}),
                fetchUserByUsername(user.username)
                    .then((res) => {
                        if (res.documents.length > 0) {
                            throw new DuplicateError('Username already exists');
                        }
                    })
                    .catch((error) => {}),
                fetchUserByUserId(user.id)
                    .then((res) => {
                        if (res) {
                            throw new DuplicateError('User already exists');
                        }
                    })
                    .catch((error) => {}),
            ]);
        } catch (error) {
            if (error instanceof DuplicateError) {
                console.log('Duplicate error', error);
                throw error;
            }
            console.log('Error while fetching user', error);
            throw error;
        }
        return await database.createDocument(
            DB_NAME,
            USER_COLLECTION,
            user.id,
            {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                password: user.password,
                isAdmin: user.isAdmin,
                createdAt: user.createdAt,
                jobs: user.jobs ?? [],
                applications: user.applications ?? [],
                tnC: user.tnC,
            }
        );
    } catch (error) {
        console.log('Error creating user document', error);
        throw error;
    }
}

async function fetchUserByEmail(email: string) {
    return await database.listDocuments(DB_NAME, USER_COLLECTION, [
        Query.equal('email', email),
    ]);
}

async function fetchUserByUsername(username: string) {
    return await database.listDocuments(DB_NAME, USER_COLLECTION, [
        Query.equal('username', username),
    ]);
}
async function fetchUserByUserId(userId: string) {
    return await database.getDocument(DB_NAME, USER_COLLECTION, userId);
}

async function isUserIsAdmin(userId: string) {
    const user = await fetchUserByUserId(userId);
    if (!user) {
        throw new InternalServerError('User not found');
    }
    return user.isAdmin;
}

export {
    createUserCollection,
    createUserDocument,
    fetchUserByEmail,
    fetchUserByUsername,
    fetchUserByUserId,
    isUserIsAdmin,
};
