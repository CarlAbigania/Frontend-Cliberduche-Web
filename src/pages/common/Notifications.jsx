// src/pages/Notifications.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheckCircle, FaTrash, FaSpinner } from 'react-icons/fa';
import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    getUnreadNotificationsCount,
} from '../../api/axios';

export default function Notifications() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [unreadCount, setUnreadCount] = useState(0);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchNotifications();
        fetchUnreadCount();
        const interval = setInterval(() => {
            fetchNotifications();
            fetchUnreadCount();
        }, 5000);
        return () => clearInterval(interval);
    }, [token, navigate, page]);

    const fetchNotifications = async () => {
        try {
            const response = await getNotifications(page);
            const paginator = response.data.notifications;
            setNotifications(paginator.data || []);
            setPagination({
                currentPage: paginator.current_page,
                lastPage: paginator.last_page,
                total: paginator.total,
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await getUnreadNotificationsCount();
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationRead(id);
            await fetchNotifications();
            await fetchUnreadCount();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsRead();
            await fetchNotifications();
            await fetchUnreadCount();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
            await fetchNotifications();
            await fetchUnreadCount();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.is_read)
        : notifications;

    const goToPage = (newPage) => {
        if (newPage >= 1 && newPage <= (pagination?.lastPage || 1)) {
            setPage(newPage);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6 dark:bg-slate-800 dark:border-slate-700">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between dark:border-slate-700 dark:bg-slate-900">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center dark:text-slate-100">
                        <FaBell className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                        Notifications
                    </h2>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Filter tabs */}
                <div className="px-6 py-3 flex gap-4 border-b border-gray-200 dark:border-slate-700">
                    <button
                        onClick={() => setFilter('all')}
                        className={`text-sm font-medium transition-colors pb-2 ${filter === 'all'
                                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                                : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                    >
                        All ({pagination?.total || 0})
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`text-sm font-medium transition-colors pb-2 ${filter === 'unread'
                                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                                : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                    >
                        Unread ({unreadCount})
                    </button>
                </div>
            </div>

            {/* Notifications list */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <FaSpinner className="h-8 w-8 text-gray-400 animate-spin dark:text-slate-500" />
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 text-center p-4 dark:text-slate-400">
                        <FaBell className="h-12 w-12 mb-3 opacity-50 dark:opacity-30" />
                        <p className="font-medium">
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </p>
                    </div>
                ) : (
                    <>
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-6 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                    } dark:hover:bg-slate-700/50`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                                                {notification.title}
                                            </h3>
                                            {!notification.is_read && (
                                                <span className="inline-flex items-center justify-center h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                                            )}
                                        </div>
                                        <p className="text-gray-700 text-sm mb-2 dark:text-slate-300">
                                            {notification.content}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!notification.is_read && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                title="Mark as read"
                                                className="text-gray-400 hover:text-gray-600 transition-colors p-2 dark:text-slate-500 dark:hover:text-slate-300"
                                            >
                                                <FaCheckCircle className="h-5 w-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(notification.id)}
                                            title="Delete"
                                            className="text-gray-400 hover:text-red-600 transition-colors p-2 dark:text-slate-500 dark:hover:text-red-400"
                                        >
                                            <FaTrash className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination controls */}
                        {pagination && pagination.lastPage > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between dark:border-slate-700 dark:text-slate-300">
                                <button
                                    onClick={() => goToPage(page - 1)}
                                    disabled={page === 1}
                                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:disabled:opacity-40"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-700 dark:text-slate-300">
                                    Page {page} of {pagination.lastPage}
                                </span>
                                <button
                                    onClick={() => goToPage(page + 1)}
                                    disabled={page === pagination.lastPage}
                                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}