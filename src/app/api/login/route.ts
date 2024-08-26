import { fetchUserByUsername } from '@/appwrite/server/collections/user-collection';
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
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        if (users.documents.length > 1) {
            return NextResponse.json({ message: 'Multiple users found' }, { status: 409 });
        }
        const user = users.documents[0];
        const isPasswordValid = bcryptjs.compareSync(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
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
        return NextResponse.json({ message: 'Error while signing in, please try again later' }, { status: 500 });
    }
}
