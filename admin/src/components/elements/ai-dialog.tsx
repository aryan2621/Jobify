import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AiDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    aiPrompt: string;
    setAiPrompt: (prompt: string) => void;
    aiModel: string;
    setAiModel: (model: string) => void;
    handleAiPrompt: () => void;
    placeholder: string;
    isFetchingAiResponse: boolean;
    aiResponse: string;
}

const AiDialog = ({
    isOpen,
    onOpenChange,
    aiPrompt,
    setAiPrompt,
    aiModel,
    setAiModel,
    handleAiPrompt,
    placeholder,
    isFetchingAiResponse,
    aiResponse,
}: AiDialogProps) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(aiResponse);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant='ghost' size='icon' className='absolute right-2 bottom-2'>
                    <Wand2 className='h-4 w-4' />
                </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-5xl p-0'>
                <DialogHeader className='px-6 pt-6'>
                    <DialogTitle>Ask from AI</DialogTitle>
                </DialogHeader>
                <div className='flex flex-col md:flex-row h-[80vh] gap-6 p-6'>
                    <div className='flex flex-col gap-4 md:w-1/2'>
                        <div className='flex flex-col gap-4 h-full'>
                            <Textarea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder={placeholder}
                                className='min-h-[200px] flex-grow resize-none'
                            />
                            <Select value={aiModel} onValueChange={setAiModel}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder='Model' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='gemini-1.5-flash'>Gemini 1.5 Flash</SelectItem>
                                    <SelectItem value='gemini-1.5-flash-8b'>Gemini 1.5 Flash-8B</SelectItem>
                                    <SelectItem value='gemini-1.5-pro'>Gemini 1.5 Pro</SelectItem>
                                    <SelectItem value='gemini-1.0-pro'>Gemini 1.0 Pro</SelectItem>
                                    <SelectItem value='text-embedding-004'>Text Embedding</SelectItem>
                                    <SelectItem value='aqa'>AQA</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleAiPrompt} disabled={isFetchingAiResponse}>
                                {isFetchingAiResponse ? (
                                    <span className='flex items-center'>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Generating...
                                    </span>
                                ) : (
                                    'Generate'
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className='md:w-1/2 relative'>
                        <div className='h-full rounded-lg border bg-muted overflow-y-auto'>
                            {isFetchingAiResponse ? (
                                <div className='flex flex-col items-center justify-center h-full py-8'>
                                    <div className='space-y-2 text-center'>
                                        <div className='relative h-12 w-12'>
                                            <div className='absolute inset-0'>
                                                <div className='h-full w-full animate-ping rounded-full bg-blue-200 opacity-75'></div>
                                            </div>
                                            <div className='relative flex h-full w-full items-center justify-center'>
                                                <Loader2 className='h-8 w-8 animate-spin text-blue-500' />
                                            </div>
                                        </div>
                                        <p className='text-sm text-muted-foreground'>Generating your response...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className='relative p-4 min-h-full'>
                                    <div className='prose max-w-none dark:prose-invert'>
                                        <p className='text-sm whitespace-pre-wrap'>{aiResponse}</p>
                                    </div>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className={cn('absolute top-2 right-2 opacity-70 hover:opacity-100', copied && 'text-green-500')}
                                        onClick={handleCopy}
                                    >
                                        {copied ? <CheckCircle2 className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AiDialog;
