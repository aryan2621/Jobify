import { USER_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { isRecognisedError, UnauthorizedError } from '@jobify/domain/error';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { fetchApplicationsByUserId } from '@jobify/appwrite-server/collections/application-collection';
import { UserApplicationsRequest } from '@jobify/domain/request';
import { ApplicationStatus } from '@jobify/domain/application';
const MAX_LIMIT = 500;
function formatDateKey(createdAt: string): string {
    const d = new Date(createdAt);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
export async function GET(req: NextRequest) {
    const token = req.cookies.get(USER_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const id = (user as {
            id: string;
        }).id;
        const documents = await fetchApplicationsByUserId(id, new UserApplicationsRequest(null, MAX_LIMIT));
        const byStatus = { applied: 0, selected: 0, rejected: 0 };
        const periodMap: Record<string, {
            applied: number;
            selected: number;
            rejected: number;
        }> = {};
        const sorted = [...documents].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        for (const doc of sorted) {
            const status = doc.status as string;
            const dateKey = formatDateKey(doc.createdAt);
            if (!periodMap[dateKey]) {
                periodMap[dateKey] = { applied: 0, selected: 0, rejected: 0 };
            }
            if (status === ApplicationStatus.APPLIED) {
                byStatus.applied++;
                periodMap[dateKey].applied++;
            }
            else if (status === ApplicationStatus.SELECTED) {
                byStatus.selected++;
                periodMap[dateKey].selected++;
            }
            else if (status === ApplicationStatus.REJECTED) {
                byStatus.rejected++;
                periodMap[dateKey].rejected++;
            }
        }
        const byPeriod = Object.entries(periodMap)
            .map(([date, counts]) => ({ date, ...counts }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const total = byStatus.applied + byStatus.selected + byStatus.rejected;
        return NextResponse.json({
            total,
            byStatus: { applied: byStatus.applied, selected: byStatus.selected, rejected: byStatus.rejected },
            byPeriod,
        }, { status: 200 });
    }
    catch (error) {
        const err = error as any;
        if (isRecognisedError(err)) {
            return NextResponse.json({ message: err.message }, { status: err.statusCode });
        }
        console.error('Error while fetching application analytics', error);
        return NextResponse.json({ message: 'Error while fetching application analytics' }, { status: 500 });
    }
}
