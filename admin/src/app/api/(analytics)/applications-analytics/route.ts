import { ApplicationStatus } from '@/model/application';
import { isRecognisedError, UnauthorizedError } from '@/model/error';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { fetchApplicationsByJobIds } from '@/appwrite/server/collections/application-collection';
import { fetchJobsByUserId } from '@/appwrite/server/collections/job-collection';

const MAX_APPLICATIONS = 5000;

function formatDateKey(createdAt: string): string {
    const d = new Date(createdAt);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const userId = (user as { id: string }).id;

        const jobs = await fetchJobsByUserId(userId);
        const jobIds = jobs.map((j) => j.id);
        const documents = await fetchApplicationsByJobIds(jobIds, MAX_APPLICATIONS);

        const byStatus = { applied: 0, selected: 0, rejected: 0 };
        const periodMap: Record<string, { applied: number; selected: number; rejected: number }> = {};

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
            } else if (status === ApplicationStatus.SELECTED) {
                byStatus.selected++;
                periodMap[dateKey].selected++;
            } else if (status === ApplicationStatus.REJECTED) {
                byStatus.rejected++;
                periodMap[dateKey].rejected++;
            }
        }

        const byPeriod = Object.entries(periodMap)
            .map(([date, counts]) => ({ date, ...counts }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const total = byStatus.applied + byStatus.selected + byStatus.rejected;

        return NextResponse.json(
            {
                total,
                byStatus: { applied: byStatus.applied, selected: byStatus.selected, rejected: byStatus.rejected },
                byPeriod,
            },
            { status: 200 }
        );
    } catch (error) {
        if (isRecognisedError(error)) {
            console.log('Error while fetching applications analytics', error);
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ message: 'Error while fetching applications analytics' }, { status: 500 });
    }
}
