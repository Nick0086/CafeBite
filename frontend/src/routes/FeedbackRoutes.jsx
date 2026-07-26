import { Navigate, Route, Routes } from 'react-router';
import { TabsContent } from '@/components/ui/tabs';
import ClientSupportIndex from '@/components/ClientSupport/ClientSupportIndex';
import DashboardIndex from '@/components/ClientSupport/dashboard/DashboardIndex';
import FeedbackIndex from '@/components/ClientSupport/feedback/FeedbackIndex';

export default function FeedbackRoutes() {
    return (
        <Routes>
            <Route path="/" element={<ClientSupportIndex />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route
                    path="dashboard"
                    element={
                        <TabsContent value="dashboard">
                            <DashboardIndex />
                        </TabsContent>
                    }
                />
                <Route
                    path="feedback"
                    element={
                        <TabsContent value="feedback">
                            <FeedbackIndex />
                        </TabsContent>
                    }
                />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    );
}
