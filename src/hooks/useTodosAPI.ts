// src/hooks/useTodosAPI.ts
import { useState, useCallback, useEffect } from 'react';
import { todoService } from '../services/todoService';
import type { Todo, TodoFormData } from '../components/TodoForm';

export interface FilterOptions {
    status: 'all' | 'active' | 'completed';
    priority: 'all' | 'low' | 'medium' | 'high';
    category: string;
    dateFilter: 'all' | 'today' | 'tomorrow' | 'this-week' | 'overdue' | 'no-date';
    sortBy: 'created' | 'updated' | 'title' | 'priority' | 'dueDate';
    sortOrder: 'asc' | 'desc';
}

interface UseTodosAPIReturn {
    todos: Todo[];
    categories: string[];
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
    getStats: () => { total: number; completed: number; active: number; overdue: number };
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
    const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        loadTodos();
    }, []);

    useEffect(() => {
        loadCategories();
    }, [todos]);

    const loadTodos = useCallback(async () => {
        setLoading(true);
        try {
            const response = await todoService.getTodos({
                status: filters.status !== 'all' ? filters.status : undefined,
                priority: filters.priority !== 'all' ? filters.priority : undefined,
                category: filters.category !== 'all' ? filters.category : undefined,
            });
            setTodos(response.data); // .data ile unwrap et
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load todos');
            console.error('Failed to load todos:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const loadCategories = useCallback(async () => {
        try {
            const response = await todoService.getCategories();
            setCategories(response.data); // .data ile unwrap et
        } catch (err) {
            console.error('Failed to load categories:', err);
        }
    }, []);

    const createTodo = useCallback(async (data: TodoFormData) => {
        setLoading(true);
        try {
            const response = await todoService.createTodo({
                title: data.title,
                description: data.description,
                priority: data.priority,
                category: data.category,
                dueDate: data.dueDate
            });
            setTodos(prev => [response.data, ...prev]); // .data ile unwrap et
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create todo');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateTodo = useCallback(async (id: string, data: TodoFormData) => {
        setLoading(true);
        try {
            const response = await todoService.updateTodo(id, {
                title: data.title,
                description: data.description,
                priority: data.priority,
                category: data.category,
                dueDate: data.dueDate
            });
            setTodos(prev => prev.map(todo => todo.id === id ? response.data : todo)); // .data
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update todo');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteTodo = useCallback(async (id: string) => {
        setLoading(true);
        try {
            await todoService.deleteTodo(id);
            setTodos(prev => prev.filter(todo => todo.id !== id));
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete todo');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleTodo = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const todo = todos.find(t => t.id === id);
            if (!todo) return;

            const response = await todoService.toggleTodo(id, !todo.completed);
            setTodos(prev => prev.map(t => t.id === id ? response.data : t)); // .data
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle todo');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [todos]);

    const bulkDelete = useCallback(async (ids: string[]) => {
        setLoading(true);
        try {
            await todoService.bulkDelete(ids);
            setTodos(prev => prev.filter(todo => !ids.includes(todo.id)));
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete todos');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const reorderTodos = useCallback(async (reorderedTodos: Todo[]) => {
        try {
            // Optimistic update
            setTodos(reorderedTodos);

            // Backend'e gönder (şimdilik comment'te bırak)
            // const reorderData = reorderedTodos.map((todo, index) => ({
            //     id: todo.id,
            //     order: index
            // }));
            // await todoService.reorderTodos(reorderData);

            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reorder todos');
            await loadTodos();
            throw err;
        }
    }, [loadTodos]);

    const refreshTodos = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await loadTodos();
        } finally {
            setIsRefreshing(false);
        }
    }, [loadTodos]);

    const searchTodos = useCallback((query: string): Todo[] => {
        if (!query.trim()) return todos;

        const lowercaseQuery = query.toLowerCase();
        return todos.filter(todo =>
            todo.title.toLowerCase().includes(lowercaseQuery) ||
            todo.description?.toLowerCase().includes(lowercaseQuery) ||
            todo.category?.toLowerCase().includes(lowercaseQuery)
        );
    }, [todos]);

    const getStats = useCallback(() => {
        const total = todos.length;
        const completed = todos.filter(t => t.completed).length;
        const active = total - completed;
        const overdue = todos.filter(t =>
            !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
        ).length;

        return { total, completed, active, overdue };
    }, [todos]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        todos,
        categories,
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
        getStats,
        clearError,
    };
}