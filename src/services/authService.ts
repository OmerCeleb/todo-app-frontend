// src/services/authService.ts
import { apiClient } from './apiClient';
import { API_CONFIG } from '../config/api';

// Types for authentication
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
    role: 'USER' | 'ADMIN';
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    type: string;
    user: User;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

class AuthService {
    /**
     * Register a new user
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>(
            API_CONFIG.ENDPOINTS.AUTH.REGISTER,
            data
        );

        // Store tokens in localStorage
        if (response.token) {
            apiClient.setAuthToken(response.token);
            this.setRefreshToken(response.refreshToken);
        }

        return response;
    }

    /**
     * Login user
     */
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>(
            API_CONFIG.ENDPOINTS.AUTH.LOGIN,
            data
        );

        // Store tokens in localStorage
        if (response.token) {
            apiClient.setAuthToken(response.token);
            this.setRefreshToken(response.refreshToken);
        }

        return response;
    }

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        try {
            await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {});
        } catch (error) {
            // Continue with logout even if server request fails
            console.warn('Logout request failed:', error);
        } finally {
            // Always clear local tokens
            this.clearTokens();
        }
    }

    /**
     * Refresh access token
     */
    async refreshToken(): Promise<AuthResponse> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await apiClient.post<AuthResponse>(
            API_CONFIG.ENDPOINTS.AUTH.REFRESH,
            { refreshToken }
        );

        // Update stored tokens
        if (response.token) {
            apiClient.setAuthToken(response.token);
            if (response.refreshToken) {
                this.setRefreshToken(response.refreshToken);
            }
        }

        return response;
    }

    /**
     * Get current user profile
     */
    async getCurrentUser(): Promise<User> {
        return apiClient.get<User>(API_CONFIG.ENDPOINTS.AUTH.ME);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        const token = localStorage.getItem('authToken');
        if (!token) return false;

        // Check if token is expired (basic check)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp > currentTime;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get stored refresh token
     */
    private getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }

    /**
     * Set refresh token in localStorage
     */
    private setRefreshToken(token: string): void {
        localStorage.setItem('refreshToken', token);
    }

    /**
     * Clear all stored tokens
     */
    private clearTokens(): void {
        apiClient.removeAuthToken();
        localStorage.removeItem('refreshToken');
    }

    /**
     * Get current auth token
     */
    getAuthToken(): string | null {
        return localStorage.getItem('authToken');
    }

    /**
     * Validate and auto-refresh token if needed
     */
    async validateAndRefreshToken(): Promise<boolean> {
        if (!this.isAuthenticated()) {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
                try {
                    await this.refreshToken();
                    return true;
                } catch (error) {
                    this.clearTokens();
                    return false;
                }
            }
            return false;
        }
        return true;
    }
}

// Export singleton instance
export const authService = new AuthService();