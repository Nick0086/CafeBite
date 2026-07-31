import { useCallback, useState } from 'react';
import { RowDetailsModal } from '@/common/Modal/RowDetailsModal';
import CategoriesCardGrid from './components/CategoriesCardGrid';
import CategoriesForm from './components/CategoriesForm';
import { useCategoryList } from './hooks/useCategoriesData';

export default function CategoriesIndex() {
    const [selectedRow, setSelectedRow] = useState(null);
    const [formModal, setFormModal] = useState({ open: false, mode: null, data: null });

    const { data, isLoading } = useCategoryList();

    const openCreate = useCallback(() => setFormModal({ open: true, mode: 'create', data: null }), []);
    const openEdit = useCallback((row) => setFormModal({ open: true, mode: 'edit', data: row }), []);
    const closeForm = useCallback(() => setFormModal({ open: false, mode: null, data: null }), []);

    return (
        <>
            <RowDetailsModal
                isOpen={selectedRow !== null}
                onClose={() => setSelectedRow(null)}
                data={selectedRow || {}}
                title="Category Details"
            />

            <CategoriesForm
                open={formModal.open}
                selectedRow={formModal.data}
                isEdit={formModal.mode === 'edit'}
                onHide={closeForm}
            />

            <div className="w-full">
                <CategoriesCardGrid
                    data={data}
                    isLoading={isLoading}
                    onView={setSelectedRow}
                    onEdit={openEdit}
                    onCreate={openCreate}
                />
            </div>
        </>
    );
}
