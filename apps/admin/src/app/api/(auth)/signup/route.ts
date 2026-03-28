import { createAdminDocument } from '@jobify/appwrite-server/collections/admin-collection';
import { Admin } from '@jobify/domain/admin';
import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { BadRequestError, isRecognisedError } from '@jobify/domain/error';
import { randomUUID } from 'crypto';
import { verifyRecaptcha } from '@/lib/recaptcha';

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as Record<string, unknown>;
        const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
        const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : '';
        const username = typeof body.username === 'string' ? body.username.trim() : '';
        const email = typeof body.email === 'string' ? body.email.trim() : '';
        const password = typeof body.password === 'string' ? body.password : '';
        const recaptchaToken = typeof body.recaptchaToken === 'string' ? body.recaptchaToken : '';

        if (!recaptchaToken) {
            throw new BadRequestError('reCAPTCHA token is required');
        }

        const isValidRecaptcha = await verifyRecaptcha(recaptchaToken);
        if (!isValidRecaptcha) {
            throw new BadRequestError('Invalid reCAPTCHA verification. Please try again.');
        }

        if (!firstName || !lastName || !username || !email || !password) {
            throw new BadRequestError('firstName, lastName, username, email, and password are required');
        }
        const salt = bcryptjs.genSaltSync(10);
        const hashedPassword = bcryptjs.hashSync(password, salt);
        const admin = new Admin(
            randomUUID(),
            firstName,
            lastName,
            username,
            email,
            hashedPassword,
            hashedPassword,
            new Date().toISOString()
        );
        const created = (await createAdminDocument(admin)) as Record<string, unknown>;
        const responseUser = {
            id: (created.id ?? created.$id) as string,
            firstName: created.firstName,
            lastName: created.lastName,
            username: created.username,
            email: created.email,
            createdAt: created.createdAt ?? '',
        };
        return NextResponse.json(responseUser, { status: 201 });
    } catch (error) {
        console.log('Error while creating admin', error);
        if (isRecognisedError(error)) {
            const err = error as { message?: string; statusCode?: number };
            return NextResponse.json({ message: err.message }, { status: err.statusCode ?? 500 });
        }
        return NextResponse.json({ message: 'Error while creating account' }, { status: 500 });
    }
}
