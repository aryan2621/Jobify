import { fetchUserByUsername } from '@/appwrite/server/collections/user-collection';
import { countJobsByUserId } from '@/appwrite/server/collections/job-collection';
import { countWorkflowsByUserId } from '@/appwrite/server/collections/workflow-collection';
import { getAvatarViewUrl } from '@/appwrite/server/storage';
import { isRecognisedError, UnauthorizedError } from '@/model/error';
import { LoginUserRequest } from '@/model/request';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body as LoginUserRequest;
        const users = await fetchUserByUsername(username);
        if (users.documents.length === 0) {
            throw new UnauthorizedError('User not found');
        }
        if (users.documents.length > 1) {
            throw new UnauthorizedError('Multiple users found');
        }
        const user = users.documents[0] as Record<string, unknown>;
        const isPasswordValid = bcryptjs.compareSync(password, (user.password as string) ?? '');
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid password');
        }
        const token = jwt.sign(
            { id: (user.id ?? user.$id) as string },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        );
        const avatarUrl = user.avatarFileId ? getAvatarViewUrl(user.avatarFileId as string) : null;
        const uid = (user.id ?? user.$id) as string;
        const [jobCount, workflowCount] = await Promise.all([countJobsByUserId(uid), countWorkflowsByUserId(uid)]);
        const responseUser = {
            id: uid,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            jobCount,
            workflowCount,
            createdAt: user.createdAt ?? '',
            avatarUrl,
        };
        const response = NextResponse.json(responseUser, { status: 200 });
        response.cookies.set('token', token, {
            httpOnly: true,
            maxAge: 86400,
            expires: new Date(Date.now() + 86400 * 1000),
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        return response;
    } catch (error) {
        console.log('Error while signing in', error);
        if (isRecognisedError(error)) {
            const err = error as { message?: string; statusCode?: number };
            return NextResponse.json({ message: err.message }, { status: err.statusCode ?? 500 });
        }
        return NextResponse.json({ message: 'Error while signing in, please try again later' }, { status: 500 });
    }
}
