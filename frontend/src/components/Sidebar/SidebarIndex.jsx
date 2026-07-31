import { Outlet, useLocation } from 'react-router';
import {
    Sidebar as SidebarComponent,
    SidebarContent,
    SidebarHeader as SidebarHeaderSlot,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import SidebarHeader from './components/SidebarHeader';
import SidebarNav from './components/SidebarNav';
import SidebarTopBar from './components/SidebarTopBar';

export default function SidebarIndex() {
    const location = useLocation();
    const isfullScreen = location.pathname.includes('template-editor');

    const isActive = (link) => location.pathname.split('/')[1] === link.split('/')[1];

    if (isfullScreen) {
        return <Outlet />;
    }

    return (
        <SidebarProvider>
            <SidebarComponent
                className={cn('border-r border-slate-200 bg-white')}
                collapsible="icon"
                style={{ fontFamily: 'Nunito, "Segoe UI", arial' }}
            >
                <SidebarHeaderSlot>
                    <SidebarHeader />
                </SidebarHeaderSlot>
                <SidebarContent>
                    <SidebarNav isActive={isActive} />
                </SidebarContent>
            </SidebarComponent>
            <SidebarInset className={cn('h-full w-full min-w-0')}>
                <SidebarTopBar />
                <main className="flex-1 overflow-auto bg-surface-background md:p-2 lg:p-4">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
