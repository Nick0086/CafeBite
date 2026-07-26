import { useState, useRef, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import QrCodeToolbar from './components/QrCodeToolbar';
import QrCodeForm from './components/QrCodeForm';
import { toastError } from '@/utils/toast-utils';
import QrCodeGrid from './components/QrCodeGrid';
import { useQrCodeSelection } from './hooks/useQrCodeSelection';
import { usePrintQrCodes } from './hooks/usePrintQrCodes';
import { useQrCodes, useTemplates } from './hooks/useQrCodeData';
import GoogleStyleLoader from '@/components/ui/loaders/GoogleStyleLoader';

export default function QrCodeIndex() {
    const [modalState, setModalState] = useState({ open: false, mode: null, data: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState([]);
    const printFrameRef = useRef(null);

    const { selectedQrCodes, toggleQrCodeSelection, clearSelections, selectAll } = useQrCodeSelection();
    const { printQRCode, printSelectedQrCodes: printSelected, printAllQrCodes: printAll } =
        usePrintQrCodes(printFrameRef, selectedQrCodes, clearSelections);

    const { data, isLoading, error } = useQrCodes();
    const { data: templates, isLoading: isLoadingTemplates, error: templateError } = useTemplates();

    const filteredItems = data?.qrCodes?.filter((item) => {
        const matchesSearch = item?.table_number?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTemplate =
            selectedTemplate?.length === 0 || selectedTemplate?.includes(item.template_id);
        return matchesSearch && matchesTemplate;
    });

    useEffect(() => {
        if (error) {
            toastError(`Error fetching QR Codes: ${error?.err?.message}`);
        }
        if (templateError) {
            toastError(`Error fetching templates: ${templateError?.err?.message}`);
        }
    }, [error, templateError]);

    const templateOptions = useMemo(() => {
        return (
            templates?.templates?.map((template) => ({
                value: template?.unique_id,
                label: template?.name,
            })) || []
        );
    }, [templates]);

    const handlePrintSelected = () => {
        printSelected(filteredItems);
    };

    const handlePrintAll = () => {
        printAll(filteredItems);
    };

    const handleModalToggle = (state = {}) => {
        setModalState((prev) => ({ ...prev, ...state }));
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedTemplate([]);
    };

    const handleSelectAll = () => {
        if (filteredItems?.length > 0) {
            selectAll(filteredItems);
        }
    };

    if (isLoading || isLoadingTemplates) {
        return (
            <Card className="h-screen w-full transition ease-in-out duration-300">
                <GoogleStyleLoader className="h-[70%]" />
            </Card>
        );
    }

    return (
        <>
            <QrCodeForm
                open={modalState.open}
                onClose={() => handleModalToggle({ open: false, mode: null, data: null })}
                mode={modalState.mode}
                data={modalState.data}
                isLoadingTemplates={isLoadingTemplates}
                templateOptions={templateOptions}
            />

            <iframe
                ref={printFrameRef}
                style={{ position: 'absolute', height: '0', width: '0', border: '0' }}
                title="Print Frame"
            />

            <Card className="rounded-lg border">
                <CardHeader className="p-0 pb-2 border-b px-4 pt-3">
                    <div className="mb-2">
                        <QrCodeToolbar
                            onGenerate={() => handleModalToggle({ open: true, mode: 'create', data: null })}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            selectedTemplate={selectedTemplate}
                            setSelectedTemplate={setSelectedTemplate}
                            resetFilters={resetFilters}
                            templateOptions={templateOptions}
                            filteredItems={filteredItems}
                            handleSelectAll={handleSelectAll}
                            clearSelections={clearSelections}
                            selectedQrCodes={selectedQrCodes}
                            handlePrintAll={handlePrintAll}
                            handlePrintSelected={handlePrintSelected}
                        />
                    </div>
                </CardHeader>
                <CardContent className="mt-4 px-2">
                    {error ? (
                        <p className="mt-2 flex items-center justify-center h-[50dvh] text-2xl font-bold text-primary">
                            Failed to load QR Codes.
                        </p>
                    ) : data?.qrCodes?.length && filteredItems?.length ? (
                        <QrCodeGrid
                            qrCodes={filteredItems}
                            selectedQrCodes={selectedQrCodes}
                            toggleQrCodeSelection={toggleQrCodeSelection}
                            handleModalToggle={handleModalToggle}
                            printQRCode={printQRCode}
                        />
                    ) : (
                        <p className="mt-2 flex items-center justify-center h-52 text-2xl font-bold text-primary">
                            No QR Codes available.
                        </p>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
