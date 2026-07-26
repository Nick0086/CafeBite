import { memo, useContext, useState } from 'react';
import { MessageSquare, MoreHorizontal, Reply, Edit, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Chip } from '@/components/ui/chip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PermissionsContext } from '@/contexts/PermissionsContext';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import {
    useAddCommentMutation,
    useDeleteCommentMutation,
    useUpdateCommentMutation,
} from '../../hooks/useClientSupportData';
import { formatCommentDate } from '../../utils/date.utils';

const buildHierarchy = (comments) => {
    const map = new Map();
    const top = [];
    comments.forEach((c) => map.set(c.id, { ...c, replies: [] }));
    comments.forEach((c) => {
        if (c.parent_comment_id && map.has(c.parent_comment_id)) {
            map.get(c.parent_comment_id).replies.push(map.get(c.id));
        } else {
            top.push(map.get(c.id));
        }
    });
    return top;
};

const CommentItem = memo(function CommentItem({
    comment,
    isReply,
    permissions,
    editingId,
    editText,
    setEditText,
    setEditingId,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText,
    onUpdate,
    onDelete,
    onReply,
    isUpdating,
    isReplying,
}) {
    const isAdmin = comment.commented_by === 'admin';
    const isOwner = permissions?.unique_id === comment.commented_by_id;
    const isEditing = editingId === comment.id;

    return (
        <div className={`flex items-start md:space-x-3 space-x-1 ${isReply ? 'md:ml-8 ml-4 mt-3' : ''}`}>
            <div
                className={`sm:w-8 sm:h-8 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isAdmin ? 'bg-blue-100' : 'bg-gray-100'
                }`}
            >
                <span
                    className={`sm:font-medium font-bold sm:text-sm text-[10px] ${
                        isAdmin ? 'text-blue-600' : 'text-gray-600'
                    }`}
                >
                    {isAdmin ? 'A' : comment.commenter_name?.[0] || 'U'}
                </span>
            </div>
            <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex sm:flex-row flex-col sm:items-center items-start gap-1">
                            <span className="font-medium sm:text-sm text-xs">
                                {isAdmin ? 'Support Team' : comment.commenter_name || 'User'}
                            </span>
                            {isAdmin && (
                                <Chip
                                    className="capitalize sm:text-sm text-xs"
                                    variant="light"
                                    color="purple"
                                    radius="md"
                                    size="sm"
                                    border="none"
                                >
                                    Administrator
                                </Chip>
                            )}
                            <span className="sm:text-sm text-xs text-gray-500">{formatCommentDate(comment.created_at)}</span>
                            {comment.updated_at !== comment.created_at && (
                                <span className="sm:text-sm text-xs text-gray-400">(edited)</span>
                            )}
                        </div>

                        {isOwner && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="z-[99999999999999]" align="end">
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setEditingId(comment.id);
                                            setEditText(comment.comment);
                                        }}
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </DropdownMenuItem>
                                    <Separator />
                                    <DropdownMenuItem
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this comment?')) {
                                                onDelete(comment.unique_id);
                                            }
                                        }}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="space-y-3">
                            <Textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="bg-card sm:text-sm text-xs"
                                rows="4"
                            />
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => onUpdate(comment.unique_id)}
                                    disabled={isUpdating || !editText.trim()}
                                    isLoading={isUpdating}
                                >
                                    <Check className="w-3 h-3 mr-1" />
                                    {isUpdating ? 'Updating...' : 'Update'}
                                </Button>
                                <Button onClick={() => setEditingId(null)} variant="outline" size="sm" className="border-border">
                                    <X className="w-3 h-3 mr-1" />
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-700 mb-3">{comment.comment}</p>
                    )}

                    {!isEditing && (
                        <div className="flex items-center space-x-4">
                            <Button
                                onClick={() => setReplyingTo(comment.id)}
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-gray-500 hover:text-gray-700"
                            >
                                <Reply className="w-3 h-3 mr-1" />
                                Reply
                            </Button>
                            {comment.replies?.length > 0 && (
                                <span className="text-xs text-gray-500">
                                    {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {replyingTo === comment.id && (
                    <div className="mt-3 ml-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-gray-600 font-medium text-xs">U</span>
                            </div>
                            <div className="flex-1">
                                <Textarea
                                    value={replyText}
                                    placeholder="Write a reply..."
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="bg-card sm:text-sm text-xs"
                                    rows="4"
                                />
                                <div className="flex items-center space-x-2 mt-2">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => onReply(comment.id)}
                                        disabled={isReplying || !replyText.trim()}
                                        isLoading={isReplying}
                                    >
                                        {isReplying ? 'Replying...' : 'Reply'}
                                    </Button>
                                    <Button onClick={() => setReplyingTo(null)} variant="outline" size="sm" className="border-border">
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {comment.replies?.length > 0 && (
                    <div className="mt-3">
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                isReply
                                permissions={permissions}
                                editingId={editingId}
                                editText={editText}
                                setEditText={setEditText}
                                setEditingId={setEditingId}
                                replyingTo={replyingTo}
                                setReplyingTo={setReplyingTo}
                                replyText={replyText}
                                setReplyText={setReplyText}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                                onReply={onReply}
                                isUpdating={isUpdating}
                                isReplying={isReplying}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

export default function FeedbackComment({ comments, commentText, setCommentText, selectedRow }) {
    const { permissions } = useContext(PermissionsContext);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    const addCommentMutation = useAddCommentMutation(selectedRow?.unique_id);
    const updateCommentMutation = useUpdateCommentMutation(selectedRow?.unique_id);
    const deleteCommentMutation = useDeleteCommentMutation(selectedRow?.unique_id);

    const isUpdatingAny = updateCommentMutation.isPending;
    const replyingParentId = addCommentMutation.variables?.parent_comment_id ?? null;

    const handleAddComment = () => {
        if (commentText.trim()) {
            addCommentMutation.mutate(
                { comment: commentText },
                {
                    onSuccess: () => {
                        setCommentText('');
                        setReplyingTo(null);
                        setReplyText('');
                        toastSuccess('Comment added successfully');
                    },
                    onError: (error) => toastError(`Error adding comment: ${error?.err?.message}`),
                }
            );
        }
    };

    const handleReply = (commentId) => {
        if (replyText.trim()) {
            addCommentMutation.mutate(
                { comment: replyText, parent_comment_id: commentId },
                {
                    onSuccess: () => {
                        setReplyingTo(null);
                        setReplyText('');
                        toastSuccess('Reply added successfully');
                    },
                    onError: (error) => toastError(`Error adding reply: ${error?.err?.message}`),
                }
            );
        }
    };

    const handleUpdateComment = (commentId) => {
        if (editText.trim()) {
            updateCommentMutation.mutate(
                { commentId, comment: editText },
                {
                    onSuccess: () => {
                        setEditingId(null);
                        setEditText('');
                        toastSuccess('Comment updated successfully');
                    },
                    onError: (error) => toastError(`Error updating comment: ${error?.err?.message}`),
                }
            );
        }
    };

    const handleDeleteComment = (commentId) => {
        deleteCommentMutation.mutate(commentId, {
            onSuccess: () => toastSuccess('Comment deleted successfully'),
            onError: (error) => toastError(`Error deleting comment: ${error?.err?.message}`),
        });
    };

    const hierarchicalComments = buildHierarchy(comments);

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold">Comments & Updates ({comments.length})</h3>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                    <div className="sm:w-8 sm:h-8 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 sm:font-medium font-bold sm:text-sm text-[10px]">U</span>
                    </div>
                    <div className="flex-1">
                        <Textarea
                            className="sm:text-sm text-xs"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            rows="4"
                        />
                        <div className="flex items-center justify-end mt-3">
                            <Button
                                onClick={handleAddComment}
                                disabled={addCommentMutation.isPending || !commentText.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {addCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                {hierarchicalComments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No comments yet. Be the first to comment!</div>
                ) : (
                    hierarchicalComments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            permissions={permissions}
                            editingId={editingId}
                            editText={editText}
                            setEditText={setEditText}
                            setEditingId={setEditingId}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            replyText={replyText}
                            setReplyText={setReplyText}
                            onUpdate={handleUpdateComment}
                            onDelete={handleDeleteComment}
                            onReply={handleReply}
                            isUpdating={isUpdatingAny}
                            isReplying={replyingParentId === comment.id}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
