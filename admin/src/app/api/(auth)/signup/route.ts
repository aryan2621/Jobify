import { createUserDocument } from '@/appwrite/server/collections/user-collection';
import { User } from '@/model/user';
import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { isRecognisedError } from '@/model/error';

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as Record<string, unknown>;
        const password = body.password as string;
        const salt = bcryptjs.genSaltSync(10);
        const hashedPassword = bcryptjs.hashSync(password, salt);
        const user = new User(
            body.id as string,
            body.firstName as string,
            body.lastName as string,
            body.username as string,
            body.email as string,
            hashedPassword,
            hashedPassword,
            (body.createdAt as string) ?? new Date().toISOString(),
            (body.jobs as string[]) ?? [],
            (body.applications as string[]) ?? [],
            (body.tnC as boolean) ?? false,
            (body.workflows as string[]) ?? []
        );
        const created = (await createUserDocument(user, 'admin')) as Record<string, unknown>;
        const responseUser = {
            id: (created.id ?? created.$id) as string,
            firstName: created.firstName,
            lastName: created.lastName,
            username: created.username,
            email: created.email,
            applications: created.applications ?? [],
            jobs: created.jobs ?? [],
            workflows: created.workflows ?? [],
            createdAt: created.createdAt ?? '',
            tnC: created.tnC ?? false,
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
