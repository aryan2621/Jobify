import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
export async function middleware(request: NextRequest) {
    const secret = process.env.JWT_SECRET?.trim();
    if (!secret) {
        console.error('JWT_SECRET is not set or empty');
        return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }
    const path = request.nextUrl.pathname?.toLowerCase();
    const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
    const isPublicPath = publicPaths.includes(path);
    const token = request.cookies?.get('token');
    let user = null;
    if (token) {
        try {
            const secretEncoded = new TextEncoder().encode(secret);
            const verified = await jwtVerify(token.value, secretEncoded);
            user = verified.payload;
        }
        catch (error) {
            console.log('Invalid token:', error);
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete({ name: 'token', path: '/' });
            return response;
        }
    }
    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }
    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
}
export const config = {
    matcher: ['/', '/login', '/signup', '/profile', '/contact', '/billing', '/jobs', '/jobs/:path*', '/applications', '/applications/:path*', '/analytics'],
};
