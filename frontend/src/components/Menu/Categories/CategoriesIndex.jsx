import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { toastError } from '@/utils/toast-utils';
import { Info, Pencil, Plus } from 'lucide-react';
import { getCatgeoryColumnsMapping, queryKeyLoopUp } from './utils';
import { useQuery } from '@tanstack/react-query';
import { getAllCategory } from '@/service/categories.service';

import CommonTable from '@/common/Table/CommonTable';
import SquareLoader from '@/components/ui/CustomLoaders/SquarLoader';
import CommonTableToolbar from './components/CommonTableToolbar';
import CategoriesForm from './CategoriesForm';
import RowDetailsModal from '@/common/Modal/RowDetailsModal';

import { Card } from '@/components/ui/card';
import { getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export default function CategoriesIndex() {

  const { t } = useTranslation()
  const colMapping = getCatgeoryColumnsMapping(t);
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([{ id: "status", value: [1] }])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState({ data: null, isEdit: false, isOpen: false });

  const { data, isLoading, error } = useQuery({
    queryKey: [queryKeyLoopUp['Category']],
    queryFn: getAllCategory,
  });

  useEffect(() => {
    if (error) {
      toastError(`${t('error_fetching_category')} ${JSON.stringify(error)}`);
    }
  }, [error]);

  const handleRowClick = (rowData) => {
    setSelectedRow(rowData);
  };

  const handleClose = () => {
    setSelectedRow(null);
  };

  const handleOpenModal = ({ data, isOpen, isEdit }) => {
    setSelectedCategory((prv) => ({ ...prv, data, isOpen, isEdit }))
  };

  const handleEdit = useCallback((data) => {
    handleOpenModal({ data, isOpen: true, isEdit: true });
  }, []);

  const columns = useMemo(() => [
    {
      header: t('unique_no'),
      accessorKey: "id",
      colClassName: "w-2/12 text-start",
    },
    {
      header:  t('category'),
      accessorKey: "name",
      colClassName: "w-4/12 text-start",
    },
    {
      header:  t('count'),
      accessorKey: "menu_item_count",
      HeaderClassName: "text-center",
      colClassName: "w-2/12",
    },
    {
      header: t('status'),
      accessorKey: "status",
      HeaderClassName: "text-center",
      colClassName: "w-2/12",
      cell: ({ cell }) => (
        cell?.getValue() === 1 ? (
          <Chip className='gap-1' variant='light' color='green' radius='md' size='sm' border='none'><span>{t('active')}</span></Chip>
        ) : (
          <Chip className='gap-1' variant='light' color='red' radius='md' size='sm' border='none'><span>{t('inactive')}</span></Chip>
        )
      ),
      filterFn: (row, id, value) => {
        return value?.includes(row?.getValue(id));
      },
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
  ], [handleEdit,t]);

  const tableInstance = useReactTable({
    columns,
    data: data?.categories || [],
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
        <SquareLoader bodyClassName={'h-[70%]'} />
      </Card>
    )
  }

  return (
    <>
      <RowDetailsModal
        isOpen={selectedRow !== null}
        onClose={handleClose}
        data={selectedRow || {}}
        title={t('category_details')}
      />

      <CategoriesForm
        open={selectedCategory?.isOpen}
        selectedRow={selectedCategory?.data}
        isEdit={selectedCategory?.isEdit}
        onHide={() => handleOpenModal({ data: null, isOpen: false, isEdit: false })}
      />

      <div className="w-full" >
        <div className=" px-2 my-2 flex md:flex-row flex-col justify-between md:items-center gap-2">
          <h2 className='text-2xl font-medium' >{t('menu_categories')}</h2>
          <div className="flex items-center gap-2">
            <Button onClick={() => handleOpenModal({ isOpen: true, isEdit: false, data: null })} size='sm' className='text-indigo-500 gap-2 border bg-white hover:text-white border-indigo-500 hover:bg-indigo-500'>
              <div className='flex items-center gap-1 '>
                <Plus size={18} />
                <span className='text-sm'>{t('add_category')}</span>
              </div>
            </Button>
          </div>
        </div>
        <div className='border-y border-gray-200 p-2'>
          <CommonTableToolbar
            table={tableInstance}
            columnsMapping={colMapping}
            searchColumnId="name"
            searchPlaceholder={t('filter_by_category')}
          />
        </div>
        <div className='border-y border-gray-200 '>
          <CommonTable
            table={tableInstance}
            tableStyle='2xl:h-[69dvh] h-[60dvh]'
            tableHeadRowStyle='bg-indigo-50/20 hover:bg-indigo-50/50'
            tableBodyRowStyle='text-center bg-transparent hover:bg-indigo-50/50'
          />
        </div>
      </div>
    </>

  )
}
