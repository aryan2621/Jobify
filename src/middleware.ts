import getOrCreateDatabase from '@/appwrite/server/database';
import getOrCreateStorage from '@/appwrite/server/storage';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    await Promise.all([getOrCreateDatabase(), getOrCreateStorage()]);
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
