'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { BarChartIcon, CircleHelpIcon, FileIcon, MenuIcon, ProfileIcon } from '@/elements/icon';
import { BookCopyIcon, HouseIcon, ScrollTextIcon, PanelLeftClose, PanelLeftOpen, Workflow, HandCoins } from 'lucide-react';
import Link from 'next/link';
import { userStore } from '@/store';
import { User } from '@/model/user';

interface NavbarLayoutProps {
    children: React.ReactNode;
}

const NavbarLayout: React.FC<NavbarLayoutProps> = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    const user = userStore(
        (state) =>
            new User(
                state.user?.id ?? '',
                state.user?.firstName ?? '',
                state.user?.lastName ?? '',
                state.user?.username ?? '',
                state.user?.email ?? '',
                state.user?.password ?? '',
                state.user?.confirmPassword ?? '',
                state.user?.createdAt ?? '',
                state.user?.jobs ?? [],
                state.user?.applications ?? [],
                state.user?.roles ?? [],
                state.user?.tnC ?? false
            )
    );

    const showPost = user?.isSuperUser || !user?.applier;
    const showApplications = user?.isSuperUser || !user?.poster;

    return (
        <div className='flex min-h-screen w-full'>
            <aside className={`hidden md:flex flex-col border-r bg-background transition-all duration-300 ${isCollapsed ? 'w-[60px]' : 'w-[240px]'}`}>
                <Button variant='ghost' size='icon' className='self-end m-2' onClick={toggleSidebar}>
                    {isCollapsed ? <PanelLeftOpen className='h-5 w-5' /> : <PanelLeftClose className='h-5 w-5' />}
                </Button>
                {user ? (
                    <>
                        <nav className='flex flex-col gap-2 p-2'>
                            <NavItem href='/' icon={<HouseIcon className='h-5 w-5' />} label='Home' isCollapsed={isCollapsed} />
                            <NavItem href='/posts' icon={<BookCopyIcon className='h-5 w-5' />} label='Posts' isCollapsed={isCollapsed} />
                            {showApplications && (
                                <NavItem
                                    href='/applications'
                                    icon={<ScrollTextIcon className='h-5 w-5' />}
                                    label='Applications'
                                    isCollapsed={isCollapsed}
                                />
                            )}
                            {showPost && <NavItem href='/post' icon={<FileIcon className='h-5 w-5' />} label='Post' isCollapsed={isCollapsed} />}
                            {showPost && (
                                <NavItem href='/workflows' icon={<Workflow className='h-5 w-5' />} label='Workflows' isCollapsed={isCollapsed} />
                            )}
                            <NavItem href='/analytics' icon={<BarChartIcon className='h-5 w-5' />} label='Analytics' isCollapsed={isCollapsed} />
                            <NavItem href='/billing' icon={<HandCoins className='h-5 w-5' />} label='Billing' isCollapsed={isCollapsed} />
                            <NavItem
                                href='/contact'
                                icon={<CircleHelpIcon className='h-5 w-5' />}
                                label='Help and Support'
                                isCollapsed={isCollapsed}
                            />
                            <NavItem href='/user' icon={<ProfileIcon className='h-5 w-5' />} label='Profile' isCollapsed={isCollapsed} />
                        </nav>
                    </>
                ) : (
                    <> </>
                )}
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
                            {user ? (
                                <>
                                    <nav className='grid gap-6 text-lg font-medium'>
                                        <NavItem href='/' icon={<HouseIcon className='h-5 w-5' />} label='Home' isCollapsed={false} />
                                        <NavItem href='/posts' icon={<BookCopyIcon className='h-5 w-5' />} label='Posts' isCollapsed={false} />
                                        {showApplications && (
                                            <NavItem
                                                href='/applications'
                                                icon={<ScrollTextIcon className='h-5 w-5' />}
                                                label='Applications'
                                                isCollapsed={false}
                                            />
                                        )}
                                        {showPost && (
                                            <NavItem href='/post' icon={<FileIcon className='h-5 w-5' />} label='Post' isCollapsed={false} />
                                        )}
                                        {showPost && (
                                            <NavItem
                                                href='/workflows'
                                                icon={<Workflow className='h-5 w-5' />}
                                                label='Workflows'
                                                isCollapsed={false}
                                            />
                                        )}
                                        <NavItem
                                            href='/analytics'
                                            icon={<BarChartIcon className='h-5 w-5' />}
                                            label='Analytics'
                                            isCollapsed={false}
                                        />
                                        <NavItem href='/billing' icon={<HandCoins className='h-5 w-5' />} label='Billing' isCollapsed={false} />
                                        <NavItem
                                            href='/contact'
                                            icon={<CircleHelpIcon className='h-5 w-5' />}
                                            label='Help and Support'
                                            isCollapsed={false}
                                        />
                                        <NavItem href='/user' icon={<ProfileIcon className='h-5 w-5' />} label='Profile' isCollapsed={false} />
                                    </nav>
                                </>
                            ) : (
                                <> </>
                            )}
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
