import { database } from '../config';
import { DB_NAME, ADMIN_COLLECTION } from '../name';
import { Admin } from '@jobify/domain/admin';
import { Query } from 'appwrite';
import { DuplicateError } from '@jobify/domain/error';

async function createAdminDocument(admin: Admin) {
    try {
        try {
            await Promise.all([
                fetchAdminByEmail(admin.email).then((res) => {
                    if (res.documents.length > 0) {
                        throw new DuplicateError('Email already exists');
                    }
                }),
                fetchAdminByUsername(admin.username).then((res) => {
                    if (res.documents.length > 0) {
                        throw new DuplicateError('Username already exists');
                    }
                }),
                fetchAdminById(admin.id)
                    .then((res) => {
                        if (res) {
                            throw new DuplicateError('Admin already exists');
                        }
                    })
                    .catch((err: { code?: number }) => {
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
            console.log('Error while fetching admin', error);
            throw error;
        }
        return await database.createDocument(DB_NAME, ADMIN_COLLECTION, admin.id, {
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            username: admin.username,
            email: admin.email,
            password: admin.password,
            createdAt: admin.createdAt,
        });
    } catch (error) {
        console.log('Error creating admin document', error);
        throw error;
    }
}

async function fetchAdminByEmail(email: string) {
    try {
        return await database.listDocuments(DB_NAME, ADMIN_COLLECTION, [Query.equal('email', email)]);
    } catch (error) {
        console.log('Error fetching admin by email', error);
        throw error;
    }
}

async function fetchAdminByUsername(username: string) {
    try {
        return await database.listDocuments(DB_NAME, ADMIN_COLLECTION, [Query.equal('username', username)]);
    } catch (error) {
        console.log('Error fetching admin by username', error);
        throw error;
    }
}

async function fetchAdminById(adminId: string) {
    try {
        return await database.getDocument(DB_NAME, ADMIN_COLLECTION, adminId);
    } catch (error) {
        console.log('Error fetching admin by id', error);
        throw error;
    }
}

async function updateAdmin(adminId: string, admin: Partial<Admin>) {
    try {
        return await database.updateDocument(DB_NAME, ADMIN_COLLECTION, adminId, admin);
    } catch (error) {
        console.log('Error updating admin', error);
        throw error;
    }
}

export { createAdminDocument, fetchAdminByEmail, fetchAdminByUsername, fetchAdminById, updateAdmin };
