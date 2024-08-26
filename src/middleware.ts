import getOrCreateDatabase from '@/appwrite/server/database';
import { getOrCreateStorage } from '@/appwrite/server/storage';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname?.toLowerCase();
    await Promise.all([getOrCreateDatabase(), getOrCreateStorage()]);
    const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
    const isPublicPath = publicPaths.includes(path);
    const token = request.cookies.get('token');
    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/', request.nextUrl).toString());
    }
    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/login', request.nextUrl).toString());
    }
}

export const config = {
    matcher: ['/', '/login', '/signup', '/forgot-password', '/reset-password'],
};
