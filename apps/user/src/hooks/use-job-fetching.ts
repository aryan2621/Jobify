import { useState, useRef, useEffect, useCallback } from 'react';
import { Job } from '@jobify/domain/job';
import { fetchPaginatedJobs } from '@/lib/job-utils/service';
import { useDebounce } from '@/lib/job-utils/utils';
export const useJobFetching = (initialLimit = 10) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastId, setLastId] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef<HTMLDivElement | null>(null);
    const loadingRef = useRef(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [jobType, setJobType] = useState('all');
    const [workplaceType, setWorkplaceType] = useState('all');
    const [jobState, setJobState] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const fetchJobs = useCallback(async () => {
        if (loadingRef.current || !hasMore)
            return;
        setLoading(true);
        loadingRef.current = true;
        await fetchPaginatedJobs(initialLimit, lastId, (fetchedJobs, hasMoreJobs, newLastId) => {
            setJobs((prevJobs) => [...prevJobs, ...fetchedJobs]);
            setLastId(newLastId);
            setHasMore(hasMoreJobs);
        }, () => { });
        setLoading(false);
        loadingRef.current = false;
    }, [lastId, hasMore, initialLimit]);
    const debouncedFetchJobs = useDebounce(fetchJobs, 300);
    useEffect(() => {
        let filtered = [...jobs];
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((job) => job.profile.toLowerCase().includes(query) ||
                (job.company && job.company.toLowerCase().includes(query)) ||
                job.location.toLowerCase().includes(query) ||
                job.description.toLowerCase().includes(query) ||
                job.skills.some((skill) => skill.toLowerCase().includes(query)));
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
                case 'closing':
                    const getDaysRemaining = (deadline: string) => {
                        const today = new Date();
                        const lastDate = new Date(deadline);
                        return Math.ceil((lastDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    };
                    return getDaysRemaining(a.lastDateToApply) - getDaysRemaining(b.lastDateToApply);
                default:
                    return 0;
            }
        });
        setFilteredJobs(filtered);
    }, [jobs, searchQuery, jobType, workplaceType, jobState, sortBy]);
    const resetFilters = () => {
        setSearchQuery('');
        setJobType('all');
        setWorkplaceType('all');
        setJobState('all');
        setSortBy('newest');
    };
    useEffect(() => {
        debouncedFetchJobs();
    }, [debouncedFetchJobs]);
    useEffect(() => {
        if (!observerRef.current)
            return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                debouncedFetchJobs();
            }
        }, { threshold: 0.5 });
        observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [debouncedFetchJobs, hasMore]);
    return {
        jobs,
        filteredJobs,
        loading,
        hasMore,
        observerRef,
        searchQuery,
        setSearchQuery,
        jobType,
        setJobType,
        workplaceType,
        setWorkplaceType,
        jobState,
        setJobState,
        sortBy,
        setSortBy,
        resetFilters,
        fetchJobs: debouncedFetchJobs,
        setJobs,
    };
};
