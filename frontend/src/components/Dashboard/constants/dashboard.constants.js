import { Clock, CreditCard, ShoppingBag, Utensils } from 'lucide-react';

export const DASHBOARD_METRICS = [
    {
        title: 'Orders Today',
        currentValue: '30',
        description: 'Count of orders placed today',
        icon: ShoppingBag,
        trend: { direction: 'up', value: '20% from last week' },
    },
    {
        title: 'Active Orders',
        currentValue: '20',
        description: 'Ongoing orders being prepared or pending',
        icon: Clock,
    },
    {
        title: 'Total Revenue Today',
        currentValue: '3000',
        description: 'Sum of all paid orders from today',
        icon: CreditCard,
        trend: { direction: 'up', value: '2% from last week' },
    },
    {
        title: 'Total Menu Items',
        currentValue: '30',
        description: 'Count of active menu items',
        icon: Utensils,
    },
];
