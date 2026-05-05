import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
    FaCalendar,
    FaPlus,
    FaTimes,
    FaSpinner,
    FaClock,
    FaCheckCircle,
    FaHourglassEnd,
    FaCalendarCheck,
} from 'react-icons/fa';
import axios from '../../api/axios';
// Import our utility functions
import {
    formatDate,
    formatTimeRange,
    formatAppointmentDateTime,
    getMonthRange
} from '../../utils/dateTimeUtils';

export default function ClientAppointments() {
    const { token, user, isApproved, isPending, isRejected } = useAuth();
    const navigate = useNavigate();

    // Data states
    const [appointments, setAppointments] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });
    const [currentPage, setCurrentPage] = useState(1);

    // Calendar availability (for the form)
    const [availableDates, setAvailableDates] = useState(new Set());
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [formCalendarMonth, setFormCalendarMonth] = useState(new Date());

    // Available times for selected date
    const [availableTimes, setAvailableTimes] = useState([]);
    const [loadingTimes, setLoadingTimes] = useState(false);

    // UI states
    const [showForm, setShowForm] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [accessError, setAccessError] = useState('');

    // Cancel modal
    const [cancelModal, setCancelModal] = useState({ show: false, appointmentId: null, reason: '' });

    // Form data
    const [formData, setFormData] = useState({
        service_type: '',
        appointment_date: '',
        appointment_time: '',
        notes: '',
    });

    // ------------------------------------------------------------------------
    // API calls
    // ------------------------------------------------------------------------
    const fetchServices = async () => {
        try {
            const res = await axios.get('/appointments/services');
            const servData = res.data;
            if (servData && servData.services && Array.isArray(servData.services)) {
                setServices(servData.services);
            } else if (Array.isArray(servData)) {
                setServices(servData);
            }
        } catch (error) {
            console.error('Failed to fetch services', error);
        }
    };

    // Fetch available slots for a given month (to highlight dates)
    const fetchAvailableSlots = async (start, end) => {
        setLoadingAvailability(true);
        try {
            const res = await axios.get(`/appointments/available-slots?start_date=${start}&end_date=${end}`);
            const datesWithSlots = new Set(res.data.slots.map(slot => slot.date));
            setAvailableDates(datesWithSlots);
        } catch (error) {
            console.error('Failed to fetch availability', error);
            setAvailableDates(new Set());
        } finally {
            setLoadingAvailability(false);
        }
    };

    // Fetch available times for a specific date
    const fetchAvailableTimes = async (date) => {
        if (!date) return;
        setLoadingTimes(true);
        try {
            const res = await axios.get(`/appointments/available-slots?start_date=${date}&end_date=${date}`);
            let times = res.data.slots
                .filter(slot => slot.date === date)
                .map(slot => {
                    // Use actual start and end from the slot
                    const display = formatTimeRange(slot.time, slot.end_time);
                    return { start: slot.time, display };
                });

            // Client‑side filtering: if the selected date is today, remove times that have already passed
            const todayStr = formatDate(new Date());
            if (date === todayStr) {
                const now = new Date();
                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                times = times.filter(slot => {
                    const [hour, minute] = slot.start.split(':').map(Number);
                    const slotMinutes = hour * 60 + minute;
                    return slotMinutes > currentMinutes; // slot must start after current time
                });
            }

            setAvailableTimes(times);
        } catch (error) {
            console.error('Failed to fetch available times', error);
            setAvailableTimes([]);
        } finally {
            setLoadingTimes(false);
        }
    };

    const fetchAppointments = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page };
            const res = await axios.get('/appointments', { params });
            const aptData = res.data;

            let appointmentsData = [];
            let paginator = {};

            if (aptData && aptData.appointments) {
                paginator = aptData.appointments;
                if (paginator.data && Array.isArray(paginator.data)) {
                    appointmentsData = paginator.data;
                } else if (Array.isArray(paginator)) {
                    appointmentsData = paginator;
                }
                setPagination({
                    currentPage: paginator.current_page || page,
                    lastPage: paginator.last_page || 1,
                    total: paginator.total ?? appointmentsData.length,
                });
            } else if (Array.isArray(aptData)) {
                appointmentsData = aptData;
                setPagination({ currentPage: 1, lastPage: 1, total: appointmentsData.length });
            } else if (aptData && aptData.data && Array.isArray(aptData.data)) {
                appointmentsData = aptData.data;
                setPagination({
                    currentPage: aptData.current_page || page,
                    lastPage: aptData.last_page || 1,
                    total: aptData.total ?? appointmentsData.length,
                });
            }

            setAppointments(appointmentsData);
            setCurrentPage(page);
        } catch (error) {
            if (error.response?.status === 403) {
                setAccessError('You do not have permission to access appointments.');
            } else {
                console.error('Failed to fetch appointments', error);
                setMessage({ type: 'error', text: 'Failed to load appointments' });
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // ------------------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------------------
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        if (user) {
            if (isApproved) {
                setAccessError('');
                fetchServices();
                fetchAppointments(1);
                const { start, end } = getMonthRange(formCalendarMonth);
                fetchAvailableSlots(start, end);
            } else {
                setLoading(false);
                if (isPending) {
                    setAccessError('Your account is pending approval. Please wait for admin to approve your account.');
                } else if (isRejected) {
                    setAccessError('Your account has been rejected. Please update your profile information.');
                } else {
                    setAccessError('Your account is not approved.');
                }
            }
        }
    }, [token, user, isApproved, isPending, isRejected, navigate]);

    useEffect(() => {
        if (isApproved && !accessError) {
            const { start, end } = getMonthRange(formCalendarMonth);
            fetchAvailableSlots(start, end);
        }
    }, [formCalendarMonth, isApproved, accessError]);

    useEffect(() => {
        if (formData.appointment_date) {
            fetchAvailableTimes(formData.appointment_date);
        } else {
            setAvailableTimes([]);
        }
    }, [formData.appointment_date]);

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // ------------------------------------------------------------------------
    // Calendar tile styling
    // ------------------------------------------------------------------------
    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateStr = formatDate(date);
            if (availableDates.has(dateStr)) {
                return 'has-availability';
            }
        }
        return null;
    };

    const tileDisabled = ({ date, view }) => {
        if (view === 'month') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today;
        }
        return false;
    };

    // ------------------------------------------------------------------------
    // Actions
    // ------------------------------------------------------------------------
    const handleCancelAppointment = async () => {
        if (!cancelModal.reason.trim()) {
            setMessage({ type: 'error', text: 'Please provide a cancellation reason' });
            return;
        }

        setActionLoading(true);
        try {
            await axios.post(`/appointments/${cancelModal.appointmentId}/cancel`, {
                reason: cancelModal.reason,
            });
            setMessage({ type: 'success', text: 'Appointment cancelled successfully' });
            setCancelModal({ show: false, appointmentId: null, reason: '' });
            await fetchAppointments(currentPage);
            const { start, end } = getMonthRange(formCalendarMonth);
            await fetchAvailableSlots(start, end);
            if (formData.appointment_date) {
                await fetchAvailableTimes(formData.appointment_date);
            }
        } catch (error) {
            if (error.response?.status === 403) {
                setAccessError('You do not have permission to cancel appointments.');
            } else {
                setMessage({ type: 'error', text: 'Failed to cancel appointment' });
            }
        } finally {
            setActionLoading(false);
        }
    };

    // ------------------------------------------------------------------------
    // Form handling
    // ------------------------------------------------------------------------
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date) => {
        setFormData((prev) => ({ ...prev, appointment_date: formatDate(date), appointment_time: '' }));
    };

    const handleFormCalendarMonthChange = ({ activeStartDate }) => {
        if (activeStartDate) {
            setFormCalendarMonth(activeStartDate);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await axios.post('/appointments', formData);
            setMessage({ type: 'success', text: 'Appointment created successfully!' });
            setFormData({ service_type: '', appointment_date: '', appointment_time: '', notes: '' });
            setShowForm(false);
            await fetchAppointments(1);
            const { start, end } = getMonthRange(formCalendarMonth);
            await fetchAvailableSlots(start, end);
        } catch (error) {
            if (error.response?.status === 403) {
                setAccessError('You do not have permission to create appointments.');
            } else {
                setMessage({
                    type: 'error',
                    text: error.response?.data?.message || 'Failed to create appointment',
                });
            }
        } finally {
            setActionLoading(false);
        }
    };

    // ------------------------------------------------------------------------
    // Render
    // ------------------------------------------------------------------------
    return (
        <div className="max-w-6xl mx-auto">
            {message.text && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${message.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <FaCalendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                        My Appointments
                    </h2>
                    {isApproved && !accessError && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                        >
                            <FaPlus className="h-4 w-4" />
                            New Appointment
                        </button>
                    )}
                </div>

                {accessError && (
                    <div className="p-6">
                        <div className={`p-4 rounded-lg ${isRejected
                                ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                                : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
                            }`}>
                            {accessError}
                        </div>
                    </div>
                )}

                {isApproved && !accessError && (
                    <>
                        {showForm && (
                            <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 space-y-4">
                                {/* Service Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Service Type
                                    </label>
                                    <select
                                        name="service_type"
                                        value={formData.service_type}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Select a service</option>
                                        {services.map((service) => (
                                            <option key={service} value={service}>
                                                {service}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Appointment Date - Calendar */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Appointment Date
                                    </label>
                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-300 dark:border-gray-600">
                                        <div className="relative">
                                            <Calendar
                                                onChange={handleDateChange}
                                                value={formData.appointment_date ? new Date(formData.appointment_date) : null}
                                                tileClassName={tileClassName}
                                                tileDisabled={tileDisabled}
                                                onActiveStartDateChange={handleFormCalendarMonthChange}
                                            />
                                            {loadingAvailability && (
                                                <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center rounded-lg">
                                                    <FaSpinner className="animate-spin text-blue-600 dark:text-blue-400 text-2xl" />
                                                </div>
                                            )}
                                        </div>
                                        {availableDates.size > 0 && (
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-3">
                                                <span className="w-3 h-3 bg-blue-200 dark:bg-blue-900/50 rounded-full mr-2"></span>
                                                <span>Dates with available slots</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Appointment Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Appointment Time
                                    </label>
                                    {loadingTimes ? (
                                        <div className="flex items-center justify-center h-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                                            <FaSpinner className="animate-spin text-blue-600 dark:text-blue-400" />
                                        </div>
                                    ) : (
                                        <select
                                            name="appointment_time"
                                            value={formData.appointment_time}
                                            onChange={handleInputChange}
                                            required
                                            disabled={!formData.appointment_date || availableTimes.length === 0}
                                            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400"
                                        >
                                            {!formData.appointment_date ? (
                                                <option value="">Select a date first</option>
                                            ) : availableTimes.length === 0 ? (
                                                <option value="">No available slots</option>
                                            ) : (
                                                <>
                                                    <option value="">Select a time</option>
                                                    {availableTimes.map((slot) => (
                                                        <option key={slot.start} value={slot.start}>
                                                            {slot.display}
                                                        </option>
                                                    ))}
                                                </>
                                            )}
                                        </select>
                                    )}
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                                        placeholder="Any additional information..."
                                    ></textarea>
                                </div>

                                {/* Form Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        {actionLoading ? (
                                            <FaSpinner className="h-5 w-5 animate-spin inline" />
                                        ) : (
                                            'Create Appointment'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Appointments Table */}
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <FaSpinner className="h-8 w-8 text-gray-400 dark:text-gray-500 animate-spin" />
                            </div>
                        ) : appointments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400 text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mx-6 mb-6">
                                <FaCalendar className="h-12 w-12 mb-3 opacity-50" />
                                <p className="font-medium">No appointments found</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto px-6 pb-6">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border rounded-lg border-gray-200 dark:border-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {appointments.map((apt) => (
                                                <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{apt.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{apt.service_type}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                        {/* Pass the actual duration from the appointment */}
                                                        {formatAppointmentDateTime(apt.appointment_date, apt.appointment_time, apt.duration)}
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
                                                        {apt.status !== 'cancelled' && apt.status !== 'completed' ? (
                                                            <button
                                                                onClick={() => setCancelModal({ show: true, appointmentId: apt.id, reason: '' })}
                                                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium"
                                                            >
                                                                Cancel
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-400 dark:text-gray-500">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {pagination.lastPage > 1 && (
                                    <div className="px-6 pb-6 flex items-center justify-between flex-wrap gap-3">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Showing page {pagination.currentPage} of {pagination.lastPage} ({pagination.total} total appointments)
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => fetchAppointments(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Page {currentPage} of {pagination.lastPage}
                                            </span>
                                            <button
                                                onClick={() => fetchAppointments(currentPage + 1)}
                                                disabled={currentPage === pagination.lastPage}
                                                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Cancel Modal */}
                        {cancelModal.show && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                        Cancel Appointment
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Please provide a reason for cancelling this appointment.
                                    </p>
                                    <textarea
                                        value={cancelModal.reason}
                                        onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
                                        rows="3"
                                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none mb-4"
                                        placeholder="Reason for cancellation..."
                                    ></textarea>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleCancelAppointment}
                                            disabled={actionLoading || !cancelModal.reason.trim()}
                                            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            {actionLoading ? (
                                                <FaSpinner className="h-5 w-5 animate-spin inline" />
                                            ) : (
                                                'Confirm Cancel'
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setCancelModal({ show: false, appointmentId: null, reason: '' })}
                                            className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}