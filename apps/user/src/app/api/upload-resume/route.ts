import { USER_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { uploadResume } from '@jobify/appwrite-server/storage';
import { isRecognisedError, UnauthorizedError } from '@jobify/domain/error';
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
function isAllowedResumeFile(file: File): boolean {
    if (ALLOWED_TYPES.includes(file.type)) {
        return true;
    }
    const name = file.name.toLowerCase();
    if (name.endsWith('.pdf') || name.endsWith('.doc') || name.endsWith('.docx')) {
        return file.type === '' || file.type === 'application/octet-stream';
    }
    return false;
}
export async function POST(req: NextRequest) {
    const token = req.cookies.get(USER_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        jwt.verify(token.value, process.env.JWT_SECRET!);
        const formData = await req.formData();
        const file = formData.get('file');
        if (!file || !(file instanceof File)) {
            return NextResponse.json({ message: 'No file provided' }, { status: 400 });
        }
        if (!isAllowedResumeFile(file)) {
            return NextResponse.json({ message: 'Invalid file type. Only PDF, DOC, or DOCX is allowed.' }, { status: 400 });
        }
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ message: 'File must be less than 5MB' }, { status: 400 });
        }
        const fileId = await uploadResume(file);
        return NextResponse.json({ fileId }, { status: 200 });
    }
    catch (error) {
        if (isRecognisedError(error)) {
            const err = error as {
                statusCode: number;
                message: string;
            };
            return NextResponse.json({ message: err.message }, { status: err.statusCode });
        }
        console.error('Resume upload error:', error);
        return NextResponse.json({ message: 'Failed to upload resume' }, { status: 500 });
    }
}
