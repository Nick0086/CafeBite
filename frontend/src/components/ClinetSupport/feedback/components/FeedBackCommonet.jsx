import { Button } from '@/components/ui/button';
import { addComment, updateComment, deleteComment } from '@/service/clinetFeedback.service';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, MoreHorizontal, Reply, Edit, Trash2, X, Check } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';
import { feedBackListQueryKeys } from '../utils';
import { format, parseISO } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Chip } from '@/components/ui/chip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PermissionsContext } from '@/contexts/PermissionsContext';

export default function FeedBackComment({ comments, commentText, setCommentText, selectedRow }) {
    const queryClient = useQueryClient();
    const { permissions } = useContext(PermissionsContext);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [showDropdown, setShowDropdown] = useState(null);

    // Add comment mutation
    const addCommentMutation = useMutation({
        mutationFn: (data) => addComment(selectedRow?.unique_id, data),
        onSuccess: () => {
            setCommentText('');
            setReplyingTo(null);
            setReplyText('');
            queryClient.invalidateQueries([feedBackListQueryKeys['FEEDBACK_DETAIL'], selectedRow?.unique_id]);
            toastSuccess('Comment added successfully');
        },
        onError: (error) => toastError(`Error adding comment: ${error?.err?.message}`),
    });

    // Update comment mutation
    const updateCommentMutation = useMutation({
        mutationFn: (data) => updateComment(selectedRow?.unique_id, data.commentId, data.comment),
        onSuccess: () => {
            setEditingComment(null);
            setEditText('');
            queryClient.invalidateQueries([feedBackListQueryKeys['FEEDBACK_DETAIL'], selectedRow?.unique_id]);
            toastSuccess('Comment updated successfully');
        },
        onError: (error) => toastError(`Error updating comment: ${error?.err?.message}`),
    });

    // Delete comment mutation
    const deleteCommentMutation = useMutation({
        mutationFn: (commentId) => deleteComment(selectedRow?.unique_id, commentId),
        onSuccess: () => {
            queryClient.invalidateQueries([feedBackListQueryKeys['FEEDBACK_DETAIL'], selectedRow?.unique_id]);
            toastSuccess('Comment deleted successfully');
        },
        onError: (error) => toastError(`Error deleting comment: ${error?.err?.message}`),
    });

    const handleAddComment = () => {
        if (commentText.trim()) {
            addCommentMutation.mutate({ comment: commentText });
        }
    };

    const handleReply = (commentId) => {
        if (replyText.trim()) {
            addCommentMutation.mutate({
                comment: replyText,
                parent_comment_id: commentId
            });
        }
    };

    const handleEdit = (comment) => {
        setEditingComment(comment.id);
        setEditText(comment.comment);
        setShowDropdown(null);
    };

    const handleUpdateComment = (commentId) => {
        if (editText.trim()) {
            updateCommentMutation.mutate({
                commentId: commentId,
                comment: editText
            });
        }
    };

    const handleDeleteComment = (commentId) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            deleteCommentMutation.mutate(commentId);
        }
        setShowDropdown(null);
    };

    const handleCancelEdit = () => {
        setEditingComment(null);
        setEditText('');
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
        setReplyText('');
    };

    const getCommentHierarchy = (comments) => {
        const commentMap = new Map();
        const topLevelComments = [];

        // Create a map of all comments
        comments.forEach(comment => {
            commentMap.set(comment.id, { ...comment, replies: [] });
        });

        // Organize comments into hierarchy
        comments.forEach(comment => {
            if (comment.parent_comment_id && commentMap.has(comment.parent_comment_id)) {
                commentMap.get(comment.parent_comment_id).replies.push(commentMap.get(comment.id));
            } else {
                topLevelComments.push(commentMap.get(comment.id));
            }
        });

        return topLevelComments;
    };

    const renderComment = (comment, isReply = false) => {
        const isAdmin = comment.commented_by === 'admin';
        const isCurrentUserComment = permissions?.unique_id === comment.commented_by_id;
        const isEditing = editingComment === comment.id;

        return (
            <div key={comment.id} className={`flex items-start md:space-x-3 space-x-1 ${isReply ? 'ms:ml-8 m;-4 mt-3' : ''}`}>
                <div className={`sm:w-8 sm:h-8 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isAdmin ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                    <span className={`sm:font-medium font-bold sm:text-sm text-[10px] ${isAdmin ? 'text-blue-600' : 'text-gray-600'
                        }`}>
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
                                    <Chip className='capitalize sm:text-sm text-xs' variant='light' color={'purple'} radius='md' size='sm' border='none' >
                                        Administrator
                                    </Chip>
                                )}
                                <span className="sm:text-sm text-xs text-gray-500">
                                    {format(parseISO(comment.created_at), 'dd-MM-yyyy hh:mm:ss a')}
                                </span>
                                {comment.updated_at !== comment.created_at && (
                                    <span className="sm:text-sm text-xs text-gray-400">(edited)</span>
                                )}
                            </div>

                            {isCurrentUserComment && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className='z-[99999999999999]' align="end">
                                        <DropdownMenuItem onClick={() => handleEdit(comment)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <Separator />
                                        <DropdownMenuItem onClick={() => handleDeleteComment(comment.unique_id)} className="text-red-600">
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
                                    className='bg-white sm:text-sm text-xs'
                                    roes='4'
                                />
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant='primary'
                                        onClick={() => handleUpdateComment(comment.unique_id)}
                                        disabled={updateCommentMutation.isPending || !editText.trim()}
                                        isLoading={updateCommentMutation.isPending}
                                    >
                                        <Check className="w-3 h-3 mr-1" />
                                        {updateCommentMutation.isPending ? 'Updating...' : 'Update'}
                                    </Button>
                                    <Button onClick={handleCancelEdit} className='border-border' variant="outline" size="sm" >
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
                                {comment.replies && comment.replies.length > 0 && (
                                    <span className="text-xs text-gray-500">
                                        {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Reply Input */}
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
                                        className='bg-white sm:text-sm text-xs'
                                        roes='4'
                                    />
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Button
                                            variant='primary'
                                            size="sm"
                                            onClick={() => handleReply(comment.id)}
                                            disabled={addCommentMutation.isPending || !replyText.trim()}
                                            isLoading={addCommentMutation.isPending}
                                        >
                                            {addCommentMutation.isPending ? 'Replying...' : 'Reply'}
                                        </Button>
                                        <Button
                                            onClick={handleCancelReply}
                                            variant="outline"
                                            className='border-border'
                                            size="sm"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Render Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3">
                            {comment.replies.map(reply => renderComment(reply, true))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const hierarchicalComments = getCommentHierarchy(comments);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown && !event.target.closest('.relative')) {
                setShowDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold">Comments & Updates ({comments.length})</h3>
            </div>

            {/* Add Comment Section */}
            <div className="bg-white border border-gray-200  rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                    <div className="sm:w-8 sm:h-8 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 sm:font-medium font-bold sm:text-sm  text-[10px]">U</span>
                    </div>
                    <div className="flex-1">
                        <Textarea className='sm:text-sm text-xs' value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." rows="4" />
                        <div className="flex items-center justify-end mt-3">
                            {/* <div className="text-xs text-gray-500">
                                Tip: Use @username to mention someone
                            </div> */}
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

            {/* Comments List */}
            <div className="space-y-4">
                {hierarchicalComments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No comments yet. Be the first to comment!
                    </div>
                ) : (
                    hierarchicalComments.map(comment => renderComment(comment))
                )}
            </div>
        </div>
    );
}