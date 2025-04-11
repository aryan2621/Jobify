import getOrCreateDatabase from '@/appwrite/server/database';
import { getOrCreateStorage } from '@/appwrite/server/storage';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname?.toLowerCase();
    await Promise.all([getOrCreateDatabase(), getOrCreateStorage()]);

    const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
    const isPublicPath = publicPaths.includes(path);
    const token = request.cookies?.get('token');

    const isAdminPath = path.startsWith('/admin');
    const isUserPath = path.startsWith('/user');

    let user = null;

    if (token) {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            const verified = await jwtVerify(token.value, secret);
            user = verified.payload;
        } catch (error) {
            console.log('Invalid token:', error);
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('token');
            return response;
        }
    }
    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }
    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    if (user) {
        if (isAdminPath && user.role !== 'admin') {
            return NextResponse.redirect(new URL('/user/posts', request.url));
        }
        if (isUserPath && user.role !== 'user') {
            return NextResponse.redirect(new URL('/admin/posts', request.url));
        }
    }
}

export const config = {
    matcher: ['/', '/analytics', '/login', '/signup', '/admin/:path*', '/user/:path*', '/profile', '/contact', '/billing'],
};
