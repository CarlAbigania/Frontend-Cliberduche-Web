import React, { useState, useEffect, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
    getAppointments,
    getServices,
    updateAppointment,
    cancelAppointment,
    getAvailableSlots
} from '../../api/axios';
import {
    FaSearch,
    FaUndo,
    FaSpinner,
    FaCheckCircle,
    FaTimesCircle,
    FaCalendarCheck,
    FaTimes
} from 'react-icons/fa';
// Import shared date/time utilities
import {
    formatDate,
    formatTimeTo12Hour,
    getMonthRange
} from '../../utils/dateTimeUtils';

export default function AdminAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Filter states
    const [selectedDate, setSelectedDate] = useState(null);
    const [status, setStatus] = useState('');
    const [serviceType, setServiceType] = useState('');
    const [search, setSearch] = useState('');

    // Options for dropdowns
    const [serviceOptions, setServiceOptions] = useState([]);
    const statusOptions = ['pending', 'confirmed', 'cancelled', 'completed'];

    // Calendar highlighting: store dates that have available slots
    const [availableDates, setAvailableDates] = useState(new Set());
    const [loadingAvailability, setLoadingAvailability] = useState(false);

    // For button loading states
    const [processingId, setProcessingId] = useState(null);

    // Message state for success/error feedback
    const [message, setMessage] = useState({ type: '', text: '' });

    // Cancel modal state
    const [cancelModal, setCancelModal] = useState({
        show: false,
        appointmentId: null,
        reason: '',
        error: ''
    });

    // Auto-dismiss message after 3 seconds
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Fetch service types once
    useEffect(() => {
        getServices()
            .then(res => setServiceOptions(res.data.services || []))
            .catch(() => setMessage({ type: 'error', text: 'Failed to load service types' }));
    }, []);

    // Format date and time for display (admin version: date + start time in 12‑hour)
    const formatAdminDateTime = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return '';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'Invalid Date';
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const formattedTime = formatTimeTo12Hour(timeStr);
            return `${formattedDate} at ${formattedTime}`;
        } catch (e) {
            return 'Invalid Date';
        }
    };

    // Fetch available slots for the currently viewed month
    const fetchMonthAvailability = useCallback(async (monthDate) => {
        if (!monthDate) return;
        const { start, end } = getMonthRange(monthDate);
        setLoadingAvailability(true);
        try {
            const res = await getAvailableSlots(start, end);
            const datesWithSlots = new Set(res.data.slots.map(slot => slot.date));
            setAvailableDates(datesWithSlots);
        } catch (error) {
            console.error('Failed to fetch availability', error);
            setMessage({ type: 'error', text: 'Could not load availability' });
        } finally {
            setLoadingAvailability(false);
        }
    }, []);

    // Fetch main appointments with filters
    const fetchAppointments = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                date: selectedDate ? formatDate(selectedDate) : undefined,
                status: status || undefined,
                service_type: serviceType || undefined,
                search: search || undefined,
            };
            const res = await getAppointments(params);
            setAppointments(res.data.appointments.data || []);
            setPagination(res.data.appointments);
            setCurrentPage(page);
        } catch (error) {
            console.error('Failed to fetch appointments', error);
            setMessage({ type: 'error', text: 'Failed to load appointments' });
        } finally {
            setLoading(false);
        }
    }, [selectedDate, status, serviceType, search]);

    // Auto-apply filters when date, status, or service type changes
    useEffect(() => {
        fetchAppointments(1);
    }, [selectedDate, status, serviceType, fetchAppointments]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAppointments(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, fetchAppointments]);

    // Initial load of availability for current month
    useEffect(() => {
        const today = new Date();
        fetchMonthAvailability(today);
    }, [fetchMonthAvailability]);

    const handleCalendarChange = (date) => {
        setSelectedDate(date);
    };

    const handleActiveStartDateChange = ({ activeStartDate }) => {
        if (activeStartDate) {
            fetchMonthAvailability(activeStartDate);
        }
    };

    const clearFilters = () => {
        setSelectedDate(null);
        setStatus('');
        setServiceType('');
        setSearch('');
        // fetchAppointments will be triggered by the useEffect
    };

    // Handle status change with error catching
    const handleStatusChange = async (id, newStatus) => {
        setProcessingId(id);
        try {
            await updateAppointment(id, { status: newStatus });
            setMessage({ type: 'success', text: `Appointment marked as ${newStatus}` });
            fetchAppointments(currentPage);
            if (selectedDate) fetchMonthAvailability(selectedDate);
        } catch (error) {
            if (error.response?.status === 422) {
                const data = error.response.data;
                setMessage({ type: 'error', text: data.message || 'Validation error' });
            } else {
                setMessage({ type: 'error', text: 'Failed to update status' });
            }
        } finally {
            setProcessingId(null);
        }
    };

    // Open cancel modal instead of prompt
    const openCancelModal = (id) => {
        setCancelModal({
            show: true,
            appointmentId: id,
            reason: '',
            error: ''
        });
    };

    // Handle cancel submission from modal
    const handleCancelSubmit = async () => {
        if (!cancelModal.reason.trim()) {
            setCancelModal(prev => ({ ...prev, error: 'Cancellation reason is required' }));
            return;
        }

        setProcessingId(cancelModal.appointmentId);
        try {
            await cancelAppointment(cancelModal.appointmentId, { reason: cancelModal.reason });
            setMessage({ type: 'success', text: 'Appointment cancelled successfully' });
            setCancelModal({ show: false, appointmentId: null, reason: '', error: '' });
            fetchAppointments(currentPage);
            if (selectedDate) fetchMonthAvailability(selectedDate);
        } catch (error) {
            if (error.response?.status === 422) {
                const data = error.response.data;
                setCancelModal(prev => ({ ...prev, error: data.message || 'Validation failed' }));
            } else {
                setCancelModal(prev => ({ ...prev, error: 'Cancellation failed. Please try again.' }));
            }
        } finally {
            setProcessingId(null);
        }
    };

    // Custom tile class for calendar highlighting (available slots)
    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateStr = formatDate(date);
            if (availableDates.has(dateStr)) {
                return 'has-availability';
            }
        }
        return null;
    };

    // Count active filters for summary
    const activeFilterCount = [
        selectedDate,
        status,
        serviceType,
        search
    ].filter(Boolean).length;

    // Message Alert Component
    const MessageAlert = () => {
        if (!message.text) return null;
        return (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${message.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
                }`}>
                {message.text}
            </div>
        );
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <MessageAlert />

            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Appointments</h1>

            {/* Top section: Calendar + Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-start">
                {/* Calendar */}
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <FaCalendarCheck className="text-blue-600 dark:text-blue-400" />
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Select Date</h2>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <span className="w-3 h-3 bg-blue-200 dark:bg-blue-900/50 rounded-full mr-2"></span>
                            <span>Available</span>
                        </div>
                    </div>
                    <div className="relative">
                        <Calendar
                            onChange={handleCalendarChange}
                            value={selectedDate}
                            tileClassName={tileClassName}
                            onActiveStartDateChange={handleActiveStartDateChange}
                            className="small-calendar"
                        />
                        {loadingAvailability && (
                            <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center rounded-lg">
                                <FaSpinner className="animate-spin text-blue-600 dark:text-blue-400 text-2xl" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            >
                                <option value="">All</option>
                                {statusOptions.map(opt => (
                                    <option key={opt} value={opt}>
                                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Type</label>
                            <select
                                value={serviceType}
                                onChange={e => setServiceType(e.target.value)}
                                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            >
                                <option value="">All</option>
                                {serviceOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search (Name/ID)</label>
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Client name or appointment ID"
                                    className="w-full border rounded pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={clearFilters}
                            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2 transition-colors"
                        >
                            <FaUndo /> Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Filters Summary */}
            {activeFilterCount > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Active filters:</span>
                    {selectedDate && (
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full flex items-center gap-1">
                            <FaCalendarCheck className="text-xs" />
                            {formatDate(selectedDate)}
                        </span>
                    )}
                    {status && (
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">
                            Status: {status}
                        </span>
                    )}
                    {serviceType && (
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">
                            Service: {serviceType}
                        </span>
                    )}
                    {search && (
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">
                            Search: "{search}"
                        </span>
                    )}
                </div>
            )}

            {/* Appointments Table */}
            {loading ? (
                <div className="text-center py-10">
                    <FaSpinner className="animate-spin text-4xl text-blue-600 dark:text-blue-400 mx-auto" />
                </div>
            ) : (
                <>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {appointments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                            No appointments found. Try clearing filters.
                                        </td>
                                    </tr>
                                ) : (
                                    appointments.map(apt => (
                                        <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{apt.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                {apt.client?.full_name || apt.client?.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{apt.service_type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                {formatAdminDateTime(apt.appointment_date, apt.appointment_time)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${apt.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                                        apt.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                                            apt.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                                                                'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'}`}>
                                                    {apt.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {apt.status === 'pending' && (
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => handleStatusChange(apt.id, 'confirmed')}
                                                            disabled={processingId === apt.id}
                                                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 flex items-center gap-1 disabled:opacity-50"
                                                            title="Confirm"
                                                        >
                                                            {processingId === apt.id ? (
                                                                <FaSpinner className="animate-spin" />
                                                            ) : (
                                                                <FaCheckCircle />
                                                            )}
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => openCancelModal(apt.id)}
                                                            disabled={processingId === apt.id}
                                                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 flex items-center gap-1 disabled:opacity-50"
                                                            title="Cancel"
                                                        >
                                                            {processingId === apt.id ? (
                                                                <FaSpinner className="animate-spin" />
                                                            ) : (
                                                                <FaTimesCircle />
                                                            )}
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                                {apt.status === 'confirmed' && (
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => handleStatusChange(apt.id, 'completed')}
                                                            disabled={processingId === apt.id}
                                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 flex items-center gap-1 disabled:opacity-50"
                                                            title="Complete"
                                                        >
                                                            {processingId === apt.id ? (
                                                                <FaSpinner className="animate-spin" />
                                                            ) : (
                                                                <FaCheckCircle />
                                                            )}
                                                            Complete
                                                        </button>
                                                        <button
                                                            onClick={() => openCancelModal(apt.id)}
                                                            disabled={processingId === apt.id}
                                                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 flex items-center gap-1 disabled:opacity-50"
                                                            title="Cancel"
                                                        >
                                                            {processingId === apt.id ? (
                                                                <FaSpinner className="animate-spin" />
                                                            ) : (
                                                                <FaTimesCircle />
                                                            )}
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                                {apt.status === 'completed' && (
                                                    <span className="text-gray-400 dark:text-gray-500 text-sm">No actions</span>
                                                )}
                                                {apt.status === 'cancelled' && (
                                                    <span className="text-gray-400 dark:text-gray-500 text-sm">Cancelled</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.last_page > 1 && (
                        <div className="mt-4 flex justify-center">
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => fetchAppointments(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                {[...Array(pagination.last_page).keys()].map(page => (
                                    <button
                                        key={page + 1}
                                        onClick={() => fetchAppointments(page + 1)}
                                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${pagination.current_page === page + 1
                                                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {page + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => fetchAppointments(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    )}
                </>
            )}

            {/* Cancel Modal */}
            {cancelModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Cancel Appointment</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Please provide a reason for cancelling this appointment.
                        </p>
                        {cancelModal.error && (
                            <p className="text-red-600 dark:text-red-400 text-sm mb-4">{cancelModal.error}</p>
                        )}
                        <textarea
                            value={cancelModal.reason}
                            onChange={(e) => setCancelModal(prev => ({ ...prev, reason: e.target.value, error: '' }))}
                            rows="3"
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none mb-4"
                            placeholder="Reason for cancellation..."
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancelSubmit}
                                disabled={processingId === cancelModal.appointmentId}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                {processingId === cancelModal.appointmentId ? (
                                    <FaSpinner className="h-5 w-5 animate-spin inline" />
                                ) : (
                                    'Confirm Cancel'
                                )}
                            </button>
                            <button
                                onClick={() => setCancelModal({ show: false, appointmentId: null, reason: '', error: '' })}
                                className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}