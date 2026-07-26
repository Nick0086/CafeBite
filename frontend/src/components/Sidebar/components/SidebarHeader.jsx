import { Link } from 'react-router';
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { CafeIcon } from '../constants/sidebar.constants';

export default function SidebarHeader() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Link className="flex justify-center items-center gap-2 my-2 w-full no-underline text-inherit" to="/">
                    <CafeIcon />
                    <b className="text-lg tracking-[0.1em] group-data-[collapsible=icon]:hidden">CafeBite</b>
                </Link>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
