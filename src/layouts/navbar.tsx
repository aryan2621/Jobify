'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { BarChartIcon, CircleHelpIcon, ClipboardIcon, FileIcon, InfoIcon, MenuIcon, ProfileIcon } from '@/elements/icon';
import { BookCopyIcon, HouseIcon, ScrollTextIcon, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Link from 'next/link';

interface NavbarLayoutProps {
    children: React.ReactNode;
}

const NavbarLayout: React.FC<NavbarLayoutProps> = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className='flex min-h-screen w-full'>
            <aside className={`hidden md:flex flex-col border-r bg-background transition-all duration-300 ${isCollapsed ? 'w-[60px]' : 'w-[240px]'}`}>
                <Button variant='ghost' size='icon' className='self-end m-2' onClick={toggleSidebar}>
                    {isCollapsed ? <PanelLeftOpen className='h-5 w-5' /> : <PanelLeftClose className='h-5 w-5' />}
                </Button>
                <nav className='flex flex-col gap-2 p-2'>
                    <NavItem href='/' icon={<HouseIcon className='h-5 w-5' />} label='Home' isCollapsed={isCollapsed} />
                    <NavItem href='/posts' icon={<BookCopyIcon className='h-5 w-5' />} label='Posts' isCollapsed={isCollapsed} />
                    <NavItem href='/applications' icon={<ScrollTextIcon className='h-5 w-5' />} label='Applications' isCollapsed={isCollapsed} />
                    <NavItem href='/post' icon={<FileIcon className='h-5 w-5' />} label='Post' isCollapsed={isCollapsed} />
                    <NavItem href='/analytics' icon={<BarChartIcon className='h-5 w-5' />} label='Analytics' isCollapsed={isCollapsed} />
                    <NavItem href='/contact' icon={<CircleHelpIcon className='h-5 w-5' />} label='Help and Support' isCollapsed={isCollapsed} />
                    <NavItem href='/user' icon={<ProfileIcon className='h-5 w-5' />} label='Profile' isCollapsed={isCollapsed} />
                </nav>
            </aside>
            <div className='flex flex-1 flex-col'>
                <header className='sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6'>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button size='icon' variant='outline' className='md:hidden'>
                                <MenuIcon className='h-5 w-5' />
                                <span className='sr-only'>Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side='left' className='sm:max-w-xs'>
                            <nav className='grid gap-6 text-lg font-medium'>
                                <NavItem href='/' icon={<HouseIcon className='h-5 w-5' />} label='Home' isCollapsed={false} />
                                <NavItem href='/posts' icon={<BookCopyIcon className='h-5 w-5' />} label='Posts' isCollapsed={false} />
                                <NavItem
                                    href='/applications'
                                    icon={<ScrollTextIcon className='h-5 w-5' />}
                                    label='Applications'
                                    isCollapsed={false}
                                />
                                <NavItem href='/post' icon={<FileIcon className='h-5 w-5' />} label='Post' isCollapsed={false} />
                                <NavItem href='/analytics' icon={<BarChartIcon className='h-5 w-5' />} label='Analytics' isCollapsed={false} />
                                <NavItem href='/contact' icon={<CircleHelpIcon className='h-5 w-5' />} label='Help and Support' isCollapsed={false} />
                                <NavItem href='/user' icon={<ProfileIcon className='h-5 w-5' />} label='Profile' isCollapsed={false} />
                            </nav>
                        </SheetContent>
                    </Sheet>
                </header>
                <main className='flex-1 p-4 sm:p-6'>{children}</main>
            </div>
        </div>
    );
};

interface NavItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, isCollapsed }) => (
    <Link
        href={href}
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${isCollapsed ? 'justify-center' : ''}`}
        prefetch={false}
    >
        {icon}
        {!isCollapsed && <span>{label}</span>}
    </Link>
);

export default NavbarLayout;
