import { ADMIN_AUTH_COOKIE_NAME } from '@jobify/domain/auth-cookie';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, isRecognisedError } from '@jobify/domain/error';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MAX_PROMPT_LENGTH = 10000;
const ALLOWED_MODELS = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

export async function POST(request: NextRequest) {
    const token = request.cookies.get(ADMIN_AUTH_COOKIE_NAME);
    try {
        if (!token) {
            throw new UnauthorizedError('You are not authorized to use this feature');
        }
        jwt.verify(token.value, process.env.JWT_SECRET!);

        const body = await request.json();
        const prompt = typeof body?.prompt === 'string' ? body.prompt : '';
        const model = typeof body?.model === 'string' ? body.model : 'gemini-1.5-flash';

        if (!prompt.trim()) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }
        if (prompt.length > MAX_PROMPT_LENGTH) {
            return NextResponse.json({ error: 'Prompt exceeds maximum length' }, { status: 400 });
        }
        if (!ALLOWED_MODELS.includes(model)) {
            return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
        }

        const geminiModel = genAI.getGenerativeModel({ model });
        const response = await geminiModel.generateContent(prompt);
        return NextResponse.json(response.response.text(), { status: 200 });
    } catch (error) {
        if (isRecognisedError(error)) {
            const err = error as { message?: string; statusCode?: number };
            return NextResponse.json({ error: err.message }, { status: err.statusCode ?? 401 });
        }
        console.log('Error while asking AI', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
