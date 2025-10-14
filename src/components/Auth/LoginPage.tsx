// src/components/Auth/LoginPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CheckSquare, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, X, Loader2, Shield, Sparkles } from 'lucide-react';

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
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, formType: 'login' | 'register') => {
        const { name, value } = e.target;
        if (formType === 'login') {
            setLoginData(prev => ({ ...prev, [name]: value }));
        } else {
            setRegisterData(prev => ({ ...prev, [name]: value }));
        }
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        if (error) clearError();
    };

    // Handle login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateLoginForm()) return;

        try {
            await login({
                email: loginData.email,
                password: loginData.password
            });
        } catch (err) {
            console.error('Login failed:', err);
        }
    };

    // Handle register
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateRegisterForm()) return;

        try {
            await register({
                name: registerData.name,
                email: registerData.email,
                password: registerData.password
            });
            setSuccessMessage('Account created successfully! Redirecting...');
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err) {
            console.error('Registration failed:', err);
        }
    };

    // Handle enter key press
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (isLogin) {
                handleLogin(e as unknown as React.FormEvent);
            } else {
                handleRegister(e as unknown as React.FormEvent);
            }
        }
    };

    // Format error messages
    const getFormattedError = (error: string): string => {
        if (error.includes('Invalid credentials') || error.includes('401')) {
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            <div className="w-full max-w-6xl flex items-center justify-center gap-8 relative z-10">
                {/* Left side - Branding */}
                <div className="hidden lg:flex flex-col items-start justify-center flex-1 max-w-lg">
                    <div className="space-y-6">
                        {/* Logo and Title */}
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-50"></div>
                                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 shadow-2xl">
                                    <CheckSquare className="h-12 w-12 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                                    TaskMaster
                                </h1>
                                <p className="text-gray-600 text-sm mt-1">Professional Task Management</p>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-4 mt-12">
                            <div className="flex items-start gap-3 group">
                                <div className="mt-1 p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                    <CheckCircle className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Organize Everything</h3>
                                    <p className="text-gray-600 text-sm">Keep all your tasks in one place with smart categories</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 group">
                                <div className="mt-1 p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                    <Shield className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Secure & Private</h3>
                                    <p className="text-gray-600 text-sm">Your data is encrypted and protected at all times</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 group">
                                <div className="mt-1 p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                    <Sparkles className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Smart Features</h3>
                                    <p className="text-gray-600 text-sm">Priority management, deadlines, and analytics</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Form */}
                <div className="w-full max-w-md">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-6">
                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center mb-6">
                            <div className="inline-flex items-center gap-3">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-3">
                                    <CheckSquare className="h-8 w-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-800 bg-clip-text text-transparent">
                                    TaskMaster
                                </h1>
                            </div>
                        </div>

                        {/* Tab Switcher */}
                        <div className="relative">
                            <div className="flex bg-gray-100/80 rounded-2xl p-1.5 gap-1">
                                <button
                                    type="button"
                                    onClick={() => isLogin || handleToggleMode()}
                                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                                        isLogin
                                            ? 'bg-white text-blue-600 shadow-lg shadow-blue-100'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Sign In
                                </button>
                                <button
                                    type="button"
                                    onClick={() => !isLogin || handleToggleMode()}
                                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                                        !isLogin
                                            ? 'bg-white text-blue-600 shadow-lg shadow-blue-100'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Sign Up
                                </button>
                            </div>
                        </div>

                        {/* Global Error Message */}
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-xl flex items-start space-x-3 animate-slideDown">
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
                            <div className="bg-green-50 border-l-4 border-green-500 text-green-800 px-4 py-3 rounded-xl flex items-start space-x-3 animate-slideDown">
                                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                <p className="text-sm font-medium">{successMessage}</p>
                            </div>
                        )}

                        {/* Login Form */}
                        {isLogin ? (
                            <form onSubmit={handleLogin} className="space-y-5">
                                {/* Email Field */}
                                <div>
                                    <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input
                                            id="login-email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            value={loginData.email}
                                            onChange={(e) => handleInputChange(e, 'login')}
                                            onKeyPress={handleKeyPress}
                                            className={`block w-full pl-12 pr-4 py-3.5 border-2 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                                                validationErrors.email
                                                    ? 'border-red-300 focus:border-red-500'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    {validationErrors.email && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {validationErrors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input
                                            id="login-password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            value={loginData.password}
                                            onChange={(e) => handleInputChange(e, 'login')}
                                            onKeyPress={handleKeyPress}
                                            className={`block w-full pl-12 pr-12 py-3.5 border-2 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                                                validationErrors.password
                                                    ? 'border-red-300 focus:border-red-500'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {validationErrors.password && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {validationErrors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Signing in...
                                        </span>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </form>
                        ) : (
                            /* Register Form */
                            <form onSubmit={handleRegister} className="space-y-5">
                                {/* Name Field */}
                                <div>
                                    <label htmlFor="register-name" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input
                                            id="register-name"
                                            name="name"
                                            type="text"
                                            autoComplete="name"
                                            value={registerData.name}
                                            onChange={(e) => handleInputChange(e, 'register')}
                                            onKeyPress={handleKeyPress}
                                            className={`block w-full pl-12 pr-4 py-3.5 border-2 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                                                validationErrors.name
                                                    ? 'border-red-300 focus:border-red-500'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    {validationErrors.name && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {validationErrors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label htmlFor="register-email" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input
                                            id="register-email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            value={registerData.email}
                                            onChange={(e) => handleInputChange(e, 'register')}
                                            onKeyPress={handleKeyPress}
                                            className={`block w-full pl-12 pr-4 py-3.5 border-2 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                                                validationErrors.email
                                                    ? 'border-red-300 focus:border-red-500'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    {validationErrors.email && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {validationErrors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label htmlFor="register-password" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input
                                            id="register-password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="new-password"
                                            value={registerData.password}
                                            onChange={(e) => handleInputChange(e, 'register')}
                                            onKeyPress={handleKeyPress}
                                            className={`block w-full pl-12 pr-12 py-3.5 border-2 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                                                validationErrors.password
                                                    ? 'border-red-300 focus:border-red-500'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {registerData.password && (
                                        <div className="mt-2">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-gray-600">Password strength:</span>
                                                <span className={`text-xs font-semibold ${passwordStrength.color}`}>
                                                    {passwordStrength.text}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-300 ${
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
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {validationErrors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Confirm Password Field */}
                                <div>
                                    <label htmlFor="register-confirm-password" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input
                                            id="register-confirm-password"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            autoComplete="new-password"
                                            value={registerData.confirmPassword}
                                            onChange={(e) => handleInputChange(e, 'register')}
                                            onKeyPress={handleKeyPress}
                                            className={`block w-full pl-12 pr-12 py-3.5 border-2 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                                                validationErrors.confirmPassword
                                                    ? 'border-red-300 focus:border-red-500'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {validationErrors.confirmPassword && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {validationErrors.confirmPassword}
                                        </p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Creating account...
                                        </span>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>

                                {/* Terms notice */}
                                <p className="text-xs text-center text-gray-600">
                                    By signing up, you agree to our{' '}
                                    <button
                                        type="button"
                                        onClick={() => console.log('Terms clicked')}
                                        className="text-blue-600 hover:underline cursor-pointer bg-transparent border-none p-0"
                                    >
                                        Terms of Service
                                    </button>
                                    {' '}and{' '}
                                    <button
                                        type="button"
                                        onClick={() => console.log('Privacy clicked')}
                                        className="text-blue-600 hover:underline cursor-pointer bg-transparent border-none p-0"
                                    >
                                        Privacy Policy
                                    </button>
                                </p>
                            </form>
                        )}

                        {/* Toggle link */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-600">
                                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleToggleMode}
                            className="w-full text-center py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            {isLogin ? 'Create a free account →' : '← Back to sign in'}
                        </button>
                    </div>

                    {/* Security badge */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
                        <Shield className="h-4 w-4" />
                        <span>Secured with 256-bit encryption</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;