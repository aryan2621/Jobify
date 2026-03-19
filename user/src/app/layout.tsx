import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Providers from './theme';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
    title: 'JobConnect',
    description: 'JobConnect is a platform for connecting job seekers with employers.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en' suppressHydrationWarning>
            <body className={`bg-lightbg text-black dark:bg-darkbg dark:text-white`}>
                <Providers>{children}</Providers>
                <Analytics />
                <Toaster />
            </body>
        </html>
    );
}
