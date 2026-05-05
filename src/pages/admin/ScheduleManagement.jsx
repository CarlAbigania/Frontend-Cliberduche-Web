import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    FaCalendarAlt,
    FaSpinner,
    FaEdit,
    FaTrash,
    FaPlus,
} from 'react-icons/fa';
import {
    getSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getExceptions,
    createException,
    updateException,
    deleteException,
} from '../../api/axios';
import { formatDate } from '../../utils/dateTimeUtils'; // <-- import our date formatter

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ScheduleManagement() {
    const { user, loading: authLoading } = useAuth();

    const [schedules, setSchedules] = useState([]);
    const [exceptions, setExceptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('weekly');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalType, setModalType] = useState('schedule');
    const [formData, setFormData] = useState({
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        slot_duration: 30,
        buffer: 0,
        is_active: true,
        exception_date: '',
        start_time_exc: '',
        end_time_exc: '',
        reason: '',
        is_available: false,
    });

    // Loading states for submissions and deletions
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null); // tracks id + type, e.g., 'schedule-5'
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        if (!authLoading && user) {
            fetchData();
        }
    }, [authLoading, user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [schedRes, excRes] = await Promise.all([
                getSchedules(),
                getExceptions(),
            ]);
            setSchedules(schedRes.data);
            setExceptions(excRes.data);
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        // Clear field-specific error when user changes the field
        if (validationErrors[name]) {
            setValidationErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const openCreateModal = (type) => {
        setModalType(type);
        setEditingItem(null);
        setFormData({
            day_of_week: 1,
            start_time: '09:00',
            end_time: '17:00',
            slot_duration: 30,
            buffer: 0,
            is_active: true,
            exception_date: '',
            start_time_exc: '',
            end_time_exc: '',
            reason: '',
            is_available: false,
        });
        setValidationErrors({});
        setShowModal(true);
    };

    const openEditModal = (item, type) => {
        setModalType(type);
        setEditingItem(item);
        setValidationErrors({});
        if (type === 'schedule') {
            setFormData({
                day_of_week: item.day_of_week,
                start_time: item.start_time.substring(0, 5),
                end_time: item.end_time.substring(0, 5),
                slot_duration: item.slot_duration,
                buffer: item.buffer,
                is_active: item.is_active,
            });
        } else {
            // Format the exception_date to YYYY-MM-DD for the input field
            const formattedDate = item.exception_date ? formatDate(new Date(item.exception_date)) : '';
            setFormData({
                exception_date: formattedDate,
                start_time_exc: item.start_time ? item.start_time.substring(0, 5) : '',
                end_time_exc: item.end_time ? item.end_time.substring(0, 5) : '',
                reason: item.reason || '',
                is_available: item.is_available,
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setValidationErrors({});

        try {
            if (modalType === 'schedule') {
                const payload = {
                    day_of_week: parseInt(formData.day_of_week),
                    start_time: formData.start_time,
                    end_time: formData.end_time,
                    slot_duration: parseInt(formData.slot_duration),
                    buffer: parseInt(formData.buffer || 0),
                    is_active: formData.is_active,
                };
                if (editingItem) {
                    await updateSchedule(editingItem.id, payload);
                } else {
                    await createSchedule(payload);
                }
            } else {
                const payload = {
                    exception_date: formData.exception_date,
                    start_time: formData.start_time_exc || null,
                    end_time: formData.end_time_exc || null,
                    reason: formData.reason,
                    is_available: formData.is_available,
                };
                if (editingItem) {
                    await updateException(editingItem.id, payload);
                } else {
                    await createException(payload);
                }
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Save error', error);
            // Handle validation errors from API
            if (error.response?.status === 422) {
                setValidationErrors(error.response.data.errors || {});
            } else {
                alert('Failed to save. Check console.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm('Are you sure?')) return;
        const deleteKey = `${type}-${id}`;
        setDeletingId(deleteKey);
        try {
            if (type === 'schedule') {
                await deleteSchedule(id);
            } else {
                await deleteException(id);
            }
            fetchData();
        } catch (error) {
            console.error('Delete error', error);
            alert('Failed to delete. Check console.');
        } finally {
            setDeletingId(null);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-4xl text-blue-600 dark:text-blue-400" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between dark:border-slate-700 dark:bg-slate-900">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center dark:text-slate-100">
                        <FaCalendarAlt className="mr-2 text-blue-600 dark:text-blue-400" />
                        Schedule Management
                    </h2>
                    <div className="flex gap-2">
                        {activeTab === 'weekly' ? (
                            <button
                                onClick={() => openCreateModal('schedule')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 dark:bg-blue-700 dark:hover:bg-blue-800"
                            >
                                <FaPlus /> Add Schedule
                            </button>
                        ) : (
                            <button
                                onClick={() => openCreateModal('exception')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 dark:bg-blue-700 dark:hover:bg-blue-800"
                            >
                                <FaPlus /> Add Exception
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-slate-700">
                    <button
                        className={`px-6 py-3 text-sm font-medium ${activeTab === 'weekly'
                            ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        onClick={() => setActiveTab('weekly')}
                    >
                        Weekly Schedule
                    </button>
                    <button
                        className={`px-6 py-3 text-sm font-medium ${activeTab === 'exceptions'
                            ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        onClick={() => setActiveTab('exceptions')}
                    >
                        Exceptions
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'weekly' && (
                        <div className="space-y-3">
                            {schedules.length === 0 ? (
                                <p className="text-gray-500 text-center py-8 dark:text-slate-400">
                                    No weekly schedules defined.
                                </p>
                            ) : (
                                schedules.map((sched) => {
                                    const deleteKey = `schedule-${sched.id}`;
                                    const isDeleting = deletingId === deleteKey;
                                    return (
                                        <div
                                            key={sched.id}
                                            className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                                        >
                                            <div>
                                                <h3 className="font-medium dark:text-slate-200">
                                                    {DAYS[sched.day_of_week]}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-slate-400">
                                                    {sched.start_time} – {sched.end_time} | Duration:{' '}
                                                    {sched.slot_duration} min | Buffer: {sched.buffer} min
                                                    {!sched.is_active && (
                                                        <span className="ml-2 text-red-500 dark:text-red-400">(Inactive)</span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(sched, 'schedule')}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                    disabled={isDeleting}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sched.id, 'schedule')}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {activeTab === 'exceptions' && (
                        <div className="space-y-3">
                            {exceptions.length === 0 ? (
                                <p className="text-gray-500 text-center py-8 dark:text-slate-400">
                                    No exceptions defined.
                                </p>
                            ) : (
                                exceptions.map((exc) => {
                                    const deleteKey = `exception-${exc.id}`;
                                    const isDeleting = deletingId === deleteKey;
                                    // Format the date nicely for display
                                    const displayDate = exc.exception_date
                                        ? formatDate(new Date(exc.exception_date))
                                        : 'Invalid date';
                                    return (
                                        <div
                                            key={exc.id}
                                            className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                                        >
                                            <div>
                                                <h3 className="font-medium dark:text-slate-200">{displayDate}</h3>
                                                <p className="text-sm text-gray-600 dark:text-slate-400">
                                                    {exc.start_time && exc.end_time
                                                        ? `${exc.start_time} – ${exc.end_time}`
                                                        : 'All day'}{' '}
                                                    | {exc.is_available ? 'Available' : 'Blocked'}
                                                    {exc.reason && (
                                                        <span className="ml-2 text-gray-500 dark:text-slate-500">({exc.reason})</span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(exc, 'exception')}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                    disabled={isDeleting}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(exc.id, 'exception')}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for create/edit */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 dark:bg-opacity-70">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 dark:bg-slate-800 dark:border dark:border-slate-700">
                        <h3 className="text-lg font-semibold mb-4 dark:text-slate-100">
                            {editingItem ? 'Edit' : 'Add'}{' '}
                            {modalType === 'schedule' ? 'Schedule' : 'Exception'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            {modalType === 'schedule' ? (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                                            Day of Week
                                        </label>
                                        <select
                                            name="day_of_week"
                                            value={formData.day_of_week}
                                            onChange={handleInputChange}
                                            className={`w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400 ${validationErrors.day_of_week ? 'border-red-500' : ''
                                                }`}
                                            required
                                        >
                                            {DAYS.map((day, idx) => (
                                                <option key={idx} value={idx}>
                                                    {day}
                                                </option>
                                            ))}
                                        </select>
                                        {validationErrors.day_of_week && (
                                            <p className="text-red-500 text-xs mt-1">{validationErrors.day_of_week[0]}</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                                                Start Time
                                            </label>
                                            <input
                                                type="time"
                                                name="start_time"
                                                value={formData.start_time}
                                                onChange={handleInputChange}
                                                className={`w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400 ${validationErrors.start_time ? 'border-red-500' : ''
                                                    }`}
                                                required
                                            />
                                            {validationErrors.start_time && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors.start_time[0]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                                                End Time
                                            </label>
                                            <input
                                                type="time"
                                                name="end_time"
                                                value={formData.end_time}
                                                onChange={handleInputChange}
                                                className={`w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400 ${validationErrors.end_time ? 'border-red-500' : ''
                                                    }`}
                                                required
                                            />
                                            {validationErrors.end_time && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors.end_time[0]}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                                                Slot Duration (min)
                                            </label>
                                            <input
                                                type="number"
                                                name="slot_duration"
                                                value={formData.slot_duration}
                                                onChange={handleInputChange}
                                                min="5"
                                                className={`w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400 ${validationErrors.slot_duration ? 'border-red-500' : ''
                                                    }`}
                                                required
                                            />
                                            {validationErrors.slot_duration && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors.slot_duration[0]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                                                Buffer (min)
                                            </label>
                                            <input
                                                type="number"
                                                name="buffer"
                                                value={formData.buffer}
                                                onChange={handleInputChange}
                                                min="0"
                                                className={`w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400 ${validationErrors.buffer ? 'border-red-500' : ''
                                                    }`}
                                            />
                                            {validationErrors.buffer && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors.buffer[0]}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="flex items-center dark:text-slate-300">
                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                checked={formData.is_active}
                                                onChange={handleInputChange}
                                                className="mr-2 dark:bg-slate-700 dark:border-slate-600"
                                            />
                                            Active
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                                            Exception Date
                                        </label>
                                        <input
                                            type="date"
                                            name="exception_date"
                                            value={formData.exception_date}
                                            onChange={handleInputChange}
                                            className={`w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400 ${validationErrors.exception_date ? 'border-red-500' : ''
                                                }`}
                                            required
                                        />
                                        {validationErrors.exception_date && (
                                            <p className="text-red-500 text-xs mt-1">{validationErrors.exception_date[0]}</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                                                Start Time (optional)
                                            </label>
                                            <input
                                                type="time"
                                                name="start_time_exc"
                                                value={formData.start_time_exc}
                                                onChange={handleInputChange}
                                                className={`w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400 ${validationErrors.start_time ? 'border-red-500' : ''
                                                    }`}
                                            />
                                            {validationErrors.start_time && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors.start_time[0]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                                                End Time (optional)
                                            </label>
                                            <input
                                                type="time"
                                                name="end_time_exc"
                                                value={formData.end_time_exc}
                                                onChange={handleInputChange}
                                                className={`w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400 ${validationErrors.end_time ? 'border-red-500' : ''
                                                    }`}
                                            />
                                            {validationErrors.end_time && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors.end_time[0]}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                                            Reason (optional)
                                        </label>
                                        <input
                                            type="text"
                                            name="reason"
                                            value={formData.reason}
                                            onChange={handleInputChange}
                                            className={`w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400 ${validationErrors.reason ? 'border-red-500' : ''
                                                }`}
                                        />
                                        {validationErrors.reason && (
                                            <p className="text-red-500 text-xs mt-1">{validationErrors.reason[0]}</p>
                                        )}
                                    </div>
                                    <div className="mb-4">
                                        <label className="flex items-center dark:text-slate-300">
                                            <input
                                                type="checkbox"
                                                name="is_available"
                                                checked={formData.is_available}
                                                onChange={handleInputChange}
                                                className="mr-2 dark:bg-slate-700 dark:border-slate-600"
                                            />
                                            Available (unchecked = blocked)
                                        </label>
                                    </div>
                                </>
                            )}

                            {/* Display general error if any */}
                            {validationErrors.general && (
                                <div className="mb-4 text-red-500 text-sm">{validationErrors.general}</div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:border-slate-600 dark:hover:bg-slate-700 dark:text-slate-300"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 flex items-center gap-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FaSpinner className="animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        'Save'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}