import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query';
import { templateQueryKeyLoopUp } from './utils';
import { Card } from '@/components/ui/card';
import { toastError } from '@/utils/toast-utils';
import { Button } from '@/components/ui/button';
import { Info, Pencil, Plus } from 'lucide-react';
import { getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import RowDetailsModal from '@/common/Modal/RowDetailsModal';
import CommonTable from '@/common/Table/CommonTable';
import CommonTableToolbar from './components/CommonTableToolbar';
import { useNavigate } from 'react-router';
import { getAllTemplates } from '@/service/templates.service';
import { useTranslation } from 'react-i18next';
import GoogleStyleLoader from '@/components/ui/loaders/GoogleStyleLoader';

export default function TemplateIndex() {

  const {t} = useTranslation();
  const navigate = useNavigate();
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [selectedRow, setSelectedRow] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: [templateQueryKeyLoopUp['TEMPLATE_LIST']],
    queryFn: getAllTemplates,
  });

  useEffect(() => {
    if (error) {
      toastError(`${t('error_fetching_templates_list')}: ${JSON.stringify(error)}`);
    }
  }, [error]);

  const handleClose = () => {
    setSelectedRow(null);
  };

  const handleRowClick = useCallback((rowData) => {
    setSelectedRow(rowData);
  }, []);

  const handleEdit = useCallback((data) => {
    navigate(`../tamplate-editor/${data?.unique_id}`)
  }, []);

  const columns = useMemo(() => [
    {
      header: t('sr_no'),
      accessorKey: "id",
      colClassName: "w-1/12"
    },
    {
      header: `${t('templates')} ${t('name')}`,
      accessorKey: "name",
      colClassName: "w-4/12",
    },
    {
      id: "actions",
      header: t('actions'),
      HeaderClassName: "text-center",
      colClassName: "w-2/12 text-center",
      cell: ({ _, row }) => (
        <div>
          <Button size='xs' type='button' variant="ghost" className="rounded-full text-indigo-500 hover:bg-indigo-100 hover:text-indigo-600" onClick={() => handleRowClick(row?.original)}>
            <Info size={16} />
          </Button>
          <Button size='xs' type='button' variant="ghost" className="rounded-full text-green-500 hover:bg-green-100 hover:text-green-600" onClick={() => handleEdit(row?.original)}>
            <Pencil size={16} />
          </Button>
        </div>
      ),
    },
  ], [handleRowClick, handleEdit, t]);

  const tableData = useMemo(() => {
    return data?.templates || [];
  }, [data]);

  const tableInstance = useReactTable({
    columns,
    data: tableData,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 100,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  });

  if (isLoading) {
    return (
      <Card className='h-screen w-full transition ease-in-out duration-300'>
        <GoogleStyleLoader className={'h-[70%]'} />
      </Card>
    )
  }

  return (
    <>
      <RowDetailsModal
        isOpen={selectedRow !== null}
        onClose={handleClose}
        data={selectedRow || {}}
        title={`${t('templates')} ${t('details')}`}
      />

      <div className="w-full" >
        <div className=" px-2 my-2 flex justify-between items-center">
          <h2 className='text-2xl font-medium' >{t('templates')}</h2>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('../tamplate-editor/new')} size='sm' className='text-indigo-500 gap-2 border bg-white hover:text-white border-indigo-500 hover:bg-indigo-500'>
              <div className='flex items-center gap-1 '>
                <Plus size={18} />
                <span className='text-sm'>{t('add')} {t('templates')}</span>
              </div>
            </Button>
          </div>
        </div>
        <div className='border-y border-gray-200 p-2'>
          <CommonTableToolbar
            table={tableInstance}
            searchColumnId="name"
            searchPlaceholder={`${t('filter_by')} ${t('templates')}...`}
          />
        </div>
        <div className='border-y border-gray-200'>
          <CommonTable
            table={tableInstance}
            tableStyle='2xl:h-[69dvh] h-[60dvh]'
            tableHeadRowStyle='bg-indigo-50/20 hover:bg-indigo-50/50'
            tableBodyRowStyle='bg-transparent hover:bg-indigo-50/50'
          />
        </div>
      </div>
    </>
  )
}
