import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PublicRoute({ children }) {
    const { user, token, loading, isAdmin } = useAuth();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
            </div>
        );
    }

    // If user is already logged in, redirect to appropriate dashboard
    if (token && user) {
        if (isAdmin) {
            return <Navigate to="/admin" replace />;
        } else {
            return <Navigate to="/client" replace />;
        }
    }

    // Otherwise, render the public page (login/register)
    return children;
}