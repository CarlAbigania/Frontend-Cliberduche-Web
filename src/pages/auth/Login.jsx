import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import logo from '/logo/cliberduche_logo.png';
import PerspectiveCard from '../../components/PerspectiveCard';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Validation states
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const navigate = useNavigate();
    const { login } = useAuth();

    const [loginRef, loginAnimation] = useScrollAnimation(0.2);

    // Allowed email domains (same as contact page)
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
            case 'password':
                if (!val) return 'Password is required';
                if (val.length < 6) return 'Password must be at least 6 characters';
                return '';
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Mark all fields as touched
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
            const result = await login(formData.email, formData.password);

            if (result.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/client');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Dynamic classes for fields (soft error colors)
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0b2545] via-[#1f7a8c] to-[#0b2545] flex items-center justify-center px-4 relative">

            {/* Fixed Return Home Button */}
            <Link
                to="/"
                className="fixed top-6 left-6 z-40 inline-flex items-center bg-white/90 backdrop-blur-sm text-[#0b2545] hover:text-[#1f7a8c] hover:bg-white transition-all duration-300 group px-4 py-3 rounded-full shadow-lg"
            >
                <FaArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm tracking-wider font-medium">RETURN HOME</span>
            </Link>

            <div className="max-w-md w-full">
                <PerspectiveCard
                    className={`relative ${loginAnimation}`}
                    maxRotate={12}
                    defaultScale={1.03}
                >
                    <div
                        ref={loginRef}
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

                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold text-white">
                                Login to Cliberduche
                            </h1>
                        </div>

                        {/* Soft error banner */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-300/30 text-rose-100 px-4 py-3 rounded-lg mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            {/* Email Field */}
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

                            {/* Password Field */}
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

                            {/* Remember / Forgot */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-green-600 bg-white/20 border-white/30 rounded focus:ring-green-500 focus:ring-2"
                                    />
                                    <span className="ml-2 text-white">Remember me</span>
                                </label>
                                <a href="#" className="text-green-300 hover:text-green-100 transition-colors">
                                    Forgot password?
                                </a>
                            </div>

                            {/* Submit Button with Spinner */}
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
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-white/60">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-green-400 hover:text-green-300 font-medium">
                                    Register now
                                </Link>
                            </p>
                        </div>
                    </div>
                </PerspectiveCard>
            </div>
        </div>
    );
}