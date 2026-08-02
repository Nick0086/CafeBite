import { useLocation } from 'react-router';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/ui/Layouts/user-nav';

const PAGE_TITLES = [
    { match: '/', title: 'Overview' },
    { match: '/menu-management', title: 'Menu management' },
    { match: '/qr-management', title: 'QR code management' },
    { match: '/profile-management', title: 'Profile' },
    { match: '/ticket-management', title: 'Customer feedback' },
];

export default function SidebarTopBar() {
    const { pathname } = useLocation();
    const currentPage = PAGE_TITLES.find((page) => page.match === '/' ? pathname === '/' : pathname.startsWith(page.match));

    return (
        <header className="sticky top-0 z-10 flex h-12 shrink-0 w-full items-center justify-between border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-1 h-4" />
                <span className="truncate text-sm font-semibold text-slate-700 sm:text-base">
                    {currentPage?.title || 'SmartMenu'}
                </span>
            </div>
            <UserNav />
        </header>
    );
}
