import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaCamera, FaIdCard, FaCheckCircle, FaEnvelope, FaSun, FaMoon } from 'react-icons/fa';

export default function Profile() {
    const { user, updateProfile } = useAuth();
    const [darkMode, setDarkMode] = useState(() => {
        // Check localStorage and system preference
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('darkMode');
            if (saved !== null) return saved === 'true';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    const [formData, setFormData] = useState({
        firstname: user?.firstname || '',
        middlename: user?.middlename || '',
        lastname: user?.lastname || '',
        contact_number: user?.contact_number || '',
        email: user?.email || '',
    });
    const [profileImage, setProfileImage] = useState(null);
    const [validId, setValidId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Apply dark mode class to html element
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, setter) => {
        setter(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const data = new FormData();
        data.append('firstname', formData.firstname ?? '');
        data.append('middlename', formData.middlename ?? '');
        data.append('lastname', formData.lastname ?? '');
        data.append('contact_number', formData.contact_number ?? '');
        data.append('email', formData.email ?? '');

        if (profileImage) {
            data.append('profile_image', profileImage);
        }
        if (validId) {
            data.append('valid_id', validId);
        }

        try {
            await updateProfile(data);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-200">
                {/* Header with dark mode toggle */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                        <FaUser className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                        Profile Settings
                    </h2>
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {darkMode ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
                    </button>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mx-6 mt-4 p-3 rounded-lg text-sm ${message.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                        }`}>
                        {message.type === 'success' && <FaCheckCircle className="inline mr-2 h-4 w-4" />}
                        {message.text}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} encType="multipart/form-data" className="p-6 space-y-6">
                    {/* Name fields - grid layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                            <input
                                type="text"
                                name="firstname"
                                value={formData.firstname}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Middle Name</label>
                            <input
                                type="text"
                                name="middlename"
                                value={formData.middlename}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                            <input
                                type="text"
                                name="lastname"
                                value={formData.lastname}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Contact and Email - two columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Number</label>
                            <input
                                type="text"
                                name="contact_number"
                                value={formData.contact_number}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                <FaEnvelope className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="off"
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Profile Image */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <FaCamera className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                            Profile Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, setProfileImage)}
                            className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 dark:file:bg-green-900/30 file:text-green-700 dark:file:text-green-400 hover:file:bg-green-100 dark:hover:file:bg-green-900/50 file:cursor-pointer transition-colors"
                        />
                        {user?.profile_image_url && (
                            <div className="mt-3 flex items-center">
                                <img
                                    src={user.profile_image_url}
                                    alt="Profile"
                                    className="h-16 w-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                                />
                                <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">Current image</span>
                            </div>
                        )}
                    </div>

                    {/* Valid ID - only for clients */}
                    {user?.role === 'client' && (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                <FaIdCard className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                Valid ID
                            </label>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => handleFileChange(e, setValidId)}
                                className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 dark:file:bg-green-900/30 file:text-green-700 dark:file:text-green-400 hover:file:bg-green-100 dark:hover:file:bg-green-900/50 file:cursor-pointer transition-colors"
                            />
                            {user?.valid_id_url && (
                                <a
                                    href={user.valid_id_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-3 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 underline"
                                >
                                    View current ID
                                </a>
                            )}
                        </div>
                    )}

                    {/* Submit button */}
                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}