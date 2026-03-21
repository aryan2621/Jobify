import { ADMIN_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname?.toLowerCase();

    const publicPaths = ['/login', '/signup'];
    const isPublicPath = publicPaths.includes(path);
    const token = request.cookies?.get(ADMIN_AUTH_COOKIE_NAME);

    if (token) {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            await jwtVerify(token.value, secret);
        } catch (error) {
            console.log('Invalid token:', error);
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete({ name: ADMIN_AUTH_COOKIE_NAME, path: '/' });
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
    matcher: ['/', '/analytics', '/login', '/signup', '/posts', '/posts/:path*', '/applications', '/applications/:path*', '/workflows', '/workflow/:path*', '/profile', '/contact', '/billing'],
};
