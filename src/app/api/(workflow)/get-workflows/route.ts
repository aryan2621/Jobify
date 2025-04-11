import { isRecognisedError, UnauthorizedError } from '@/model/error';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getWorkflowsByUserId, getAllWorkflows, getWorkflowTemplates } from '@/appwrite/server/collections/workflow-collection';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token');
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to perform this action');
        }

        const user = jwt.verify(token.value, process.env.JWT_SECRET!);
        const userId = (user as any).id;

        const type = req.nextUrl.searchParams.get('type') || 'user';
        const limit = req.nextUrl.searchParams.get('limit');
        const lastId = req.nextUrl.searchParams.get('lastId');

        let workflows;

        // Fetch workflows based on type
        switch (type) {
            case 'user':
                workflows = await getWorkflowsByUserId(userId);
                break;
            case 'templates':
                workflows = await getWorkflowTemplates();
                break;
            case 'all':
                // Only allow admins to fetch all workflows
                if ((user as any).role !== 'admin') {
                    throw new UnauthorizedError('You are not authorized to access all workflows');
                }
                workflows = await getAllWorkflows(lastId || null, limit ? parseInt(limit) : null);
                break;
            default:
                return NextResponse.json({ message: 'Invalid workflow type' }, { status: 400 });
        }

        return NextResponse.json(workflows, { status: 200 });
    } catch (error) {
        console.log('Error while fetching workflows', error);
        if (isRecognisedError(error)) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ message: 'Error while fetching workflows' }, { status: 500 });
    }
}
