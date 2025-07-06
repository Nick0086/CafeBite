import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { toastError } from '@/utils/toast-utils';
import { feedBackQueryKeys } from './utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GoogleStyleLoader from '@/components/ui/loaders/GoogleStyleLoader';
import { getFeedbackStats } from '@/service/clinetFeedback.service';
import FeedbackCard from './components/FeedbackCard';
import FeedbackProgressCard from './components/FeedbackProgressCard';
import { CheckCircle, Clock, MessageSquare, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FeedBackIndex from '../feedback/FeedBackIndex';

export default function DashboardIndex() {

    const navigate = useNavigate();

    const { data: feedBackState, isLoading: feedBackStateIsLoading, error: feedBackStateError } = useQuery({
        queryKey: [feedBackQueryKeys['FEEDBACK_STATS']],
        queryFn: getFeedbackStats,
    });
    const stats = useMemo(() => feedBackState?.data, [feedBackState]);

    useEffect(() => {
        if (feedBackStateError) {
            toastError(`Error During Fetching Feedback State: ${feedBackStateError?.err?.message}`);
        }
    }, [feedBackStateError]);

    if (feedBackStateIsLoading) {
        return (
            <Card className='h-screen w-full transition ease-in-out duration-300'>
                <GoogleStyleLoader className={'h-[70%]'} />
            </Card>
        );
    }

    return (
        <Card className='border-none shadow-none'>
            <CardContent className="mt-4 px-4 space-y-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FeedbackCard
                        title="Total Feedback"
                        value={stats?.total_feedback || "0"}
                        icon={<MessageSquare size={32} className="text-blue-600" />}
                        color="blue"
                    />
                    <FeedbackCard
                        title="Open Tickets"
                        value={stats?.open_count || "0"}
                        icon={<Clock size={32} className="text-yellow-600" />}
                        color="yellow"
                    />
                    <FeedbackCard
                        title="Resolved"
                        value={stats?.resolved_count || "0"}
                        icon={<CheckCircle size={32} className=" text-green-600" />}
                        color="green"
                    />
                    <FeedbackCard
                        title="Avg Rating"
                        value={stats?.avg_satisfaction_rating || "0"}
                        icon={<Star size={32} className=" text-yellow-500" />}
                        color="yellow"
                    />
                </div>

                {/* Additional Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FeedbackCard
                        title="Last 7 Days"
                        value={stats?.last_7_days_count || "0"}
                        icon={<div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-medium">7d</span>
                        </div>}
                        color="blue"
                    />
                    <FeedbackCard
                        title="Last 30 Days"
                        value={stats?.last_30_days_count || "0"}
                        icon={<div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-sm font-medium">30d</span>
                        </div>}
                        color="green"
                    />
                    <FeedbackCard
                        title="In Progress"
                        value={stats?.in_progress_count || "0"}
                        icon={<Clock size={32} className="text-orange-600" />}
                        color="orange"
                    />
                </div>

                {/* Charts and Recent Feedback */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <FeedbackProgressCard
                        title="Feedback by Status"
                        totalCount={stats?.total_feedback || 0}
                        items={[
                            { status: "open", count: stats?.open_count || 0, label: "Open" },
                            { status: "in_progress", count: stats?.in_progress_count || 0, label: "In Progress" },
                            { status: "resolved", count: stats?.resolved_count || 0, label: "Resolved" },
                            { status: "closed", count: stats?.closed_count || 0, label: "Closed" },
                            { status: "cancelled", count: stats?.cancelled_count || 0, label: "Cancelled" },
                        ]}
                    />
                    <FeedbackProgressCard
                        title="Feedback by Type"
                        totalCount={stats?.total_feedback || 0}
                        items={[
                            { type: "bug", count: stats?.bug_count || 0, label: "Bug Reports" },
                            { type: "complaint", count: stats?.complaint_count || 0, label: "Complaints" },
                            { type: "suggestion", count: stats?.suggestion_count || 0, label: "Suggestions" },
                            { type: "billing", count: stats?.billing_count || 0, label: "Billing Issues" },
                            { type: "feature_request", count: stats?.feature_request_count || 0, label: "Feature Requests" },
                        ]}
                    />
                </div>

                {/* Recent Feedback - Keep this section as is */}
                <Card className='shadow-sm' >
                    <CardHeader className='px-4 border-b py-3' >
                        <CardTitle>Recent Feedback</CardTitle>
                    </CardHeader>
                    <CardContent className='px-0 pb-2' >
                        {/* <div className="space-y-4 px-4">
                            {latestFeedbackData?.map((feedback) => (
                                <div key={feedback.id} className="flex items-start gap-3 p-3 rounded-lg border">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Link href={`/ticket-management/feedback/${feedback.id}`} className="font-medium text-gray-900 hover:text-blue-600 truncate">
                                                {feedback.title}
                                            </Link>
                                            <StatusBadge status={feedback.status} />
                                        </div>
                                        <p className="text-sm text-gray-600 capitalize">{feedback.type.replace("_", " ")}</p>
                                        <p className="text-xs text-gray-500 mt-1">{new Date(feedback.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                            {latestFeedbackData?.length === 0 && <p className="text-foreground text-center h-[40dvh] flex items-center justify-center py-4 text-xl font-bold">No recent feedback</p>}
                        </div> */}
                        <FeedBackIndex pagenation={false} />
                        <div className="mt-2 pt-2 px-2 border-t text-center">
                            <Button onClick={() => navigate("/ticket-management/feedback")} variant="outline" className="lg:w-1/4 w-full bg-transparent border-border">
                                View All Feedback
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}