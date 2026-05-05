import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth >= 768) {
                setSidebarOpen(true);
            }
        }
    }, []);

    const role = user?.role === 'admin' ? 'admin' : 'client';

    return (
        <div className="min-h-screen bg-transparent relative">

            {/* Mobile/tablet overlay when sidebar is open */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <Sidebar
                role={role}
                sidebarOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                handleLogout={handleLogout}
            />

            <div
                className={`relative transition-all duration-300 ml-0 ${
                    sidebarOpen ? 'md:ml-64' : 'md:ml-20'
                }`}
            >
                <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </main>
            </div>
        </div>
    );
}