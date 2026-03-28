'use client';
import React from 'react';
import { Input } from '../input';
import { Button } from '../button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';
import { Search, RefreshCw, SortAsc, Users, Clock, Send } from 'lucide-react';
import { ApplicationStatus, ApplicationStage } from '../../../domain/src/application';

type SortOption = 'newest' | 'oldest' | 'nameAsc' | 'nameDesc';

interface ApplicationFilterBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    stageFilter: string;
    setStageFilter: (stage: string) => void;
    onApply: () => void;
    onRefresh: () => void;
    compact?: boolean;
    sortBy?: SortOption;
    setSortBy?: (value: SortOption) => void;
}

export const ApplicationFilterBar: React.FC<ApplicationFilterBarProps> = ({
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    stageFilter,
    setStageFilter,
    onApply,
    onRefresh,
    compact = false,
    sortBy,
    setSortBy,
}) => {
    const actionButtons = (
        <div className='flex items-center gap-2 shrink-0'>
            <Button
                type='button'
                variant='outline'
                size='icon'
                className={compact ? 'h-8 w-8' : 'h-9 w-9'}
                onClick={onRefresh}
                aria-label='Reload all data from server'
                title='Reload all data from server'
            >
                <RefreshCw className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            </Button>
            <Button
                type='button'
                variant='default'
                size='icon'
                className={compact ? 'h-8 w-8' : 'h-9 w-9'}
                onClick={onApply}
                aria-label='Apply filters'
                title='Apply filters'
            >
                <Send className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            </Button>
        </div>
    );

    if (compact) {
        return (
            <div className='bg-background/95 pb-3 pt-2 mb-4 border-b'>
                <div className='flex flex-col gap-3'>
                    <div className='relative w-full'>
                        <Search className='absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2' />
                        <Input
                            placeholder='Search applications...'
                            value={searchQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            className='pl-9 w-full'
                        />
                    </div>

                    <div className='flex items-center gap-2 flex-wrap w-full'>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className='h-8 text-xs flex-1 min-w-[130px]'>
                                <Clock className='mr-2 h-3.5 w-3.5' />
                                <SelectValue placeholder='Application Status' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>All Statuses</SelectItem>
                                <SelectItem value={ApplicationStatus.APPLIED}>Applied</SelectItem>
                                <SelectItem value={ApplicationStatus.SELECTED}>Selected</SelectItem>
                                <SelectItem value={ApplicationStatus.REJECTED}>Rejected</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={stageFilter} onValueChange={setStageFilter}>
                            <SelectTrigger className='h-8 text-xs flex-1 min-w-[130px]'>
                                <Users className='mr-2 h-3.5 w-3.5' />
                                <SelectValue placeholder='Application Stage' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>All Stages</SelectItem>
                                <SelectItem value={ApplicationStage.APPLIED}>Applied</SelectItem>
                                <SelectItem value={ApplicationStage.SHORTLISTED}>Shortlisted</SelectItem>
                                <SelectItem value={ApplicationStage.ASSIGNMENT_SENT}>Assignment Sent</SelectItem>
                                <SelectItem value={ApplicationStage.ASSIGNMENT_SUBMITTED}>Assignment Submitted</SelectItem>
                                <SelectItem value={ApplicationStage.INTERVIEW_SCHEDULED}>Interview Scheduled</SelectItem>
                                <SelectItem value={ApplicationStage.INTERVIEW_DONE}>Interview Done</SelectItem>
                                <SelectItem value={ApplicationStage.OFFER_SENT}>Offer Sent</SelectItem>
                                <SelectItem value={ApplicationStage.HIRED}>Hired</SelectItem>
                                <SelectItem value={ApplicationStage.REJECTED}>Rejected</SelectItem>
                                <SelectItem value={ApplicationStage.WITHDRAWN}>Withdrawn</SelectItem>
                            </SelectContent>
                        </Select>

                        {sortBy !== undefined && setSortBy && (
                            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                                <SelectTrigger className='h-8 text-xs flex-1 min-w-[130px]'>
                                    <SortAsc className='mr-2 h-3.5 w-3.5' />
                                    <SelectValue placeholder='Sort by' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='newest'>Newest First</SelectItem>
                                    <SelectItem value='oldest'>Oldest First</SelectItem>
                                    <SelectItem value='nameAsc'>Name (A-Z)</SelectItem>
                                    <SelectItem value='nameDesc'>Name (Z-A)</SelectItem>
                                </SelectContent>
                            </Select>
                        )}

                        {actionButtons}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='space-y-4 mb-8'>
            <div className='relative'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                    placeholder='Search applications...'
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className='pl-9'
                />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                        <div className='flex items-center'>
                            <Clock className='h-4 w-4 mr-2' />
                            <SelectValue placeholder='Application Status' />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all'>All Statuses</SelectItem>
                        <SelectItem value={ApplicationStatus.APPLIED}>Applied</SelectItem>
                        <SelectItem value={ApplicationStatus.SELECTED}>Selected</SelectItem>
                        <SelectItem value={ApplicationStatus.REJECTED}>Rejected</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={stageFilter} onValueChange={setStageFilter}>
                    <SelectTrigger>
                        <div className='flex items-center'>
                            <Users className='h-4 w-4 mr-2' />
                            <SelectValue placeholder='Application Stage' />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all'>All Stages</SelectItem>
                        <SelectItem value={ApplicationStage.APPLIED}>Applied</SelectItem>
                        <SelectItem value={ApplicationStage.SHORTLISTED}>Shortlisted</SelectItem>
                        <SelectItem value={ApplicationStage.ASSIGNMENT_SENT}>Assignment Sent</SelectItem>
                        <SelectItem value={ApplicationStage.ASSIGNMENT_SUBMITTED}>Assignment Submitted</SelectItem>
                        <SelectItem value={ApplicationStage.INTERVIEW_SCHEDULED}>Interview Scheduled</SelectItem>
                        <SelectItem value={ApplicationStage.INTERVIEW_DONE}>Interview Done</SelectItem>
                        <SelectItem value={ApplicationStage.OFFER_SENT}>Offer Sent</SelectItem>
                        <SelectItem value={ApplicationStage.HIRED}>Hired</SelectItem>
                        <SelectItem value={ApplicationStage.REJECTED}>Rejected</SelectItem>
                        <SelectItem value={ApplicationStage.WITHDRAWN}>Withdrawn</SelectItem>
                    </SelectContent>
                </Select>

                {sortBy !== undefined && setSortBy && (
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                        <SelectTrigger>
                            <div className='flex items-center'>
                                <SortAsc className='h-4 w-4 mr-2' />
                                <SelectValue placeholder='Sort by' />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='newest'>Newest First</SelectItem>
                            <SelectItem value='oldest'>Oldest First</SelectItem>
                            <SelectItem value='nameAsc'>Name (A-Z)</SelectItem>
                            <SelectItem value='nameDesc'>Name (Z-A)</SelectItem>
                        </SelectContent>
                    </Select>
                )}

                <div className='flex items-end sm:col-span-2 lg:col-span-1 lg:items-center lg:h-10'>{actionButtons}</div>
            </div>
        </div>
    );
};
