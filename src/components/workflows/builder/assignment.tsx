'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Calendar, Clock, Eye, FileText, FileUp, Info, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils'; // Assuming you have a utils file with cn function
import { isURL } from '@/lib/utils/validation-utils';
import { AssignmentNode } from '@/model/workflow';

interface AssignmentNodeBuilderProps {
    node: AssignmentNode;
    onSubmit: (node: AssignmentNode) => void;
}

// Helper to get date-time string for input
const getDateTimeString = (date?: Date): string => {
    if (!date) return '';
    date = new Date(date);
    return date.toISOString().slice(0, 16);
};

// Validation interface
interface ValidationState {
    label: { valid: boolean; message: string };
    url: { valid: boolean; message: string };
    deadline: { valid: boolean; message: string };
    description: { valid: boolean; message: string };
}

const AssignmentNodeBuilderComponent = ({ node, onSubmit }: AssignmentNodeBuilderProps) => {
    const { toast } = useToast();

    // Create a deep copy of the node to avoid mutation
    const cpNode = new AssignmentNode(
        node.id,
        node.data,
        node.position,
        node.url || '',
        node.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
        node.description || '',
        node.attachments || [],
        node.sourcePosition,
        node.targetPosition
    );

    // State
    const [newNode, setNewNode] = useState(cpNode);
    const [activeTab, setActiveTab] = useState<string>('details');
    const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
    const [validation, setValidation] = useState<ValidationState>({
        label: { valid: true, message: '' },
        url: { valid: true, message: '' },
        deadline: { valid: true, message: '' },
        description: { valid: true, message: '' },
    });

    // Field change handler
    const handleChange = (field: keyof AssignmentNode, value: any) => {
        setNewNode((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear validation error when field is edited
        if (field in validation) {
            setValidation((prev) => ({
                ...prev,
                [field]: { valid: true, message: '' },
            }));
        }
    };

    // Label change handler
    const handleLabelChange = (value: string) => {
        setNewNode((prev) => ({
            ...prev,
            data: { ...prev.data, label: value },
        }));

        // Clear validation
        setValidation((prev) => ({
            ...prev,
            label: { valid: true, message: '' },
        }));
    };

    // Validate all fields
    const validateForm = (): boolean => {
        const newValidation: ValidationState = {
            label: { valid: true, message: '' },
            url: { valid: true, message: '' },
            deadline: { valid: true, message: '' },
            description: { valid: true, message: '' },
        };

        let isValid = true;

        // Validate label
        if (!newNode.data.label.trim()) {
            newValidation.label = {
                valid: false,
                message: 'Label is required',
            };
            isValid = false;
        }

        // Validate URL
        if (!newNode.url.trim()) {
            newValidation.url = {
                valid: false,
                message: 'Assignment URL is required',
            };
            isValid = false;
        } else if (!isURL(newNode.url)) {
            newValidation.url = {
                valid: false,
                message: 'Please enter a valid URL',
            };
            isValid = false;
        }

        // Validate deadline
        if (!newNode.deadline) {
            newValidation.deadline = {
                valid: false,
                message: 'Deadline is required',
            };
            isValid = false;
        } else {
            const now = new Date();
            if (newNode.deadline < now) {
                newValidation.deadline = {
                    valid: false,
                    message: 'Deadline must be in the future',
                };
                isValid = false;
            }
        }

        // Validate description
        if (!newNode.description.trim()) {
            newValidation.description = {
                valid: false,
                message: 'Description is required',
            };
            isValid = false;
        } else if (newNode.description.length < 10) {
            newValidation.description = {
                valid: false,
                message: 'Description should be at least 10 characters',
            };
            isValid = false;
        }

        setValidation(newValidation);
        return isValid;
    };

    // Handle form submission
    const handleSubmit = () => {
        setFormSubmitted(true);

        if (validateForm()) {
            onSubmit(newNode);
        } else {
            toast({
                title: 'Validation Error',
                description: 'Please correct the errors in the form',
                variant: 'destructive',
            });
        }
    };

    // Preview component
    const AssignmentPreview = () => {
        return (
            <Card className='mt-4'>
                <CardHeader className='pb-2'>
                    <CardTitle className='text-base'>Assignment Preview</CardTitle>
                    <CardDescription>How this assignment will appear to candidates</CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                    <div className='flex justify-between items-start'>
                        <div className='flex flex-col'>
                            <h3 className='font-medium'>{newNode.data.label || 'Untitled Assignment'}</h3>
                            {newNode.deadline && (
                                <div className='flex items-center text-sm text-muted-foreground'>
                                    <Calendar className='h-3.5 w-3.5 mr-1.5' />
                                    <time dateTime={newNode.deadline.toISOString()}>
                                        {newNode.deadline.toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </time>
                                    <span className='mx-1'>•</span>
                                    <Clock className='h-3.5 w-3.5 mr-1.5' />
                                    <time dateTime={newNode.deadline.toISOString()}>
                                        {newNode.deadline.toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </time>
                                </div>
                            )}
                        </div>

                        <Badge variant='outline' className='h-6'>
                            <FileText className='h-3.5 w-3.5 mr-1.5' />
                            <span>Assignment</span>
                        </Badge>
                    </div>

                    {newNode.description && (
                        <div className='text-sm mt-2'>
                            <p className='line-clamp-3'>{newNode.description}</p>
                        </div>
                    )}

                    {newNode.url && (
                        <div className='flex items-center justify-between mt-2 bg-muted/50 rounded-md p-2 text-sm'>
                            <div className='flex items-center'>
                                <LinkIcon className='h-4 w-4 mr-2 text-primary' />
                                <span className='truncate max-w-xs'>{newNode.url}</span>
                            </div>
                            <Button variant='ghost' size='sm' className='h-8 w-8 p-0' disabled>
                                <ExternalLink className='h-4 w-4' />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className='space-y-6'>
            <div className='flex items-center'>
                <div className='bg-primary/20 p-2 rounded-full mr-3'>
                    <FileText className='h-5 w-5 text-primary' />
                </div>
                <div>
                    <h2 className='font-bold text-lg'>Configure Assignment</h2>
                    <p className='text-sm text-muted-foreground'>Set up assignment details and deadline</p>
                </div>
            </div>

            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger value='details'>
                        <Info className='h-4 w-4 mr-2' />
                        Assignment Details
                    </TabsTrigger>
                    <TabsTrigger value='preview'>
                        <Eye className='h-4 w-4 mr-2' />
                        Preview
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='details' className='space-y-4 mt-4'>
                    <div className='flex flex-col gap-4'>
                        {/* Basic information */}
                        <div>
                            <Label
                                htmlFor='label'
                                className={cn('flex items-center', formSubmitted && !validation.label.valid && 'text-destructive')}
                            >
                                Assignment Name <span className='text-destructive'>*</span>
                            </Label>
                            <Input
                                id='label'
                                value={newNode.data.label}
                                onChange={(e) => handleLabelChange(e.target.value)}
                                placeholder='e.g., Coding Challenge'
                                className={cn(formSubmitted && !validation.label.valid && 'border-destructive')}
                            />
                            {formSubmitted && !validation.label.valid && (
                                <p className='text-destructive text-xs flex items-center mt-1'>
                                    <AlertCircle className='h-3 w-3 mr-1' />
                                    {validation.label.message}
                                </p>
                            )}
                        </div>

                        {/* Assignment URL */}
                        <div>
                            <Label htmlFor='url' className={cn('flex items-center', formSubmitted && !validation.url.valid && 'text-destructive')}>
                                Assignment URL <span className='text-destructive'>*</span>
                            </Label>
                            <div className='relative'>
                                <LinkIcon className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                                <Input
                                    id='url'
                                    value={newNode.url}
                                    onChange={(e) => handleChange('url', e.target.value)}
                                    placeholder='https://github.com/...'
                                    className={cn('pl-9', formSubmitted && !validation.url.valid && 'border-destructive')}
                                />
                            </div>
                            {formSubmitted && !validation.url.valid && (
                                <p className='text-destructive text-xs flex items-center mt-1'>
                                    <AlertCircle className='h-3 w-3 mr-1' />
                                    {validation.url.message}
                                </p>
                            )}
                        </div>

                        {/* Deadline */}
                        <div>
                            <Label
                                htmlFor='deadline'
                                className={cn('flex items-center', formSubmitted && !validation.deadline.valid && 'text-destructive')}
                            >
                                Deadline <span className='text-destructive'>*</span>
                            </Label>
                            <div className='relative'>
                                <Calendar className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                                <Input
                                    id='deadline'
                                    type='datetime-local'
                                    value={getDateTimeString(newNode.deadline)}
                                    onChange={(e) => handleChange('deadline', new Date(e.target.value))}
                                    className={cn('pl-9', formSubmitted && !validation.deadline.valid && 'border-destructive')}
                                />
                            </div>
                            {formSubmitted && !validation.deadline.valid && (
                                <p className='text-destructive text-xs flex items-center mt-1'>
                                    <AlertCircle className='h-3 w-3 mr-1' />
                                    {validation.deadline.message}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <Label
                                htmlFor='description'
                                className={cn('flex items-center', formSubmitted && !validation.description.valid && 'text-destructive')}
                            >
                                Description <span className='text-destructive'>*</span>
                            </Label>
                            <Textarea
                                id='description'
                                value={newNode.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder='Enter assignment details, requirements, submission instructions, etc.'
                                rows={4}
                                className={cn(formSubmitted && !validation.description.valid && 'border-destructive')}
                            />
                            <div className='flex justify-between mt-1'>
                                {formSubmitted && !validation.description.valid ? (
                                    <p className='text-destructive text-xs flex items-center'>
                                        <AlertCircle className='h-3 w-3 mr-1' />
                                        {validation.description.message}
                                    </p>
                                ) : (
                                    <p className='text-xs text-muted-foreground'>Characters: {newNode.description.length}</p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Attachments */}
                        <div>
                            <Label htmlFor='attachments'>Attachments (Optional)</Label>
                            <div
                                className='border border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors'
                                onClick={() =>
                                    toast({
                                        title: 'Feature Not Implemented',
                                        description: 'File attachment functionality would go here',
                                    })
                                }
                            >
                                <FileUp className='h-6 w-6 mx-auto mb-2 text-muted-foreground' />
                                <p className='text-sm text-muted-foreground'>Click to upload or drag files here</p>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value='preview' className='mt-2'>
                    <AssignmentPreview />
                </TabsContent>
            </Tabs>

            <Separator />

            <Button onClick={handleSubmit} className='w-full'>
                Save Assignment Configuration
            </Button>
        </div>
    );
};

export default AssignmentNodeBuilderComponent;
