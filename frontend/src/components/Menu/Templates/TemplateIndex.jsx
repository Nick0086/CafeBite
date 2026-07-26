import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RowDetailsModal } from '@/common/Modal/RowDetailsModal';
import TemplatesTable from './components/TemplatesTable';
import { useState } from 'react';
import { useTemplateList } from './hooks/useTemplatesData';

export default function TemplateIndex() {
    const navigate = useNavigate();
    const [selectedRow, setSelectedRow] = useState(null);
    const { data, isLoading } = useTemplateList();

    return (
        <>
            <RowDetailsModal
                isOpen={selectedRow !== null}
                onClose={() => setSelectedRow(null)}
                data={selectedRow || {}}
                title="Templates Details"
            />

            <div className="w-full">
                <div className="px-2 my-2 flex justify-between items-center">
                    <h2 className="text-2xl font-medium">Templates</h2>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => navigate('../template-editor/new')}
                            size="sm"
                            className="text-indigo-500 gap-2 border bg-white hover:text-white border-indigo-500 hover:bg-indigo-500"
                        >
                            <div className="flex items-center gap-1">
                                <Plus size={18} />
                                <span className="text-sm">Add Templates</span>
                            </div>
                        </Button>
                    </div>
                </div>

                <TemplatesTable
                    data={data}
                    isLoading={isLoading}
                    onView={setSelectedRow}
                    onEdit={(row) => navigate(`../template-editor/${row?.unique_id}`)}
                />
            </div>
        </>
    );
}
