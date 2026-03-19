import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RefreshCw, Briefcase, Building, Filter, SortAsc } from 'lucide-react';
import { JobType, WorkplaceTypes, JobState } from '@/model/job';

interface FilterBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    jobType: string;
    setJobType: (type: string) => void;
    workplaceType: string;
    setWorkplaceType: (type: string) => void;
    jobState?: string;
    setJobState?: (state: string) => void;
    sortBy?: string;
    setSortBy?: (sort: string) => void;
    resetFilters: () => void;
    isAdmin?: boolean;
    compact?: boolean;
}

export const FilterBar = ({
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
    isAdmin = false,
    compact = false,
}: FilterBarProps) => {
    if (compact) {
        return (
            <div className='bg-background/95 pb-3 pt-2 mb-4 border-b'>
                <div className='flex flex-col gap-3'>
                    <div className='relative w-[96%] mx-auto'>
                        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                        <Input
                            placeholder='Search job title, company, or skills...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='pl-9 w-full'
                        />
                    </div>

                    <div className='flex items-center gap-2 flex-wrap w-[96%] mx-auto'>
                        <Select value={jobType} onValueChange={setJobType}>
                            <SelectTrigger className='h-8 text-xs flex-1 min-w-[130px]'>
                                <Briefcase className='mr-2 h-3.5 w-3.5' />
                                <SelectValue placeholder='Job Type' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>All Types</SelectItem>
                                <SelectItem value={JobType.FULL_TIME}>{JobType.FULL_TIME}</SelectItem>
                                <SelectItem value={JobType.PART_TIME}>{JobType.PART_TIME}</SelectItem>
                                <SelectItem value={JobType.CONTRACT}>{JobType.CONTRACT}</SelectItem>
                                <SelectItem value={JobType.INTERNSHIP}>{JobType.INTERNSHIP}</SelectItem>
                                <SelectItem value={JobType.TEMPORARY}>{JobType.TEMPORARY}</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={workplaceType} onValueChange={setWorkplaceType}>
                            <SelectTrigger className='h-8 text-xs flex-1 min-w-[130px]'>
                                <Building className='mr-2 h-3.5 w-3.5' />
                                <SelectValue placeholder='Workplace Type' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>All Locations</SelectItem>
                                <SelectItem value={WorkplaceTypes.REMOTE}>{WorkplaceTypes.REMOTE}</SelectItem>
                                <SelectItem value={WorkplaceTypes.HYBRID}>{WorkplaceTypes.HYBRID}</SelectItem>
                                <SelectItem value={WorkplaceTypes.ONSITE}>{WorkplaceTypes.ONSITE}</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant='ghost' size='icon' className='h-8 w-8' onClick={resetFilters} title='Reset filters'>
                            <RefreshCw className='h-3.5 w-3.5' />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='space-y-4'>
            <div className='relative'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                    placeholder='Search job title, company, or skills...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-9'
                />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
                <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger>
                        <div className='flex items-center'>
                            <Briefcase className='h-4 w-4 mr-2' />
                            <SelectValue placeholder='Job Type' />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all'>All Types</SelectItem>
                        <SelectItem value={JobType.FULL_TIME}>{JobType.FULL_TIME}</SelectItem>
                        <SelectItem value={JobType.PART_TIME}>{JobType.PART_TIME}</SelectItem>
                        <SelectItem value={JobType.CONTRACT}>{JobType.CONTRACT}</SelectItem>
                        <SelectItem value={JobType.INTERNSHIP}>{JobType.INTERNSHIP}</SelectItem>
                        <SelectItem value={JobType.TEMPORARY}>{JobType.TEMPORARY}</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={workplaceType} onValueChange={setWorkplaceType}>
                    <SelectTrigger>
                        <div className='flex items-center'>
                            <Briefcase className='h-4 w-4 mr-2' />
                            <SelectValue placeholder='Workplace Type' />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all'>All Locations</SelectItem>
                        <SelectItem value={WorkplaceTypes.REMOTE}>{WorkplaceTypes.REMOTE}</SelectItem>
                        <SelectItem value={WorkplaceTypes.HYBRID}>{WorkplaceTypes.HYBRID}</SelectItem>
                        <SelectItem value={WorkplaceTypes.ONSITE}>{WorkplaceTypes.ONSITE}</SelectItem>
                    </SelectContent>
                </Select>

                {isAdmin && setJobState && jobState && (
                    <Select value={jobState} onValueChange={setJobState}>
                        <SelectTrigger>
                            <div className='flex items-center'>
                                <Filter className='h-4 w-4 mr-2' />
                                <SelectValue placeholder='Status' />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>All Status</SelectItem>
                            <SelectItem value={JobState.PUBLISHED}>{JobState.PUBLISHED}</SelectItem>
                            <SelectItem value={JobState.DRAFT}>{JobState.DRAFT}</SelectItem>
                            <SelectItem value={JobState.CLOSED}>{JobState.CLOSED}</SelectItem>
                        </SelectContent>
                    </Select>
                )}

                {isAdmin && setSortBy && sortBy && (
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                            <div className='flex items-center'>
                                <SortAsc className='h-4 w-4 mr-2' />
                                <SelectValue placeholder='Sort By' />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='newest'>Newest First</SelectItem>
                            <SelectItem value='oldest'>Oldest First</SelectItem>
                            <SelectItem value='applicationsHigh'>Most Applications</SelectItem>
                            <SelectItem value='applicationsLow'>Least Applications</SelectItem>
                            <SelectItem value='closing'>Closing Soon</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            </div>

            <div className='flex justify-end'>
                <Button variant='outline' size='sm' onClick={resetFilters}>
                    <RefreshCw className='h-4 w-4 mr-2' />
                    Reset Filters
                </Button>
            </div>
        </div>
    );
};
