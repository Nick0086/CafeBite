

import React from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { TabsContent } from '@/components/ui/tabs'
import ClinetSupportIndex from '@/components/ClinetSupport'
import DashboardIndex from '@/components/ClinetSupport/dashboard/DashboardINdex'
import FeedBackIndex from '@/components/ClinetSupport/feedback/FeedBackIndex'

export default function FeedbackRoutes() {
    return (
        <Routes>
            <Route path="/" element={<ClinetSupportIndex />}>

                <Route index element={<Navigate to="dashboard" replace />} />

                <Route path="dashboard" element={<TabsContent value="dashboard"><DashboardIndex /></TabsContent>} />
                <Route path="feedback" element={<TabsContent value="feedback"><FeedBackIndex /></TabsContent>} />

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
        </Routes>
    )
}
