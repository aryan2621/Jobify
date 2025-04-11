import { getResume } from '@/appwrite/server/storage';
import { toast } from '@/components/ui/use-toast';
import { Application } from '@/model/application';
import { FileText } from 'lucide-react';
import { Link, User } from 'lucide-react';
import { GraduationCap } from 'lucide-react';
import { Briefcase } from 'lucide-react';

export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const downloadResume = async (resumeId: string, filename: string = 'resume.pdf', onError?: (error: unknown) => void): Promise<void> => {
    try {
        const file = await getResume(resumeId);
        const blob = new Blob([file], { type: 'application/octet-binary;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading resume:', error);
        if (onError) onError(error);
        else toast({ title: 'Download Failed', description: 'Could not download the resume.', variant: 'destructive' });
        throw error;
    }
};

export type FieldValidation = {
    value: string | boolean | number | any[];
    isValid: boolean;
    errorMessage: string;
    touched: boolean;
};

export type FormValidation = {
    [key: string]: FieldValidation;
};

export const FORM_STEPS = [
    { id: 1, title: 'Personal Information', icon: <User className='w-5 h-5' /> },
    { id: 2, title: 'Education', icon: <GraduationCap className='w-5 h-5' /> },
    { id: 3, title: 'Experience', icon: <Briefcase className='w-5 h-5' /> },
    { id: 4, title: 'Skills & Links', icon: <Link className='w-5 h-5' /> },
    { id: 5, title: 'Cover Letter', icon: <FileText className='w-5 h-5' /> },
];

export const saveFormDraft = (formData: Application) => {
    try {
        localStorage.setItem(`application_draft_${formData.jobId}`, JSON.stringify(formData));
    } catch (error) {
        console.error('Error saving draft:', error);
    }
};

export const loadFormDraft = (jobId: string): Application | null => {
    try {
        const savedData = localStorage.getItem(`application_draft_${jobId}`);
        if (savedData) {
            return JSON.parse(savedData);
        }
        return null;
    } catch (error) {
        console.error('Error loading draft:', error);
        return null;
    }
};

export const clearFormDraft = (jobId: string) => {
    try {
        localStorage.removeItem(`application_draft_${jobId}`);
    } catch (error) {
        console.error('Error clearing draft:', error);
    }
};
