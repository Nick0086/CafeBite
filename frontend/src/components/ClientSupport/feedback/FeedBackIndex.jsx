import { useCallback, useContext, useMemo, useState } from 'react';
import {
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Edit, Eye, MessageSquare, Paperclip, Plus } from 'lucide-react';

import {
    FEEDBACK_STATUS,
    FEEDBACK_TYPE_COLOR,
    FEEDBACK_STATUS_COLOR,
    FEEDBACK_STATUS_LABEL,
    FEEDBACK_TYPE_OPTIONS,
} from '../constants/clientSupport.constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GoogleStyleLoader from '@/components/ui/loaders/GoogleStyleLoader';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { CommonTable } from '@/common/Table/CommonTable';
import { DataTablePagination } from '@/components/ui/table-pagination';
import { PermissionsContext } from '@/contexts/PermissionsContext';
import { InlineSelector } from '@/common/InlineSelector';

import FeedbackForm from './FeedbackForm';
import FeedbackDetails from './FeedbackDetails';
import {
    useFeedbackList,
    useUpdateFeedbackStatusMutation,
    useUpdateFeedbackTypeMutation,
} from '../hooks/useClientSupportData';

const StatusCell = ({ value, isSuperAdmin, onChange, isLoading }) => {
    if (!isSuperAdmin) {
        return (
            <Chip
                className="capitalize"
                variant="light"
                color={FEEDBACK_STATUS_COLOR[value] || FEEDBACK_STATUS_COLOR.default}
                radius="md"
                size="sm"
                border="none"
            >
                {FEEDBACK_STATUS_LABEL[value] || FEEDBACK_STATUS_LABEL.default}
            </Chip>
        );
    }
    return (
        <InlineSelector
            value={value}
            onChange={onChange}
            isLoading={isLoading}
            options={FEEDBACK_STATUS}
            renderSelected={() => (
                <Chip
                    className="capitalize"
                    variant="light"
                    color={FEEDBACK_STATUS_COLOR[value] || FEEDBACK_STATUS_COLOR.default}
                    radius="md"
                    size="sm"
                    border="none"
                >
                    {FEEDBACK_STATUS_LABEL[value] || FEEDBACK_STATUS_LABEL.default}
                </Chip>
            )}
            placeholder="Select Status"
            searchPlaceholder="Search Status..."
            emptyMessage="No status found"
        />
    );
};

const TypeCell = ({ value, isOwner, onChange, isLoading }) => {
    const { label, color } = FEEDBACK_TYPE_COLOR[value] || FEEDBACK_TYPE_COLOR.default;
    if (!isOwner) {
        return (
            <Chip className="gap-1" variant="light" color={color} radius="md" size="sm" border="none">
                <span>{label}</span>
            </Chip>
        );
    }
    return (
        <InlineSelector
            value={value}
            onChange={onChange}
            isLoading={isLoading}
            options={FEEDBACK_TYPE_OPTIONS}
            renderSelected={() => (
                <Chip className="gap-1" variant="light" color={color} radius="md" size="sm" border="none">
                    <span>{label}</span>
                </Chip>
            )}
            placeholder="Select Type"
            searchPlaceholder="Search Type..."
            emptyMessage="No type found"
        />
    );
};

export default function FeedbackIndex({ pagination: isPaginated = true }) {
    const { isSuperAdmin, permissions } = useContext(PermissionsContext);

    const [pageState, setPageState] = useState({ pageIndex: 0, pageSize: isPaginated ? 25 : 10 });
    const [formModal, setFormModal] = useState({ open: false, mode: null, data: null });
    const [detailsModal, setDetailsModal] = useState({ open: false, data: null });

    const { data: latestFeedback, isLoading } = useFeedbackList(pageState);

    const openCreate = useCallback(() => setFormModal({ open: true, mode: 'create', data: null }), []);
    const openEdit = useCallback((row) => setFormModal({ open: true, mode: 'edit', data: row }), []);
    const closeForm = useCallback(() => setFormModal({ open: false, mode: null, data: null }), []);
    const openDetails = useCallback((row) => setDetailsModal({ open: true, data: row }), []);
    const closeDetails = useCallback(() => setDetailsModal({ open: false, data: null }), []);

    const statusMutation = useUpdateFeedbackStatusMutation(pageState);
    const typeMutation = useUpdateFeedbackTypeMutation(pageState);

    const columns = useMemo(
        () => [
            {
                header: 'Ticket',
                accessorKey: 'title',
                colClassName: 'text-start',
                HeaderClassName: 'text-start',
                cell: ({ cell }) => {
                    const r = cell.row.original;
                    return (
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-blue-600">T-{r.id}</span>
                                {r.image_count > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Paperclip className="h-3 w-3 text-gray-400" />
                                        {r.image_count}
                                    </div>
                                )}
                                {r.comment_count > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <MessageSquare className="h-3 w-3" />
                                        {r.comment_count}
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-900 font-medium max-w-xs truncate">{cell.getValue()}</p>
                            <p className="text-xs text-gray-500">{r.createdAt}</p>
                        </div>
                    );
                },
            },
            {
                header: 'Customer',
                accessorKey: 'client_id',
                colClassName: 'text-start',
                cell: ({ cell }) => {
                    const r = cell.row.original;
                    return (
                        <div className="space-y-1">
                            <p className="font-medium text-gray-900 text-sm">
                                {r.first_name} {r.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{r.email}</p>
                        </div>
                    );
                },
            },
            {
                header: 'Status',
                accessorKey: 'status',
                HeaderClassName: 'text-center',
                colClassName: 'text-center',
                cell: ({ cell, row }) => {
                    const id = row.original.unique_id;
                    const isLoading =
                        statusMutation.variables?.feedbackId === id && statusMutation.isPending;
                    return (
                        <StatusCell
                            value={cell.getValue()}
                            isSuperAdmin={isSuperAdmin}
                            isLoading={isLoading}
                            onChange={(value) =>
                                statusMutation.mutate({ feedbackId: id, status: value })
                            }
                        />
                    );
                },
            },
            {
                header: 'Category',
                accessorKey: 'type',
                HeaderClassName: 'text-center',
                colClassName: 'text-center',
                cell: ({ cell, row }) => {
                    const id = row.original.unique_id;
                    const isLoading =
                        typeMutation.variables?.feedbackId === id && typeMutation.isPending;
                    return (
                        <TypeCell
                            value={cell.getValue()}
                            isOwner={permissions?.unique_id === row.original.client_id}
                            isLoading={isLoading}
                            onChange={(value) =>
                                typeMutation.mutate({ feedbackId: id, type: value })
                            }
                        />
                    );
                },
            },
            {
                id: 'actions',
                header: 'Actions',
                HeaderClassName: 'text-center',
                colClassName: 'w-2/12 text-center',
                cell: ({ row }) => (
                    <div>
                        <Button
                            onClick={() => openDetails(row?.original)}
                            size="xs"
                            type="button"
                            variant="ghost"
                            className="rounded-full text-indigo-500 hover:bg-indigo-100 hover:text-indigo-600"
                        >
                            <Eye size={16} />
                        </Button>
                        {permissions?.unique_id === row.original.client_id && isPaginated && (
                            <Button
                                onClick={() => openEdit(row?.original)}
                                size="xs"
                                type="button"
                                variant="ghost"
                                className="rounded-full text-green-500 hover:bg-green-100 hover:text-green-600"
                            >
                                <Edit size={16} />
                            </Button>
                        )}
                    </div>
                ),
            },
        ],
        [isSuperAdmin, permissions, statusMutation, typeMutation, openDetails, openEdit, isPaginated]
    );

    const tableInstance = useReactTable({
        data: latestFeedback?.data || [],
        rowCount: parseInt(latestFeedback?.pagination?.total) || 0,
        columns,
        state: { pagination: pageState },
        onPaginationChange: setPageState,
        getSortedRowModel: getSortedRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
    });

    if (isLoading) {
        return (
            <Card className="h-screen w-full transition ease-in-out duration-300">
                <GoogleStyleLoader className="h-[70%]" />
            </Card>
        );
    }

    return (
        <>
            <FeedbackForm
                isOpen={formModal.open}
                onClose={closeForm}
                isEdit={formModal.mode === 'edit'}
                editData={formModal.data}
            />

            <FeedbackDetails
                isOpen={detailsModal.open}
                onClose={closeDetails}
                selectedRow={detailsModal.data}
            />

            <Card className="shadow-none border-none">
                {isPaginated && (
                    <CardHeader className="p-0 pb-2 border-b px-2 pt-2">
                        <div className="flex flex-wrap gap-2 justify-between items-center">
                            <div>
                                <CardTitle className="text-primary text-2xl font-bold">
                                    Support Tickets
                                </CardTitle>
                                <p className="text-secondary text-sm">
                                    Manage all your feedback and support tickets
                                </p>
                            </div>
                            {!isSuperAdmin && (
                                <Button
                                    onClick={openCreate}
                                    size="sm"
                                    className="text-indigo-500 gap-2 border bg-white hover:text-white border-indigo-500 hover:bg-indigo-500"
                                >
                                    <div className="flex items-center gap-1">
                                        <Plus size={18} />
                                        <span className="text-sm">Create Ticket</span>
                                    </div>
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                )}
                <CardContent className="pb-0 px-0">
                    <CommonTable
                        table={tableInstance}
                        tableStyle="2xl:h-[69dvh] h-[60dvh]"
                        tableHeadRowStyle="bg-indigo-50/20 hover:bg-indigo-50/50"
                        tableBodyRowStyle="bg-transparent hover:bg-indigo-50/50"
                    />
                    {isPaginated && (
                        <div className="mt-2 pt-2 border-t">
                            <DataTablePagination
                                table={tableInstance}
                                count={latestFeedback?.pagination?.total || 0}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
