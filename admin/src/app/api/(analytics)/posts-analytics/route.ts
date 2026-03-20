import { NextRequest, NextResponse } from 'next/server';
import { fetchJobsByUserId } from '@/appwrite/server/collections/job-collection';
import { isRecognisedError, UnauthorizedError } from '@/model/error';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const userId = (user as { id: string }).id;
        const jobs = await fetchJobsByUserId(userId);
        const normalized = jobs.map((doc) => ({ ...doc, id: (doc.$id ?? doc.id) as string }));
        return NextResponse.json(normalized, { status: 200 });
    } catch (error) {
        console.log('Error while fetching jobs', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ message: 'Error while fetching jobs' }, { status: 500 });
    }
}
