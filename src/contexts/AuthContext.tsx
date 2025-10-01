// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User, LoginRequest, RegisterRequest } from '../services/authService';
import { ApiError } from '../services/apiClient';

interface AuthContextType {
    // State
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (credentials: LoginRequest) => Promise<void>;
    register: (userData: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    clearError: () => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check if user is authenticated on app start
    useEffect(() => {
        initializeAuth();
    }, []);

    /**
     * Initialize authentication state on app start
     */
    const initializeAuth = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const userStr = localStorage.getItem('user');

            if (token && userStr) {
                const userData = JSON.parse(userStr);
                setUser(userData);
            }
        } catch (error) {
            console.error('Auth initialization failed:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        } finally {
            setIsLoading(false);
        }
    };
    /**
     * Login user
     */
    const login = async (credentials: LoginRequest) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.login(credentials);

            // localStorage'a kaydet
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            setUser(response.user);
        } catch (error) {
            const errorMessage = error instanceof ApiError
                ? error.message
                : 'Login failed. Please try again.';
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };


    /**
     * Register new user
     */
    const register = async (userData: RegisterRequest) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.register(userData);
            setUser(response.user);
        } catch (error) {
            const errorMessage = error instanceof ApiError
                ? error.message
                : 'Registration failed. Please try again.';
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Logout user
     */
    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();
        } catch (error) {
            console.warn('Logout request failed:', error);
        } finally {
            setUser(null);
            setError(null);
            setIsLoading(false);
        }
    };

    /**
     * Refresh current user data
     */
    const refreshUser = async () => {
        if (!authService.isAuthenticated()) {
            return;
        }

        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error('Failed to refresh user:', error);
            // If refresh fails, logout user
            await logout();
        }
    };

    /**
     * Clear error state
     */
    const clearError = () => {
        setError(null);
    };

    const value: AuthContextType = {
        // State
        user,
        isAuthenticated: !!user,
        isLoading,
        error,

        // Actions
        login,
        register,
        logout,
        refreshUser,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

/**
 * Higher-order component to protect routes
 */
export function withAuth<P extends object>(
    Component: React.ComponentType<P>
): React.ComponentType<P> {
    return function AuthenticatedComponent(props: P) {
        const { isAuthenticated, isLoading } = useAuth();

        if (isLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            );
        }

        if (!isAuthenticated) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Authentication Required
                        </h2>
                        <p className="text-gray-600">
                            Please log in to access this page.
                        </p>
                    </div>
                </div>
            );
        }

        return <Component {...props} />;
    };
}