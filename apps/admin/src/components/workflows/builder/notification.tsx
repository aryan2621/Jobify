'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Label } from '@jobify/ui/label';
import { Input } from '@jobify/ui/input';
import { Button } from '@jobify/ui/button';
import { Textarea } from '@jobify/ui/textarea';
import { NotificationNode, NotificationOption } from '@jobify/domain/workflow';
import { Badge } from '@jobify/ui/badge';
import ky from 'ky';
import { useToast } from '@jobify/ui/use-toast';
import AiDialog from '@/components/elements/ai-dialog';
import { Check, Mail, AlertCircle } from 'lucide-react';


const EMAIL_BODY_VARIABLES: { value: string; label: string }[] = [
    { value: '{{candidate.name}}', label: 'candidate.name' },
    { value: '{{candidate.email}}', label: 'candidate.email' },
    { value: '{{job.title}}', label: 'job.title' },
    { value: '{{job.company}}', label: 'job.company' },
];

interface BodyFieldWithMentionsProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

function BodyFieldWithMentions({ value, onChange, placeholder }: BodyFieldWithMentionsProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const cursorAfterInsertRef = useRef<number | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [atIndex, setAtIndex] = useState(-1);
    const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const filtered = EMAIL_BODY_VARIABLES.filter((v) =>
        v.label.toLowerCase().includes(filter.toLowerCase())
    );

    useEffect(() => { setSelectedIndex(0); }, [filter]);

    useEffect(() => {
        if (textareaRef.current && cursorAfterInsertRef.current !== null) {
            const pos = cursorAfterInsertRef.current;
            textareaRef.current.setSelectionRange(pos, pos);
            textareaRef.current.focus();
            cursorAfterInsertRef.current = null;
        }
    }, [value]);

    
    const measureAtPosition = useCallback((ta: HTMLTextAreaElement, atIdx: number): { top: number; left: number } => {
        if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!;
        const style = getComputedStyle(ta);
        ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

        const paddingLeft = parseFloat(style.paddingLeft);
        const paddingTop = parseFloat(style.paddingTop);
        const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5;
        const taWidth = ta.clientWidth - paddingLeft - parseFloat(style.paddingRight);

        
        const textUpTo = ta.value.slice(0, atIdx);
        const words = textUpTo.split(/(\n)/); 
        const lines: string[] = [];
        let currentLine = '';

        for (const segment of words) {
            if (segment === '\n') {
                lines.push(currentLine);
                currentLine = '';
                continue;
            }
            
            const chars = segment.split('');
            for (const char of chars) {
                const test = currentLine + char;
                if (ctx.measureText(test).width > taWidth && currentLine.length > 0) {
                    lines.push(currentLine);
                    currentLine = char;
                } else {
                    currentLine = test;
                }
            }
        }
        lines.push(currentLine);

        const lineIndex = lines.length - 1;
        const lastLine = lines[lineIndex];
        const x = paddingLeft + ctx.measureText(lastLine).width;
        const y = paddingTop + lineIndex * lineHeight - ta.scrollTop;

        return { top: y, left: x };
    }, []);

    const closeDropdown = useCallback(() => {
        setDropdownOpen(false);
        setFilter('');
        setAtIndex(-1);
    }, []);

    const insertVariable = useCallback(
        (variable: { value: string; label: string }, currentAtIndex: number) => {
            if (!textareaRef.current) return;
            const pos = textareaRef.current.selectionStart ?? value.length;
            const before = value.slice(0, currentAtIndex);
            const after = value.slice(pos);
            const newValue = before + variable.value + after;
            cursorAfterInsertRef.current = currentAtIndex + variable.value.length;
            onChange(newValue);
            closeDropdown();
        },
        [value, onChange, closeDropdown]
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newValue = e.target.value;
            const cursorPos = e.target.selectionStart ?? newValue.length;
            onChange(newValue);

            const textBeforeCursor = newValue.slice(0, cursorPos);
            const lastAt = textBeforeCursor.lastIndexOf('@');

            if (lastAt === -1) { closeDropdown(); return; }

            const fragment = textBeforeCursor.slice(lastAt + 1);
            if (fragment.includes(' ')) { closeDropdown(); return; }

            const pos = measureAtPosition(e.target, lastAt);
            setDropdownPos(pos);
            setAtIndex(lastAt);
            setFilter(fragment);
            setDropdownOpen(true);
            setSelectedIndex(0);
        },
        [onChange, closeDropdown, measureAtPosition]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (!dropdownOpen || filtered.length === 0) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((i) => (i + 1) % filtered.length); return; }
            if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((i) => (filtered.length + i - 1) % filtered.length); return; }
            if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertVariable(filtered[selectedIndex], atIndex); return; }
            if (e.key === 'Escape') { e.preventDefault(); closeDropdown(); }
        },
        [dropdownOpen, filtered, selectedIndex, atIndex, insertVariable, closeDropdown]
    );

    const lineHeight = textareaRef.current
        ? parseFloat(getComputedStyle(textareaRef.current).lineHeight) || 22
        : 22;

    return (
        <div className="relative">
            <Textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={() => setTimeout(closeDropdown, 150)}
                placeholder={placeholder}
                className="min-h-[100px]"
            />
            {dropdownOpen && filtered.length > 0 && (
                <ul
                    className="absolute z-50 max-h-40 w-56 overflow-auto rounded-md border bg-popover py-1 text-popover-foreground shadow-md"
                    role="listbox"
                    style={{
                        
                        top: dropdownPos.top + lineHeight,
                        left: dropdownPos.left,
                    }}
                >
                    {filtered.map((v, i) => (
                        <li
                            key={v.value}
                            role="option"
                            aria-selected={i === selectedIndex}
                            className={`cursor-pointer px-3 py-2 text-sm font-mono ${
                                i === selectedIndex ? 'bg-accent text-accent-foreground' : ''
                            }`}
                            onPointerDown={(e) => {
                                e.preventDefault();
                                insertVariable(v, atIndex);
                            }}
                        >
                            {v.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
interface NotificationNodeBuilderProps {
    node: NotificationNode;
    onSubmit: (node: NotificationNode) => void;
}
interface FormField {
    label: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
}

const FormInput = ({ label, type = 'text', placeholder, value, onChange, required }: FormField) => (
    <div>
        <Label className='mb-2 block'>
            {label}
            {required && <span className='text-destructive ml-0.5'>*</span>}
        </Label>
        <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
);

const EmailConfig = ({
    node,
    handleEmailConfigChange,
}: {
    node: NotificationNode;
    handleEmailConfigChange: (field: string, value: string) => void;
}) => (
    <div className='flex flex-col gap-3'>
        <FormInput
            label='To'
            type='email'
            value={node.data.emailConfig?.to || ''}
            onChange={(value) => handleEmailConfigChange('to', value)}
            placeholder='e.g. {{candidate.email}} or recipient@example.com'
            required
        />
        <FormInput
            label='CC (optional)'
            type='email'
            value={node.data.emailConfig?.cc || ''}
            onChange={(value) => handleEmailConfigChange('cc', value)}
            placeholder='CC'
        />
        <FormInput
            label='BCC (optional)'
            type='email'
            value={node.data.emailConfig?.bcc || ''}
            onChange={(value) => handleEmailConfigChange('bcc', value)}
            placeholder='BCC'
        />
        <FormInput
            label='Subject'
            value={node.data.emailConfig?.subject || ''}
            onChange={(value) => handleEmailConfigChange('subject', value)}
            placeholder='Subject'
            required
        />
        <div>
            <Label className='mb-2 block'>
                Body
                <span className='text-destructive ml-0.5'>*</span>
            </Label>
            <p className='text-xs text-muted-foreground mb-1.5'>Type <kbd className='rounded border px-1 font-mono'>@</kbd> to open variable palette; use ↑↓ to move, Enter to insert.</p>
            <BodyFieldWithMentions
                value={node.data.emailConfig?.body || ''}
                onChange={(v) => handleEmailConfigChange('body', v)}
                placeholder='e.g. Hi @ or Dear {{candidate.name}}, …'
            />
        </div>
    </div>
);

const NotificationNodeBuilderComponent = ({ node, onSubmit }: NotificationNodeBuilderProps) => {
    const cpNode = new NotificationNode(node.id, node.data, node.position, [NotificationOption.EMAIL], node.sourcePosition, node.targetPosition);

    const [newNode, setNewNode] = useState(cpNode);
    const [aiPrompt, setAiPrompt] = useState<string>('');
    const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
    const [aiModel, setAiModel] = useState<string>('gemini-1.5-flash');
    const [isFetchingAiResponse, setIsFetchingAiResponse] = useState(false);
    const [aiResponse, setAiResponse] = useState<string>('');
    const [gmailConnected, setGmailConnected] = useState<boolean | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = (await ky.get('/api/settings').json()) as { gmailConnected?: boolean };
                setGmailConnected(Boolean(data?.gmailConnected));
            } catch {
                setGmailConnected(false);
            }
        };
        fetchSettings();
    }, []);

    const handleEmailConfigChange = (field: string, value: string) => {
        setNewNode({
            ...newNode,
            data: {
                ...newNode.data,
                emailConfig: {
                    to: newNode.data.emailConfig?.to || '',
                    cc: newNode.data.emailConfig?.cc || '',
                    bcc: newNode.data.emailConfig?.bcc || '',
                    subject: newNode.data.emailConfig?.subject || '',
                    body: newNode.data.emailConfig?.body || '',
                    [field]: value,
                },
            },
        });
    };

    const handleAiPrompt = async () => {
        setIsFetchingAiResponse(true);
        try {
            const response = await ky.post('/api/ask-ai', {
                json: { prompt: aiPrompt, model: aiModel },
            });
            const data = await response.json();
            setAiResponse(data as string);
        } catch (error) {
            console.error('Error while asking AI', error);
            toast({
                title: 'Error',
                description: 'An error occurred while asking AI',
            });
        } finally {
            setIsFetchingAiResponse(false);
            setAiPrompt('');
        }
    };

    return (
        <div className='p-4'>
            <h2 className='font-bold text-lg mb-4'>Notification Task</h2>
            <div className='flex flex-col gap-4'>
                <div>
                    <Label className='mb-2 block'>Name</Label>
                    <Input value={newNode.data.name ?? `notify_${newNode.id.slice(0, 8)}`} disabled className='bg-muted' />
                </div>
                <FormInput
                    label='Label'
                    value={newNode.data.label}
                    onChange={(value) => setNewNode({ ...newNode, data: { ...newNode.data, label: value } })}
                />

                <div>
                    <div className='rounded-lg border bg-muted/30 p-4 space-y-3 mb-4'>
                        <div className='flex items-center justify-between'>
                            <span className='text-sm font-medium flex items-center gap-2'>
                                <Mail className='h-4 w-4' />
                                Send via Gmail
                            </span>
                            {gmailConnected === true && (
                                <Badge variant='outline' className='bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300'>
                                    <Check className='h-3.5 w-3.5 mr-1' />
                                    Connected
                                </Badge>
                            )}
                        </div>
                        {gmailConnected === false && (
                            <div className='text-sm'>
                                <p className='flex items-start gap-2 text-amber-700 dark:text-amber-400'>
                                    <AlertCircle className='h-4 w-4 shrink-0 mt-0.5' />
                                    <span>
                                        Important to connect Google before saving this. Go to Profile for saving.
                                    </span>
                                </p>
                                <Button asChild variant='outline' size='sm' className='mt-3'>
                                    <Link href='/profile?tab=settings'>
                                        <Mail className='h-4 w-4 mr-2' />
                                        Connect your Google account
                                    </Link>
                                </Button>
                            </div>
                        )}
                        {gmailConnected === null && (
                            <p className='text-xs text-muted-foreground'>Checking connection…</p>
                        )}
                    </div>
                    <EmailConfig node={newNode} handleEmailConfigChange={handleEmailConfigChange} />
                    <AiDialog
                        isOpen={isAiDialogOpen}
                        onOpenChange={setIsAiDialogOpen}
                        aiPrompt={aiPrompt}
                        setAiPrompt={setAiPrompt}
                        aiModel={aiModel}
                        setAiModel={setAiModel}
                        handleAiPrompt={handleAiPrompt}
                        placeholder='What kind of email would you like to create?'
                        isFetchingAiResponse={isFetchingAiResponse}
                        aiResponse={aiResponse}
                    />
                </div>
            </div>

            <Button onClick={() => onSubmit(newNode)} className='mt-4 w-full'>
                Submit
            </Button>
        </div>
    );
};

export default NotificationNodeBuilderComponent;
