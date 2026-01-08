import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { InstallPrompt } from './components/InstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import AdminDashboard from './pages/admin/AdminDashboard';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import LandingPage from './pages/LandingPage';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import InitialSetupPage from './pages/setup/InitialSetupPage';
import StaffDashboard from './pages/staff/StaffDashboard';
import { setupService } from './services/setup';

function App() {
  const [loading, setLoading] = useState(true);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const { setupNeeded } = await setupService.checkInitialSetup();
        setSetupNeeded(setupNeeded);
        if (setupNeeded) {
          navigate('/setup');
        }
      } catch (error) {
        console.error("Failed to check setup status:", error);
        // Handle server error case, maybe show an error page
      } finally {
        setLoading(false);
      }
    };

    checkSetup();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner component
  }

  if (setupNeeded) {
    return (
      <Routes>
        <Route path="/setup" element={<InitialSetupPage />} />
      </Routes>
    );
  }

  return (
    <>
      {/* PWA Components */}
      <OfflineIndicator />
      <InstallPrompt />
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={['MANAGER']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['STAFF']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
