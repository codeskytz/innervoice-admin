import { AdminProvider } from './contexts/AdminContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SidebarLayout } from './components/SidebarLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { useNavigate, useLocation } from 'react-router';
import { useEffect } from 'react';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/dashboard');
    }
  }, []);

  return (
    <>
      {location.pathname === '/login' ? (
        <LoginPage />
      ) : (
        <ProtectedRoute>
          <SidebarLayout>
            {location.pathname === '/dashboard' && <DashboardPage />}
            {location.pathname === '/users' && <UsersPage />}
            {location.pathname === '/categories' && <CategoriesPage />}
          </SidebarLayout>
        </ProtectedRoute>
      )}
    </>
  );
}

export function App() {
  return (
    <AdminProvider>
      <AppContent />
    </AdminProvider>
  );
}
