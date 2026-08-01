import { FolderOpen, Inbox, SearchX, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const config = {
    allEmpty: {
        icon: Inbox,
        title: 'No categories yet',
        description: 'Get started by creating your first menu category.',
        showCreate: true,
        showClear: false,
    },
    activeEmpty: {
        icon: Sparkles,
        title: 'No active categories',
        description: 'All your categories are currently inactive. Switch to the Inactive tab to see them.',
        showCreate: false,
        showClear: false,
    },
    inactiveEmpty: {
        icon: FolderOpen,
        title: 'No inactive categories',
        description: 'Every category is active. Inactive categories will appear here.',
        showCreate: false,
        showClear: false,
    },
    searchEmpty: {
        icon: SearchX,
        title: 'No matching categories',
        description: 'Try a different search term or clear the filters.',
        showCreate: false,
        showClear: true,
    },
};

export default function CategoryEmptyState({
    hasCategories,
    hasSearch,
    tab,
    onCreate,
    onClear,
}) {
    const key = !hasCategories
        ? 'allEmpty'
        : hasSearch
          ? 'searchEmpty'
          : tab === 'active'
            ? 'activeEmpty'
            : 'inactiveEmpty';

    const { icon: Icon, title, description, showCreate, showClear } = config[key];

    return (
        <div className="flex min-h-[40dvh] flex-col items-center justify-center px-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                <Icon className="h-7 w-7" aria-hidden="true" />
            </div>
            <h4 className="mt-4 text-base font-semibold text-slate-900">{title}</h4>
            <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p>
            <div className="mt-4 flex items-center gap-2">
                {showCreate && (
                    <Button size="sm" variant="gradient" onClick={onCreate}>
                        Create category
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
