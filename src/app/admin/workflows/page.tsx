'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getWorkflowsByUserId, deleteWorkflow } from '@/appwrite/server/collections/workflow-collection';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { MoreVertical, PenSquare, Copy, Trash2, Plus, Search, FilterX, GitGraph } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import ky from 'ky';
import NavbarLayout from '@/layouts/navbar';
import { Workflow } from '@/model/workflow';

export default function WorkflowList() {
    const router = useRouter();
    const { toast } = useToast();

    // State
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);

    // Load workflows
    useEffect(() => {
        const loadWorkflows = async () => {
            setIsLoading(true);
            try {
                const response = await ky.get(`/api/get-workflows?type=user`).json<any[]>();
                setWorkflows(
                    response.map((workflow) => ({
                        id: workflow.id,
                        name: workflow.name,
                        description: workflow.description,
                        status: workflow.status,
                        createdAt: workflow.createdAt,
                        updatedAt: workflow.updatedAt,
                        createdBy: workflow.createdBy,
                        nodes: JSON.parse(workflow.nodes),
                        edges: JSON.parse(workflow.edges),
                        isTemplate: workflow.isTemplate,
                        templateCategory: workflow.templateCategory,
                        tags: workflow.tags,
                    }))
                );
            } catch (error) {
                console.error('Error loading workflows:', error);
                toast({
                    title: 'Error',
                    description: 'Could not load workflows. Please try again.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadWorkflows();
    }, [toast]);

    // Filter workflows based on search and status
    const filteredWorkflows = workflows.filter((workflow) => {
        const matchesSearch =
            workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (workflow.description || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Navigate to workflow editor
    const handleEditWorkflow = (id: string) => {
        router.push(`/admin/workflow/edit-workflow/${id}`);
    };

    // Create new workflow
    const handleCreateWorkflow = () => {
        router.push('/admin/workflow/create-workflow');
    };

    // Delete workflow
    const confirmDeleteWorkflow = (id: string) => {
        setWorkflowToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteWorkflow = async () => {
        if (!workflowToDelete) return;

        try {
            await deleteWorkflow(workflowToDelete);
            setWorkflows(workflows.filter((w) => w.id !== workflowToDelete));
            toast({
                title: 'Success',
                description: 'Workflow deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting workflow:', error);
            toast({
                title: 'Error',
                description: 'Could not delete workflow. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setDeleteDialogOpen(false);
            setWorkflowToDelete(null);
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Status badge component
    const StatusBadge = ({ status }: { status: string }) => {
        const getBadgeVariant = (status: string) => {
            switch (status) {
                case 'active':
                    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
                case 'draft':
                    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
                case 'archived':
                    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
                default:
                    return '';
            }
        };

        return (
            <Badge variant='outline' className={getBadgeVariant(status)}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <NavbarLayout>
            <div className='container mx-auto p-4 max-w-7xl'>
                <div className='flex justify-between items-center mb-6'>
                    <h1 className='text-2xl font-bold'>Recruitment Workflows</h1>
                    <Button onClick={handleCreateWorkflow}>
                        <Plus className='h-4 w-4 mr-2' />
                        Create Workflow
                    </Button>
                </div>

                <div className='mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4'>
                    <div className='relative flex-1'>
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder='Search workflows...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='pl-9'
                        />
                        {searchQuery && (
                            <Button
                                variant='ghost'
                                size='icon'
                                className='absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8'
                                onClick={() => setSearchQuery('')}
                            >
                                <FilterX className='h-4 w-4' />
                            </Button>
                        )}
                    </div>

                    <Tabs defaultValue='all' className='min-w-[300px]' value={statusFilter} onValueChange={setStatusFilter}>
                        <TabsList className='grid grid-cols-3'>
                            <TabsTrigger value='all'>All</TabsTrigger>
                            <TabsTrigger value='active'>Active</TabsTrigger>
                            <TabsTrigger value='draft'>Drafts</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {isLoading ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className='overflow-hidden'>
                                <CardHeader className='pb-2'>
                                    <Skeleton className='h-5 w-3/4 mb-1' />
                                    <Skeleton className='h-4 w-1/2' />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className='h-4 w-full mb-2' />
                                    <Skeleton className='h-4 w-3/4 mb-2' />
                                    <Skeleton className='h-4 w-1/2' />
                                </CardContent>
                                <CardFooter className='flex justify-between'>
                                    <Skeleton className='h-4 w-1/3' />
                                    <Skeleton className='h-8 w-8 rounded-full' />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : filteredWorkflows.length === 0 ? (
                    <div className='text-center p-8 border rounded-lg bg-muted/20'>
                        <GitGraph className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
                        <h3 className='text-lg font-medium mb-2'>No workflows found</h3>
                        <p className='text-muted-foreground mb-4'>
                            {searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Create your first workflow to get started with recruitment automation'}
                        </p>
                        <Button onClick={handleCreateWorkflow}>
                            <Plus className='h-4 w-4 mr-2' />
                            Create New Workflow
                        </Button>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {filteredWorkflows.map((workflow) => (
                            <Card key={workflow.id} className='overflow-hidden'>
                                <CardHeader className='pb-2'>
                                    <div className='flex justify-between items-start'>
                                        <div>
                                            <CardTitle className='text-base'>{workflow.name}</CardTitle>
                                            <CardDescription>Updated {formatDate(workflow.updatedAt)}</CardDescription>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant='ghost' size='icon' className='h-8 w-8'>
                                                    <MoreVertical className='h-4 w-4' />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align='end'>
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleEditWorkflow(workflow.id)}>
                                                    <PenSquare className='h-4 w-4 mr-2' />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Copy className='h-4 w-4 mr-2' />
                                                    Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => confirmDeleteWorkflow(workflow.id)}
                                                    className='text-destructive focus:text-destructive'
                                                >
                                                    <Trash2 className='h-4 w-4 mr-2' />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className='text-sm text-muted-foreground mb-3 line-clamp-2'>
                                        {workflow.description || 'No description provided'}
                                    </p>
                                    <div className='flex flex-wrap gap-2'>
                                        <StatusBadge status={workflow.status || 'draft'} />
                                        {workflow.isTemplate && (
                                            <Badge variant='outline' className='bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'>
                                                Template
                                            </Badge>
                                        )}
                                        {workflow.tags &&
                                            workflow.tags.slice(0, 2).map((tag) => (
                                                <Badge key={tag} variant='outline' className='text-xs'>
                                                    {tag}
                                                </Badge>
                                            ))}
                                    </div>
                                </CardContent>
                                <CardFooter className='flex justify-between pt-2'>
                                    <div className='text-xs text-muted-foreground'>{workflow.nodes?.length || 0} nodes</div>
                                    <Button size='sm' variant='outline' onClick={() => handleEditWorkflow(workflow.id)}>
                                        Open Editor
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Workflow</DialogTitle>
                            <DialogDescription>Are you sure you want to delete this workflow? This action cannot be undone.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant='destructive' onClick={handleDeleteWorkflow}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </NavbarLayout>
    );
}
