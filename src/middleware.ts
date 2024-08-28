import getOrCreateDatabase from '@/appwrite/server/database';
import { getOrCreateStorage } from '@/appwrite/server/storage';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname?.toLowerCase();
    await Promise.all([getOrCreateDatabase(), getOrCreateStorage()]);
    const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
    const isPublicPath = publicPaths.includes(path);
    const token = request.cookies?.get('token');

    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }
    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: [
        '/analytics',
        '/login',
        '/signup',
        '/posts',
        '/post',
        '/applications',
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
        '/',
    ],
};
