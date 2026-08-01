import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MenuItemsCardGridHeader({ onCreate, showAdd = true }) {
    return (
        <div className="border-b border-slate-200 px-2 sm:px-3 pt-0 pb-1 flex flex-wrap items-center justify-between gap-y-2">
            <div>
                <h3 className="text-lg font-bold text-slate-900">Menu Items</h3>
                <p className="mt-0.5 text-xs text-slate-500">Create and manage the items in your menu.</p>
            </div>
            {showAdd && (
                <Button
                    onClick={onCreate}
                    variant="gradient"
                    size="xss"
                    className="p-1.5 md:text-sm text-xs ml-auto"
                >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    Add menu item
                </Button>
            )}
        </div>
    );
}
