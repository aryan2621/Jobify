import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Job } from '@jobify/domain/job';
import { fetchPaginatedJobs } from '@/lib/job-utils/service';

export type JobListFilters = {
    searchQuery: string;
    jobType: string;
    workplaceType: string;
    jobState: string;
    sortBy: string;
};

const DEFAULT_FILTERS: JobListFilters = {
    searchQuery: '',
    jobType: 'all',
    workplaceType: 'all',
    jobState: 'all',
    sortBy: 'newest',
};

export const useJobFetching = (pageSize = 10) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const loadingRef = useRef(false);
    const [page, setPage] = useState(1);

    const [draft, setDraft] = useState<JobListFilters>(DEFAULT_FILTERS);
    const [applied, setApplied] = useState<JobListFilters>(DEFAULT_FILTERS);

    const loadAllJobsFromServer = useCallback(async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        try {
            const allJobs: Job[] = [];
            let cursor: string | null = null;
            let more = true;
            while (more) {
                let batch: Job[] = [];
                let pageHasMore = false;
                let nextCursor: string | null = null;
                await fetchPaginatedJobs(
                    pageSize,
                    cursor,
                    (fetchedJobs, hasMoreJobs, newLastId) => {
                        batch = fetchedJobs;
                        pageHasMore = hasMoreJobs;
                        nextCursor = newLastId;
                    },
                    () => {}
                );
                if (batch.length === 0) break;
                allJobs.push(...batch);
                cursor = nextCursor;
                more = pageHasMore;
            }
            setJobs(allJobs);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [pageSize]);

    useEffect(() => {
        let filtered = [...jobs];
        const { searchQuery, jobType, workplaceType, jobState, sortBy } = applied;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (job) =>
                    job.profile.toLowerCase().includes(query) ||
                    (job.company && job.company.toLowerCase().includes(query)) ||
                    job.location.toLowerCase().includes(query) ||
                    job.description.toLowerCase().includes(query) ||
                    job.skills.some((skill) => skill.toLowerCase().includes(query))
            );
        }

        if (jobType !== 'all') {
            filtered = filtered.filter((job) => job.type === jobType);
        }

        if (workplaceType !== 'all') {
            filtered = filtered.filter((job) => job.workplaceType === workplaceType);
        }

        if (jobState !== 'all') {
            filtered = filtered.filter((job) => job.state === jobState);
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'closing': {
                    const getDaysRemaining = (deadline: string) => {
                        const today = new Date();
                        const lastDate = new Date(deadline);
                        return Math.ceil((lastDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    };
                    return getDaysRemaining(a.lastDateToApply) - getDaysRemaining(b.lastDateToApply);
                }
                default:
                    return 0;
            }
        });

        setFilteredJobs(filtered);
    }, [jobs, applied]);

    const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize) || 1);

    useEffect(() => {
        setPage((p) => Math.min(Math.max(1, p), totalPages));
    }, [totalPages]);

    const paginatedJobs = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredJobs.slice(start, start + pageSize);
    }, [filteredJobs, page, pageSize]);

    useEffect(() => {
        void loadAllJobsFromServer();
    }, [loadAllJobsFromServer]);

    const applyFilters = useCallback(() => {
        setApplied({ ...draft });
        setPage(1);
        void loadAllJobsFromServer();
    }, [draft, loadAllJobsFromServer]);

    const refreshJobs = useCallback(() => {
        setDraft({ ...applied });
        setPage(1);
        void loadAllJobsFromServer();
    }, [applied, loadAllJobsFromServer]);

    const clearFiltersAndApply = useCallback(() => {
        setDraft(DEFAULT_FILTERS);
        setApplied(DEFAULT_FILTERS);
        setPage(1);
        void loadAllJobsFromServer();
    }, [loadAllJobsFromServer]);

    const rangeStart = filteredJobs.length === 0 ? 0 : (page - 1) * pageSize + 1;
    const rangeEnd = Math.min(page * pageSize, filteredJobs.length);

    return {
        jobs,
        setJobs,
        filteredJobs,
        paginatedJobs,
        loading,
        page,
        setPage,
        pageSize,
        totalPages,
        totalFilteredCount: filteredJobs.length,
        rangeStart,
        rangeEnd,
        searchQuery: draft.searchQuery,
        setSearchQuery: (q: string) => setDraft((p) => ({ ...p, searchQuery: q })),
        jobType: draft.jobType,
        setJobType: (v: string) => setDraft((p) => ({ ...p, jobType: v })),
        workplaceType: draft.workplaceType,
        setWorkplaceType: (v: string) => setDraft((p) => ({ ...p, workplaceType: v })),
        jobState: draft.jobState,
        setJobState: (v: string) => setDraft((p) => ({ ...p, jobState: v })),
        sortBy: draft.sortBy,
        setSortBy: (v: string) => setDraft((p) => ({ ...p, sortBy: v })),
        applyFilters,
        refreshJobs,
        clearFiltersAndApply,
        appliedFilters: applied,
    };
};
