import { USER_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { fetchUserByUsername } from '@jobify/appwrite-server/collections/user-collection';
import { isRecognisedError, UnauthorizedError } from '@jobify/domain/error';
import { LoginUserRequest } from '@jobify/domain/request';
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
        const user = users.documents[0];
        const isPasswordValid = bcryptjs.compareSync(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid password');
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
            expiresIn: '1d',
        });
        const responseUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
        };
        const response = NextResponse.json(responseUser, { status: 200 });
        response.cookies.set(USER_AUTH_COOKIE_NAME, token, {
            httpOnly: true,
            maxAge: 86400,
            expires: new Date(Date.now() + 86400 * 1000),
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        return response;
    }
    catch (error) {
        console.log('Error while signing in', error);
        if (isRecognisedError(error)) {
            const err = error as any;
            return NextResponse.json({ message: err.message }, { status: err.statusCode });
        }
        return NextResponse.json({ message: 'Error while signing in, please try again later' }, { status: 500 });
    }
}
