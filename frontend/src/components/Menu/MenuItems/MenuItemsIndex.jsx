import { useCallback, useMemo, useState } from 'react';
import { useCategoryOptions, useMenuItemList } from './hooks/useMenuItemsData';
import { useMenuItemsFilter } from './hooks/useMenuItemsFilter';
import MenuItemForm from './components/MenuItemsForm';
import MenuItemsCardGrid from './components/MenuItemsCardGrid';

export default function MenuItemsIndex() {
    const [formModal, setFormModal] = useState({ open: false, mode: null, data: null, isDirect: false });

    const { data, isLoading } = useMenuItemList();
    const { data: categoryData } = useCategoryOptions();
    const filter = useMenuItemsFilter();

    const items = data?.menuItems || [];

    const openCreate = useCallback(() => setFormModal({ open: true, mode: 'create', data: null, isDirect: false }), []);
    const openEdit = useCallback((row) => setFormModal({ open: true, mode: 'edit', data: row, isDirect: false }), []);
    const closeForm = useCallback(() => setFormModal({ open: false, mode: null, data: null, isDirect: false }), []);

    const openCreateInCategory = useCallback((categoryId) => setFormModal({ open: true, mode: 'create', isDirect: true, data: { name: '', description: '', price: '', cover_image: '', category_id: categoryId, status: 1, availability: 'in_stock' } }), []);

    const categoryOptions = useMemo(() => (categoryData?.categories || []).map((c) => ({ value: c?.name, label: c?.name })), [categoryData]);

    return (
        <div className="w-full">
            <MenuItemForm
                open={formModal.open}
                isEdit={formModal.mode === 'edit'}
                selectedRow={formModal.data}
                isDirect={formModal.isDirect}
                onHide={closeForm}
            />

            <MenuItemsCardGrid
                items={items}
                isLoading={isLoading}
                categoryOptions={categoryOptions}
                filter={filter}
                onCreate={openCreate}
                onCreateInCategory={openCreateInCategory}
                onEdit={openEdit}
            />
        </div>
    );
}
