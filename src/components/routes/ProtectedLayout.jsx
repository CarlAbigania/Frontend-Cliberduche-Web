import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';

export default function ProtectedLayout({ children, allowedRoles }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If allowedRoles is specified, check if user's role is included
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate default dashboard based on role
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    // For any other authenticated role (client), go to client dashboard
    return <Navigate to="/client" replace />;
  }

  return (
    <DashboardLayout>
      {children !== undefined ? children : <Outlet />}
    </DashboardLayout>
  );
}