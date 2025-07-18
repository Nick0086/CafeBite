import { ToastContainer } from 'react-toastify';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { Toaster } from './components/ui/toaster';
import PrivateRoutes from './common/PrivateRoutes';


import Login from './components/Authentication/Login';
import ResetPassword from './components/Authentication/ResetPassword';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import MenuRoutes from './routes/MenuRoutes';
// import QrCodeManagerIndex from './components/Table-QrCode/table-qrcodeIndex';
// import CustomerMenuIndex from './components/CustomerMenu/CustomerMenuIndex';
// import OrderRoutes from './routes/order-routes';
// import InvoiceRoutes from './routes/InvoiceRoutes';

import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-image-crop/dist/ReactCrop.css';
import Registration from './components/Authentication/Registration/Registration';
import { PermissionsProvider } from './contexts/PermissionsContext';
import QrCodeManagerIndex from './components/Table-QrCode/table-qrcodeIndex';
import CustomerMenuIndex from './components/CustomerMenu/CustomerMenuIndex';
import ProfileManagement from './components/ProfileManagement/ProfileManagement';
import ClinetSupportIndex from './components/ClinetSupport/index';
import FeedbackRoutes from './routes/FeedbackRoutes';


function App() {

  const location = useLocation();
  const path = location.pathname.split('/');
  const restrictedRoutes = ['login', 'register-user', 'reset-password'];
  const fullScreen = ['tamplate-editor'];
  const publicRoutes = ['menu']; // Add this for customer routes

  const isRestrictedRoute = restrictedRoutes.some(route => path.includes(route));
  const isfullScreen = fullScreen?.some(route => path.includes(route));
  const isPublicRoute = publicRoutes.some(route => path.includes(route));

  return (
    <>

      {
        (!isRestrictedRoute && !isPublicRoute) && (
          <PermissionsProvider>
            <Routes>
              <Route path="/" element={<PrivateRoutes />}>
                <Route path='' element={<Sidebar isfullScreen={isfullScreen} />}>
                  <Route path='' element={<div>👋 Hyy</div>} />
                  {/* <Route path="/dashboard" element={<Dashboard />} /> */}
                  <Route path="/menu-management/*" element={<MenuRoutes />} />
                  <Route path="/qr-management" element={<QrCodeManagerIndex />} />
                  <Route path="/profile-management" element={<ProfileManagement />} />
                  <Route path="/ticket-management/*" element={<FeedbackRoutes/>} />
                  {/* <Route path="/order-management/*" element={<OrderRoutes />} /> */}
                  {/* <Route path="/invoice-management/*" element={<InvoiceRoutes />} /> */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Route>
            </Routes>
          </PermissionsProvider>
        )
      }

      {/* Public Customer Routes */}
      {isPublicRoute && (
        <Routes>
          <Route path="/menu/:restaurantId/:tableId" element={<CustomerMenuIndex />} />
          <Route path="/menu/*" element={<p>No Accesss</p>} />
        </Routes>
      )}

      {
        isRestrictedRoute && (
          <Routes >
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/register-user" element={<Registration />} />
            <Route exact path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )
      }



      {/* Notifications */}
      <ToastContainer limit={3} />

      <Toaster
        position="top-center"
        expand={true}
        toastOptions={{
          className: 'list-none'
        }}
      />
    </>
  );
}

export default App;