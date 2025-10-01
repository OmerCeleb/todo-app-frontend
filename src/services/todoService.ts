// src/services/todoService.ts
import { apiService } from './api';
import type { Todo } from '../components/TodoForm';

export interface TodoCreateRequest {
    title: string;
    description?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    category?: string;
    dueDate?: string;
}

export interface TodoUpdateRequest extends Partial<TodoCreateRequest> {
    completed?: boolean;
}

export interface TodoFilters {
    status?: 'all' | 'active' | 'completed';
    priority?: 'all' | 'LOW' | 'MEDIUM' | 'HIGH';
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
}

class TodoService {
    private readonly basePath = '/todos';

    async getTodos(filters: TodoFilters = {}) {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
            }
        });

        const queryString = params.toString();
        const endpoint = queryString ? `${this.basePath}?${queryString}` : this.basePath;

        return apiService.get<Todo[]>(endpoint);
    }

    async getTodo(id: string) {
        return apiService.get<Todo>(`${this.basePath}/${id}`);
    }

    async createTodo(data: TodoCreateRequest) {
        return apiService.post<Todo>(this.basePath, {
            title: data.title,
            description: data.description,
            priority: data.priority,  // toUpperCase() kaldırıldı
            category: data.category,
            dueDate: data.dueDate ? `${data.dueDate}T23:59:59` : undefined
        });
    }

    async updateTodo(id: string, data: TodoUpdateRequest) {
        return apiService.put<Todo>(`${this.basePath}/${id}`, {
            ...data,
            priority: data.priority ? data.priority.toUpperCase() : undefined,
            dueDate: data.dueDate ? `${data.dueDate}T23:59:59` : undefined
        });
    }

    async deleteTodo(id: string) {
        return apiService.delete<void>(`${this.basePath}/${id}`);
    }

    async toggleTodo(id: string, completed: boolean) {
        return apiService.patch<Todo>(`${this.basePath}/${id}`, { completed });
    }

    async bulkDelete(ids: string[]) {
        return apiService.post<void>(`${this.basePath}/bulk-delete`, { ids });
    }

    async reorderTodos(reorderData: { id: string; order: number }[]) {
        return apiService.post<void>(`${this.basePath}/reorder`, reorderData);
    }

    async getCategories() {
        return apiService.get<string[]>(`${this.basePath}/categories`);
    }

    async getStats() {
        return apiService.get<{
            total: number;
            completed: number;
            active: number;
            overdue: number;
        }>(`${this.basePath}/stats`);
    }
}

export const todoService = new TodoService();