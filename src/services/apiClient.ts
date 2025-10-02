// src/services/apiClient.ts
import { API_CONFIG } from '../config/api';

export interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    error?: string;
}

export class ApiError extends Error {
    public status?: number;
    public data?: any;

    constructor(message: string, status?: number, data?: any) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

class ApiClient {
    private baseURL: string;
    private timeout: number;

    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
    }

    /**
     * Get stored JWT token from localStorage
     */
    private getAuthToken(): string | null {
        return localStorage.getItem('authToken');
    }

    /**
     * Set JWT token in localStorage
     */
    public setAuthToken(token: string): void {
        localStorage.setItem('authToken', token);
    }

    /**
     * Remove JWT token from localStorage
     */
    public removeAuthToken(): void {
        localStorage.removeItem('authToken');
    }

    /**
     * Get default headers for requests
     */
    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        const token = this.getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Make HTTP request with error handling
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        const config: RequestInit = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...config,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Parse response
            let responseData: any;
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            // Handle errors
            if (!response.ok) {
                // Extract error message from different possible response formats
                let errorMessage = 'An error occurred';

                if (typeof responseData === 'object') {
                    // Try different error message fields
                    errorMessage = responseData.message
                        || responseData.error
                        || responseData.errors?.[0]?.message
                        || `HTTP error! status: ${response.status}`;
                } else if (typeof responseData === 'string') {
                    errorMessage = responseData;
                }

                console.error('API Error Response:', {
                    status: response.status,
                    data: responseData,
                    message: errorMessage
                });

                throw new ApiError(
                    errorMessage,
                    response.status,
                    responseData
                );
            }

            return responseData;
        } catch (error) {
            // If it's already an ApiError, rethrow it
            if (error instanceof ApiError) {
                throw error;
            }

            // Handle other error types
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new ApiError('Request timeout', 408);
                }
                throw new ApiError(`Network error: ${error.message}`, 0);
            }

            throw new ApiError('Unknown error occurred', 0);
        }
    }

    /**
     * GET request
     */
    public async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    /**
     * POST request
     */
    public async post<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * PUT request
     */
    public async put<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * DELETE request
     */
    public async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    /**
     * PATCH request
     */
    public async patch<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
}

// Export singleton instance
export const apiClient = new ApiClient();