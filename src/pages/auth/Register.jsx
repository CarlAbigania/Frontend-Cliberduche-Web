import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import logo from '/logo/cliberduche_logo.png';
import PerspectiveCard from '../../components/PerspectiveCard';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        contact_number: '',
        password: '',
        password_confirmation: '',
        valid_id: null
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // Validation states
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Modal state
    const [showBenefitsModal, setShowBenefitsModal] = useState(false);

    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { register } = useAuth();

    const [registerRef, registerAnimation] = useScrollAnimation(0.2);

    // Allowed email domains
    const allowedDomains = new Set([
        "gmail.com", "yahoo.com", "yahoo.co.uk", "yahoo.com.ph",
        "outlook.com", "hotmail.com", "live.com", "icloud.com",
        "me.com", "aol.com", "protonmail.com", "mail.com",
        "gmx.com", "yandex.com",
    ]);

    // Validation functions
    const validateField = (name, value) => {
        const val = typeof value === 'string' ? value.trim() : value;

        switch (name) {
            case 'firstname':
                if (!val) return 'First name is required';
                if (val.length < 2) return 'First name must be at least 2 characters';
                return '';
            case 'lastname':
                if (!val) return 'Last name is required';
                if (val.length < 2) return 'Last name must be at least 2 characters';
                return '';
            case 'email': {
                if (!val) return 'Email is required';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(val)) return 'Invalid email format';
                const domain = val.split('@')[1]?.toLowerCase();
                if (!domain || !allowedDomains.has(domain)) {
                    return 'Please use a common email provider (Gmail, Yahoo, Outlook, etc.)';
                }
                return '';
            }
            case 'contact_number':
                if (!val) return 'Contact number is required';
                const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
                if (!phoneRegex.test(val)) return 'Enter a valid phone number';
                return '';
            case 'password':
                if (!val) return 'Password is required';
                if (val.length < 8) return 'Password must be at least 8 characters';
                return '';
            case 'password_confirmation':
                if (!val) return 'Please confirm your password';
                if (val !== formData.password) return 'Passwords do not match';
                return '';
            case 'valid_id':
                return !value ? 'Please upload a valid ID' : '';
            default:
                return '';
        }
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (touched[name]) {
            const error = validateField(name, value);
            setErrors(prev => ({ ...prev, [name]: error }));
        }

        if (error) setError('');
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));

        const error = validateField(name, formData[name]);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setError('Invalid file type. Please upload a JPEG, PNG, or PDF file.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('File size too large. Maximum size is 5MB.');
                return;
            }

            setFormData(prev => ({ ...prev, valid_id: file }));
            setTouched(prev => ({ ...prev, valid_id: true }));
            setErrors(prev => ({ ...prev, valid_id: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            await register(formData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 5000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper for input classes (except file input)
    const getFieldClasses = (fieldName) => {
        const isError = touched[fieldName] && errors[fieldName];
        const isValid = touched[fieldName] && !errors[fieldName] && formData[fieldName];
        return {
            inputClass: `peer w-full px-4 pt-5 pb-2 rounded-lg bg-white/20 border outline-none transition-all duration-300 text-white placeholder-transparent ${isError
                    ? 'border-red-300/70 focus:border-red-300/70 focus:ring-2 focus:ring-red-300/50'
                    : isValid
                        ? 'border-green-400 focus:border-green-400 focus:ring-2 focus:ring-green-400'
                        : 'border-white/30 focus:border-green-400 focus:ring-2 focus:ring-green-400'
                }`,
            labelClass: `absolute left-4 transition-all duration-300 pointer-events-none ${formData[fieldName] ? 'top-0 text-sm' : 'top-3 text-base peer-focus:top-0 peer-focus:text-sm'
                } ${isError
                    ? 'text-red-300'
                    : isValid
                        ? 'text-green-400'
                        : 'text-white/60 peer-focus:text-green-400'
                }`,
        };
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0b2545] via-[#1f7a8c] to-[#0b2545] flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <PerspectiveCard
                        className="relative"
                        maxRotate={12}
                        defaultScale={1.03}
                    >
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaCheck className="w-10 h-10 text-green-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-4">Registration Successful!</h1>
                            <p className="text-white/80 mb-4">
                                Your account has been created and is pending approval. You will receive an email once your account is reviewed.
                            </p>
                            <p className="text-white/60 text-sm">
                                Redirecting to login in 5 seconds...
                            </p>
                        </div>
                    </PerspectiveCard>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0b2545] via-[#1f7a8c] to-[#0b2545] flex items-center justify-center px-4 relative py-10">

            {/* Fixed Return Home Button */}
            <Link
                to="/"
                className="fixed top-6 left-6 z-40 inline-flex items-center bg-white/90 backdrop-blur-sm text-[#0b2545] hover:text-[#1f7a8c] hover:bg-white transition-all duration-300 group px-4 py-3 rounded-full shadow-lg"
            >
                <FaArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm tracking-wider font-medium">RETURN HOME</span>
            </Link>

            <div className="max-w-3xl w-full">
                <PerspectiveCard
                    className={`relative ${registerAnimation}`}
                    maxRotate={12}
                    defaultScale={1.03}
                >
                    <div
                        ref={registerRef}
                        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 pt-14 shadow-2xl border border-white/20"
                    >
                        {/* Floating Glass Logo */}
                        <div className="absolute -top-9 left-1/2 -translate-x-1/2">
                            <div className="bg-white/30 backdrop-blur-md rounded-full p-3 shadow-lg border border-white/40">
                                <img
                                    src={logo}
                                    alt="Cliberduche Logo"
                                    className="w-14 h-auto"
                                />
                            </div>
                        </div>

                        {/* Header with title and question button */}
                        <div className="text-center mb-6 flex items-center justify-center gap-2">
                            <h1 className="text-3xl font-bold text-white">Create Account</h1>
                            <button
                                type="button"
                                onClick={() => setShowBenefitsModal(true)}
                                className="w-6 h-6 rounded-full bg-white/20 text-white/80 hover:bg-white/30 hover:text-white flex items-center justify-center text-sm font-bold transition-colors focus:outline-none"
                                aria-label="Benefits of registering"
                            >
                                ?
                            </button>
                        </div>

                        {/* Soft error banner */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-300/30 text-rose-100 px-4 py-3 rounded-lg mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            {/* Grid layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* First Name */}
                                <div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="firstname"
                                            name="firstname"
                                            value={formData.firstname}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            required
                                            disabled={loading}
                                            placeholder=" "
                                            className={getFieldClasses('firstname').inputClass}
                                        />
                                        <label htmlFor="firstname" className={getFieldClasses('firstname').labelClass}>
                                            First Name
                                        </label>
                                        {touched.firstname && !errors.firstname && formData.firstname && (
                                            <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 w-4 h-4" />
                                        )}
                                    </div>
                                    {touched.firstname && errors.firstname && (
                                        <p className="text-xs text-rose-200 italic mt-1">{errors.firstname}</p>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="lastname"
                                            name="lastname"
                                            value={formData.lastname}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            required
                                            disabled={loading}
                                            placeholder=" "
                                            className={getFieldClasses('lastname').inputClass}
                                        />
                                        <label htmlFor="lastname" className={getFieldClasses('lastname').labelClass}>
                                            Last Name
                                        </label>
                                        {touched.lastname && !errors.lastname && formData.lastname && (
                                            <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 w-4 h-4" />
                                        )}
                                    </div>
                                    {touched.lastname && errors.lastname && (
                                        <p className="text-xs text-rose-200 italic mt-1">{errors.lastname}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            required
                                            disabled={loading}
                                            placeholder=" "
                                            className={getFieldClasses('email').inputClass}
                                        />
                                        <label htmlFor="email" className={getFieldClasses('email').labelClass}>
                                            Email Address
                                        </label>
                                        {touched.email && !errors.email && formData.email && (
                                            <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 w-4 h-4" />
                                        )}
                                    </div>
                                    {touched.email && errors.email && (
                                        <p className="text-xs text-rose-200 italic mt-1">{errors.email}</p>
                                    )}
                                </div>

                                {/* Contact Number */}
                                <div>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            id="contact_number"
                                            name="contact_number"
                                            value={formData.contact_number}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            required
                                            disabled={loading}
                                            placeholder=" "
                                            className={getFieldClasses('contact_number').inputClass}
                                        />
                                        <label htmlFor="contact_number" className={getFieldClasses('contact_number').labelClass}>
                                            Contact Number
                                        </label>
                                        {touched.contact_number && !errors.contact_number && formData.contact_number && (
                                            <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 w-4 h-4" />
                                        )}
                                    </div>
                                    {touched.contact_number && errors.contact_number && (
                                        <p className="text-xs text-rose-200 italic mt-1">{errors.contact_number}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            required
                                            disabled={loading}
                                            placeholder=" "
                                            className={getFieldClasses('password').inputClass}
                                        />
                                        <label htmlFor="password" className={getFieldClasses('password').labelClass}>
                                            Password
                                        </label>
                                        {touched.password && !errors.password && formData.password && (
                                            <FaCheck className="absolute right-10 top-1/2 -translate-y-1/2 text-green-400 w-4 h-4" />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-green-400"
                                        >
                                            {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {touched.password && errors.password && (
                                        <p className="text-xs text-rose-200 italic mt-1">{errors.password}</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            value={formData.password_confirmation}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            required
                                            disabled={loading}
                                            placeholder=" "
                                            className={getFieldClasses('password_confirmation').inputClass}
                                        />
                                        <label htmlFor="password_confirmation" className={getFieldClasses('password_confirmation').labelClass}>
                                            Confirm Password
                                        </label>
                                        {touched.password_confirmation && !errors.password_confirmation && formData.password_confirmation && (
                                            <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 w-4 h-4" />
                                        )}
                                    </div>
                                    {touched.password_confirmation && errors.password_confirmation && (
                                        <p className="text-xs text-rose-200 italic mt-1">{errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>

                            {/* Valid ID File Input with Label (no button) */}
                            <div className="md:col-span-2">
                                <label htmlFor="valid_id" className="block text-white/80 text-sm font-medium mb-1">
                                    Valid ID (Upload your ID for verification)
                                </label>
                                <input
                                    type="file"
                                    id="valid_id"
                                    name="valid_id"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    onBlur={handleBlur}
                                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                                    className={`w-full px-4 py-3 rounded-lg bg-white/20 border outline-none transition-all duration-300 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-600 ${touched.valid_id && errors.valid_id
                                            ? 'border-red-300/70 focus:border-red-300/70 focus:ring-2 focus:ring-red-300/50'
                                            : formData.valid_id
                                                ? 'border-green-400 focus:border-green-400 focus:ring-2 focus:ring-green-400'
                                                : 'border-white/30 focus:border-green-400 focus:ring-2 focus:ring-green-400'
                                        }`}
                                />
                                {touched.valid_id && errors.valid_id && (
                                    <p className="text-xs text-rose-200 italic mt-1">{errors.valid_id}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg
                                            className="animate-spin h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Creating Account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-white/60">
                                Already have an account?{' '}
                                <Link to="/login" className="text-green-400 hover:text-green-300 font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </PerspectiveCard>
            </div>

            {/* Benefits Modal */}
            {showBenefitsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowBenefitsModal(false)}
                    ></div>
                    {/* Modal Content */}
                    <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 max-w-md w-full">
                        <button
                            onClick={() => setShowBenefitsModal(false)}
                            className="absolute top-4 right-4 text-white/70 hover:text-white"
                            aria-label="Close modal"
                        >
                            <FaTimes className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-bold text-white mb-4">Benefits of Registration</h2>
                        <ul className="space-y-3 text-white/80">
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">•</span>
                                <span>Schedule appointments for consultation with our experts.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">•</span>
                                <span>View your projects based on discussions with the company, all in one place.</span>
                            </li>
                        </ul>
                        <div className="mt-6 text-right">
                            <button
                                onClick={() => setShowBenefitsModal(false)}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}