import { NextRequest } from 'next/server';
import { CalendarService } from '@/appwrite/server/services/calendar-service';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            throw new Error('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const userId = (user as any).id;
        const { authCode } = await req.json();
        await CalendarService.connectToCalendar(authCode, userId);
        return NextResponse.json({ message: 'Calendar connected successfully' }, { status: 200 });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : 'Error while connecting to Calendar';
        
        console.error('Error while connecting to Calendar', error);
        return NextResponse.json({ message }, { status: 500 });
    }
}
