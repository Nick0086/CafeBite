import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GoogleStyleLoader from '@/components/ui/loaders/GoogleStyleLoader';
import CategoryCard from './CategoryCard';
import CategoryEmptyState from './CategoryEmptyState';

const TABS = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
];

export default function CategoriesCardGrid({ data, isLoading, onView, onEdit, onCreate }) {
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState('active');

    const { counts, visible, filtered } = useMemo(() => {
        const categories = data?.categories || [];
        const q = search.trim().toLowerCase();
        const matchesSearch = (cat) => !q || cat.name?.toLowerCase().includes(q);

        const visible = categories.filter(matchesSearch);
        const active = visible.filter((cat) => cat.status === 1);
        const inactive = visible.filter((cat) => cat.status !== 1);

        return {
            counts: { all: visible.length, active: active.length, inactive: inactive.length },
            visible,
            filtered: tab === 'all' ? visible : tab === 'active' ? active : inactive,
        };
    }, [data, search, tab]);

    if (isLoading) {
        return (
            <Card className="flex min-h-[69dvh] w-full items-center justify-center border-none shadow-none">
                <GoogleStyleLoader className="h-40" />
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-none p-0">
            <div className="border-b border-slate-200 px-2 sm:px-3 pt-0 pb-1 flex flex-wrap items-center justify-between gap-y-2">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Menu categories</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Create and organize the sections of your menu.
                    </p>
                </div>
                {visible.length > 0 && (
                    <Button
                        onClick={onCreate}
                        variant="gradient"
                        size="xss"
                        className="p-1.5 md:text-sm text-xs ml-auto"
                    >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        Add category
                    </Button>
                )}
            </div>

            <div className="border-b border-slate-100 px-2 sm:px-3 py-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="relative w-full sm:w-[320px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search categories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-9 w-full"
                        />
                    </div>
                    <Tabs value={tab} onValueChange={setTab}>
                        <TabsList className="bg-slate-100/80">
                            {TABS.map((t) => (
                                <TabsTrigger key={t.value} value={t.value} className="text-xs">
                                    {t.label} ({counts[t.value]})
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="p-3 sm:p-4">
                {filtered.length === 0 ? (
                    <CategoryEmptyState
                        hasCategories={visible.length > 0}
                        hasSearch={!!search.trim()}
                        tab={tab}
                        onCreate={onCreate}
                        onClear={() => {
                            setSearch('');
                            setTab('all');
                        }}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map((category) => (
                            <CategoryCard
                                key={category.unique_id || category.id}
                                category={category}
                                onView={onView}
                                onEdit={onEdit}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}
