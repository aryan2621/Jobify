'use client';
import { ReactFlowProvider } from '@xyflow/react';
import NavbarLayout from '@/layouts/navbar';
import { DnDProvider } from '@/context/workflow';
import { Editor } from '@/components/workflows/components/editor';

export default function EditWorkflowPage({ params }: { params: { id: string } }) {
    const { id } = params;
    return (
        <ReactFlowProvider>
            <NavbarLayout>
                <DnDProvider>
                    <Editor workflowId={id} />
                </DnDProvider>
            </NavbarLayout>
        </ReactFlowProvider>
    );
}
