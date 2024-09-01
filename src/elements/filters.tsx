'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PlusCircle, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const fields = ['location', 'name', 'age'];
const operators = ['equal', 'unequal', 'exist', 'not exist'];

interface FilterRowProps {
    filter: {
        id: number;
        field: string;
        operator: string;
        value: string;
    };
    updateFilter: (filter: { id: number; field: string; operator: string; value: string }) => void;
    removeFilter: (id: number) => void;
}

const FilterRow: React.FC<FilterRowProps> = ({ filter, updateFilter, removeFilter }) => (
    <div className='flex flex-col space-y-2 w-full mb-4'>
        <div className='flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full'>
            <Select value={filter.field || ''} onValueChange={(value) => updateFilter({ ...filter, field: value })}>
                <SelectTrigger className='col-3'>
                    <SelectValue placeholder='Select field' />
                </SelectTrigger>
                <SelectContent>
                    {fields.map((field) => (
                        <SelectItem key={field} value={field}>
                            {field}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={filter.operator || ''} onValueChange={(value) => updateFilter({ ...filter, operator: value })}>
                <SelectTrigger className='col-3'>
                    <SelectValue placeholder='Select operator' />
                </SelectTrigger>
                <SelectContent>
                    {operators.map((op) => (
                        <SelectItem key={op} value={op}>
                            {op}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {filter.operator !== 'exist' && filter.operator !== 'not exist' && (
                <Input
                    type='text'
                    placeholder='Value'
                    value={filter.value || ''}
                    onChange={(e) => updateFilter({ ...filter, value: e.target.value })}
                    className='col-3'
                />
            )}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => removeFilter(filter.id)}
                            className='p-0 h-8 w-8 flex items-center justify-center col-1'
                        >
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='24'
                                height='24'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            >
                                <line x1='18' y1='6' x2='6' y2='18'></line>
                                <line x1='6' y1='6' x2='18' y2='18'></line>
                            </svg>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Remove this filter</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    </div>
);

interface FilterGroupProps {
    group: {
        id: number;
        filters: {
            id: number;
            field: string;
            operator: string;
            value: string;
        }[];
        operator: string;
    };
    updateFilter: (groupId: number, filter: { id: number; field: string; operator: string; value: string }) => void;
    removeFilter: (groupId: number, filterId: number) => void;
    addFilter: (groupId: number) => void;
    updateGroupOperator: (groupId: number, operator: string) => void;
}

const FilterGroup: React.FC<FilterGroupProps> = ({ group, updateFilter, removeFilter, addFilter, updateGroupOperator }) => {
    if (!group || !group.filters) {
        return null;
    }
    return (
        <div key={group.id} className='space-y-4 mb-6 w-full'>
            {group.filters.map((filter, filterIndex) => (
                <React.Fragment key={filter.id}>
                    <FilterRow
                        filter={filter}
                        updateFilter={(updatedFilter) => updateFilter(group.id, updatedFilter)}
                        removeFilter={() => removeFilter(group.id, filter.id)}
                    />
                    {filterIndex < group.filters.length - 1 && (
                        <div className='flex justify-center my-2'>
                            <Select value={group.operator} onValueChange={(value) => updateGroupOperator(group.id, value)}>
                                <SelectTrigger className='w-[100px]'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='AND'>AND</SelectItem>
                                    <SelectItem value='OR'>OR</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </React.Fragment>
            ))}
            <Button onClick={() => addFilter(group.id)} variant='outline' className='w-full'>
                <PlusCircle className='mr-2 h-4 w-4' /> Add Filter
            </Button>
        </div>
    );
};

export default function FiltersPage() {
    const [filterGroups, setFilterGroups] = useState<
        { id: number; filters: { id: number; field: string; operator: string; value: string }[]; operator: string }[]
    >([{ id: Date.now(), filters: [], operator: 'AND' }]);

    const addFilter = (groupId: number) => {
        setFilterGroups((groups) =>
            groups.map((group) => {
                if (group.id === groupId) {
                    return {
                        ...group,
                        filters: [...group.filters, { id: Date.now(), field: '', operator: '', value: '' }],
                    };
                }
                return group;
            })
        );
    };

    const updateFilter = (groupId: number, updatedFilter: { id: number; field: string; operator: string; value: string }) => {
        setFilterGroups((groups) =>
            groups.map((group) => {
                if (group.id === groupId) {
                    return {
                        ...group,
                        filters: group.filters.map((filter) => (filter.id === updatedFilter.id ? updatedFilter : filter)),
                    };
                }
                return group;
            })
        );
    };

    const removeFilter = (groupId: number, filterId: any) => {
        setFilterGroups((groups) =>
            groups.map((group) => {
                if (group.id === groupId) {
                    return {
                        ...group,
                        filters: group.filters.filter((filter) => filter.id !== filterId),
                    };
                }
                return group;
            })
        );
    };

    const updateGroupOperator = (groupId: number, operator: any) => {
        setFilterGroups((groups) => groups.map((group) => (group.id === groupId ? { ...group, operator } : group)));
    };

    const applyFilters = () => {
        console.log('Applying filters:', filterGroups);
    };

    return (
        <Card className='w-full mx-auto'>
            <CardHeader>
                <div className='flex justify-between items-center'>
                    <CardTitle className='text-2xl font-bold'>Filters</CardTitle>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant='ghost' size='icon'>
                                    <HelpCircle className='h-5 w-5' />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Create filters to narrow down your search results.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardHeader>
            <CardContent>
                {filterGroups.map((group) => (
                    <FilterGroup
                        key={group.id}
                        group={group}
                        updateFilter={updateFilter}
                        removeFilter={removeFilter}
                        addFilter={addFilter}
                        updateGroupOperator={updateGroupOperator}
                    />
                ))}
                <div className='flex justify-between items-center mt-6'>
                    <Badge variant='outline' className='text-sm'>
                        {filterGroups.reduce((acc, group) => acc + group.filters.length, 0)} filters applied
                    </Badge>
                    <Button onClick={applyFilters} className='w-auto'>
                        Apply Filters
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
