import { SearchX, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';

const config = {
    noItems: {
        icon: UtensilsCrossed,
        title: 'No menu items yet',
        description: 'Get started by creating your first menu item.',
        showCreate: true,
        showClear: false,
    },
    filtered: {
        icon: SearchX,
        title: 'No matching menu items',
        description: 'Try a different search term or clear the filters.',
        showCreate: false,
        showClear: true,
    },
    emptyCategory: {
        icon: UtensilsCrossed,
        title: 'No items in this category',
        description: 'Add an item to this category to see it here.',
        showCreate: false,
        showClear: false,
    },
};

export default function MenuItemEmptyState({ variant, onCreate, onClear }) {
    const { icon: Icon, title, description, showCreate, showClear } = config[variant] || config.noItems;

    return (
        <div className="flex min-h-[76dvh] md:min-h-[65dvh] flex-col items-center justify-center px-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                <Icon className="h-7 w-7" aria-hidden="true" />
            </div>
            <h4 className="mt-4 text-base font-semibold text-slate-900">{title}</h4>
            <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p>
            <div className="mt-4 flex items-center gap-2">
                {showCreate && (
                    <Button size="sm" variant="gradient" onClick={onCreate}>
                        Create menu item
                    </Button>
                )}
                {showClear && (
                    <Button variant="link" className="h-auto p-0 text-sm" onClick={onClear}>
                        Clear filters
                    </Button>
                )}
            </div>
        </div>
    );
}
