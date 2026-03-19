import ky from 'ky';
import { Job } from '@/model/job';
import { mapJobResponse } from '@/lib/job-utils/utils';
import { toast } from '@/components/ui/use-toast';

export const fetchPaginatedJobs = async (
    limit: number,
    lastId: string | null,
    onSuccess: (jobs: Job[], hasMore: boolean, lastId: string | null) => void,
    onError: () => void
) => {
    try {
        const url = '/api/posts?limit=' + limit + (lastId ? '&lastId=' + lastId : '');
        const response = (await ky.get(url).json()) as Job[];
        const fetchedJobs = (response ?? []).map(mapJobResponse);

        onSuccess(fetchedJobs, fetchedJobs.length === limit, fetchedJobs.length ? fetchedJobs[fetchedJobs.length - 1].id : null);

        return fetchedJobs;
    } catch (error) {
        console.error('Error fetching jobs:', error);
        toast({
            title: 'Error',
            description: 'Failed to load jobs. Please try again.',
            variant: 'destructive',
        });
        onError();
        return [];
    }
};

export const deleteJob = async (jobId: string) => {
    try {
        await ky.delete(`/api/post/${jobId}`);
        toast({
            title: 'Job Deleted',
            description: 'The job posting has been successfully deleted',
        });
        return true;
    } catch (error) {
        console.error('Error deleting job:', error);
        toast({
            title: 'Error',
            description: 'Failed to delete job. Please try again.',
            variant: 'destructive',
        });
        return false;
    }
};
