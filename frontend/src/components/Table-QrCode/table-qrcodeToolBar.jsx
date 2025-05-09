import React from 'react'
import { Button } from '../ui/button'
import { Plus, Printer, X } from 'lucide-react'
import { CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { FacetedFilter } from '../ui/FacetedFilter'
import { useTranslation } from 'react-i18next'

export default function QrCodeToolbar({
    onGenerate,
    searchQuery,
    setSearchQuery,
    selectedTemplate,
    setSelectedTemplate,
    templateOptions,
    resetFilters,
    handleSelectAll,
    filteredItems,
    clearSelections,
    selectedQrCodes,
    handlePrintSelected,
    handlePrintAll
}) {

    const { t } = useTranslation();

    return (
        <div className='space-y-4' >
            <div className='flex justify-between items-center' >
                <div>
                    <CardTitle className='text-primary text-2xl font-bold' >{t('qr_code_management')}</CardTitle>
                    <p className='text-secondary text-sm' >{t('manage_qr_codes')}</p>
                </div>

                <Button onClick={onGenerate} size='sm' className='text-indigo-500 gap-2 border bg-white hover:text-white border-indigo-500 hover:bg-indigo-500'>
                    <div className='flex items-center gap-1 '>
                        <Plus size={18} />
                        <span className='text-sm'>{t('generate_qr_code')}</span>
                    </div>
                </Button>
            </div>

            <div className="flex gap-2 justify-start pb-2">
                <Input
                    placeholder={t('filter_by_table')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 w-[150px] lg:w-[320px]"
                />

                <FacetedFilter title={t('template')} options={templateOptions} onFilterChange={setSelectedTemplate} value={selectedTemplate} />

                {(searchQuery || selectedTemplate?.length) ? (
                    <Button variant="ghost" onClick={resetFilters} className="text-red-500 h-8 px-1 lg:px-2 hover:bg-red-100 hover:text-red-700">
                        {t('reset')}
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                ) : null}
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="flex items-center gap-1"
                    disabled={!filteredItems?.length}
                >
                    <span>{t('select_all')}</span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelections}
                    className="flex items-center gap-1"
                    disabled={selectedQrCodes.length === 0}
                >
                    <span>{t('clear_selection')}</span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrintAll}
                    className="flex items-center gap-1"
                    disabled={!filteredItems?.length}
                >
                    <Printer size={14} />
                    {t('print_all')}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrintSelected}
                    className="flex items-center gap-1"
                    disabled={selectedQrCodes.length === 0}
                >
                    <Printer size={14} />
                    {t('print_selected')} ({selectedQrCodes.length})
                </Button>
            </div>
        </div>

    )
}
