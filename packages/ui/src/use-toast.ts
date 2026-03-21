'use client';

import * as React from 'react';
import { toast as sonnerToast } from 'sonner';

/** Auto-dismiss for success, info, and warning toasts */
const AUTO_DISMISS_MS_NEUTRAL = 3000;
/** Errors often need a moment longer to read */
const AUTO_DISMISS_MS_DESTRUCTIVE = 5000;

type ToastVariant = 'default' | 'destructive' | 'info' | 'warning';

type ToastProps = {
    title?: React.ReactNode;
    description?: React.ReactNode;
    variant?: ToastVariant;
    duration?: number;
};

function defaultDuration(variant: ToastVariant | undefined): number {
    return variant === 'destructive' ? AUTO_DISMISS_MS_DESTRUCTIVE : AUTO_DISMISS_MS_NEUTRAL;
}

function toast({ title, description, variant = 'default', duration }: ToastProps) {
    const message = title ?? '';
    const opts = {
        description: description as string | undefined,
        duration: duration ?? defaultDuration(variant),
    };

    let id: string | number;
    switch (variant) {
        case 'destructive':
            id = sonnerToast.error(message, opts);
            break;
        case 'info':
            id = sonnerToast.info(message, opts);
            break;
        case 'warning':
            id = sonnerToast.warning(message, opts);
            break;
        default:
            id = sonnerToast.success(message, opts);
            break;
    }

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
