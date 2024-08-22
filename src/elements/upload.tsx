import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { UploadIcon, XIcon } from './icon';
import Image from 'next/image';

interface Props {
    acceptedFileTypes: string[];
}

export default function Upload({ acceptedFileTypes }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleDragOver = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            setDragActive(true);
        },
        []
    );

    const handleDragLeave = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            setDragActive(false);
        },
        []
    );

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(false);
        const droppedFile = event.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
        }
    }, []);

    const removeFile = () => {
        setFile(null);
    };

    return (
        <div className='grid gap-6 max-w-md mx-auto p-6 rounded-lg border'>
            <div className='text-center space-y-2'>
                <h2 className='text-2xl font-bold'>File Uploader</h2>
                <p className='text-muted-foreground'>
                    Drag and drop your files here or click to select.
                </p>
            </div>
            <div
                className={`group relative h-48 rounded-lg border-2 border-dashed ${
                    dragActive ? 'border-primary' : 'border-muted'
                } transition-colors`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {!file && (
                    <>
                        <div className='absolute inset-0 flex flex-col items-center justify-center space-y-2 text-muted-foreground'>
                            <UploadIcon className='h-8 w-8' />
                            <p className='text-sm'>Drag &amp; Drop to Upload</p>
                        </div>
                        <input
                            accept={acceptedFileTypes?.join(',')}
                            type='file'
                            className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
                            onChange={handleFileChange}
                        />
                    </>
                )}
                {file && (
                    <div className='grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border bg-background p-4'>
                        <Image
                            src={URL.createObjectURL(file)}
                            alt='File Preview'
                            width={64}
                            height={64}
                            className='aspect-square rounded-md object-cover'
                        />
                        <div className='space-y-1'>
                            <p className='font-medium'>{file.name}</p>
                            <p className='text-sm text-muted-foreground'>
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <Button
                            variant='ghost'
                            size='icon'
                            onClick={removeFile}
                        >
                            <XIcon className='h-4 w-4' />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
