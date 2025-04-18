import { createUserDocument } from '@/appwrite/server/collections/user-collection';
import { User } from '@/model/user';
import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { isRecognisedError } from '@/model/error';

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as User;
        const password = body.password;
        const salt = bcryptjs.genSaltSync(10);
        const hashedPassword = bcryptjs.hashSync(password, salt);
        const user = new User(
            body.id,
            body.firstName,
            body.lastName,
            body.username,
            body.email,
            hashedPassword,
            hashedPassword,
            body.createdAt,
            body.jobs,
            body.applications,
            body.role,
            body.tnC,
            body.workflows
        );
        await createUserDocument(user);
        return NextResponse.json({ message: 'User created' }, { status: 201 });
    } catch (error) {
        console.log('Error while creating user', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ message: 'Error while creating user' }, { status: 500 });
    }
}
