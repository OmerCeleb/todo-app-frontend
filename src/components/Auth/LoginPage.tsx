// src/components/Auth/LoginPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CheckSquare, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, X } from 'lucide-react';

const LoginPage: React.FC = () => {
    const { login, register, error, clearError, isLoading } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState('');

    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Validate login form
    const validateLoginForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!loginData.email) {
            errors.email = 'Email address is required';
        } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!loginData.password) {
            errors.password = 'Password is required';
        } else if (loginData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateRegisterForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!registerData.name.trim()) {
            errors.name = 'Full name is required';
        } else if (registerData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }

        if (!registerData.email) {
            errors.email = 'Email address is required';
        } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!registerData.password) {
            errors.password = 'Password is required';
        } else if (registerData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (!registerData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (registerData.password !== registerData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle toggle mode
    const handleToggleMode = () => {
        setIsLogin(!isLogin);
        setValidationErrors({});
        setSuccessMessage('');
        clearError();
    };

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'login' | 'register') => {
        const { name, value } = e.target;

        if (type === 'login') {
            setLoginData(prev => ({ ...prev, [name]: value }));
        } else {
            setRegisterData(prev => ({ ...prev, [name]: value }));
        }

        // Clear specific field error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        // Clear global error when user starts typing
        if (error) {
            clearError();
        }
    };

    // Handle keyboard events
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            if (isLogin) {
                handleLoginSubmit();
            } else {
                handleRegisterSubmit();
            }
        }
    };

    // Handle login form submission
    const handleLoginSubmit = async () => {
        if (!validateLoginForm() || isLoading) {
            return;
        }

        try {
            await login(loginData);
            setSuccessMessage('Login successful! Redirecting...');
        } catch (error: any) {
            console.error('Login failed:', error);
        }
    };

    // Handle register form submission
    const handleRegisterSubmit = async () => {
        if (!validateRegisterForm() || isLoading) {
            return;
        }

        try {
            const userData = {
                name: registerData.name.trim(),
                email: registerData.email,
                password: registerData.password
            };

            await register(userData);
            setSuccessMessage('Registration successful! Welcome aboard!');
        } catch (error: any) {
            console.error('Registration failed:', error);
        }
    };

    // Format error message for better UX
    const getFormattedError = (error: string) => {
        if (error.includes('Invalid email or password') || error.includes('Bad credentials')) {
            return 'Invalid email or password. Please try again.';
        }
        if (error.includes('Email already exists')) {
            return 'This email is already registered. Try signing in instead.';
        }
        if (error.includes('User not found')) {
            return 'No account found with this email address.';
        }
        if (error.includes('Network Error') || error.includes('fetch')) {
            return 'Connection error. Please check your internet connection.';
        }
        if (error.includes('timeout')) {
            return 'Request timed out. Please try again.';
        }
        return error;
    };

    // Get password strength indicator
    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, text: '', color: '' };
        if (password.length < 6) return { strength: 1, text: 'Weak', color: 'text-red-500' };
        if (password.length < 8) return { strength: 2, text: 'Fair', color: 'text-yellow-500' };
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { strength: 2, text: 'Fair', color: 'text-yellow-500' };
        return { strength: 3, text: 'Strong', color: 'text-green-500' };
    };

    const passwordStrength = getPasswordStrength(registerData.password);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute top-40 right-20 w-16 h-16 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
            </div>

            <div className="max-w-md w-full space-y-8 relative z-10">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl transform hover:scale-105 transition-transform duration-300">
                        <CheckSquare className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-2">
                        Todo App
                    </h2>
                    <p className="text-gray-600 text-lg">
                        {isLogin ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
                    </p>
                </div>

                {/* Form Container */}
                <div className="bg-white shadow-2xl rounded-3xl p-8 space-y-6 border border-gray-100">
                    {/* Tab Switcher */}
                    <div className="flex bg-gray-100 rounded-xl p-1">
                        <button
                            type="button"
                            onClick={() => isLogin || handleToggleMode()}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                                isLogin
                                    ? 'bg-white text-blue-600 shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => !isLogin || handleToggleMode()}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                                !isLogin
                                    ? 'bg-white text-blue-600 shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Global Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start space-x-3 animate-slideDown">
                            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">
                                    {getFormattedError(error)}
                                </p>
                            </div>
                            <button
                                onClick={clearError}
                                className="text-red-600 hover:text-red-800 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start space-x-3 animate-slideDown">
                            <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <p className="text-sm font-medium">{successMessage}</p>
                        </div>
                    )}

                    {/* Login Form */}
                    {isLogin ? (
                        <div className="space-y-5">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="login-email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={loginData.email}
                                        onChange={(e) => handleInputChange(e, 'login')}
                                        onKeyPress={handleKeyPress}
                                        className={`input-field pl-10 ${
                                            validationErrors.email ? 'border-red-500 focus:ring-red-500' : ''
                                        }`}
                                        placeholder="you@example.com"
                                    />
                                </div>
                                {validationErrors.email && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {validationErrors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="login-password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        value={loginData.password}
                                        onChange={(e) => handleInputChange(e, 'login')}
                                        onKeyPress={handleKeyPress}
                                        className={`input-field pl-10 pr-10 ${
                                            validationErrors.password ? 'border-red-500 focus:ring-red-500' : ''
                                        }`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {validationErrors.password && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {validationErrors.password}
                                    </p>
                                )}
                            </div>

                            {/* Login Button */}
                            <button
                                type="button"
                                onClick={handleLoginSubmit}
                                disabled={isLoading}
                                className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </div>
                    ) : (
                        /* Register Form */
                        <div className="space-y-5">
                            {/* Name Field */}
                            <div>
                                <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="register-name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        value={registerData.name}
                                        onChange={(e) => handleInputChange(e, 'register')}
                                        onKeyPress={handleKeyPress}
                                        className={`input-field pl-10 ${
                                            validationErrors.name ? 'border-red-500 focus:ring-red-500' : ''
                                        }`}
                                        placeholder="John Doe"
                                    />
                                </div>
                                {validationErrors.name && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {validationErrors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="register-email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={registerData.email}
                                        onChange={(e) => handleInputChange(e, 'register')}
                                        onKeyPress={handleKeyPress}
                                        className={`input-field pl-10 ${
                                            validationErrors.email ? 'border-red-500 focus:ring-red-500' : ''
                                        }`}
                                        placeholder="you@example.com"
                                    />
                                </div>
                                {validationErrors.email && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {validationErrors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="register-password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        value={registerData.password}
                                        onChange={(e) => handleInputChange(e, 'register')}
                                        onKeyPress={handleKeyPress}
                                        className={`input-field pl-10 pr-10 ${
                                            validationErrors.password ? 'border-red-500 focus:ring-red-500' : ''
                                        }`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {registerData.password && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-gray-600">Password strength:</span>
                                            <span className={`font-medium ${passwordStrength.color}`}>
                                                {passwordStrength.text}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                                    passwordStrength.strength === 1 ? 'bg-red-500 w-1/3' :
                                                        passwordStrength.strength === 2 ? 'bg-yellow-500 w-2/3' :
                                                            passwordStrength.strength === 3 ? 'bg-green-500 w-full' :
                                                                'w-0'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                )}
                                {validationErrors.password && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {validationErrors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="register-confirm-password"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        value={registerData.confirmPassword}
                                        onChange={(e) => handleInputChange(e, 'register')}
                                        onKeyPress={handleKeyPress}
                                        className={`input-field pl-10 pr-10 ${
                                            validationErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''
                                        }`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {validationErrors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {validationErrors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            {/* Register Button */}
                            <button
                                type="button"
                                onClick={handleRegisterSubmit}
                                disabled={isLoading}
                                className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creating account...
                                    </span>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-600">
                    <p>
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            type="button"
                            onClick={handleToggleMode}
                            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;