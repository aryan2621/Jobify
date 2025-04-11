'use client';

import { useState, useEffect } from 'react';
import { InterviewNode } from '@/model/workflow';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { OAuthHandler } from '@/components/elements/oauth-button';
import { googleCalenderOAuthConfig } from '@/config/oauth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Calendar, CalendarClock, Check, Clock, ExternalLink, Eye, FileUp, Info, Link as LinkIcon, Video } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils'; // Assuming you have a utils file with cn function
import { isURL } from '@/lib/utils/validation-utils';

interface InterviewNodeBuilderProps {
    node: InterviewNode;
    onSubmit: (node: InterviewNode) => void;
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
    link: { valid: boolean; message: string };
    time: { valid: boolean; message: string };
    description: { valid: boolean; message: string };
}

const InterviewNodeBuilderComponent = ({ node, onSubmit }: InterviewNodeBuilderProps) => {
    const { toast } = useToast();

    // Create a deep copy of the node to avoid mutation
    const cpNode = new InterviewNode(
        node.id,
        node.data,
        node.position,
        node.link || '',
        node.description || '',
        node.attachments || [],
        node.time || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
        node.sourcePosition,
        node.targetPosition
    );

    // State
    const [newNode, setNewNode] = useState(cpNode);
    const [activeTab, setActiveTab] = useState<string>('details');
    const [calendarConnected, setCalendarConnected] = useState<boolean>(false);
    const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
    const [validation, setValidation] = useState<ValidationState>({
        label: { valid: true, message: '' },
        link: { valid: true, message: '' },
        time: { valid: true, message: '' },
        description: { valid: true, message: '' },
    });

    // Field change handler
    const handleChange = (field: keyof InterviewNode, value: any) => {
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

    // OAuth handlers
    const handleOAuthSuccess = (response: any) => {
        console.log('OAuth successful:', response);
        setCalendarConnected(true);
        toast({
            title: 'Calendar Connected',
            description: 'You can now create a calendar event for this interview',
        });
    };

    const handleOAuthError = (error: string) => {
        toast({
            title: 'Calendar Connection Failed',
            description: 'Error connecting to calendar, please try again',
            variant: 'destructive',
        });
    };

    // Validate all fields
    const validateForm = (): boolean => {
        const newValidation: ValidationState = {
            label: { valid: true, message: '' },
            link: { valid: true, message: '' },
            time: { valid: true, message: '' },
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

        // Validate link
        if (!newNode.link.trim()) {
            newValidation.link = {
                valid: false,
                message: 'Meeting link is required',
            };
            isValid = false;
        } else if (!isURL(newNode.link)) {
            newValidation.link = {
                valid: false,
                message: 'Please enter a valid URL',
            };
            isValid = false;
        }

        // Validate time
        if (!newNode.time) {
            newValidation.time = {
                valid: false,
                message: 'Interview time is required',
            };
            isValid = false;
        } else {
            const now = new Date();
            if (newNode.time < now) {
                newValidation.time = {
                    valid: false,
                    message: 'Interview time must be in the future',
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
    const InterviewPreview = () => {
        return (
            <Card className='mt-4'>
                <CardHeader className='pb-2'>
                    <CardTitle className='text-base'>Interview Preview</CardTitle>
                    <CardDescription>How this interview will appear to candidates</CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                    <div className='flex justify-between items-start'>
                        <div className='flex flex-col'>
                            <h3 className='font-medium'>{newNode.data.label || 'Untitled Interview'}</h3>
                            {newNode.time && (
                                <div className='flex items-center text-sm text-muted-foreground'>
                                    <Calendar className='h-3.5 w-3.5 mr-1.5' />
                                    <time dateTime={newNode.time.toISOString()}>
                                        {newNode.time.toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </time>
                                    <span className='mx-1'>•</span>
                                    <Clock className='h-3.5 w-3.5 mr-1.5' />
                                    <time dateTime={newNode.time.toISOString()}>
                                        {newNode.time.toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </time>
                                </div>
                            )}
                        </div>

                        <Badge variant='outline' className='h-6'>
                            <Video className='h-3.5 w-3.5 mr-1.5' />
                            <span>Interview</span>
                        </Badge>
                    </div>

                    {newNode.description && (
                        <div className='text-sm mt-2'>
                            <p className='line-clamp-3'>{newNode.description}</p>
                        </div>
                    )}

                    {newNode.link && (
                        <div className='flex items-center justify-between mt-2 bg-muted/50 rounded-md p-2 text-sm'>
                            <div className='flex items-center'>
                                <LinkIcon className='h-4 w-4 mr-2 text-primary' />
                                <span className='truncate max-w-xs'>{newNode.link}</span>
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
                    <Video className='h-5 w-5 text-primary' />
                </div>
                <div>
                    <h2 className='font-bold text-lg'>Configure Interview</h2>
                    <p className='text-sm text-muted-foreground'>Set up interview details and calendar integration</p>
                </div>
            </div>

            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger value='details'>
                        <Info className='h-4 w-4 mr-2' />
                        Interview Details
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
                                Interview Name <span className='text-destructive'>*</span>
                            </Label>
                            <Input
                                id='label'
                                value={newNode.data.label}
                                onChange={(e) => handleLabelChange(e.target.value)}
                                placeholder='e.g., Technical Interview'
                                className={cn(formSubmitted && !validation.label.valid && 'border-destructive')}
                            />
                            {formSubmitted && !validation.label.valid && (
                                <p className='text-destructive text-xs flex items-center mt-1'>
                                    <AlertCircle className='h-3 w-3 mr-1' />
                                    {validation.label.message}
                                </p>
                            )}
                        </div>

                        {/* Meeting link */}
                        <div>
                            <Label htmlFor='link' className={cn('flex items-center', formSubmitted && !validation.link.valid && 'text-destructive')}>
                                Meeting Link <span className='text-destructive'>*</span>
                            </Label>
                            <div className='relative'>
                                <LinkIcon className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                                <Input
                                    id='link'
                                    value={newNode.link}
                                    onChange={(e) => handleChange('link', e.target.value)}
                                    placeholder='https://meet.google.com/...'
                                    className={cn('pl-9', formSubmitted && !validation.link.valid && 'border-destructive')}
                                />
                            </div>
                            {formSubmitted && !validation.link.valid && (
                                <p className='text-destructive text-xs flex items-center mt-1'>
                                    <AlertCircle className='h-3 w-3 mr-1' />
                                    {validation.link.message}
                                </p>
                            )}
                        </div>

                        {/* Interview time */}
                        <div>
                            <Label htmlFor='time' className={cn('flex items-center', formSubmitted && !validation.time.valid && 'text-destructive')}>
                                Interview Time <span className='text-destructive'>*</span>
                            </Label>
                            <div className='relative'>
                                <CalendarClock className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                                <Input
                                    id='time'
                                    type='datetime-local'
                                    value={getDateTimeString(newNode.time)}
                                    onChange={(e) => handleChange('time', new Date(e.target.value))}
                                    className={cn('pl-9', formSubmitted && !validation.time.valid && 'border-destructive')}
                                />
                            </div>
                            {formSubmitted && !validation.time.valid && (
                                <p className='text-destructive text-xs flex items-center mt-1'>
                                    <AlertCircle className='h-3 w-3 mr-1' />
                                    {validation.time.message}
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
                                placeholder='Enter interview details, preparation instructions, etc.'
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

                        {/* Calendar integration */}
                        <div>
                            <TooltipProvider>
                                <div className='flex items-center justify-between mb-3'>
                                    <h3 className='text-sm font-medium'>Calendar Integration</h3>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className='h-4 w-4 text-muted-foreground cursor-help' />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className='max-w-xs text-xs'>Connect to your calendar to automatically create events for interviews</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </TooltipProvider>

                            <div className='flex items-center gap-3 mb-2'>
                                <OAuthHandler config={googleCalenderOAuthConfig} onSuccess={handleOAuthSuccess} onError={handleOAuthError}>
                                    <Button variant={calendarConnected ? 'outline' : 'default'} className='flex items-center'>
                                        {calendarConnected ? (
                                            <>
                                                <Check className='h-4 w-4 mr-2 text-green-500' />
                                                Connected
                                            </>
                                        ) : (
                                            <>
                                                <Calendar className='h-4 w-4 mr-2' />
                                                Connect Calendar
                                            </>
                                        )}
                                    </Button>
                                </OAuthHandler>

                                {calendarConnected && (
                                    <Badge variant='outline' className='bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300'>
                                        <Check className='h-3.5 w-3.5 mr-1' />
                                        Google Calendar
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Attachments (simplified for now) */}
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
                    <InterviewPreview />
                </TabsContent>
            </Tabs>

            <Separator />

            <Button onClick={handleSubmit} className='w-full'>
                Save Interview Configuration
            </Button>
        </div>
    );
};

export default InterviewNodeBuilderComponent;
