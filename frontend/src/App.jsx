import { ToastContainer } from 'react-toastify';
import { Navigate, Route, Routes } from 'react-router';

import PrivateRoutes from '@/common/PrivateRoutes';
import SidebarIndex from '@/components/Sidebar/SidebarIndex';
import DashboardIndex from '@/components/Dashboard/DashboardIndex';
import QrCodeIndex from '@/components/QrCode/QrCodeIndex';
import ProfileManagementIndex from '@/components/ProfileManagement/ProfileManagementIndex';
import CustomerMenuIndex from '@/components/CustomerMenu/CustomerMenuIndex';
import LoginIndex from '@/components/Authentication/Login/LoginIndex';
import ResetPasswordIndex from '@/components/Authentication/ResetPassword/ResetPasswordIndex';
import RegistrationIndex from '@/components/Authentication/Registration/RegistrationIndex';
import MenuRoutes from '@/routes/MenuRoutes';
import FeedbackRoutes from '@/routes/FeedbackRoutes';
import { PermissionsProvider } from '@/contexts/PermissionsContext';
import AdminPrivateRoutes from '@/common/AdminPrivateRoutes';
import AdminLoginIndex from '@/components/Admin/Auth/AdminLoginIndex';
import AdminLeadsIndex from '@/components/Admin/Leads/AdminLeadsIndex';

import '@/App.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-image-crop/dist/ReactCrop.css';

function App() {
  return (
    <>
      <Routes>
        <Route path="/menu" element={<Navigate to="/login" replace />} />
        <Route path="/menu/:restaurantId/:tableId" element={<CustomerMenuIndex />} />

        <Route path="/login" element={<LoginIndex />} />
        <Route path="/register-user" element={<RegistrationIndex />} />
        <Route path="/reset-password" element={<ResetPasswordIndex />} />

        {/* Admin CRM Routes */}
        <Route path="/admin/login" element={<AdminLoginIndex />} />
        <Route path="/admin" element={<AdminPrivateRoutes />}>
          <Route index element={<Navigate to="/admin/leads" replace />} />
          <Route path="leads" element={<AdminLeadsIndex />} />
          <Route path="*" element={<Navigate to="/admin/leads" replace />} />
        </Route>

        <Route element={<PermissionsProvider><PrivateRoutes /></PermissionsProvider>}>
          <Route element={<SidebarIndex />}>
            <Route index element={<DashboardIndex />} />
            <Route path="menu-management/*" element={<MenuRoutes />} />
            <Route path="qr-management" element={<QrCodeIndex />} />
            <Route path="profile-management" element={<ProfileManagementIndex />} />
            <Route path="ticket-management/*" element={<FeedbackRoutes />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <ToastContainer limit={3} />
    </>
  );
}

export default App;
