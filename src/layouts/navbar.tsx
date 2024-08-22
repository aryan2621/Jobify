import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    BarChartIcon,
    CircleHelpIcon,
    ClipboardIcon,
    FileIcon,
    FileTextIcon,
    InfoIcon,
    MenuIcon,
    ProfileIcon,
} from '@/elements/icon';
import { BookCopyIcon, BookPlus, HouseIcon, ScrollTextIcon } from 'lucide-react';
import Link from 'next/link';

interface NavbarLayoutProps {
    children: React.ReactNode;
}

const NavbarLayout: React.FC<NavbarLayoutProps> = ({ children }) => {
    return (
        <div className='flex min-h-screen w-full'>
            <aside className='hidden w-[240px] flex-col border-r bg-background p-4 md:flex'>
                <nav className='flex flex-col gap-2'>
                <NavItem
                        href='/'
                        icon={<HouseIcon className='h-5 w-5' />}
                        label='Home'
                    />
                    <NavItem
                        href='/apply'
                        icon={<BookPlus className='h-5 w-5' />}
                        label='Apply'
                    />
                     <NavItem
                        href='/applications'
                        icon={<ScrollTextIcon className='h-5 w-5' />}
                        label='Applications'
                    />
                     <NavItem
                        href='/post'
                        icon={<FileIcon className='h-5 w-5' />}
                        label='Post'
                    />
                     <NavItem
                        href='/posts'
                        icon={<BookCopyIcon className='h-5 w-5' />}
                        label='Posts'
                    />
                    <NavItem
                        href='/analytics'
                        icon={<BarChartIcon className='h-5 w-5' />}
                        label='Analytics'
                    />
                    <NavItem
                        href='#'
                        icon={<CircleHelpIcon className='h-5 w-5' />}
                        label='Help and Support'
                    />
                    <NavItem
                        href='#'
                        icon={<ProfileIcon className='h-5 w-5' />}
                        label='Profile'
                    />
                </nav>
            </aside>
            <div className='flex flex-1 flex-col'>
                <header className='sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6'>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                size='icon'
                                variant='outline'
                                className='sm:hidden'
                            >
                                <MenuIcon className='h-5 w-5' />
                                <span className='sr-only'>Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side='left' className='sm:max-w-xs'>
                            <nav className='grid gap-6 text-lg font-medium'>
                                <NavItem
                                    href='#'
                                    icon={<FileIcon className='h-5 w-5' />}
                                    label='Job Form'
                                />
                                <NavItem
                                    href='/admin-jobs-posted'
                                    icon={<ClipboardIcon className='h-5 w-5' />}
                                    label='Jobs Posted'
                                />
                                <NavItem
                                    href='#'
                                    icon={<InfoIcon className='h-5 w-5' />}
                                    label='Analytics'
                                />
                                <NavItem
                                    href='#'
                                    icon={
                                        <CircleHelpIcon className='h-5 w-5' />
                                    }
                                    label='Help and Support'
                                />
                                <NavItem
                                    href='#'
                                    icon={<ProfileIcon className='h-5 w-5' />}
                                    label='Profile'
                                />
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
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label }) => (
    <Link
        href={href}
        className='flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50'
        prefetch={false}
    >
        {icon}
        {label}
    </Link>
);

export default NavbarLayout;
