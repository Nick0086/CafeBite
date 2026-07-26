import { Fragment } from 'react';
import { Link } from 'react-router';
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SIDEBAR_NAV_ITEMS } from '../constants/sidebar.constants';

export default function SidebarNav({ isActive }) {
    return (
        <SidebarGroup>
            <SidebarMenu>
                {SIDEBAR_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Fragment key={item.title}>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive(item.link)}
                                    tooltip={item.title}
                                >
                                    <Link className="no-underline text-inherit" to={item.link}>
                                        {Icon && <Icon className="size-6" />}
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
