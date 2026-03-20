import { database } from '../config';
import { DB_NAME, USER_COLLECTION } from '@/appwrite/name';
import { User } from '@/model/user';
import { Query } from 'appwrite';
import { DuplicateError } from '@/model/error';

async function createUserDocument(user: User) {
    try {
        try {
            await Promise.all([
                fetchUserByEmail(user.email).then((res) => {
                    if (res.documents.length > 0) {
                        throw new DuplicateError('Email already exists');
                    }
                }),
                fetchUserByUsername(user.username).then((res) => {
                    if (res.documents.length > 0) {
                        throw new DuplicateError('Username already exists');
                    }
                }),
                fetchUserByUserId(user.id)
                    .then((res) => {
                        if (res) {
                            throw new DuplicateError('User already exists');
                        }
                    })
                    .catch((err) => {
                        if (err.code === 404) {
                        } else {
                            throw err;
                        }
                    }),
            ]);
        } catch (error) {
            if (error instanceof DuplicateError) {
                console.log('Duplicate error', error);
                throw error;
            }
            console.log('Error while fetching user', error);
            throw error;
        }
        return await database.createDocument(DB_NAME, USER_COLLECTION, user.id, {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            password: user.password,
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.log('Error creating user document', error);
        throw error;
    }
}

async function fetchUserByEmail(email: string) {
    try {
        return await database.listDocuments(DB_NAME, USER_COLLECTION, [Query.equal('email', email)]);
    } catch (error) {
        console.log('Error fetching user by email', error);
        throw error;
    }
}

async function fetchUserByUsername(username: string) {
    try {
        return await database.listDocuments(DB_NAME, USER_COLLECTION, [Query.equal('username', username)]);
    } catch (error) {
        console.log('Error fetching user by username', error);
        throw error;
    }
}
async function fetchUserByUserId(userId: string) {
    try {
        return await database.getDocument(DB_NAME, USER_COLLECTION, userId);
    } catch (error) {
        console.log('Error fetching user by userId', error);
        throw error;
    }
}

async function updateUser(userId: string, user: Partial<User>) {
    try {
        return await database.updateDocument(DB_NAME, USER_COLLECTION, userId, user);
    } catch (error) {
        console.log('Error updating user', error);
        throw error;
    }
}

export { createUserDocument, fetchUserByEmail, fetchUserByUsername, fetchUserByUserId, updateUser };
