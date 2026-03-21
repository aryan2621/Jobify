import { ADMIN_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { fetchAdminByUsername } from '@jobify/appwrite-server/collections/admin-collection';
import { countJobsByUserId } from '@jobify/appwrite-server/collections/job-collection';
import { countWorkflowsByUserId } from '@jobify/appwrite-server/collections/workflow-collection';
import { getAvatarViewUrl } from '@jobify/appwrite-server/storage';
import { isRecognisedError, UnauthorizedError } from '@jobify/domain/error';
import { LoginUserRequest } from '@jobify/domain/request';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body as LoginUserRequest;
        const admins = await fetchAdminByUsername(username);
        if (admins.documents.length === 0) {
            throw new UnauthorizedError('Invalid username or password');
        }
        if (admins.documents.length > 1) {
            throw new UnauthorizedError('Invalid username or password');
        }
        const user = admins.documents[0] as Record<string, unknown>;
        const isPasswordValid = bcryptjs.compareSync(password, (user.password as string) ?? '');
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid username or password');
        }
        const token = jwt.sign(
            { id: (user.id ?? user.$id) as string },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        );
        const avatarUrl = user.avatarFileId ? getAvatarViewUrl(user.avatarFileId as string) : null;
        const uid = (user.id ?? user.$id) as string;
        const responseUser = {
            id: uid,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt ?? '',
            avatarUrl,
        };
        const response = NextResponse.json(responseUser, { status: 200 });
        response.cookies.set(ADMIN_AUTH_COOKIE_NAME, token, {
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
