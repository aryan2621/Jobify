import { uploadResume } from '@/appwrite/server/storage';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.formData();
        const file = body.get('file');

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ message: 'File not found or incorrect type' }, { status: 400 });
        }
        const id = await uploadResume(file);
        return NextResponse.json({ id }, { status: 201 });
    } catch (error) {
        console.log('Error uploading file', error);
        return NextResponse.json({ message: 'Error while uploading file' }, { status: 500 });
    }
}
