'use client';

import { ReactFlowProvider } from '@xyflow/react';
import NavbarLayout from '@/layouts/navbar';
import { DnDProvider } from '@/context/workflow';
import { Editor } from '@/components/workflows/components/editor';

export default function WorkflowPage({ params }: { params: { id?: string[] } }) {
    const workflowId = params.id?.[0];

    return (
        <ReactFlowProvider>
            <NavbarLayout>
                <DnDProvider>
                    <Editor workflowId={workflowId} />
                </DnDProvider>
            </NavbarLayout>
        </ReactFlowProvider>
    );
}
