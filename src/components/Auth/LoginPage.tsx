import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, AlertCircle, CheckCircle2, User, Loader2, CheckSquare, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormData {
    email: string;
    password: string;
}

interface RegisterFormData extends LoginFormData {
    confirmPassword: string;
    name: string;
}

const LoginPage: React.FC = () => {
    const { login, register, isLoading, error, clearError } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState('');

    const [loginData, setLoginData] = useState<LoginFormData>({
        email: '',
        password: ''
    });

    const [registerData, setRegisterData] = useState<RegisterFormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Clear messages when switching between login/register
    useEffect(() => {
        setValidationErrors({});
        setSuccessMessage('');
        clearError();
    }, [isLogin, clearError]);

    // Client-side validation
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

                {/* Main Card */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
                    {/* Toggle Buttons */}
                    <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
                        <button
                            onClick={() => setIsLogin(true)}
                            disabled={isLoading}
                            className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50 ${
                                isLogin
                                    ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <LogIn className="w-4 h-4" />
                                Sign In
                            </div>
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            disabled={isLoading}
                            className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50 ${
                                !isLogin
                                    ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <UserPlus className="w-4 h-4" />
                                Sign Up
                            </div>
                        </button>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg animate-in slide-in-from-top duration-300">
                            <div className="flex items-center">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <p className="ml-3 text-sm text-green-700 font-medium">{successMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg animate-in slide-in-from-top duration-300">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="ml-3 text-sm text-red-700 font-medium">{getFormattedError(error)}</p>
                            </div>
                        </div>
                    )}

                    {/* Login Form */}
                    {isLogin ? (
                        <div className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={loginData.email}
                                        onChange={(e) => handleInputChange(e, 'login')}
                                        onKeyPress={handleKeyPress}
                                        disabled={isLoading}
                                        className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                                            validationErrors.email
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300 hover:border-gray-400 focus:bg-white'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        placeholder="Enter your email"
                                    />
                                </div>
                                {validationErrors.email && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {validationErrors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={loginData.password}
                                        onChange={(e) => handleInputChange(e, 'login')}
                                        onKeyPress={handleKeyPress}
                                        disabled={isLoading}
                                        className={`w-full pl-12 pr-12 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                                            validationErrors.password
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300 hover:border-gray-400 focus:bg-white'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 disabled:opacity-50"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                {validationErrors.password && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {validationErrors.password}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleLoginSubmit}
                                disabled={isLoading || !loginData.email || !loginData.password}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Signing In...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        Sign In
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        /* Register Form */
                        <div className="space-y-6">
                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={registerData.name}
                                        onChange={(e) => handleInputChange(e, 'register')}
                                        onKeyPress={handleKeyPress}
                                        disabled={isLoading}
                                        className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                                            validationErrors.name
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300 hover:border-gray-400 focus:bg-white'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                {validationErrors.name && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {validationErrors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={registerData.email}
                                        onChange={(e) => handleInputChange(e, 'register')}
                                        onKeyPress={handleKeyPress}
                                        disabled={isLoading}
                                        className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                                            validationErrors.email
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300 hover:border-gray-400 focus:bg-white'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        placeholder="Enter your email"
                                    />
                                </div>
                                {validationErrors.email && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {validationErrors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={registerData.password}
                                        onChange={(e) => handleInputChange(e, 'register')}
                                        onKeyPress={handleKeyPress}
                                        disabled={isLoading}
                                        className={`w-full pl-12 pr-12 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                                            validationErrors.password
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300 hover:border-gray-400 focus:bg-white'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        placeholder="Create a strong password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 disabled:opacity-50"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                {/* Password Strength Indicator */}
                                {registerData.password && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500">Password strength:</span>
                                            <span className={`font-medium ${passwordStrength.color}`}>
                                                {passwordStrength.text}
                                            </span>
                                        </div>
                                        <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${
                                                    passwordStrength.strength === 1 ? 'bg-red-500 w-1/3' :
                                                        passwordStrength.strength === 2 ? 'bg-yellow-500 w-2/3' :
                                                            passwordStrength.strength === 3 ? 'bg-green-500 w-full' : 'w-0'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                )}
                                {validationErrors.password && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {validationErrors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Shield className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={registerData.confirmPassword}
                                        onChange={(e) => handleInputChange(e, 'register')}
                                        onKeyPress={handleKeyPress}
                                        disabled={isLoading}
                                        className={`w-full pl-12 pr-12 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                                            validationErrors.confirmPassword
                                                ? 'border-red-300 bg-red-50'
                                                : registerData.confirmPassword && registerData.password === registerData.confirmPassword
                                                    ? 'border-green-300 bg-green-50'
                                                    : 'border-gray-300 hover:border-gray-400 focus:bg-white'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        placeholder="Confirm your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={isLoading}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 disabled:opacity-50"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                {validationErrors.confirmPassword && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {validationErrors.confirmPassword}
                                    </p>
                                )}
                                {registerData.confirmPassword && registerData.password === registerData.confirmPassword && (
                                    <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Passwords match
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleRegisterSubmit}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-5 h-5" />
                                        Create Account
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={handleToggleMode}
                                disabled={isLoading}
                                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors disabled:opacity-50"
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="text-center">
                    <p className="text-sm text-gray-500">
                        🔒 Secure authentication with Spring Boot backend
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;