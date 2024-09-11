import { isRecognisedError, UnauthorizedError } from '@/model/error';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { fetchApplicationsByUserId } from '@/appwrite/server/collections/application-collection';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.NEXT_PUBLIC_JWT_SECRET!);
        const id = (user as any).id;
        const applications = await fetchApplicationsByUserId(id);
        return NextResponse.json(applications, { status: 200 });
    } catch (error) {
        if (isRecognisedError(error)) {
            console.log('Error while fetching user applications', error);
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ message: 'Error while fetching user applications' }, { status: 500 });
    }
}
