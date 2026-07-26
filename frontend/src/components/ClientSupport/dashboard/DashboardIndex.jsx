import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GoogleStyleLoader from '@/components/ui/loaders/GoogleStyleLoader';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, MessageSquare, Star } from 'lucide-react';
import FeedbackCard from './components/FeedbackCard';
import FeedbackProgressCard from './components/FeedbackProgressCard';
import FeedbackIndex from '../feedback/FeedbackIndex';
import { useFeedbackStats } from '../hooks/useClientSupportData';

export default function DashboardIndex() {
    const navigate = useNavigate();
    const { data: feedbackStatsData, isLoading } = useFeedbackStats();
    const stats = useMemo(() => feedbackStatsData?.data, [feedbackStatsData]);

    if (isLoading) {
        return (
            <Card className="h-screen w-full transition ease-in-out duration-300">
                <GoogleStyleLoader className="h-[70%]" />
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-none">
            <CardContent className="mt-4 px-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FeedbackCard
                        title="Total Feedback"
                        value={stats?.total_feedback || '0'}
                        icon={<MessageSquare size={32} className="text-blue-600" />}
                        color="blue"
                    />
                    <FeedbackCard
                        title="Open Tickets"
                        value={stats?.open_count || '0'}
                        icon={<Clock size={32} className="text-yellow-600" />}
                        color="yellow"
                    />
                    <FeedbackCard
                        title="Resolved"
                        value={stats?.resolved_count || '0'}
                        icon={<CheckCircle size={32} className="text-green-600" />}
                        color="green"
                    />
                    <FeedbackCard
                        title="Avg Rating"
                        value={stats?.avg_satisfaction_rating || '0'}
                        icon={<Star size={32} className="text-yellow-500" />}
                        color="yellow"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FeedbackCard
                        title="Last 7 Days"
                        value={stats?.last_7_days_count || '0'}
                        icon={
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-sm font-medium">7d</span>
                            </div>
                        }
                        color="blue"
                    />
                    <FeedbackCard
                        title="Last 30 Days"
                        value={stats?.last_30_days_count || '0'}
                        icon={
                            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 text-sm font-medium">30d</span>
                            </div>
                        }
                        color="green"
                    />
                    <FeedbackCard
                        title="In Progress"
                        value={stats?.in_progress_count || '0'}
                        icon={<Clock size={32} className="text-orange-600" />}
                        color="orange"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <FeedbackProgressCard
                        title="Feedback by Status"
                        totalCount={stats?.total_feedback || 0}
                        items={[
                            { status: 'open', count: stats?.open_count || 0, label: 'Open' },
                            { status: 'in_progress', count: stats?.in_progress_count || 0, label: 'In Progress' },
                            { status: 'resolved', count: stats?.resolved_count || 0, label: 'Resolved' },
                            { status: 'closed', count: stats?.closed_count || 0, label: 'Closed' },
                            { status: 'cancelled', count: stats?.cancelled_count || 0, label: 'Cancelled' },
                        ]}
                    />
                    <FeedbackProgressCard
                        title="Feedback by Type"
                        totalCount={stats?.total_feedback || 0}
                        items={[
                            { type: 'bug', count: stats?.bug_count || 0, label: 'Bug Reports' },
                            { type: 'complaint', count: stats?.complaint_count || 0, label: 'Complaints' },
                            { type: 'suggestion', count: stats?.suggestion_count || 0, label: 'Suggestions' },
                            { type: 'billing', count: stats?.billing_count || 0, label: 'Billing Issues' },
                            { type: 'feature_request', count: stats?.feature_request_count || 0, label: 'Feature Requests' },
                        ]}
                    />
                </div>

                <Card className="shadow-sm">
                    <CardHeader className="px-4 border-b py-3">
                        <CardTitle>Recent Feedback</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-2">
                        <FeedbackIndex pagination={false} />
                        <div className="mt-2 pt-2 px-2 border-t text-center">
                            <Button
                                onClick={() => navigate('/ticket-management/feedback')}
                                variant="outline"
                                className="lg:w-1/4 w-full bg-transparent border-border"
                            >
                                View All Feedback
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}
