import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
/**
 * Formats amount in INR for display (e.g. 499 → "₹499", 4990 → "₹4,990").
 */
export function formatPriceINR(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
}
