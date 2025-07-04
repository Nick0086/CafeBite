import React, { useCallback, useContext, useMemo, useState } from 'react'
import { getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Chip } from '@/components/ui/chip';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, Pencil } from 'lucide-react';
import RowDetailsModal from '@/common/Modal/RowDetailsModal';
import { DataTablePagination } from '@/components/ui/table-pagination';

import CommonTableToolbar from './components/CommonTableToolbar';
import CommonTable from '@/common/Table/CommonTable';
import { useTranslation } from 'react-i18next';
import GoogleStyleLoader from '@/components/ui/loaders/GoogleStyleLoader';
import { PermissionsContext } from '@/contexts/PermissionsContext';

const columnsMapping = (t) => {
  return {
    id: t('sr_no'),
    name: t('item_name'),
    price: t('price'),
    veg_status: t("food_type"),
    category_name: t("category"),
    availability: t("availability"),
    status: t("status"),
    actions: t("actions"),
  }
};

export default function MenuTable({
  setIsModalOpen,
  data,
  isLoading,
  categoryOptions,
  categoryIsLoading
}) {

  const {permissions} = useContext(PermissionsContext);
  const { t } = useTranslation();
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([{ id: "status", value: [1] }])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [selectedRow, setSelectedRow] = useState(null);

  const handleRowClick = useCallback((rowData) => {
    setSelectedRow(rowData);
  }, []);

  const handleClose = () => {
    setSelectedRow(null);
  };

  const handleEdit = useCallback((data) => {
    setIsModalOpen((prv) => ({ ...prv, isOpen: true, isEdit: true, data: data, isDireact: false }));
  }, []);

  const columns = useMemo(() => [
    {
      header: t('sr_no'),
      accessorKey: "id",
      colClassName: "w-1/12",
      cell: ({ row }) => row.index + 1,
    },
    {
      header: t('item_name'),
      accessorKey: "name",
      colClassName: "w-3/12",
    },
    {
      header: t('price'),
      accessorKey: "price",
      colClassName: "w-1/12",
      cell : ({cell}) => (
        <div className='flex items-center gap-0.5'>
          <span>{permissions?.currency_symbol}</span>
          <span>{cell?.getValue()}</span>
        </div>
      ),
      filterFn: (row, id, filterValue) => {
        // If no filter value, return all rows
        if (!filterValue) return true;

        try {
          // Parse the stringified filter value
          const { value, operator } = JSON.parse(filterValue);
          const rowValue = parseFloat(row.getValue(id));

          // Apply the appropriate comparison
          switch (operator) {
            case "lessThan":
              return rowValue < value;
            case "greaterThan":
              return rowValue > value;
            case "equals":
            default:
              return rowValue === value;
          }
        } catch (e) {
          // If there's an error parsing the filter, return true
          return true;
        }
      }
    },
    {
      header: t("category"),
      accessorKey: "category_name",
      colClassName: "w-2/12",
      filterFn: (row, id, value) => {
        return value?.includes(row?.getValue(id));
      },
    },
    {
      header: t("food_type"),
      accessorKey: "veg_status",
      HeaderClassName: "text-center",
      colClassName: "w-1/12 text-center",
      cell: ({ cell }) => (
        cell?.getValue() === 'veg' ? (
          <Chip className='gap-1' variant='light' color='green' radius='md' size='sm' border='none'><span>Veg</span></Chip>
        ) : (
          <Chip className='gap-1' variant='light' color='red' radius='md' size='sm' border='none'><span>Non Veg</span></Chip>
        )
      ),
      filterFn: (row, id, value) => {
        return value?.includes(row?.getValue(id));
      },
    },
    {
      header: t("availability"),
      accessorKey: "availability",
      HeaderClassName: "text-center",
      colClassName: "w-1/12 text-center",
      cell: ({ cell }) => (
        cell?.getValue() === 'in_stock' ? (
          <Chip className='gap-1' variant='light' color='green' radius='md' size='sm' border='none'><span>Availabe</span></Chip>
        ) : (
          <Chip className='gap-1' variant='light' color='red' radius='md' size='sm' border='none'><span>Out Of Stock</span></Chip>
        )
      ),
      filterFn: (row, id, value) => {
        return value?.includes(row?.getValue(id));
      },
    },
    {
      header: t("status"),
      accessorKey: "status",
      HeaderClassName: "text-center",
      colClassName: "w-1/12 text-center",
      cell: ({ cell }) => (
        cell?.getValue() === 1 ? (
          <Chip className='gap-1' variant='light' color='green' radius='md' size='sm' border='none'><span>Active</span></Chip>
        ) : (
          <Chip className='gap-1' variant='light' color='red' radius='md' size='sm' border='none'><span>Inactive</span></Chip>
        )
      ),
      filterFn: (row, id, value) => {
        return value?.includes(row?.getValue(id));
      },
    },
    {
      id: "actions",
      header: t("actions"),
      HeaderClassName: "text-center",
      colClassName: "w-1/12 text-center",
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

  // Always provide a fallback empty array if data?.menuItems is undefined or null
  const tableData = useMemo(() => {
    return data?.menuItems || [];
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
        pageSize: 50,
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
        title="Menu Item Details"
      />
      <div className='border-y border-gray-200 p-2'>
        <CommonTableToolbar
          table={tableInstance}
          columnsMapping={columnsMapping(t)}
          categoryOptions={categoryOptions}
          categoryIsLoading={categoryIsLoading}
          searchColumnId="name"
          searchPlaceholder={`${t("filter_by")} ${t("menu")}...`}
        />
      </div>
      <div className=''>
        <CommonTable
          table={tableInstance}
          tableStyle='2xl:h-[69dvh] h-[60dvh]'
          tableHeadRowStyle='bg-indigo-50/20 hover:bg-indigo-50/50'
          tableBodyRowStyle='bg-transparent hover:bg-indigo-50/50'
        />
      </div>
      <div className="mt-2 pt-2 border-t">
        <DataTablePagination table={tableInstance} count={data?.menuItems?.length || 0} />
      </div>
    </>

  )
}
