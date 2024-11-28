import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { prompt, model } = body;
        const geminiModel = genAI.getGenerativeModel({
            model: model,
        });
        const response = await geminiModel.generateContent(prompt);
        return NextResponse.json(response.response.text(), { status: 200 });
    } catch (error) {
        console.log('Error while asking AI', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
