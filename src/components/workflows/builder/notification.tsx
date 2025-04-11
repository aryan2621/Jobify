'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { NotificationNode, NotificationOption } from '@/model/workflow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ky from 'ky';
import { useToast } from '@/components/ui/use-toast';
import AiDialog from '@/components/elements/ai-dialog';

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
}

const FormInput = ({ label, type = 'text', placeholder, value, onChange }: FormField) => (
    <div>
        <Label>{label}</Label>
        <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
);

const FormTextArea = ({ label, placeholder, value, onChange }: FormField) => (
    <div className='relative'>
        <Label>{label}</Label>
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className='min-h-[100px]' />
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
            label='Email'
            type='email'
            value={node.data.emailConfig?.to || ''}
            onChange={(value) => handleEmailConfigChange('to', value)}
            placeholder='To'
        />
        <FormInput
            label='CC'
            type='email'
            value={node.data.emailConfig?.cc || ''}
            onChange={(value) => handleEmailConfigChange('cc', value)}
            placeholder='CC'
        />
        <FormInput
            label='BCC'
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
        />
        <FormTextArea
            label='Body'
            value={node.data.emailConfig?.body || ''}
            onChange={(value) => handleEmailConfigChange('body', value)}
            placeholder='Email body'
        />
    </div>
);

const MessageConfig = ({
    node,
    handleMessageConfigChange,
}: {
    node: NotificationNode;
    handleMessageConfigChange: (field: string, value: string) => void;
}) => (
    <div className='flex flex-col gap-3'>
        <FormInput
            label='Phone Number'
            type='tel'
            value={node.data.messageConfig?.phoneNumber || ''}
            onChange={(value) => handleMessageConfigChange('phoneNumber', value)}
            placeholder='Phone number'
        />
        <FormTextArea
            label='Message'
            value={node.data.messageConfig?.body || ''}
            onChange={(value) => handleMessageConfigChange('body', value)}
            placeholder='Message body'
        />
    </div>
);

const NotificationNodeBuilderComponent = ({ node, onSubmit }: NotificationNodeBuilderProps) => {
    const cpNode = new NotificationNode(node.id, node.data, node.position, node.notificationOptions, node.sourcePosition, node.targetPosition);

    const [newNode, setNewNode] = useState(cpNode);
    const [selectedOption, setSelectedOption] = useState<NotificationOption>(node.notificationOptions?.[0] || NotificationOption.EMAIL);
    const [aiPrompt, setAiPrompt] = useState<string>('');
    const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
    const [aiModel, setAiModel] = useState<string>('gemini-1.5-flash');
    const [isFetchingAiResponse, setIsFetchingAiResponse] = useState(false);
    const [aiResponse, setAiResponse] = useState<string>('');
    const { toast } = useToast();

    const handleOptionChange = (value: string) => {
        const option = value as NotificationOption;
        setSelectedOption(option);
        setNewNode({
            ...newNode,
            notificationOptions: [option],
            data: {
                ...newNode.data,
                emailConfig:
                    option === NotificationOption.EMAIL
                        ? {
                              to: newNode.data.emailConfig?.to || '',
                              cc: newNode.data.emailConfig?.cc || '',
                              bcc: newNode.data.emailConfig?.bcc || '',
                              subject: newNode.data.emailConfig?.subject || '',
                              body: newNode.data.emailConfig?.body || '',
                          }
                        : undefined,
                messageConfig:
                    option === NotificationOption.SMS || option === NotificationOption.WHATSAPP
                        ? {
                              phoneNumber: newNode.data.messageConfig?.phoneNumber || '',
                              body: newNode.data.messageConfig?.body || '',
                          }
                        : undefined,
            },
        });
    };

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

    const handleMessageConfigChange = (field: string, value: string) => {
        setNewNode({
            ...newNode,
            data: {
                ...newNode.data,
                messageConfig: {
                    phoneNumber: newNode.data.messageConfig?.phoneNumber || '',
                    body: newNode.data.messageConfig?.body || '',
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
                <FormInput
                    label='Label'
                    value={newNode.data.label}
                    onChange={(value) => setNewNode({ ...newNode, data: { ...newNode.data, label: value } })}
                />

                <div>
                    <Label className='mb-2 block'>Notification Method</Label>
                    <Tabs value={selectedOption} onValueChange={handleOptionChange} className='w-full'>
                        <TabsList className='grid w-full grid-cols-3'>
                            {Object.values(NotificationOption).map((option) => (
                                <TabsTrigger key={option} value={option}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {Object.values(NotificationOption).map((option) => (
                            <TabsContent key={option} value={option}>
                                {option === NotificationOption.EMAIL && (
                                    <>
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
                                    </>
                                )}
                                {(option === NotificationOption.SMS || option === NotificationOption.WHATSAPP) && (
                                    <>
                                        <MessageConfig node={newNode} handleMessageConfigChange={handleMessageConfigChange} />
                                        <AiDialog
                                            isOpen={isAiDialogOpen}
                                            onOpenChange={setIsAiDialogOpen}
                                            aiPrompt={aiPrompt}
                                            setAiPrompt={setAiPrompt}
                                            aiModel={aiModel}
                                            setAiModel={setAiModel}
                                            handleAiPrompt={handleAiPrompt}
                                            placeholder='What kind of message would you like to create?'
                                            isFetchingAiResponse={isFetchingAiResponse}
                                            aiResponse={aiResponse}
                                        />
                                    </>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </div>

            <Button onClick={() => onSubmit(newNode)} className='mt-4 w-full'>
                Submit
            </Button>
        </div>
    );
};

export default NotificationNodeBuilderComponent;
