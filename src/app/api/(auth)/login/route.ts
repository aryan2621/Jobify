import { fetchUserByUsername } from '@/appwrite/server/collections/user-collection';
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
        const user = users.documents[0];
        const isPasswordValid = bcryptjs.compareSync(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid password');
        }
        const token = jwt.sign({ id: user.id }, process.env.NEXT_PUBLIC_JWT_SECRET!, {
            expiresIn: '1d',
        });
        const response = NextResponse.json({ token }, { status: 200 });
        response.cookies.set('token', token, {
            httpOnly: true,
            maxAge: 86400,
            expires: new Date(Date.now() + 86400),
        });
        return response;
    } catch (error) {
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ message: 'Error while signing in, please try again later' }, { status: 500 });
    }
}
