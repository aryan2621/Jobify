import { AlertCircle } from 'lucide-react';

export function FieldError({ message }: { message: string }) {
    return (
        <div className='text-destructive text-xs flex items-center mt-1'>
            <AlertCircle className='h-3 w-3 mr-1' />
            <span>{message}</span>
        </div>
    );
}
