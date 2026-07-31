import { Link } from 'react-router';
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { CafeIcon } from '../constants/sidebar.constants';

export default function SidebarHeader() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Link className="group flex h-10 w-full items-center justify-center gap-2 border-b border-slate-200 px-3 pb-2 text-inherit no-underline transition hover:bg-slate-50" to="/" aria-label="CafeBite home">
                    <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition group-hover:bg-indigo-100">
                        <CafeIcon className="h-6 w-6" />
                    </span>
                    <b className="text-base tracking-[0.08em] group-data-[collapsible=icon]:hidden">CafeBite</b>
                </Link>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
