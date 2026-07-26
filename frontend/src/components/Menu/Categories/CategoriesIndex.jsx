import { useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RowDetailsModal } from '@/common/Modal/RowDetailsModal';
import CategoriesTable from './components/CategoriesTable';
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
                <div className="px-2 my-2 flex flex-row flex-wrap justify-between items-center gap-2">
                    <h2 className="text-2xl font-medium">Menu Categories</h2>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={openCreate}
                            size="sm"
                            className="text-indigo-500 gap-2 border bg-white hover:text-white border-indigo-500 hover:bg-indigo-500"
                        >
                            <div className="flex items-center gap-1">
                                <Plus size={18} />
                                <span className="text-sm">Add Category</span>
                            </div>
                        </Button>
                    </div>
                </div>

                <CategoriesTable
                    data={data}
                    isLoading={isLoading}
                    onView={setSelectedRow}
                    onEdit={openEdit}
                />
            </div>
        </>
    );
}
