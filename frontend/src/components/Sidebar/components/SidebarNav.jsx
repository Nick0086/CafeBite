import { Fragment } from 'react';
import { Link } from 'react-router';
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SIDEBAR_NAV_ITEMS } from '../constants/sidebar.constants';

export default function SidebarNav({ isActive }) {
    return (
        <SidebarGroup className="px-2 py-3 pt-0">
            <SidebarMenu className="gap-0.5">
                {SIDEBAR_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Fragment key={item.title}>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive(item.link)}
                                    tooltip={item.title}
                                    className="relative h-9 text-slate-600 hover:bg-slate-100 hover:text-slate-900 data-[active=true]:bg-indigo-50 data-[active=true]:font-semibold data-[active=true]:text-indigo-700 data-[active=true]:before:absolute data-[active=true]:before:bottom-2 data-[active=true]:before:left-0 data-[active=true]:before:top-2 data-[active=true]:before:w-0.5 data-[active=true]:before:rounded-full data-[active=true]:before:bg-indigo-600"
                                >
                                    <Link className="no-underline text-inherit" to={item.link}>
                                        {Icon && <Icon className="size-5" />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </Fragment>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
