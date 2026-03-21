import { ADMIN_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const token = req.cookies.get(ADMIN_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            return new NextResponse('You are not authorized to perform this action', { status: 401 });
        }
        const response = NextResponse.json({ status: 200 });
        response.cookies.delete({ name: ADMIN_AUTH_COOKIE_NAME, path: '/' });
        return response;
    } catch (error) {
        console.log('Error while logging out', error);
        return new NextResponse('Something went wrong', { status: 500 });
    }
}
