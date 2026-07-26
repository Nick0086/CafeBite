import { useState } from 'react';
import { FileText, Images, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/tremor-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GoogleStyleLoader from '@/components/ui/loaders/GoogleStyleLoader';
import FeedbackDetailsTab from './components/FeedbackDetailsTab';
import FeedbackAttachment from './components/FeedbackAttachment';
import FeedbackComment from './components/FeedbackComment';
import { Separator } from '@/components/ui/separator';
import { useFeedbackDetail } from '../hooks/useClientSupportData';

export default function FeedbackDetails({ isOpen, onClose, selectedRow }) {
    const [activeTab, setActiveTab] = useState('details');
    const [commentText, setCommentText] = useState('');
    const [newImages, setNewImages] = useState([]);

    const { data, isLoading } = useFeedbackDetail(selectedRow?.unique_id, isOpen);

    const handleModalClose = () => {
        setCommentText('');
        setNewImages([]);
        setActiveTab('details');
        onClose();
    };

    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={handleModalClose}>
                <DialogContent stopOutsideClick={true} className="lg:max-w-4xl md:max-w-3xl max-w-[95%] overflow-hidden">
                    <DialogHeader className="flex flex-row items-center justify-between py-2 px-6 border-b">
                        <div className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-gray-600" />
                            <DialogTitle className="text-xl font-semibold">Feedback Details</DialogTitle>
                        </div>
                    </DialogHeader>
                    <GoogleStyleLoader className="h-[50dvh]" />
                </DialogContent>
            </Dialog>
        );
    }

    const feedback = data?.data?.feedback;
    const comments = data?.data?.comments || [];
    const images = data?.data?.images || [];

    return (
        <Dialog open={isOpen} onOpenChange={handleModalClose}>
            <DialogContent stopOutsideClick={true} className="lg:max-w-4xl md:max-w-3xl max-w-[95%] overflow-hidden">
                {isOpen && feedback && (
                    <>
                        <DialogHeader className="flex flex-row items-center justify-between py-2 px-6 border-b">
                            <div className="flex items-center space-x-2">
                                <FileText className="w-5 h-5 text-gray-600" />
                                <DialogTitle className="text-xl font-semibold">Feedback Details</DialogTitle>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 overflow-hidden">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                                <TabsList className="flex sm:flex-row flex-col flex-wrap sm:items-center items-stretch w-full bg-muted sm:mx-6 mx-1 mt-2 rounded-lg">
                                    <TabsTrigger
                                        value="details"
                                        className="flex items-center flex-1 gap-2 data-[state=active]:bg-card sm:text-sm text-xs"
                                    >
                                        <FileText size={16} />
                                        Details
                                    </TabsTrigger>
                                    <Separator className="sm:hidden" />
                                    <TabsTrigger
                                        value="comments"
                                        className="flex items-center flex-1 gap-2 data-[state=active]:bg-card sm:text-sm text-xs"
                                    >
                                        <MessageSquare size={16} />
                                        Comments
                                    </TabsTrigger>
                                    <Separator className="sm:hidden" />
                                    <TabsTrigger
                                        value="attachments"
                                        className="flex items-center flex-1 gap-2 data-[state=active]:bg-card sm:text-sm text-xs"
                                    >
                                        <Images size={16} />
                                        Attachments
                                    </TabsTrigger>
                                </TabsList>

                                <div className="flex-1 overflow-y-auto sm:max-h-[75dvh] max-h-[60dvh] sm:px-6 px-2 py-4">
                                    <TabsContent value="details" className="mt-0 space-y-6">
                                        <FeedbackDetailsTab feedback={feedback} />
                                    </TabsContent>

                                    <TabsContent value="comments" className="mt-0">
                                        <FeedbackComment
                                            comments={comments}
                                            commentText={commentText}
                                            setCommentText={setCommentText}
                                            selectedRow={selectedRow}
                                        />
                                    </TabsContent>

                                    <TabsContent value="attachments" className="mt-0">
                                        <FeedbackAttachment
                                            images={images}
                                            newImages={newImages}
                                            setNewImages={setNewImages}
                                            selectedRow={selectedRow}
                                        />
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
