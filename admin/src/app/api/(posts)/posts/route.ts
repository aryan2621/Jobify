import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { fetchJobsByUserIdPaginated } from '@/appwrite/server/collections/job-collection';
import { isRecognisedError, UnauthorizedError } from '@/model/error';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const payload = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        const userId = payload.id;

        const lastId = req?.nextUrl?.searchParams?.get('lastId') ?? null;
        const limitParam = req?.nextUrl?.searchParams?.get('limit');
        if (!limitParam) {
            return NextResponse.json({ message: 'Limit cannot be empty' }, { status: 400 });
        }
        const parsedLimit = parseInt(limitParam, 10);
        if (isNaN(parsedLimit)) {
            return NextResponse.json({ message: 'Limit should be a number' }, { status: 400 });
        }

        const jobs = await fetchJobsByUserIdPaginated(userId, lastId, parsedLimit);
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
