'use client';
import { useState, useEffect, type ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@jobify/ui/card';
import { Button } from '@jobify/ui/button';
import { Input } from '@jobify/ui/input';
import { Textarea } from '@jobify/ui/textarea';
import { Label } from '@jobify/ui/label';
import { Badge } from '@jobify/ui/badge';
import { useToast } from '@jobify/ui/use-toast';
import { Calendar, Clock, FileText, Link as LinkIcon, Upload, CheckCircle, ArrowLeft, ExternalLink, AlertCircle, Info, FileUp } from 'lucide-react';
import { cn } from '@/lib/utils';
const MOCK_ASSIGNMENT = {
    id: 'node_123',
    label: 'Technical Coding Challenge',
    description: 'Please implement a responsive dashboard using Next.js and Tailwind CSS. Focus on clean code, performance, and accessibility. You should include at least three charts and a detailed project overview.',
    url: 'https://github.com/jobconnect-samples/technical-challenge-brief',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
};
export default function AssignmentSubmissionPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { id: applicationId, nodeId } = params;
    const [submissionData, setSubmissionData] = useState({
        repoLink: '',
        comments: '',
        files: [] as File[],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const isFormValid = submissionData.repoLink.trim() !== '' || submissionData.files.length > 0;
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSubmissionData(prev => ({
                ...prev,
                files: [...prev.files, ...Array.from(e.target.files || [])]
            }));
        }
    };
    const removeFile = (index: number) => {
        setSubmissionData(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index)
        }));
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsSubmitted(true);
            toast({
                title: 'Assignment Submitted!',
                description: 'Your technical challenge has been successfully received by our hiring team.',
            });
        }
        catch (error) {
            toast({
                title: 'Error Submitting',
                description: 'An unexpected error occurred. Please try again or contact support.',
                variant: 'destructive'
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (isSubmitted) {
        return (<div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400"/>
                </div>
                <h1 className="text-3xl font-bold mb-3 tracking-tight">Well Done!</h1>
                <p className="text-muted-foreground text-lg mb-8 max-w-md">
                    Your submission for <b>{MOCK_ASSIGNMENT.label}</b> has been received. Our team will review it and get back to you soon.
                </p>
                <div className="flex gap-4">
                    <Button onClick={() => router.push(`/applications/${applicationId}`)} variant="outline">
                        View Application Status
                    </Button>
                    <Button onClick={() => router.push('/')}>
                        Back to Home
                    </Button>
                </div>
            </div>);
    }
    const timeRemaining = () => {
        const now = new Date();
        const diff = MOCK_ASSIGNMENT.deadline.getTime() - now.getTime();
        if (diff <= 0)
            return 'Deadline passed';
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0)
            return `${days} day${days > 1 ? 's' : ''} and ${hours}h remaining`;
        return `${hours} hours remaining`;
    };
    return (<div className="container mx-auto max-w-5xl py-12 px-4 sm:px-6">
            <Button variant="ghost" className="mb-8 pl-0 hover:bg-transparent -ml-2 text-muted-foreground hover:text-foreground transition-all flex items-center gap-2" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4"/>
                Back to Dashboard
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                <div className="lg:col-span-12">
                    <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 pointer-events-none">
                                    Step 2 of 4
                                </Badge>
                                <span className="text-sm font-medium text-muted-foreground">ID: {applicationId?.toString().slice(0, 8)}</span>
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight">Assignment: {MOCK_ASSIGNMENT.label}</h1>
                        </div>
                        <div className="flex items-center gap-4 bg-orange-50 dark:bg-orange-950/20 px-4 py-3 rounded-xl border border-orange-100 dark:border-orange-900/30">
                            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400"/>
                            <div>
                                <p className="text-xs uppercase font-bold text-orange-600 dark:text-orange-400">Deadline</p>
                                <p className="text-sm font-semibold">{timeRemaining()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 space-y-6">
                    <Card className="border-none shadow-sm bg-muted/30">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary"/>
                                Assignment Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="prose dark:prose-invert max-w-none text-foreground/80 leading-relaxed">
                                {MOCK_ASSIGNMENT.description}
                            </div>

                            <div className="pt-4 border-t flex flex-wrap gap-4">
                                <Button variant="default" asChild className="gap-2 shadow-lg hover:shadow-xl transition-all">
                                    <a href={MOCK_ASSIGNMENT.url} target="_blank" rel="noopener noreferrer">
                                        Open Assignment Brief
                                        <ExternalLink className="h-4 w-4 ml-1"/>
                                    </a>
                                </Button>
                                <Button variant="outline" className="gap-2 border-primary/20 hover:border-primary/50">
                                    <Info className="h-4 w-4"/>
                                    Questions? Contact HR
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Info className="h-5 w-5 text-blue-500"/>
                                Guidelines
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {[
            'Ensure your code is properly documented',
            'Include a README file with setup instructions',
            'Link should be publicly accessible or shared with review@jobconnect.com',
            'Submit before the deadline to be considered'
        ].map((step, i) => (<li key={i} className="flex items-start gap-3 text-sm text-foreground/70 leading-normal">
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"/>
                                        {step}
                                    </li>))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                
                <div className="lg:col-span-5">
                    <Card className="border-none shadow-xl sticky top-8">
                        <CardHeader className="bg-primary pt-8 pb-6 text-primary-foreground rounded-t-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Upload className="h-24 w-24"/>
                            </div>
                            <CardTitle className="text-2xl font-bold">Submission</CardTitle>
                            <CardDescription className="text-primary-foreground/80">
                                Confirm the details below to complete this step
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-8 space-y-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold mb-1.5 block">Repository Link / Project URL</Label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                        <Input placeholder="https://github.com/username/project" className="pl-9 h-11 border-muted hover:border-primary/50 transition-colors focus:ring-primary/20" value={submissionData.repoLink} onChange={(e: ChangeEvent<HTMLInputElement>) => setSubmissionData(prev => ({ ...prev, repoLink: e.target.value }))}/>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground pl-1">Link to your GitHub repo, Vercel deployment, etc.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold mb-1.5 block">Supporting Files (Optional)</Label>
                                    <div className="h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 bg-muted/30 hover:bg-muted/50 hover:border-primary/40 transition-all cursor-pointer relative overflow-hidden group" onClick={() => document.getElementById('file-upload')?.click()}>
                                        <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <FileUp className="h-5 w-5 text-primary"/>
                                        </div>
                                        <p className="text-xs font-medium text-foreground/70">Click to upload documents or ZIP files</p>
                                        <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange}/>
                                    </div>

                                    {submissionData.files.length > 0 && (<div className="mt-4 space-y-2">
                                            {submissionData.files.map((file, i) => (<div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-xs group hover:bg-muted animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <div className="flex items-center gap-2 truncate pr-4">
                                                        <FileText className="h-3.5 w-3.5 text-primary shrink-0"/>
                                                        <span className="truncate font-medium">{file.name}</span>
                                                        <span className="text-muted-foreground ml-1">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                    </div>
                                                    <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all" onClick={() => removeFile(i)}>
                                                        <CheckCircle className="h-4 w-4 rotate-45"/>
                                                    </Button>
                                                </div>))}
                                        </div>)}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold mb-1.5 block">Additional Notes</Label>
                                    <Textarea placeholder="Add any specific instructions or notes for the reviewer..." className="min-h-[120px] resize-none border-muted hover:border-primary/50 transition-colors focus:ring-primary/20 p-4" value={submissionData.comments} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSubmissionData(prev => ({ ...prev, comments: e.target.value }))}/>
                                </div>

                                {!isFormValid && (<div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                        <AlertCircle className="h-4 w-4 shrink-0"/>
                                        Please provide a repository link or upload a file to proceed.
                                    </div>)}

                                <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg hover:shadow-xl transition-all" disabled={!isFormValid || isSubmitting}>
                                    {isSubmitting ? (<>
                                            <Upload className="animate-spin h-5 w-5 mr-3"/>
                                            Submitting...
                                        </>) : ('Submit Assignment')}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="pb-8 pt-0 flex justify-center border-t border-muted/50 mt-2 pt-6">
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                <CheckCircle className="h-3 w-3 text-green-500"/>
                                Secure SSL Encrypted Submission
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>);
}
