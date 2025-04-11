'use client';
import { ReactFlowProvider } from '@xyflow/react';
import NavbarLayout from '@/layouts/navbar';
import { DnDProvider } from '@/context/workflow';
import { Editor } from '@/components/workflows/components/editor';

export default function Component() {
    return (
        <ReactFlowProvider>
            <NavbarLayout>
                <DnDProvider>
                    <Editor />
                </DnDProvider>
            </NavbarLayout>
        </ReactFlowProvider>
    );
}
