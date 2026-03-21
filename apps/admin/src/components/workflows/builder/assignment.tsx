'use client';

import { useState, useEffect } from 'react';
import { Label } from '@jobify/ui/label';
import { Input } from '@jobify/ui/input';
import { Button } from '@jobify/ui/button';
import { Textarea } from '@jobify/ui/textarea';
import { useToast } from '@jobify/ui/use-toast';
import { AlertCircle, Calendar, Clock, FileText, FileUp, Info, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils'; 
import { isURL } from '@/lib/utils/validation-utils';
import { AssignmentNode, AssignmentSubmissionTracking } from '@jobify/domain/workflow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@jobify/ui/select';

interface AssignmentNodeBuilderProps {
    node: AssignmentNode;
    onSubmit: (node: AssignmentNode) => void;
}


const getDateTimeString = (date?: Date): string => {
    if (!date) return '';
    date = new Date(date);
    return date.toISOString().slice(0, 16);
};


interface ValidationState {
    label: { valid: boolean; message: string };
    url: { valid: boolean; message: string };
    deadline: { valid: boolean; message: string };
    description: { valid: boolean; message: string };
}

const AssignmentNodeBuilderComponent = ({ node, onSubmit }: AssignmentNodeBuilderProps) => {
    const { toast } = useToast();

    
    const cpNode = new AssignmentNode(
        node.id,
        node.data,
        node.position,
        node.url || '',
        node.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        node.description || '',
        node.attachments || [],
        node.sourcePosition,
        node.targetPosition,
        node.submissionTracking === 'none' || !node.submissionTracking ? 'link' : node.submissionTracking
    );

    
    const [newNode, setNewNode] = useState(cpNode);
    const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
    const [validation, setValidation] = useState<ValidationState>({
        label: { valid: true, message: '' },
        url: { valid: true, message: '' },
        deadline: { valid: true, message: '' },
        description: { valid: true, message: '' },
    });

    
    const handleChange = (field: keyof AssignmentNode, value: any) => {
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

    
    const validateForm = (): boolean => {
        const newValidation: ValidationState = {
            label: { valid: true, message: '' },
            url: { valid: true, message: '' },
            deadline: { valid: true, message: '' },
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
            <h2 className='font-bold text-lg mb-4'>Configure Assignment</h2>

            <div className='flex flex-col gap-4'>
                <div>
                    <Label className='mb-2 block'>Name</Label>
                    <Input value={newNode.data.name ?? `assignment_${newNode.id.slice(0, 8)}`} disabled className='bg-muted' />
                </div>

                <div>
                    <Label
                        className={cn('mb-2 block', formSubmitted && !validation.label.valid && 'text-destructive')}
                    >
                        Assignment Name <span className='text-destructive ml-0.5'>*</span>
                    </Label>
                    <Input
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

                {}
                <div>
                    <Label className={cn('mb-2 block', formSubmitted && !validation.url.valid && 'text-destructive')}>
                        Assignment URL <span className='text-destructive ml-0.5'>*</span>
                    </Label>
                    <div className='relative'>
                        <LinkIcon className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                        <Input
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

                
                <div>
                    <Label
                        className={cn('mb-2 block', formSubmitted && !validation.deadline.valid && 'text-destructive')}
                    >
                        Deadline <span className='text-destructive ml-0.5'>*</span>
                    </Label>
                    <div className='relative'>
                        <Calendar className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                        <Input
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

                
                <div>
                    <Label
                        className={cn('mb-2 block', formSubmitted && !validation.description.valid && 'text-destructive')}
                    >
                        Description <span className='text-destructive ml-0.5'>*</span>
                    </Label>
                    <Textarea
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

                
                <div>
                    <Label className='mb-2 block'>Submission tracking</Label>
                    <Select
                        value={newNode.submissionTracking}
                        onValueChange={(v) => handleChange('submissionTracking', v as AssignmentSubmissionTracking)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="link">Internal link</SelectItem>
                            <SelectItem value="google_form" disabled>Google Form (not available yet)</SelectItem>
                        </SelectContent>
                    </Select>
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
                Save Assignment Configuration
            </Button>
        </div>
    );
};

export default AssignmentNodeBuilderComponent;
