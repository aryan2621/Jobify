'use client';
import { Toaster } from '@jobify/ui/toaster';
import { ThemeProvider } from 'next-themes';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
            {children}
            <Toaster />
        </ThemeProvider>
    );
}
