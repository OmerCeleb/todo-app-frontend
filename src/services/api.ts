// src/services/api.ts
import { env } from '../config/env';

/**
 * API Response interface (for reference, but we return T directly now)
 */
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success?: boolean;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * API Service
 * Handles all HTTP requests to the backend API
 */
class ApiService {
    private baseURL: string;
    private timeout: number;

    constructor() {
        this.baseURL = env.API_BASE_URL;
        this.timeout = env.API_TIMEOUT;
    }

    /**
     * Make HTTP request with error handling
     * @returns Promise with the unwrapped data (T), not ApiResponse<T>
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        // Get token from localStorage
        const token = localStorage.getItem('authToken');

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Add Authorization header if token exists
        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        const config: RequestInit = {
            ...options,
            headers,
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...config,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Handle 401 Unauthorized - redirect to login
            if (response.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                throw new Error('Unauthorized - Please login again');
            }

            // Handle errors
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // Handle empty responses (like DELETE)
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                return undefined as T;
            }

            const data = await response.json();

            // IMPORTANT: Backend returns data directly (not wrapped in {data: ...})
            // So we just return the parsed JSON as-is
            return data as T;

        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout');
                }
                throw error;
            }
            throw new Error('Unknown API error');
        }
    }

    /**
     * GET request
     * @returns Promise with unwrapped data (T)
     */
    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    /**
     * POST request
     * @returns Promise with unwrapped data (T)
     */
    async post<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * PUT request
     * @returns Promise with unwrapped data (T)
     */
    async put<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * DELETE request
     * @returns Promise with unwrapped data (T)
     */
    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    /**
     * PATCH request
     * @returns Promise with unwrapped data (T)
     */
    async patch<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
}

// Export singleton instance
export const apiService = new ApiService();