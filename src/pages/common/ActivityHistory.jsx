import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    FaClock,
    FaSpinner,
    FaUser,
    FaSignInAlt,
    FaSignOutAlt,
    FaPlusCircle,
    FaEdit,
    FaTrashAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaCog,
    FaListAlt,
    FaUsers,
    FaSearch,
    FaTimes,
} from 'react-icons/fa';
import api, { getActivityLogs } from '../../api/axios';

// Helper to format date strings
const formatDateIfNeeded = (value) => {
    if (typeof value !== 'string') return value;
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z?)?$/;
    if (isoDateRegex.test(value)) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }
    }
    return value;
};

// Inline Metadata Viewer
const MetadataViewer = ({ data, level = 0 }) => {
    if (data === null || data === undefined) return <span className="text-slate-400">null</span>;

    if (typeof data !== 'object') {
        return <span className="text-slate-700 dark:text-slate-300">{formatDateIfNeeded(String(data))}</span>;
    }

    if (Array.isArray(data)) {
        return (
            <div className="space-y-1" style={{ marginLeft: level * 12 }}>
                {data.map((item, idx) => (
                    <div key={idx} className="flex">
                        <span className="text-slate-500 mr-2">-</span>
                        <MetadataViewer data={item} level={level + 1} />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-1" style={{ marginLeft: level * 12 }}>
            {Object.entries(data).map(([key, value]) => {
                const isUserField = ['client', 'created_by', 'updated_by', 'deleted_by', 'approved_by', 'rejected_by', 'cancelled_by', 'edited_by'].includes(key);
                let displayValue;

                if (isUserField && value && typeof value === 'object' && value.name) {
                    displayValue = (
                        <span>
                            {value.name} <span className="text-slate-400 text-xs">(ID: {value.id})</span>
                        </span>
                    );
                } else {
                    displayValue = <MetadataViewer data={value} level={level + 1} />;
                }

                return (
                    <div key={key} className="flex flex-wrap">
                        <span className="text-slate-500 font-mono text-sm min-w-[100px]">{key}:</span>
                        <div className="flex-1">{displayValue}</div>
                    </div>
                );
            })}
        </div>
    );
};

export default function ActivityHistory() {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [activityLogs, setActivityLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Tab state – consistent with ClientManagement
    const [activeTab, setActiveTab] = useState('my_actions'); // for admin, default to 'my_actions'; for non-admin it's always 'all'
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Define tabs with icons
    const tabs = [
        { key: 'all', label: 'All Actions', icon: FaListAlt },
        { key: 'my_actions', label: 'My Actions', icon: FaUser },
        { key: 'client_actions', label: 'Client Actions', icon: FaUsers },
    ];

    // If user is not admin, no tabs are shown (only 'all' actions are relevant)
    const showTabs = user?.role === 'admin';

    // Debounce search to avoid too many requests
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Reset page when tab or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, debouncedSearchTerm]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        if (user?.role === 'admin') {
            fetchActivityLogs();
        } else {
            fetchMyActivityLogs();
        }
    }, [token, user, navigate, currentPage, activeTab, debouncedSearchTerm]);

    const fetchActivityLogs = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                filter: activeTab !== 'all' ? activeTab : undefined,
            };
            // Only send search if tab is client_actions
            if (activeTab === 'client_actions' && debouncedSearchTerm) {
                params.search = debouncedSearchTerm;
            }
            const response = await getActivityLogs(params);
            const logs = response.data.activity_logs;
            setActivityLogs(logs?.data || []);
            setTotalPages(logs?.last_page || 1);
        } catch (error) {
            console.error('Error fetching activity logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyActivityLogs = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/auth/my-activity?page=${currentPage}`);
            const logs = response.data.activity_logs;
            setActivityLogs(logs?.data || []);
            setTotalPages(logs?.last_page || 1);
        } catch (error) {
            console.error('Error fetching my activity logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchClear = () => {
        setSearchTerm('');
    };

    // Light background colors for icon wrapper – based on action type
    const getIconBgColor = (action) => {
        switch (action.toLowerCase()) {
            case 'login':
                return 'bg-green-100';
            case 'logout':
                return 'bg-red-100';
            case 'create':
                return 'bg-blue-100';
            case 'update':
                return 'bg-yellow-100';
            case 'delete':
                return 'bg-red-100';
            case 'approve':
                return 'bg-green-100';
            case 'reject':
                return 'bg-red-100';
            default:
                return 'bg-gray-100';
        }
    };

    const getDarkIconBgColor = (action) => {
        switch (action.toLowerCase()) {
            case 'login':
                return 'dark:bg-green-900/30';
            case 'logout':
                return 'dark:bg-red-900/30';
            case 'create':
                return 'dark:bg-blue-900/30';
            case 'update':
                return 'dark:bg-yellow-900/30';
            case 'delete':
                return 'dark:bg-red-900/30';
            case 'approve':
                return 'dark:bg-green-900/30';
            case 'reject':
                return 'dark:bg-red-900/30';
            default:
                return 'dark:bg-gray-800';
        }
    };

    const getActionIcon = (action) => {
        const iconClass = "h-5 w-5";
        switch (action.toLowerCase()) {
            case 'login':
                return <FaSignInAlt className={iconClass} />;
            case 'logout':
                return <FaSignOutAlt className={iconClass} />;
            case 'create':
                return <FaPlusCircle className={iconClass} />;
            case 'update':
                return <FaEdit className={iconClass} />;
            case 'delete':
                return <FaTrashAlt className={iconClass} />;
            case 'approve':
                return <FaCheckCircle className={iconClass} />;
            case 'reject':
                return <FaTimesCircle className={iconClass} />;
            default:
                return <FaCog className={iconClass} />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Main card – same structure as ClientManagement */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm dark:bg-slate-800 dark:border-slate-700">
                {/* Header with title and search (search only for admin) */}
                <div className="px-4 pt-4 pb-2 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 dark:border-slate-700 dark:bg-slate-900">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                        <FaClock className="inline mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" />
                        {user?.role === 'admin' ? 'Activity Logs' : 'Your Activity'}
                    </h2>
                    {/* Search input – only visible for admin, and only searches by client name when on Client Actions tab */}
                    {user?.role === 'admin' && (
                        <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-none sm:w-64">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by client name..."
                                    className="w-full bg-white border border-gray-300 rounded pl-10 pr-8 py-2 text-sm text-gray-900 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:border-green-400"
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={handleSearchClear}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
                                        title="Clear search"
                                    >
                                        <FaTimes className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </form>
                    )}
                </div>

                {/* Tabs – only shown for admin, styled exactly like ClientManagement */}
                {showTabs && (
                    <div className="flex border-b border-gray-200 overflow-x-auto dark:border-slate-700">
                        {tabs.map((tab, index) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${index !== tabs.length - 1 ? 'border-r border-gray-200 dark:border-slate-700' : ''
                                    } ${activeTab === tab.key
                                        ? 'text-green-600 border-b-2 border-green-600 dark:text-green-400 dark:border-green-400'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                <tab.icon className="h-4 w-4 mr-2" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content area */}
                <div className="overflow-x-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <FaSpinner className="h-8 w-8 text-slate-400 animate-spin dark:text-slate-500" />
                        </div>
                    ) : activityLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-center p-4">
                            <FaClock className="h-12 w-12 mb-3 opacity-50 dark:opacity-30" />
                            <p className="font-medium">No activity yet</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {activityLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="p-4 bg-white rounded-lg border border-slate-200 transition-all hover:shadow-md dark:bg-slate-800 dark:border-slate-700 dark:hover:shadow-lg"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className={`p-2 rounded-lg ${getIconBgColor(log.action)} ${getDarkIconBgColor(log.action)}`}>
                                                    {getActionIcon(log.action)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold text-sm uppercase tracking-wide text-slate-700 dark:text-slate-300">
                                                            {log.action}
                                                        </span>
                                                        {log.user && log.user.id !== user?.id && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-600 text-slate-50 dark:bg-slate-700 dark:text-slate-200">
                                                                <FaUser className="h-3 w-3 mr-1" />
                                                                {log.user.full_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-600 mt-1 dark:text-slate-400">
                                                        {log.description}
                                                    </p>
                                                    {log.metadata && (
                                                        <details className="mt-2 text-xs">
                                                            <summary className="cursor-pointer text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium">
                                                                Details
                                                            </summary>
                                                            <div className="mt-2 bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700">
                                                                <MetadataViewer data={log.metadata} />
                                                            </div>
                                                        </details>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right text-xs text-slate-400 whitespace-nowrap dark:text-slate-500">
                                                <p>{new Date(log.created_at).toLocaleDateString()}</p>
                                                <p>{new Date(log.created_at).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:disabled:opacity-40"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                                        ? 'bg-blue-600 text-white dark:bg-blue-700'
                                                        : 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}