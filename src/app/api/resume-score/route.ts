import { getResumeFromBucket } from '@/appwrite/server/storage';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { ChatOpenAI } from '@langchain/openai';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: 'gpt-4o-mini',
});

const prompt = `
Analyze the provided resume for ATS (Applicant Tracking System) compatibility and return the result as a JSON object with the following keys:

1. "score": A numeric value between 0 and 100 indicating the resume's ATS compatibility based on keyword relevance, formatting, grammar, and structure.
2. "suggestions": An array of strings, where each string identifies a specific issue in the resume and provides a clear, actionable correction.

Focus your analysis on the following:
- **Keyword Relevance**: Evaluate if the resume includes appropriate keywords matching the target job description.
- **Formatting**: Check for proper use of headers, bullet points, consistent fonts, and ATS-friendly formatting (e.g., avoid tables or images that ATS systems may not parse).
- **Content Quality**: Assess grammar, spelling, clarity, and conciseness of descriptions.
- **Structure**: Ensure the resume has logically organized sections (e.g., Summary, Skills, Experience, Education).
- **Alignment**: Verify how well the content aligns with a standard ATS parsing system and a target job description.

Return precise and actionable feedback in the "suggestions" array, e.g., "The 'Experience' section lacks role-specific keywords such as 'project management'—add relevant terms." or "Avoid using images or charts; replace them with plain text to improve ATS readability."
`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fileId } = body;

        const resumeBuffer = await getResumeFromBucket(fileId);
        if (!resumeBuffer) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        // Create temporary directory and file for the resume
        const tempDir = path.join(os.tmpdir(), 'resume-score');
        await removeTempFile(tempDir);
        await fs.mkdir(tempDir, { recursive: true });
        const tempFilePath = path.join(tempDir, `resume-${fileId}.pdf`);
        await fs.writeFile(tempFilePath, Buffer.from(resumeBuffer));

        const loader = new PDFLoader(tempFilePath);
        const docs = await loader.load();

        const resumeContent = docs.map((doc: any) => doc.pageContent).join('\n');
        const messages = [
            {
                role: 'system',
                content: prompt,
            },
            {
                role: 'user',
                content: resumeContent,
            },
        ];

        const response = await model.invoke(messages);

        const responseText = response.content as string;
        const jsonStartIndex = responseText.indexOf('{');
        const jsonEndIndex = responseText.lastIndexOf('}');
        const jsonResponse = responseText.substring(jsonStartIndex, jsonEndIndex + 1);
        const parsedResponse = JSON.parse(jsonResponse);
        await removeTempFile(tempFilePath);
        return NextResponse.json(parsedResponse, { status: 200 });
    } catch (error) {
        console.error('Error while fetching resume score:', error);
        return NextResponse.json({ error: 'Error while fetching resume score' }, { status: 500 });
    }
}

async function removeTempFile(tempFilePath: string) {
    try {
        await fs.rm(tempFilePath, { recursive: true, force: true });
    } catch (error) {
        console.error('Error removing temp file:', error);
    }
}
