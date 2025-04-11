'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { BarChartIcon, CircleHelpIcon, FileIcon, MenuIcon, ProfileIcon } from '@/components/elements/icon';
import { BookCopyIcon, HouseIcon, ScrollTextIcon, PanelLeftClose, PanelLeftOpen, Workflow, HandCoins, LogOut } from 'lucide-react';
import Link from 'next/link';
import { userStore } from '@/store';
import { User, UserRole } from '@/model/user';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavbarLayoutProps {
    children: React.ReactNode;
}

const NavbarLayout: React.FC<NavbarLayoutProps> = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Check for saved preference
        const savedCollapsed = localStorage.getItem('sidebarCollapsed');
        if (savedCollapsed) {
            setIsCollapsed(savedCollapsed === 'true');
        }
        setMounted(true);
    }, []);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        // Save preference
        localStorage.setItem('sidebarCollapsed', String(newState));
    };

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
                state.user?.role ?? UserRole.USER,
                state.user?.tnC ?? false,
                state.user?.workflows ?? []
            )
    );

    const sidebarVariants = {
        expanded: { width: '240px' },
        collapsed: { width: '72px' },
    };

    const labelVariants = {
        expanded: { opacity: 1, display: 'block' },
        collapsed: { opacity: 0, display: 'none', transition: { duration: 0.1 } },
    };

    if (!mounted) return null;

    return (
        <div className='flex min-h-screen w-full bg-background/95'>
            <motion.aside
                className='hidden md:flex flex-col border-r bg-background/80 backdrop-blur-sm shadow-sm h-screen sticky top-0'
                initial={isCollapsed ? 'collapsed' : 'expanded'}
                animate={isCollapsed ? 'collapsed' : 'expanded'}
                variants={sidebarVariants}
                transition={{ duration: 0.2 }}
            >
                <div className='flex items-center h-14 px-3 border-b'>
                    {!isCollapsed && (
                        <motion.div
                            initial='expanded'
                            animate={isCollapsed ? 'collapsed' : 'expanded'}
                            variants={labelVariants}
                            className='font-semibold text-lg'
                        >
                            JobBoard
                        </motion.div>
                    )}
                    <Button variant='ghost' size='icon' className={`${isCollapsed ? 'mx-auto' : 'ml-auto'}`} onClick={toggleSidebar}>
                        {isCollapsed ? <PanelLeftOpen className='h-4 w-4' /> : <PanelLeftClose className='h-4 w-4' />}
                    </Button>
                </div>

                {user ? (
                    <div className='flex flex-col h-full justify-between py-2'>
                        <div>
                            {!isCollapsed && (
                                <motion.div
                                    variants={labelVariants}
                                    initial='expanded'
                                    animate={isCollapsed ? 'collapsed' : 'expanded'}
                                    className='px-3 py-2'
                                >
                                    <div className='flex items-center gap-3 mb-2'>
                                        <Avatar className='h-10 w-10'>
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName} ${user.lastName}`} />
                                            <AvatarFallback>
                                                {user.firstName.charAt(0)}
                                                {user.lastName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className='text-sm font-medium'>
                                                {user.firstName} {user.lastName}
                                            </p>
                                            <p className='text-xs text-muted-foreground truncate max-w-[150px]'>{user.email}</p>
                                        </div>
                                    </div>
                                    <Separator className='my-2' />
                                </motion.div>
                            )}

                            <nav className='flex flex-col gap-1 px-2'>
                                <TooltipProvider delayDuration={isCollapsed ? 300 : 10000}>
                                    <NavItem
                                        href='/'
                                        icon={<HouseIcon className='h-5 w-5' />}
                                        label='Home'
                                        isCollapsed={isCollapsed}
                                        isActive={pathname === '/'}
                                    />

                                    {user.role === UserRole.USER ? (
                                        <>
                                            <NavItem
                                                href='/user/posts'
                                                icon={<BookCopyIcon className='h-5 w-5' />}
                                                label='Browse Jobs'
                                                isCollapsed={isCollapsed}
                                                isActive={pathname.startsWith('/user/posts')}
                                            />
                                            <NavItem
                                                href='/user/applications'
                                                icon={<ScrollTextIcon className='h-5 w-5' />}
                                                label='My Applications'
                                                isCollapsed={isCollapsed}
                                                isActive={pathname.startsWith('/user/applications')}
                                                badge={user.applications?.length}
                                            />
                                        </>
                                    ) : (
                                        // Admin links
                                        <>
                                            <NavItem
                                                href='/admin/posts'
                                                icon={<BookCopyIcon className='h-5 w-5' />}
                                                label='Manage Jobs'
                                                isCollapsed={isCollapsed}
                                                isActive={pathname.startsWith('/admin/posts')}
                                                badge={user.jobs?.length}
                                            />
                                            <NavItem
                                                href='/admin/workflows'
                                                icon={<Workflow className='h-5 w-5' />}
                                                label='Workflows'
                                                isCollapsed={isCollapsed}
                                                isActive={pathname.startsWith('/admin/workflows')}
                                            />
                                        </>
                                    )}

                                    {/* Common links for both roles */}
                                    <NavItem
                                        href='/analytics'
                                        icon={<BarChartIcon className='h-5 w-5' />}
                                        label='Analytics'
                                        isCollapsed={isCollapsed}
                                        isActive={pathname === '/analytics'}
                                    />

                                    <NavItem
                                        href='/billing'
                                        icon={<HandCoins className='h-5 w-5' />}
                                        label='Billing'
                                        isCollapsed={isCollapsed}
                                        isActive={pathname === '/billing'}
                                    />

                                    {!isCollapsed && <Separator className='my-2' />}

                                    <NavItem
                                        href='/contact'
                                        icon={<CircleHelpIcon className='h-5 w-5' />}
                                        label='Help and Support'
                                        isCollapsed={isCollapsed}
                                        isActive={pathname === '/contact'}
                                    />
                                </TooltipProvider>
                            </nav>
                        </div>

                        <div className='mt-auto px-2'>
                            <TooltipProvider delayDuration={isCollapsed ? 300 : 10000}>
                                <NavItem
                                    href='/profile'
                                    icon={<ProfileIcon className='h-5 w-5' />}
                                    label='Profile'
                                    isCollapsed={isCollapsed}
                                    isActive={pathname === '/profile'}
                                />
                            </TooltipProvider>
                        </div>
                    </div>
                ) : (
                    <div className='flex items-center justify-center h-full'>
                        <p className='text-muted-foreground text-sm'>Please log in</p>
                    </div>
                )}
            </motion.aside>

            <div className='flex flex-1 flex-col'>
                <header className='sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4'>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button size='icon' variant='outline' className='md:hidden'>
                                <MenuIcon className='h-5 w-5' />
                                <span className='sr-only'>Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side='left' className='sm:max-w-xs p-0'>
                            {user ? (
                                <div className='flex flex-col h-full'>
                                    <div className='flex items-center h-14 px-4 border-b'>
                                        <div className='font-semibold text-lg'>JobBoard</div>
                                    </div>

                                    <div className='px-4 py-3'>
                                        <div className='flex items-center gap-3 mb-2'>
                                            <Avatar className='h-10 w-10'>
                                                <AvatarImage
                                                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName} ${user.lastName}`}
                                                />
                                                <AvatarFallback>
                                                    {user.firstName.charAt(0)}
                                                    {user.lastName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className='text-sm font-medium'>
                                                    {user.firstName} {user.lastName}
                                                </p>
                                                <p className='text-xs text-muted-foreground truncate max-w-[150px]'>{user.email}</p>
                                            </div>
                                        </div>
                                        <Separator className='my-2' />
                                    </div>

                                    <div className='flex-1 overflow-auto py-2'>
                                        <nav className='grid gap-1 px-2'>
                                            <NavItem
                                                href='/'
                                                icon={<HouseIcon className='h-5 w-5' />}
                                                label='Home'
                                                isCollapsed={false}
                                                isActive={pathname === '/'}
                                            />

                                            {user.role === UserRole.USER ? (
                                                <>
                                                    <NavItem
                                                        href='/user/posts'
                                                        icon={<BookCopyIcon className='h-5 w-5' />}
                                                        label='Browse Jobs'
                                                        isCollapsed={false}
                                                        isActive={pathname.startsWith('/user/posts')}
                                                    />
                                                    <NavItem
                                                        href='/user/applications'
                                                        icon={<ScrollTextIcon className='h-5 w-5' />}
                                                        label='My Applications'
                                                        isCollapsed={false}
                                                        isActive={pathname.startsWith('/user/applications')}
                                                        badge={user.applications?.length}
                                                    />
                                                </>
                                            ) : (
                                                // Admin links
                                                <>
                                                    <NavItem
                                                        href='/admin/posts'
                                                        icon={<BookCopyIcon className='h-5 w-5' />}
                                                        label='Manage Jobs'
                                                        isCollapsed={false}
                                                        isActive={pathname.startsWith('/admin/posts')}
                                                        badge={user.jobs?.length}
                                                    />
                                                    <NavItem
                                                        href='/admin/workflows'
                                                        icon={<Workflow className='h-5 w-5' />}
                                                        label='Workflows'
                                                        isCollapsed={false}
                                                        isActive={pathname.startsWith('/admin/workflows')}
                                                    />
                                                </>
                                            )}

                                            <NavItem
                                                href='/analytics'
                                                icon={<BarChartIcon className='h-5 w-5' />}
                                                label='Analytics'
                                                isCollapsed={false}
                                                isActive={pathname === '/analytics'}
                                            />
                                            <NavItem
                                                href='/billing'
                                                icon={<HandCoins className='h-5 w-5' />}
                                                label='Billing'
                                                isCollapsed={false}
                                                isActive={pathname === '/billing'}
                                            />

                                            <Separator className='my-2' />

                                            <NavItem
                                                href='/contact'
                                                icon={<CircleHelpIcon className='h-5 w-5' />}
                                                label='Help and Support'
                                                isCollapsed={false}
                                                isActive={pathname === '/contact'}
                                            />
                                        </nav>
                                    </div>

                                    <div className='mt-auto border-t p-2'>
                                        <NavItem
                                            href='/profile'
                                            icon={<ProfileIcon className='h-5 w-5' />}
                                            label='Profile'
                                            isCollapsed={false}
                                            isActive={pathname === '/profile'}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className='flex items-center justify-center h-full'>
                                    <p className='text-muted-foreground text-sm'>Please log in</p>
                                </div>
                            )}
                        </SheetContent>
                    </Sheet>

                    <div className='md:hidden font-semibold'>JobBoard</div>
                </header>

                <main className='flex-1 p-4 sm:p-6 overflow-auto'>{children}</main>
            </div>
        </div>
    );
};

interface NavItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    isCollapsed: boolean;
    isActive?: boolean;
    badge?: number;
    variant?: 'default' | 'destructive';
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, isCollapsed, isActive = false, badge, variant = 'default' }) => {
    const baseClass = 'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none';

    let variantClass = 'hover:bg-accent hover:text-accent-foreground';
    if (variant === 'destructive') {
        variantClass = 'hover:bg-destructive hover:text-destructive-foreground text-muted-foreground';
    }

    const activeClass = isActive ? 'bg-accent/50 text-accent-foreground' : '';
    const alignClass = isCollapsed ? 'justify-center' : '';

    const iconElement = (
        <>
            {icon}
            {badge && !isCollapsed && (
                <Badge variant='secondary' className='ml-auto text-xs'>
                    {badge}
                </Badge>
            )}
        </>
    );

    return isCollapsed ? (
        <Tooltip>
            <TooltipTrigger asChild>
                <Link href={href} className={`${baseClass} ${variantClass} ${activeClass} ${alignClass}`} prefetch={false}>
                    {iconElement}
                </Link>
            </TooltipTrigger>
            <TooltipContent side='right'>
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    ) : (
        <Link href={href} className={`${baseClass} ${variantClass} ${activeClass} ${alignClass}`} prefetch={false}>
            {iconElement}
            <span>{label}</span>
            {badge && (
                <Badge variant='secondary' className='ml-auto text-xs'>
                    {badge}
                </Badge>
            )}
        </Link>
    );
};

export default NavbarLayout;
