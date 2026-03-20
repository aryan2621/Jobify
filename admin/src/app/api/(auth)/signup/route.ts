import { createUserDocument } from '@/appwrite/server/collections/user-collection';
import { User } from '@/model/user';
import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { BadRequestError, isRecognisedError } from '@/model/error';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as Record<string, unknown>;
        const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
        const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : '';
        const username = typeof body.username === 'string' ? body.username.trim() : '';
        const email = typeof body.email === 'string' ? body.email.trim() : '';
        const password = typeof body.password === 'string' ? body.password : '';

        if (!firstName || !lastName || !username || !email || !password) {
            throw new BadRequestError('firstName, lastName, username, email, and password are required');
        }
        const salt = bcryptjs.genSaltSync(10);
        const hashedPassword = bcryptjs.hashSync(password, salt);
        const user = new User(
            randomUUID(),
            firstName,
            lastName,
            username,
            email,
            hashedPassword,
            hashedPassword,
            new Date().toISOString(),
            0,
            0
        );
        const created = (await createUserDocument(user)) as Record<string, unknown>;
        const responseUser = {
            id: (created.id ?? created.$id) as string,
            firstName: created.firstName,
            lastName: created.lastName,
            username: created.username,
            email: created.email,
            jobCount: 0,
            workflowCount: 0,
            createdAt: created.createdAt ?? '',
        };
        return NextResponse.json(responseUser, { status: 201 });
    } catch (error) {
        console.log('Error while creating user', error);
        if (isRecognisedError(error)) {
            const err = error as { message?: string; statusCode?: number };
            return NextResponse.json({ message: err.message }, { status: err.statusCode ?? 500 });
        }
        return NextResponse.json({ message: 'Error while creating user' }, { status: 500 });
    }
}
