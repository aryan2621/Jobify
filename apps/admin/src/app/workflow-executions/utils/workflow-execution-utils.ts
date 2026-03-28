import { EventRun, WorkflowExecutionEvent } from './types';

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
}

export function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
}

export function formatContent(value?: string): string {
    if (!value) return '';
    try { return JSON.stringify(JSON.parse(value), null, 2); }
    catch { return value; }
}

export function parseContent(value?: string): unknown {
    if (!value) return null;
    try { return JSON.parse(value) as unknown; }
    catch { return value; }
}

export function getStepDisplayName(stepType: string): string {
    const normalized = stepType.trim().toLowerCase().replace(/[\s-]+/g, '_');
    const knownLabels: Record<string, string> = {
        start: 'Workflow Started',
        end: 'Workflow Completed',
        notify: 'Candidate Notification',
        update_status: 'Update application',
        assignment: 'Assignment Email',
        interview: 'Interview Scheduling',
        wait: 'Wait Timer',
        condition: 'Condition Check',
    };
    if (knownLabels[normalized]) return knownLabels[normalized];
    return stepType.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function describeEvent(event: WorkflowExecutionEvent): string {
    const stepName = getStepDisplayName(event.stepType);
    if (event.status === 'failed')    return `${stepName} failed while processing this workflow step.`;
    if (event.status === 'completed') return `${stepName} completed successfully and produced the output below.`;
    return `${stepName} started and is currently processing.`;
}

export function formatDuration(startedAt?: string, endedAt?: string): string | null {
    if (!startedAt || !endedAt) return null;
    const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
    if (!Number.isFinite(ms) || ms < 0) return null;
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export function hasUsefulPayload(value?: string): boolean {
    const parsed = parseContent(value);
    if (parsed == null) return false;
    if (typeof parsed === 'string') return parsed.trim().length > 0 && parsed.trim() !== '{}';
    if (typeof parsed === 'object') return JSON.stringify(parsed) !== '{}';
    return true;
}

export function formatJsonValue(value: unknown): string {
    if (value === undefined) return '';
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

/** Pretty block for event payload; shows placeholder when empty. */
export function formatEventPayloadDisplay(raw?: string): string {
    if (raw === undefined || raw === null || String(raw).trim() === '') {
        return '(empty)';
    }
    const parsed = parseContent(raw);
    if (parsed === null || parsed === undefined) return '(empty)';
    if (typeof parsed === 'object') return formatJsonValue(parsed);
    return String(parsed);
}

export function buildEventRuns(events: WorkflowExecutionEvent[]): EventRun[] {
    const sorted = [...events].sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const runs: EventRun[] = [];
    const openRunsByNode = new Map<string, EventRun>();

    for (const event of sorted) {
        if (event.status === 'started') {
            const run: EventRun = {
                key: `${event.nodeId}-${event.createdAt}-${event.id}`,
                nodeId: event.nodeId,
                stepType: event.stepType,
                startedAt: event.createdAt,
                endedAt: undefined,
                finalStatus: 'started',
                events: [event],
            };
            runs.push(run);
            openRunsByNode.set(event.nodeId, run);
            continue;
        }
        const activeRun = openRunsByNode.get(event.nodeId);
        if (activeRun) {
            activeRun.events.push(event);
            activeRun.finalStatus = event.status;
            activeRun.endedAt = event.createdAt;
            openRunsByNode.delete(event.nodeId);
            continue;
        }
        runs.push({
            key: `${event.nodeId}-${event.createdAt}-${event.id}`,
            nodeId: event.nodeId,
            stepType: event.stepType,
            startedAt: undefined,
            endedAt: event.createdAt,
            finalStatus: event.status,
            events: [event],
        });
    }
    return runs;
}

export function getRunTone(status: WorkflowExecutionEvent['status']) {
    if (status === 'failed')    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (status === 'completed') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
}
