'use client';

import * as React from 'react';
import { toast as sonnerToast } from 'sonner';

const DEFAULT_TOAST_DURATION = 5000;

type ToastVariant = 'default' | 'destructive';

type ToastProps = {
    title?: React.ReactNode;
    description?: React.ReactNode;
    variant?: ToastVariant;
    duration?: number;
};

function toast({ title, description, variant, duration }: ToastProps) {
    const message = title ?? '';
    const opts = {
        description: description as string | undefined,
        duration: duration ?? DEFAULT_TOAST_DURATION,
    };

    const id = variant === 'destructive' ? sonnerToast.error(message, opts) : sonnerToast.success(message, opts);

    return {
        id: String(id),
        dismiss: () => sonnerToast.dismiss(id),
        update: () => {
            /* Sonner has no Radix-style update */
        },
    };
}

function useToast() {
    return {
        toasts: [] as [],
        toast,
        dismiss: (toastId?: string | number) => {
            if (toastId !== undefined) {
                sonnerToast.dismiss(toastId);
            } else {
                sonnerToast.dismiss();
            }
        },
    };
}

export { useToast, toast };
