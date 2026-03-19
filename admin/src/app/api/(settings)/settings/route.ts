import { NextRequest, NextResponse } from 'next/server';
import { fetchUserByUserId } from '@/appwrite/server/collections/user-collection';
import { fetchSettingsByUserId } from '@/appwrite/server/collections/settings-collection';
import { EmailProvider } from '@/model/settings';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const payload = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        await fetchUserByUserId(payload.id);
        const settings = await fetchSettingsByUserId(payload.id);
        return NextResponse.json(
            { provider: settings.provider, gmailConnected: settings.provider === EmailProvider.GMAIL },
            { status: 200 }
        );
    } catch (error) {
        if ((error as { message?: string })?.message === 'Email settings not found') {
            return NextResponse.json({ provider: null, gmailConnected: false }, { status: 200 });
        }
        console.error('Error fetching settings', error);
        return NextResponse.json({ message: 'Error fetching settings' }, { status: 500 });
    }
}
