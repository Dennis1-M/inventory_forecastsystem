// App.tsx
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AdminDashboardLayout from './layouts/AdminDashboard'; // Layout wrapper
import ManagerDashboard from './layouts/ManagerDashboard';
import StaffDashboard from './layouts/StaffDashboard';
import AdminDashboardPage from './pages/AdminDashboardPage'; // New content page
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes - Role-based */}
          <Route path="/superadmin" element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />
          
             {/* Admin route with layout wrapper */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
              <AdminDashboardLayout>
                <Routes>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />

                  {/* Add more admin routes here as needed */}
                  {/* Add more admin routes here as needed */}
                  {/* Add more admin routes here as needed */}

                </Routes>
              </AdminDashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/manager" element={
            <ProtectedRoute allowedRoles={['MANAGER']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={['STAFF']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
          
          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;