import { memo, useCallback, useMemo, useState } from 'react';
import { LayoutGrid, List, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import MenuCard from './MenuCard';
import MenuItemsTable from './components/MenuItemsTable';
import MenuItemForm from './components/MenuItemsForm';
import { useCategoryOptions, useMenuItemList } from './hooks/useMenuItemsData';

const ViewToggleButton = memo(function ViewToggleButton({ active, onClick, children, label }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            aria-pressed={active}
            className={cn('p-1.5 rounded', active ? 'bg-background shadow' : 'text-muted-foreground')}
        >
            {children}
        </button>
    );
});

const Header = memo(function Header({ onAddClick, activeView, onViewChange }) {
    return (
        <div className="px-2 pb-2 flex flex-wrap justify-between items-center border-b">
            <h2 className="text-2xl font-medium">Menu Items</h2>
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    onClick={onAddClick}
                    size="sm"
                    className="text-indigo-500 gap-2 border bg-white hover:text-white border-indigo-500 hover:bg-indigo-500"
                >
                    <div className="flex items-center gap-1">
                        <Plus size={18} />
                        <span className="text-sm whitespace-nowrap">Add Menu Item</span>
                    </div>
                </Button>
                <Separator orientation="vertical" className="h-8 bg-gray-300" />
                <div className="bg-muted rounded-md p-1 flex items-center gap-1">
                    <ViewToggleButton
                        active={activeView === 'table-view'}
                        onClick={() => onViewChange('table-view')}
                        label="Table view"
                    >
                        <List size={20} />
                    </ViewToggleButton>
                    <ViewToggleButton
                        active={activeView === 'card-view'}
                        onClick={() => onViewChange('card-view')}
                        label="Card view"
                    >
                        <LayoutGrid size={20} />
                    </ViewToggleButton>
                </div>
            </div>
        </div>
    );
});

const MemoizedMenuTable = memo(MenuItemsTable);
const MemoizedMenuCard = memo(MenuCard);

export default function MenuItemsIndex() {
    const [formModal, setFormModal] = useState({ open: false, mode: null, data: null, isDirect: false });
    const [activeView, setActiveView] = useState('table-view');

    const { data, isLoading } = useMenuItemList();
    const { data: categoryData, isLoading: categoryIsLoading } = useCategoryOptions();

    const handleAddMenuItem = useCallback(() => {
        setFormModal({ open: true, mode: 'create', data: null, isDirect: false });
    }, []);

    const closeForm = useCallback(() => {
        setFormModal({ open: false, mode: null, data: null, isDirect: false });
    }, []);

    const handleEdit = useCallback((row) => {
        setFormModal({ open: true, mode: 'edit', data: row, isDirect: false });
    }, []);

    const handleViewChange = useCallback((view) => {
        setActiveView(view);
    }, []);

    const categoryOptions = useMemo(
        () =>
            (categoryData?.categories || []).map((c) => ({
                value: c?.name,
                label: c?.name,
            })),
        [categoryData]
    );

    return (
        <div className="w-full">
            <MenuItemForm
                open={formModal.open}
                isEdit={formModal.mode === 'edit'}
                selectedRow={formModal.data}
                isDirect={formModal.isDirect}
                onHide={closeForm}
            />

            <Tabs value={activeView} onValueChange={handleViewChange}>
                <Header onAddClick={handleAddMenuItem} activeView={activeView} onViewChange={handleViewChange} />

                {activeView === 'table-view' && (
                    <TabsContent value="table-view" className="mt-0" forceMount>
                        <MemoizedMenuTable
                            data={data}
                            isLoading={isLoading}
                            categoryOptions={categoryOptions}
                            categoryIsLoading={categoryIsLoading}
                            onEdit={handleEdit}
                        />
                    </TabsContent>
                )}

                {activeView === 'card-view' && (
                    <TabsContent value="card-view" forceMount>
                        <MemoizedMenuCard
                            data={data}
                            isLoading={isLoading}
                            categoryOptions={categoryOptions}
                            setIsModalOpen={setFormModal}
                        />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
