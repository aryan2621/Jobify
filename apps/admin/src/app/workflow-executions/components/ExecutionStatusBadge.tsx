'use client';

import { Badge } from '@jobify/ui/badge';
import { WorkflowExecution } from '../utils/types';

export function ExecutionStatusBadge({ status }: { status: WorkflowExecution['status'] }) {
    const cls =
        status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
        status === 'failed'    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
        status === 'waiting'   ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    return <Badge variant='outline' className={cls}>{status}</Badge>;
}
