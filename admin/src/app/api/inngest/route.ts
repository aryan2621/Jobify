import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { runWorkflowStep } from '@/inngest/functions/workflow';

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [runWorkflowStep],
});
