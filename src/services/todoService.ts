// src/services/todoService.ts
import { apiService } from './api';
import type { Todo } from '../components/TodoForm';

/**
 * Todo creation request payload
 */
export interface TodoCreateRequest {
    title: string;
    description?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    category?: string;
    dueDate?: string;
}

/**
 * Todo update request payload
 * All fields are optional except those you want to update
 */
export interface TodoUpdateRequest extends Partial<TodoCreateRequest> {
    completed?: boolean;
}

/**
 * Filter options for querying todos
 */
export interface TodoFilters {
    status?: 'all' | 'active' | 'completed';
    priority?: 'all' | 'LOW' | 'MEDIUM' | 'HIGH';
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
}

/**
 * Todo statistics response
 */
export interface TodoStats {
    total: number;
    completed: number;
    active: number;
    overdue: number;
}

/**
 * Todo Service
 * Handles all todo-related API calls including CRUD operations, filtering, and statistics
 */
class TodoService {
    private readonly basePath = '/todos';

    /**
     * Fetch all todos with optional filtering
     * Backend: GET /api/todos?status=...&priority=...&category=...&search=...
     *
     * @param filters - Optional filter parameters (status, priority, category, search, pagination)
     * @returns Promise with array of todos matching the filters
     */
    async getTodos(filters: TodoFilters = {}): Promise<Todo[]> {
        const params = new URLSearchParams();

        // Build query parameters from filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
            }
        });

        const queryString = params.toString();
        const endpoint = queryString ? `${this.basePath}?${queryString}` : this.basePath;

        return await apiService.get<Todo[]>(endpoint);
    }

    /**
     * Fetch a single todo by ID
     * Backend: GET /api/todos/{id}
     *
     * @param id - Todo ID
     * @returns Promise with todo object
     * @throws Error if todo not found or access denied
     */
    async getTodo(id: string): Promise<Todo> {
        return await apiService.get<Todo>(`${this.basePath}/${id}`);
    }

    /**
     * Create a new todo
     * Backend: POST /api/todos
     *
     * @param data - Todo creation data (title, description, priority, category, dueDate)
     * @returns Promise with created todo object
     * @throws Error if validation fails
     */
    async createTodo(data: TodoCreateRequest): Promise<Todo> {
        return await apiService.post<Todo>(this.basePath, {
            title: data.title,
            description: data.description,
            priority: data.priority,
            category: data.category,
            dueDate: data.dueDate ? `${data.dueDate}T23:59:59` : undefined
        });
    }

    /**
     * Update an existing todo
     * Backend: PUT /api/todos/{id}
     *
     * @param id - Todo ID to update
     * @param data - Updated todo data (partial update supported)
     * @returns Promise with updated todo object
     * @throws Error if todo not found or validation fails
     */
    async updateTodo(id: string, data: TodoUpdateRequest): Promise<Todo> {
        return await apiService.put<Todo>(`${this.basePath}/${id}`, {
            ...data,
            priority: data.priority ? data.priority.toUpperCase() : undefined,
            dueDate: data.dueDate ? `${data.dueDate}T23:59:59` : undefined
        });
    }

    /**
     * Delete a todo permanently
     * Backend: DELETE /api/todos/{id}
     *
     * @param id - Todo ID to delete
     * @returns Promise that resolves when deletion is complete
     * @throws Error if todo not found or access denied
     */
    async deleteTodo(id: string): Promise<void> {
        await apiService.delete<void>(`${this.basePath}/${id}`);
    }

    /**
     * Toggle todo completion status
     * Backend: PATCH /api/todos/{id}
     *
     * @param id - Todo ID to toggle
     * @param completed - New completion status (true/false)
     * @returns Promise with updated todo object
     */
    async toggleTodo(id: string, completed: boolean): Promise<Todo> {
        return await apiService.patch<Todo>(`${this.basePath}/${id}`, { completed });
    }

    /**
     * Delete multiple todos at once
     * Backend: POST /api/todos/bulk-delete
     *
     * @param ids - Array of todo IDs to delete
     * @returns Promise with deletion result
     * @example
     * await todoService.bulkDelete(['1', '2', '3']);
     */
    async bulkDelete(ids: string[]): Promise<void> {
        await apiService.post<void>(`${this.basePath}/bulk-delete`, { ids });
    }

    /**
     * Reorder todos (for drag & drop functionality)
     * Backend: POST /api/todos/reorder
     *
     * @param reorderData - Array of objects with id and new order position
     * @returns Promise that resolves when reordering is complete
     * @example
     * await todoService.reorderTodos([
     *   { id: '1', order: 0 },
     *   { id: '2', order: 1 },
     *   { id: '3', order: 2 }
     * ]);
     */
    async reorderTodos(reorderData: { id: string; order: number }[]): Promise<void> {
        await apiService.post<void>(`${this.basePath}/reorder`, reorderData);
    }

    /**
     * Get all unique categories used in user's todos
     * Backend: GET /api/todos/categories
     *
     * @returns Promise with array of category strings
     * @example
     * const categories = await todoService.getCategories();
     * // ['Work', 'Personal', 'Shopping', ...]
     */
    async getCategories(): Promise<string[]> {
        return await apiService.get<string[]>(`${this.basePath}/categories`);
    }

    /**
     * Get todo statistics for current user
     * Backend: GET /api/todos/stats
     *
     * @returns Promise with statistics object (total, completed, active, overdue counts)
     * @example
     * const stats = await todoService.getStats();
     * // { total: 10, completed: 4, active: 6, overdue: 2 }
     */
    async getStats(): Promise<TodoStats> {
        return await apiService.get<TodoStats>(`${this.basePath}/stats`);
    }

    /**
     * Get all overdue todos for current user
     * Backend: GET /api/todos/overdue
     *
     * Overdue todos are incomplete todos with due date in the past
     *
     * @returns Promise with array of overdue todos
     * @example
     * const overdue = await todoService.getOverdueTodos();
     */
    async getOverdueTodos(): Promise<Todo[]> {
        return await apiService.get<Todo[]>(`${this.basePath}/overdue`);
    }

    /**
     * Delete all completed todos for current user
     * Backend: DELETE /api/todos/completed
     *
     * This is useful for cleaning up completed tasks in bulk
     *
     * @returns Promise with deletion result including count of deleted todos
     * @example
     * const result = await todoService.deleteCompletedTodos();
     * console.log(`Deleted ${result.deletedCount} todos`);
     */
    async deleteCompletedTodos(): Promise<{ message: string; deletedCount: number }> {
        return await apiService.delete<{
            message: string;
            deletedCount: number;
        }>(`${this.basePath}/completed`);
    }

    /**
     * Search todos by keyword
     * This is a convenience wrapper around getTodos with search parameter
     * Backend: GET /api/todos?search=keyword
     *
     * Searches in todo title, description, and category
     *
     * @param query - Search keyword
     * @returns Promise with array of matching todos
     * @example
     * const results = await todoService.searchTodos('meeting');
     */
    async searchTodos(query: string): Promise<Todo[]> {
        return this.getTodos({ search: query });
    }

    /**
     * Get todos due today
     * Backend: GET /api/todos?dueDate=today
     *
     * @returns Promise with array of todos due today
     */
    async getTodosDueToday(): Promise<Todo[]> {
        const today = new Date().toISOString().split('T')[0];
        return this.getTodos({ search: today });
    }

    /**
     * Get todos by priority
     * Backend: GET /api/todos?priority=HIGH
     *
     * @param priority - Priority level (LOW, MEDIUM, HIGH)
     * @returns Promise with array of todos with specified priority
     */
    async getTodosByPriority(priority: 'LOW' | 'MEDIUM' | 'HIGH'): Promise<Todo[]> {
        return this.getTodos({ priority });
    }

    /**
     * Get todos by category
     * Backend: GET /api/todos?category=Work
     *
     * @param category - Category name
     * @returns Promise with array of todos in specified category
     */
    async getTodosByCategory(category: string): Promise<Todo[]> {
        return this.getTodos({ category });
    }

    /**
     * Get active (incomplete) todos only
     * Backend: GET /api/todos?status=active
     *
     * @returns Promise with array of active todos
     */
    async getActiveTodos(): Promise<Todo[]> {
        return this.getTodos({ status: 'active' });
    }

    /**
     * Get completed todos only
     * Backend: GET /api/todos?status=completed
     *
     * @returns Promise with array of completed todos
     */
    async getCompletedTodos(): Promise<Todo[]> {
        return this.getTodos({ status: 'completed' });
    }
}

// Export singleton instance
export const todoService = new TodoService();