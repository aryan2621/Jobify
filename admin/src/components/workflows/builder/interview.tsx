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
import { AlertCircle, Calendar, CalendarClock, Check, Clock, ExternalLink, Eye, FileUp, Info, Link as LinkIcon, Video } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { isURL } from '@/lib/utils/validation-utils';

interface InterviewNodeBuilderProps {
    node: InterviewNode;
    onSubmit: (node: InterviewNode) => void;
}


const getDateTimeString = (date?: Date): string => {
    if (!date) return '';
    date = new Date(date);
    return date.toISOString().slice(0, 16);
};


interface ValidationState {
    label: { valid: boolean; message: string };
    link: { valid: boolean; message: string };
    time: { valid: boolean; message: string };
    description: { valid: boolean; message: string };
}

const InterviewNodeBuilderComponent = ({ node, onSubmit }: InterviewNodeBuilderProps) => {
    const { toast } = useToast();

    
    const cpNode = new InterviewNode(
        node.id,
        node.data,
        node.position,
        node.link || '',
        node.description || '',
        node.attachments || [],
        node.time || new Date(Date.now() + 24 * 60 * 60 * 1000),
        node.sourcePosition,
        node.targetPosition,
        node.duration ?? 45,
        node.participants ? [...node.participants] : undefined
    );

    
    const [newNode, setNewNode] = useState(cpNode);
    const [calendarConnected, setCalendarConnected] = useState<boolean>(false);
    const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
    const [validation, setValidation] = useState<ValidationState>({
        label: { valid: true, message: '' },
        link: { valid: true, message: '' },
        time: { valid: true, message: '' },
        description: { valid: true, message: '' },
    });

    
    const handleChange = (field: keyof InterviewNode, value: any) => {
        setNewNode((prev) => ({
            ...prev,
            [field]: value,
        }));

        
        if (field in validation) {
            setValidation((prev) => ({
                ...prev,
                [field]: { valid: true, message: '' },
            }));
        }
    };

    
    const handleLabelChange = (value: string) => {
        setNewNode((prev) => ({
            ...prev,
            data: { ...prev.data, label: value },
        }));

        
        setValidation((prev) => ({
            ...prev,
            label: { valid: true, message: '' },
        }));
    };

    
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

    
    const validateForm = (): boolean => {
        const newValidation: ValidationState = {
            label: { valid: true, message: '' },
            link: { valid: true, message: '' },
            time: { valid: true, message: '' },
            description: { valid: true, message: '' },
        };

        let isValid = true;

        
        if (!newNode.data.label.trim()) {
            newValidation.label = {
                valid: false,
                message: 'Label is required',
            };
            isValid = false;
        }

        
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

    return (
        <div className='p-4'>
            <h2 className='font-bold text-lg mb-4'>Configure Interview</h2>

            <div className='flex flex-col gap-4'>
                <div>
                    <Label className='mb-2 block'>Name</Label>
                    <Input value={newNode.data.name ?? `interview_${newNode.id.slice(0, 8)}`} disabled className='bg-muted' />
                </div>

                {}
                <div>
                    <Label
                        className={cn('mb-2 block', formSubmitted && !validation.label.valid && 'text-destructive')}
                    >
                        Interview Name <span className='text-destructive ml-0.5'>*</span>
                    </Label>
                    <Input
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

                {}
                <div>
                    <Label className={cn('mb-2 block', formSubmitted && !validation.link.valid && 'text-destructive')}>
                        Meeting Link <span className='text-destructive ml-0.5'>*</span>
                    </Label>
                    <div className='relative'>
                        <LinkIcon className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                        <Input
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

                
                <div>
                    <Label className={cn('mb-2 block', formSubmitted && !validation.time.valid && 'text-destructive')}>
                        Interview Time <span className='text-destructive ml-0.5'>*</span>
                    </Label>
                    <div className='relative'>
                        <CalendarClock className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                        <Input
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

                
                <div>
                    <Label className='mb-2 block'>Duration (minutes)</Label>
                    <Input
                        type='number'
                        min={5}
                        max={240}
                        value={newNode.duration ?? 45}
                        onChange={(e) => handleChange('duration', parseInt(e.target.value, 10) || 45)}
                    />
                </div>

                
                <div>
                    <Label className='mb-2 block'>Participants (emails, comma-separated)</Label>
                    <Input
                        value={newNode.participants?.join(', ') ?? ''}
                        onChange={(e) =>
                            handleChange(
                                'participants',
                                e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean)
                            )
                        }
                        placeholder='interviewer@company.com, hr@company.com'
                    />
                </div>

                
                <div>
                    <Label
                        className={cn('mb-2 block', formSubmitted && !validation.description.valid && 'text-destructive')}
                    >
                        Description <span className='text-destructive ml-0.5'>*</span>
                    </Label>
                    <Textarea
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

                
                <div>
                    <Label className='mb-2 block'>Attachments (Optional)</Label>
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

            <Button onClick={handleSubmit} className='mt-4 w-full'>
                Save Interview Configuration
            </Button>
        </div>
    );
};

export default InterviewNodeBuilderComponent;
