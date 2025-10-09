// src/hooks/useTodosAPI.ts
import { useState, useCallback, useEffect } from 'react';
import { todoService } from '../services/todoService';
import type { Todo, TodoFormData } from '../components/TodoForm';

export interface FilterOptions {
    status: 'all' | 'active' | 'completed';
    priority: 'all' | 'LOW' | 'MEDIUM' | 'HIGH';
    category: string;
    dateFilter: 'all' | 'today' | 'tomorrow' | 'this-week' | 'overdue' | 'no-date';
    sortBy: 'created' | 'updated' | 'title' | 'priority' | 'dueDate';
    sortOrder: 'asc' | 'desc';
}

export interface TodoStats {
    total: number;
    completed: number;
    active: number;
    overdue: number;
}

interface UseTodosAPIReturn {
    todos: Todo[];
    categories: string[];
    stats: TodoStats;
    filters: FilterOptions;
    loading: boolean;
    error: string | null;
    isRefreshing: boolean;
    createTodo: (data: TodoFormData) => Promise<void>;
    updateTodo: (id: string, data: TodoFormData) => Promise<void>;
    deleteTodo: (id: string) => Promise<void>;
    toggleTodo: (id: string) => Promise<void>;
    bulkDelete: (ids: string[]) => Promise<void>;
    reorderTodos: (reorderedTodos: Todo[]) => Promise<void>;
    setFilters: (filters: FilterOptions) => void;
    searchTodos: (query: string) => Todo[];
    refreshTodos: () => Promise<void>;
    clearError: () => void;
}

const defaultFilters: FilterOptions = {
    status: 'all',
    priority: 'all',
    category: 'all',
    dateFilter: 'all',
    sortBy: 'created',
    sortOrder: 'desc'
};

export function useTodosAPI(): UseTodosAPIReturn {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [stats, setStats] = useState<TodoStats>({ total: 0, completed: 0, active: 0, overdue: 0 });
    const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    /**
     * Load statistics from API
     * FIXED: Now correctly extracts data from response
     */
    const loadStats = useCallback(async () => {
        try {
            const stats = await todoService.getStats(); // Returns TodoStats directly
            setStats(stats);
            console.log('📊 Stats loaded:', stats);
        } catch (err) {
            console.error('Failed to load stats:', err);
            // Fallback: Calculate stats locally
            const total = todos.length;
            const completed = todos.filter(t => t.completed).length;
            const active = total - completed;
            const overdue = todos.filter(t =>
                !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
            ).length;
            setStats({ total, completed, active, overdue });
        }
    }, [todos]);

    /**
     * Load categories from API
     * FIXED: Now correctly extracts data from response
     */
    const loadCategories = useCallback(async () => {
        try {
            const categories = await todoService.getCategories(); // Returns string[] directly
            setCategories(categories);
            console.log('✅ Categories loaded:', categories);
        } catch (err) {
            console.error('Failed to load categories:', err);
        }
    }, []);

    /**
     * Load todos from API with filters
     * FIXED: Now correctly extracts data from response
     */
    const loadTodos = useCallback(async () => {
        setLoading(true);
        try {
            const todos = await todoService.getTodos({ // Returns Todo[] directly
                status: filters.status !== 'all' ? filters.status : undefined,
                priority: filters.priority !== 'all' ? filters.priority : undefined,
                category: filters.category !== 'all' ? filters.category : undefined,
            });
            setTodos(todos);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load todos');
            console.error('Failed to load todos:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Initial load: Load todos, categories, and stats
    useEffect(() => {
        loadTodos();
        loadCategories();
        loadStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reload todos when filters change
    useEffect(() => {
        loadTodos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    // Update stats when todos change
    useEffect(() => {
        if (todos.length > 0) {
            loadStats();
        }
    }, [todos.length, loadStats]);

    /**
     * Create a new todo
     * FIXED: Now correctly extracts data from response
     */
    const createTodo = useCallback(async (data: TodoFormData) => {
        setLoading(true);
        try {
            const newTodo = await todoService.createTodo({ // Returns Todo directly
                title: data.title,
                description: data.description,
                priority: data.priority,
                category: data.category,
                dueDate: data.dueDate
            });
            setTodos(prev => [newTodo, ...prev]); // FIXED: newTodo is Todo, not ApiResponse<Todo>
            await loadCategories();
            await loadStats();
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create todo');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadCategories, loadStats]);

    /**
     * Update an existing todo
     * FIXED: Now correctly extracts data from response
     */
    const updateTodo = useCallback(async (id: string, data: TodoFormData) => {
        setLoading(true);
        try {
            const updatedTodo = await todoService.updateTodo(id, { // Returns Todo directly
                title: data.title,
                description: data.description,
                priority: data.priority,
                category: data.category,
                dueDate: data.dueDate
            });
            setTodos(prev => prev.map(todo => todo.id === id ? updatedTodo : todo)); // FIXED
            await loadCategories();
            await loadStats();
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update todo');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadCategories, loadStats]);

    /**
     * Delete a todo
     */
    const deleteTodo = useCallback(async (id: string) => {
        setLoading(true);
        try {
            await todoService.deleteTodo(id);
            setTodos(prev => prev.filter(todo => todo.id !== id));
            await loadCategories();
            await loadStats();
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete todo');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadCategories, loadStats]);

    /**
     * Toggle todo completion status
     * FIXED: Now correctly extracts data from response
     */
    const toggleTodo = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const todo = todos.find(t => t.id === id);
            if (!todo) return;

            const updatedTodo = await todoService.toggleTodo(id, !todo.completed); // Returns Todo directly
            setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t)); // FIXED
            await loadStats();
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle todo');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [todos, loadStats]);

    /**
     * Delete multiple todos at once
     */
    const bulkDelete = useCallback(async (ids: string[]) => {
        setLoading(true);
        try {
            await todoService.bulkDelete(ids);
            setTodos(prev => prev.filter(todo => !ids.includes(todo.id)));
            await loadCategories();
            await loadStats();
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete todos');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadCategories, loadStats]);

    /**
     * Reorder todos (drag & drop)
     */
    const reorderTodos = useCallback(async (reorderedTodos: Todo[]) => {
        try {
            setTodos(reorderedTodos);
            const reorderData = reorderedTodos.map((todo, index) => ({
                id: todo.id,
                order: index
            }));
            await todoService.reorderTodos(reorderData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reorder todos');
            await loadTodos();
            throw err;
        }
    }, [loadTodos]);

    /**
     * Refresh all data (todos, categories, stats)
     */
    const refreshTodos = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await loadTodos();
            await loadCategories();
            await loadStats();
        } finally {
            setIsRefreshing(false);
        }
    }, [loadTodos, loadCategories, loadStats]);

    /**
     * Search todos by query string
     * Client-side filtering for instant results
     */
    const searchTodos = useCallback((query: string): Todo[] => {
        if (!query.trim()) return todos;

        const lowercaseQuery = query.toLowerCase();
        return todos.filter(todo =>
            todo.title.toLowerCase().includes(lowercaseQuery) ||
            todo.description?.toLowerCase().includes(lowercaseQuery) ||
            todo.category?.toLowerCase().includes(lowercaseQuery)
        );
    }, [todos]);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        todos,
        categories,
        stats,
        filters,
        loading,
        error,
        isRefreshing,
        createTodo,
        updateTodo,
        deleteTodo,
        toggleTodo,
        bulkDelete,
        reorderTodos,
        setFilters,
        searchTodos,
        refreshTodos,
        clearError,
    };
}