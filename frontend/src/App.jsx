import { ToastContainer } from 'react-toastify';
import { Navigate, Route, Routes } from 'react-router';

import PrivateRoutes from '@/common/PrivateRoutes';
import SidebarIndex from '@/components/Sidebar/SidebarIndex';
import DashboardIndex from '@/components/Dashboard/DashboardIndex';
import QrCodeIndex from '@/components/QrCode/QrCodeIndex';
import ProfileManagementIndex from '@/components/ProfileManagement/ProfileManagementIndex';
import CustomerMenuIndex from '@/components/CustomerMenu/CustomerMenuIndex';
import AuthenticationIndex from '@/components/Authentication/AuthenticationIndex';
import ResetPassword from '@/components/Authentication/ResetPassword';
import Registration from '@/components/Authentication/components/Registration/Registration';
import MenuRoutes from '@/routes/MenuRoutes';
import FeedbackRoutes from '@/routes/FeedbackRoutes';
import { PermissionsProvider } from '@/contexts/PermissionsContext';

import '@/App.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-image-crop/dist/ReactCrop.css';

function App() {
  return (
    <>
      <Routes>
        <Route path="/menu" element={<Navigate to="/login" replace />} />
        <Route path="/menu/:restaurantId/:tableId" element={<CustomerMenuIndex />} />

        <Route path="/login" element={<AuthenticationIndex />} />
        <Route path="/register-user" element={<Registration />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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
