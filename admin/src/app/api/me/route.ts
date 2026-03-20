import { NextRequest, NextResponse } from 'next/server';
import { fetchUserByUserId, updateUser } from '@/appwrite/server/collections/user-collection';
import { countJobsByUserId } from '@/appwrite/server/collections/job-collection';
import { countWorkflowsByUserId } from '@/appwrite/server/collections/workflow-collection';
import { getAvatarViewUrl } from '@/appwrite/server/storage';
import { BadRequestError, isRecognisedError } from '@/model/error';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
export async function GET(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            throw new Error('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const id = (user as { id: string }).id;
        const dbUser = await fetchUserByUserId(id);
        if (!dbUser) {
            throw new Error('You are not authorized to perform this action');
        }
        const u = dbUser as Record<string, unknown>;
        const avatarUrl = u.avatarFileId ? getAvatarViewUrl(u.avatarFileId as string) : null;
        const uid = (u.id ?? u.$id) as string;
        const [jobCount, workflowCount] = await Promise.all([countJobsByUserId(uid), countWorkflowsByUserId(uid)]);
        const responseUser = {
            id: uid,
            firstName: u.firstName,
            lastName: u.lastName,
            username: u.username,
            email: u.email,
            jobCount,
            workflowCount,
            createdAt: u.createdAt ?? '',
            avatarUrl,
        };
        return NextResponse.json(responseUser, { status: 200 });
    } catch (error) {
        console.log('Error while fetching user', error);
        if (isRecognisedError(error)) {
            const err = error as { message?: string; statusCode?: number };
            return NextResponse.json({ message: err.message }, { status: err.statusCode ?? 500 });
        }
        return NextResponse.json({ message: 'Error while fetching user' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            throw new Error('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const id = (user as any).id;
        const dbUser = await fetchUserByUserId(id);
        if (!dbUser) {
            throw new BadRequestError('You are not authorized to perform this action');
        }
        const { firstName, lastName, password } = await req.json();
        let hashedPassword: string | undefined;
        if (password) {
            const salt = bcryptjs.genSaltSync(10);
            hashedPassword = bcryptjs.hashSync(password, salt);
        }
        interface UpdateUserObj {
            firstName?: string;
            lastName?: string;
            password?: string;
        }
        const obj: UpdateUserObj = {};

        if (firstName) {
            obj.firstName = firstName;
        }
        if (lastName) {
            obj.lastName = lastName;
        }
        if (password) {
            obj.password = hashedPassword;
        }
        await updateUser(id, obj);
        return NextResponse.json({ message: 'User updated successfully' }, { status: 200 });
    } catch (error) {
        console.log('Error while updating user', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ message: 'Error while updating user' }, { status: 500 });
    }
}
