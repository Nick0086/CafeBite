import { Info, Pencil, Utensils } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';

export default function CategoryCard({ category, onView, onEdit }) {
    const isActive = category.status === 1;
    const count = category.menu_item_count ?? 0;

    return (
        <Card className="group overflow-hidden border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex h-full min-h-[112px]">
                <div
                    className={`w-1 shrink-0 ${
                        isActive ? 'bg-emerald-500' : 'bg-rose-400'
                    }`}
                />
                <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-3">
                        <h3
                            className="truncate text-base font-bold text-slate-900"
                            title={category.name}
                        >
                            {category.name}
                        </h3>
                        <Chip
                            className="gap-1 shrink-0 font-semibold"
                            variant="light"
                            color={isActive ? 'green' : 'red'}
                            radius="md"
                            size="sm"
                            border="none"
                        >
                            {isActive ? 'Active' : 'Inactive'}
                        </Chip>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                            <Utensils className="h-3 w-3" />
                            {count} items
                        </span>
                        <div className="flex gap-1">
                            <Button
                                size="xs"
                                type="button"
                                variant="ghost"
                                className="h-7 w-7 rounded-full p-0 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                onClick={() => onEdit(category)}
                                title="Edit category"
                                aria-label={`Edit ${category.name}`}
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                size="xs"
                                type="button"
                                variant="ghost"
                                className="h-7 w-7 rounded-full p-0 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                                onClick={() => onView(category)}
                                title="View category details"
                                aria-label={`View details for ${category.name}`}
                            >
                                <Info className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
