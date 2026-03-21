import { USER_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { NextRequest, NextResponse } from 'next/server';
import { fetchUserByUserId, updateUser } from '@jobify/appwrite-server/collections/user-collection';
import { getAvatarViewUrl, uploadAvatar } from '@jobify/appwrite-server/storage';
import { isRecognisedError } from '@jobify/domain/error';
import jwt from 'jsonwebtoken';
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export async function POST(req: NextRequest) {
    const token = req.cookies.get(USER_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const payload = jwt.verify(token.value, process.env.JWT_SECRET!) as {
            id: string;
        };
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
        await updateUser(userId, { avatarFileId: fileId });
        const avatarUrl = getAvatarViewUrl(fileId);
        return NextResponse.json({ avatarUrl }, { status: 200 });
    }
    catch (error) {
        if (isRecognisedError(error)) {
            const err = error as any;
            return NextResponse.json({ message: err.message }, { status: err.statusCode || 500 });
        }
        console.error('Avatar upload error:', error);
        return NextResponse.json({ message: 'Failed to upload avatar' }, { status: 500 });
    }
}
