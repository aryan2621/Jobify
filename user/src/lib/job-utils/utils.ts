import { useCallback, useRef } from 'react';
import { Job } from '@/model/job';
export const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const lastDate = new Date(deadline);
    const diffTime = lastDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

export const useDebounce = (cb: () => void, delay: number) => {
    const handlerRef = useRef<number | null>(null);

    const debouncedFunction = useCallback(() => {
        if (handlerRef.current) clearTimeout(handlerRef.current);

        handlerRef.current = window.setTimeout(() => {
            cb();
            handlerRef.current = null;
        }, delay);
    }, [cb, delay]);

    return debouncedFunction;
};

export const mapJobResponse = (job: Job) =>
    new Job(
        job.id,
        job.profile,
        job.description,
        job.company,
        job.type,
        job.workplaceType,
        job.lastDateToApply,
        job.location,
        job.skills,
        job.rejectionContent,
        job.selectionContent,
        job.createdAt,
        job.state,
        job.createdBy,
        job.applications
    );
