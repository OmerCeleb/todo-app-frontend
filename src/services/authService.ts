// src/services/authService.ts
import { apiClient } from './apiClient';

/**
 * User entity representing authenticated user data
 */
export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

/**
 * Authentication response containing tokens and user data
 */
export interface AuthResponse {
    token: string;
    refreshToken?: string;
    user: User;
}

/**
 * Authentication Service
 * Handles all authentication-related API calls including login, register, logout, and token refresh
 */
class AuthService {
    private readonly basePath = '/auth';

    /**
     * Authenticate user with email and password
     * Backend: POST /api/auth/login
     *
     * @param credentials - User login credentials (email and password)
     * @returns Promise with authentication response containing tokens and user data
     * @throws ApiError if authentication fails
     */
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post<{
            token: string;
            refreshToken?: string;
            user: User;
        }>(`${this.basePath}/login`, credentials);

        // Store access token in apiClient
        apiClient.setAuthToken(response.token);

        // Store refresh token in localStorage if provided
        if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
        }

        // Store user data
        localStorage.setItem('user', JSON.stringify(response.user));

        return {
            token: response.token,
            refreshToken: response.refreshToken,
            user: response.user
        };
    }

    /**
     * Register a new user account
     * Backend: POST /api/auth/register
     *
     * @param userData - New user registration data (name, email, password)
     * @returns Promise with authentication response containing tokens and user data
     * @throws ApiError if registration fails (e.g., email already exists)
     */
    async register(userData: RegisterRequest): Promise<AuthResponse> {
        const response = await apiClient.post<{
            token: string;
            refreshToken?: string;
            user: User;
        }>(`${this.basePath}/register`, userData);

        // Store access token in apiClient
        apiClient.setAuthToken(response.token);

        // Store refresh token in localStorage if provided
        if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
        }

        // Store user data
        localStorage.setItem('user', JSON.stringify(response.user));

        return {
            token: response.token,
            refreshToken: response.refreshToken,
            user: response.user
        };
    }

    /**
     * Logout current user and clear all stored authentication data
     * Backend: POST /api/auth/logout
     *
     * @returns Promise that resolves when logout is complete
     * @note Clears tokens from storage even if API call fails
     */
    async logout(): Promise<void> {
        try {
            // Notify backend of logout
            await apiClient.post(`${this.basePath}/logout`, {});
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            // Clear all authentication data regardless of API response
            this.clearAuthData();
        }
    }

    /**
     * Refresh expired access token using refresh token
     * Backend: POST /api/auth/refresh
     *
     * @param refreshToken - Valid refresh token
     * @returns Promise with new authentication tokens and user data
     * @throws ApiError if refresh token is invalid or expired
     */
    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        const response = await apiClient.post<{
            token: string;
            refreshToken?: string;
            user: User;
        }>(`${this.basePath}/refresh`, { refreshToken });

        // Update stored access token
        apiClient.setAuthToken(response.token);

        // Update refresh token if new one is provided
        if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
        }

        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response.user));

        return {
            token: response.token,
            refreshToken: response.refreshToken,
            user: response.user
        };
    }

    /**
     * Get currently authenticated user from localStorage
     *
     * @returns User object if authenticated, null otherwise
     */
    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        try {
            return JSON.parse(userStr) as User;
        } catch (error) {
            console.error('Failed to parse user data:', error);
            return null;
        }
    }

    /**
     * Check if user is currently authenticated
     * Validates presence of both access token and user data
     *
     * @returns true if user is authenticated, false otherwise
     */
    isAuthenticated(): boolean {
        const token = localStorage.getItem('authToken');
        const user = this.getCurrentUser();
        return Boolean(token && user);
    }

    /**
     * Get stored refresh token from localStorage
     *
     * @returns Refresh token string if exists, null otherwise
     */
    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }

    /**
     * Clear all authentication data from storage
     * Use this for force logout without API call
     */
    clearAuthData(): void {
        apiClient.removeAuthToken();
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
    }

    /**
     * Verify if current token is still valid
     * This is a client-side check based on token existence
     * For server-side validation, make an authenticated API call
     *
     * @returns true if token exists, false otherwise
     */
    hasValidToken(): boolean {
        return Boolean(localStorage.getItem('authToken'));
    }

    /**
     * Validate current token and refresh if needed
     * Attempts to refresh token if expired
     *
     * @returns Promise<boolean> - true if token is valid or successfully refreshed, false otherwise
     */
    async validateAndRefreshToken(): Promise<boolean> {
        const token = localStorage.getItem('authToken');
        const refreshToken = this.getRefreshToken();

        // No tokens available
        if (!token && !refreshToken) {
            return false;
        }

        // If we have a token, assume it's valid (backend will validate on requests)
        if (token) {
            return true;
        }

        // Try to refresh if we only have refresh token
        if (refreshToken) {
            try {
                await this.refreshToken(refreshToken);
                return true;
            } catch (error) {
                console.error('Token refresh failed:', error);
                this.clearAuthData();
                return false;
            }
        }

        return false;
    }
}

// Export singleton instance
export const authService = new AuthService();