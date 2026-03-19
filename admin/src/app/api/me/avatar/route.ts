import { NextRequest, NextResponse } from 'next/server';
import {
    ensureAvatarFileIdAttribute,
    fetchUserByUserId,
    updateUser,
} from '@/appwrite/server/collections/user-collection';
import { getAvatarViewUrl, uploadAvatar } from '@/appwrite/server/storage';
import { isRecognisedError } from '@/model/error';
import jwt from 'jsonwebtoken';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const payload = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        const userId = payload.id;

        const formData = await req.formData();
        const file = formData.get('file');
        if (!file || !(file instanceof File)) {
            return NextResponse.json({ message: 'No file provided' }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ message: 'Invalid file type. Use JPG, PNG, GIF, or WebP.' }, { status: 400 });
        }
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ message: 'File must be less than 5MB' }, { status: 400 });
        }

        await fetchUserByUserId(userId);
        const fileId = await uploadAvatar(file, userId);
        try {
            await updateUser(userId, { avatarFileId: fileId });
        } catch (err: unknown) {
            const res = (err as { response?: { type?: string; message?: string } })?.response;
            if (res?.type === 'document_invalid_structure' && res?.message?.includes('avatarFileId')) {
                await ensureAvatarFileIdAttribute();
                await updateUser(userId, { avatarFileId: fileId });
            } else {
                throw err;
            }
        }
        const avatarUrl = getAvatarViewUrl(fileId);

        return NextResponse.json({ avatarUrl }, { status: 200 });
    } catch (error) {
        if (isRecognisedError(error)) {
            const err = error as { message?: string; statusCode?: number };
            return NextResponse.json({ message: err.message }, { status: err.statusCode ?? 500 });
        }
        console.error('Avatar upload error:', error);
        return NextResponse.json({ message: 'Failed to upload avatar' }, { status: 500 });
    }
}
