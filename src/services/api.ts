// src/services/api.ts
import { env } from '../config/env';

export interface ApiResponse<T> {
    data: T;
    message?: string;
    success?: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

class ApiService {
    private baseURL: string;
    private timeout: number;

    constructor() {
        this.baseURL = env.API_BASE_URL;
        this.timeout = env.API_TIMEOUT;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;

        // Token'ı localStorage'dan al
        const token = localStorage.getItem('authToken');

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Token varsa Authorization header'ı ekle
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

            if (!response.ok) {
                // 401 durumunda token'ı temizle ve login'e yönlendir
                if (response.status === 401) {
                    localStorage.removeItem('authToken');
                    window.location.href = '/login';
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Backend'den gelen response farklı formatlarda olabilir
            // Eğer data zaten istediğimiz formatta ise direkt dön
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                return { data } as ApiResponse<T>;
            }

            // Eğer response direkt array veya primitive ise sarmalayarak dön
            return { data: data as T } as ApiResponse<T>;

        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`API request failed: ${error.message}`);
            }
            throw new Error('Unknown API error');
        }
    }

    // GET request
    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    // POST request
    async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // PUT request
    async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // DELETE request
    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    // PATCH request
    async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
}

export const apiService = new ApiService();