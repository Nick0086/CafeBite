import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Edit, Eye, MessageSquare, Paperclip, Plus } from 'lucide-react';

import { feedBackListQueryKeys, feedBackStatus, feedBackType, getCategoryColor, getColor, getStatusLabel } from './utils';
import { getClientFeedback, updateFeedbackStatus, updateFeedbackType } from '@/service/clinetFeedback.service';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GoogleStyleLoader from '@/components/ui/loaders/GoogleStyleLoader';
import { Button } from '@/components/ui/button';
import FeedBackForm from './FeedBackForm';
import CommonTable from '@/common/Table/CommonTable';
import { DataTablePagination } from '@/components/ui/table-pagination';
import FeedBackStatusSelector from './components/FeedBackStatusSelector';
import FeedBackTypeSelector from './components/FeedBackTypeSelector';
import FeedBackDetails from './FeedBackDetails';
import { PermissionsContext } from '@/contexts/PermissionsContext';
import { Chip } from '@/components/ui/chip';

export default function FeedBackIndex() {
    const queryClient = useQueryClient();
    const { isSuperAdmin, permissions } = useContext(PermissionsContext);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [feedBackDetails, setFeedBackDetails] = useState(null);

    const { data: latestFeedback, isLoading: latestFeedbackIsLoading, error: latestFeedbackError } = useQuery({
        queryKey: [feedBackListQueryKeys['FEEDBACK_LIST'], pagination?.pageSize, pagination?.pageIndex],
        queryFn: () => getClientFeedback({ limit: pagination?.pageSize, page: pagination?.pageIndex + 1 }),
    });

    useEffect(() => {
        if (latestFeedbackError) {
            toastError(`Error During Fetching Feedback: ${latestFeedbackError?.err?.message}`);
        }
    }, [latestFeedbackError]);

    const hadnleAddFeedBack = () => {
        setIsOpen(true);
    }

    const handleEdit = (row) => {
        setIsOpen(true);
        setIsEditing(true);
        setSelectedRow(row);
    }

    const handleModelClose = () => {
        setIsOpen(false);
        setIsEditing(false);
        setSelectedRow(null);
    }

    const handleView = (row) => {
        setIsDetailsOpen(true);
        setFeedBackDetails(row);
    }

    const handleDetailsModalClose = () => {
        setIsDetailsOpen(false);
        setFeedBackDetails(null);
    }

    const handleStatusChangeMutation = useMutation({
        mutationFn: (data) => updateFeedbackStatus(data),
        onSuccess: (res, variables) => {
            queryClient.setQueryData(
                [feedBackListQueryKeys['FEEDBACK_LIST'], pagination?.pageSize, pagination?.pageIndex],
                (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        data: oldData.data.map(order => {
                            if (order.unique_id === variables.feedbackId) {
                                return {
                                    ...order,
                                    status: variables.status
                                };
                            }
                            return order;
                        })
                    };
                }
            );
            toastSuccess(res?.message || 'Status updated successfully');
        },
        onError: (error) => {
            toastError(`Error updating status: ${error?.err?.message}`);
        },
    });

    const handleTypeChangeMutation = useMutation({
        mutationFn: (data) => updateFeedbackType(data),
        onSuccess: (res, variables) => {
            queryClient.setQueryData(
                [feedBackListQueryKeys['FEEDBACK_LIST'], pagination?.pageSize, pagination?.pageIndex],
                (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        data: oldData.data.map(order => {
                            if (order.unique_id === variables.feedbackId) {
                                return {
                                    ...order,
                                    type: variables.type
                                };
                            }
                            return order;
                        })
                    };
                }
            );
            toastSuccess(res?.message || 'Status updated successfully');
        },
        onError: (error) => {
            toastError(`Error updating status: ${error?.err?.message}`);
        },
    });

    const columns = useMemo(() => [
        {
            header: 'Ticket',
            accessorKey: "title",
            colClassName: 'text-start',
            HeaderClassName: 'text-start',
            cell: ({ cell, row }) => {
                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-blue-600">T-{cell.row.original.id}</span>
                            {cell.row.original.image_count > 0 && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Paperclip className="h-3 w-3 text-gray-400" />
                                    {cell.row.original.image_count}
                                </div>
                            )}
                            {cell.row.original.comment_count > 0 && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <MessageSquare className="h-3 w-3" />
                                    {cell.row.original.comment_count}
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-900 font-medium max-w-xs truncate">{cell.getValue()}</p>
                        <p className="text-xs text-gray-500">{cell.row.original.createdAt}</p>
                    </div>
                );
            }
        },
        {
            header: 'Customer',
            accessorKey: "client_id",
            colClassName: 'text-start',
            cell: ({ cell, row }) => {
                return (
                    <div className="space-y-1">
                        <p className="font-medium text-gray-900 text-sm ">{cell.row.original.first_name} {cell.row.original.last_name}</p>
                        <p className="text-xs text-gray-500">{cell.row.original.email}</p>
                    </div>
                );
            }
        },
        {
            header: 'Status',
            accessorKey: "status",
            HeaderClassName: 'text-center',
            colClassName: 'text-center',
            cell: ({ cell }) => {
                if (isSuperAdmin) {
                    return (
                        <FeedBackStatusSelector
                            value={cell.getValue()}
                            onChange={(value) => handleStatusChangeMutation.mutate({ feedbackId: cell.row.original.unique_id, status: value })}
                            isLoading={handleStatusChangeMutation.variables?.feedbackId === cell.row.original.unique_id && handleStatusChangeMutation.isPending}
                            options={feedBackStatus}
                            placeholder='Select Status'
                            searchPlaceholder='Search Status...'
                            emptyMessage='No status found'
                        />
                    )
                } else {
                    return (
                        <Chip className='capitalize' variant='light' color={getColor(cell.getValue())} radius='md' size='sm' border='none' >
                            {getStatusLabel(cell.getValue())}
                        </Chip>)
                }

            }
        },
        {
            header: 'Category',
            accessorKey: "type",
            HeaderClassName: 'text-center',
            colClassName: 'text-center',
            cell: ({ cell }) => {
                if (permissions?.unique_id === cell.row.original.client_id) {
                    return (
                        <FeedBackTypeSelector
                            value={cell.getValue()}
                            onChange={(value) => handleTypeChangeMutation.mutate({ feedbackId: cell.row.original.unique_id, type: value })}
                            isLoading={handleTypeChangeMutation.variables?.feedbackId === cell.row.original.unique_id && handleTypeChangeMutation.isPending}
                            options={feedBackType}
                            placeholder='Select Status'
                            searchPlaceholder='Search Status...'
                            emptyMessage='No status found'
                        />
                    )
                } else {
                    return (
                        <Chip className='gap-1' variant='light' color={getCategoryColor(cell.getValue())?.color} radius='md' size='sm' border='none'><span>{getCategoryColor(cell.getValue())?.label || cell.getValue()}</span></Chip>)
                }
            }
        },
        {
            id: "actions",
            header: "Actions",
            HeaderClassName: "text-center",
            colClassName: "w-2/12 text-center",
            cell: ({ _, row }) => (
                <div>
                    <Button onClick={() => handleView(row?.original)} size='xs' type='button' variant="ghost" className="rounded-full text-indigo-500 hover:bg-indigo-100 hover:text-indigo-600" >
                        <Eye size={16} />
                    </Button>
                    {(permissions?.unique_id === row.original.client_id &&
                        <Button onClick={() => handleEdit(row?.original)} size='xs' type='button' variant="ghost" className="rounded-full text-green-500 hover:bg-green-100 hover:text-green-600">
                            <Edit size={16} />
                        </Button>)}
                </div>
            )
        }
    ], [handleStatusChangeMutation]);

    const tableInstance = useReactTable({
        data: latestFeedback?.data || [],
        rowCount: parseInt(latestFeedback?.pagination?.total) || 0,
        columns,
        state: {
            pagination,
        },
        onPaginationChange: setPagination,
        getSortedRowModel: getSortedRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
    });


    if (latestFeedbackIsLoading) {
        return (
            <Card className='h-screen w-full transition ease-in-out duration-300'>
                <GoogleStyleLoader className={'h-[70%]'} />
            </Card>
        );
    }

    return (
        <>
            <FeedBackForm
                isOpen={isOpen}
                onClose={handleModelClose}
                isEdit={isEditing}
                editData={selectedRow}
            />

            <FeedBackDetails
                isOpen={isDetailsOpen}
                onClose={handleDetailsModalClose}
                selectedRow={feedBackDetails}
            />

            <Card className="shadow-none border-none">
                <CardHeader className="p-0 pb-2 border-b px-2 pt-2">
                    <div className="">
                        <div className='flex flex-wrap gap-2 justify-between items-center' >
                            <div>
                                <CardTitle className='text-primary text-2xl font-bold' >Support Tickets</CardTitle>
                                <p className='text-secondary text-sm' >Manage all your feedback and support tickets</p>
                            </div>

                            {!isSuperAdmin && <Button onClick={hadnleAddFeedBack} size='sm' className='text-indigo-500 gap-2 border bg-white hover:text-white border-indigo-500 hover:bg-indigo-500'>
                                <div className='flex items-center gap-1 '>
                                    <Plus size={18} />
                                    <span className='text-sm'>Create Ticke</span>
                                </div>
                            </Button>}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className=" pb-0 px-0">
                    <div className=''>
                        <CommonTable
                            table={tableInstance}
                            tableStyle='2xl:h-[69dvh] h-[60dvh]'
                            tableHeadRowStyle='bg-indigo-50/20 hover:bg-indigo-50/50'
                            tableBodyRowStyle='bg-transparent hover:bg-indigo-50/50'
                        />
                    </div>
                    <div className="mt-2 pt-2 border-t">
                        <DataTablePagination table={tableInstance} count={latestFeedback?.pagination?.total || 0} />
                    </div>
                </CardContent>
            </Card>
        </>

    )
}
