import { NextRequest, NextResponse } from 'next/server';
import { fetchUserByUserId, updateUser } from '@/appwrite/server/collections/user-collection';
import { BadRequestError, isRecognisedError } from '@/model/error';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRoles } from '@/model/user';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token');
        if (!token) {
            throw new Error('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.NEXT_PUBLIC_JWT_SECRET!);
        const id = (user as any).id;
        const dbUser = await fetchUserByUserId(id);
        if (!dbUser) {
            throw new Error('You are not authorized to perform this action');
        }
        return NextResponse.json(dbUser, { status: 200 });
    } catch (error) {
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ message: 'Error while fetching user' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const token = req.cookies.get('token');
        if (!token) {
            throw new Error('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.NEXT_PUBLIC_JWT_SECRET!);
        const id = (user as any).id;
        const dbUser = await fetchUserByUserId(id);
        if (!dbUser) {
            throw new BadRequestError('You are not authorized to perform this action');
        }
        const { firstName, lastName, password, roles } = await req.json();
        let salt;
        let hashedPassword;
        if (password) {
            salt = bcryptjs.genSaltSync(10);
            hashedPassword = bcryptjs.hashSync(password, salt);
        }
        interface UpdateUserObj {
            firstName?: string;
            lastName?: string;
            password?: string;
            roles?: UserRoles[];
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
        if (roles) {
            obj.roles = roles;
        }
        await updateUser(id, obj);
        return NextResponse.json({ message: 'User updated successfully' }, { status: 200 });
    } catch (error) {
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ message: 'Error while updating user' }, { status: 500 });
    }
}
