import { NextRequest, NextResponse } from 'next/server';
import { fetchUserByUserId, updateUser } from '@/appwrite/server/collections/user-collection';
import { BadRequestError, isRecognisedError } from '@/model/error';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@/model/user';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            throw new Error('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const id = (user as any).id;
        const dbUser = await fetchUserByUserId(id);
        if (!dbUser) {
            throw new Error('You are not authorized to perform this action');
        }
        return NextResponse.json(dbUser, { status: 200 });
    } catch (error) {
        console.log('Error while fetching user', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
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
        const { firstName, lastName, password, role } = await req.json();
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
            role?: UserRole;
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
        if (role) {
            obj.role = role;
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
