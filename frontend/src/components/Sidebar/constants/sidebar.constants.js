import CafeIcon from '@/assets/SVG/coffee-cup-coffee.svg?react';
import SvgviewerOutput from '@/assets/SVG/svgviewer-output.svg?react';
import Menu from '@/assets/SVG/menu.svg?react';
import User from '@/assets/SVG/users.svg?react';
import Support from '@/assets/SVG/supprot.svg?react';

export const SIDEBAR_NAV_ITEMS = [
    {
        title: 'Menu',
        icon: Menu,
        link: '/menu-management',
    },
    {
        title: 'Qr Code',
        icon: SvgviewerOutput,
        link: '/qr-management',
    },
    {
        title: 'Profile',
        icon: User,
        link: '/profile-management',
    },
    {
        title: 'Tickets',
        icon: Support,
        link: '/ticket-management',
    },
];

export { CafeIcon };
