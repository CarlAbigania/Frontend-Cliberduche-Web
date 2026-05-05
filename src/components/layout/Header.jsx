import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaUser, FaSignOutAlt, FaBars, FaTimes, FaBriefcase, FaSun, FaMoon } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';          // <-- new import
import { getUnreadNotificationsCount } from '../../api/axios';

export default function Header({ onToggleSidebar, sidebarOpen }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();                  // <-- use theme context
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        const fetchUnreadCount = async () => {
            try {
                const response = await getUnreadNotificationsCount();
                setUnreadCount(response.data.unread_count);
            } catch (error) {
                console.error('Error fetching unread count:', error);
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 10000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getInitials = () => {
        if (!user) return 'U';
        const first = user.firstname?.[0] || '';
        const last = user.lastname?.[0] || '';
        return (first + last).toUpperCase() || 'U';
    };

    const fullName = user ? `${user.firstname || ''} ${user.lastname || ''}`.trim() : 'User';

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-800/70 bg-slate-950/95 backdrop-blur-xl shadow-sm">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                    {onToggleSidebar && (
                        <button
                            type="button"
                            onClick={onToggleSidebar}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/80 text-slate-400 shadow-sm transition-colors hover:border-emerald-500 hover:text-emerald-300 md:hidden"
                            aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
                        >
                            {sidebarOpen ? (
                                <FaTimes className="h-4 w-4" />
                            ) : (
                                <FaBars className="h-4 w-4" />
                            )}
                        </button>
                    )}
                    {/* Workspace indicator – hidden on tablet/mobile */}
                    <div className="hidden md:flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                        <span>{user?.role === 'admin' ? 'Admin Workspace' : 'Client Workspace'}</span>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Notification Bell */}
                    <button
                        onClick={() => navigate('/notifications')}
                        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/80 text-slate-400 shadow-sm transition-colors hover:border-emerald-500 hover:text-emerald-300"
                    >
                        <FaBell className="h-4 w-4" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white shadow-[0_0_10px_rgba(16,185,129,0.8)]">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* ===== NEW DARK MODE TOGGLE BUTTON ===== */}
                    <button
                        onClick={toggleTheme}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/80 text-slate-400 shadow-sm transition-colors hover:border-emerald-500 hover:text-emerald-300"
                        aria-label="Toggle dark mode"
                    >
                        {theme === 'dark' ? <FaSun className="h-4 w-4" /> : <FaMoon className="h-4 w-4" />}
                    </button>

                    {/* User Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-1 text-left text-sm shadow-sm transition-colors hover:border-emerald-500"
                        >
                            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-emerald-600 text-xs font-semibold text-white shadow-md">
                                {user?.profile_image_url ? (
                                    <img
                                        src={user.profile_image_url}
                                        alt={fullName}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                            e.target.parentElement.textContent = getInitials();
                                        }}
                                    />
                                ) : (
                                    getInitials()
                                )}
                            </div>
                            <div className="hidden sm:block">
                                <p className="max-w-[160px] truncate text-xs font-medium text-slate-200">
                                    {fullName}
                                </p>
                                <p className="text-[11px] capitalize text-slate-400">
                                    {user?.role}
                                </p>
                            </div>
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/95 shadow-lg shadow-slate-900/10 backdrop-blur-xl">
                                <div className="border-b border-slate-700/80 px-4 py-3">
                                    <p className="truncate text-sm font-semibold text-slate-200">
                                        {fullName}
                                    </p>
                                    <p className="truncate text-xs text-slate-400">
                                        {user?.email}
                                    </p>
                                </div>

                                {/* Workspace indicator – only on tablet/mobile */}
                                <div className="md:hidden border-b border-slate-700/80 px-4 py-2">
                                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                                        <span>{user?.role === 'admin' ? 'Admin Workspace' : 'Client Workspace'}</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        navigate('/profile');
                                    }}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                                >
                                    <FaUser className="h-4 w-4" />
                                    <span>Profile</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        logout();
                                    }}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-400 transition-colors hover:bg-rose-900/40 hover:text-rose-300"
                                >
                                    <FaSignOutAlt className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}