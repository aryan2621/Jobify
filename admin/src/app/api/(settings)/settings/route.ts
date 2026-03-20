import { NextRequest, NextResponse } from 'next/server';
import { fetchUserByUserId } from '@/appwrite/server/collections/user-collection';
import jwt from 'jsonwebtoken';

import { ServiceProvider } from '@/model/settings';
import { database } from '@/appwrite/server/config';
import { DB_NAME, SETTINGS_COLLECTION } from '@/appwrite/name';
import { Query } from 'node-appwrite';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const payload = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        await fetchUserByUserId(payload.id);
        
        const queries = [Query.equal('userId', payload.id)];
        const records = await database.listDocuments(DB_NAME, SETTINGS_COLLECTION, queries);
        
        const gmailConnected = records.documents.some(doc => doc.provider === ServiceProvider.GMAIL);
        const calendarConnected = records.documents.some((doc) => doc.provider === ServiceProvider.GOOGLE_CALENDAR);
        
        return NextResponse.json(
            { 
                gmailConnected, 
                calendarConnected 
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching settings', error);
        return NextResponse.json({ gmailConnected: false, calendarConnected: false }, { status: 200 });
    }
}
