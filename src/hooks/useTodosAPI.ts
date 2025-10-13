// src/hooks/useTodosAPI.ts - SIMPLIFIED VERSION
import { useState, useCallback, useEffect, useMemo } from 'react';
import { todoService } from '../services/todoService';
import type { Todo, TodoFormData } from '../components/TodoForm';
import { getDateFilters, type DateFilter } from '../utils/dateUtils';
import { logger } from '../utils/logger';  // ✅ Production-safe logger

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
     * ✅ SIMPLIFIED: No try-catch, apiClient handles errors
     */
    const loadStats = useCallback(async () => {
        const stats = await todoService.getStats();
        setStats(stats);
        logger.debug('Stats loaded:', stats);
    }, []);

    /**
     * Load categories from API
     */
    const loadCategories = useCallback(async () => {
        const cats = await todoService.getCategories();
        setCategories(cats);
        logger.debug('Categories loaded:', cats);
    }, []);

    /**
     * Fetch todos from backend
     * ✅ SIMPLIFIED: Centralized error handling
     */
    const fetchTodos = useCallback(async () => {
        setLoading(true);
        try {
            const data = await todoService.getTodos();
            setTodos(data);
            await Promise.all([loadCategories(), loadStats()]);
            setError(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch todos';
            setError(message);
            logger.error('Error fetching todos:', err);
        } finally {
            setLoading(false);
        }
    }, [loadCategories, loadStats]);

    /**
     * Apply client-side filtering and sorting
     */
    const filteredAndSortedTodos = useMemo(() => {
        logger.debug('Applying filters:', filters);
        let filtered = [...todos];

        // Status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter(todo => {
                if (filters.status === 'completed') return todo.completed;
                if (filters.status === 'active') return !todo.completed;
                return true;
            });
        }

        // Priority filter
        if (filters.priority !== 'all') {
            filtered = filtered.filter(todo => todo.priority === filters.priority);
        }

        // Category filter
        if (filters.category !== 'all') {
            filtered = filtered.filter(todo => todo.category === filters.category);
        }

        // Date filter
        if (filters.dateFilter !== 'all') {
            const dateFilterFunctions = getDateFilters();
            const selectedDateFilter = dateFilterFunctions.find((df: DateFilter) => df.key === filters.dateFilter);
            if (selectedDateFilter) {
                filtered = selectedDateFilter.filter(filtered);
            }
        }

        // Sorting
        filtered.sort((a, b) => {
            let comparison = 0;

            switch (filters.sortBy) {
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'created':
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
                case 'updated':
                    comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                    break;
                case 'priority':
                    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                    comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
                    break;
                case 'dueDate':
                    if (!a.dueDate && !b.dueDate) comparison = 0;
                    else if (!a.dueDate) comparison = 1;
                    else if (!b.dueDate) comparison = -1;
                    else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                    break;
                default:
                    comparison = 0;
            }

            return filters.sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [todos, filters]);

    /**
     * Search todos
     */
    const searchTodos = useCallback((query: string): Todo[] => {
        if (!query) return filteredAndSortedTodos;

        const searchQuery = query.toLowerCase();
        return filteredAndSortedTodos.filter(todo =>
            todo.title.toLowerCase().includes(searchQuery) ||
            todo.description?.toLowerCase().includes(searchQuery) ||
            todo.category?.toLowerCase().includes(searchQuery)
        );
    }, [filteredAndSortedTodos]);

    /**
     * ✅ SIMPLIFIED CRUD Operations - No try-catch!
     * apiClient already handles errors and throws them
     * Parent components can catch if needed
     */

    const createTodo = useCallback(async (data: TodoFormData) => {
        await todoService.createTodo(data);
        await fetchTodos();
    }, [fetchTodos]);

    const updateTodo = useCallback(async (id: string, data: TodoFormData) => {
        await todoService.updateTodo(id, data);
        await fetchTodos();
    }, [fetchTodos]);

    const deleteTodo = useCallback(async (id: string) => {
        await todoService.deleteTodo(id);
        await fetchTodos();
    }, [fetchTodos]);

    const toggleTodo = useCallback(async (id: string) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) throw new Error('Todo not found');

        await todoService.toggleTodo(id, !todo.completed);
        await fetchTodos();
    }, [todos, fetchTodos]);

    const bulkDelete = useCallback(async (ids: string[]) => {
        await Promise.all(ids.map(id => todoService.deleteTodo(id)));
        await fetchTodos();
    }, [fetchTodos]);

    const reorderTodos = useCallback(async (reorderedTodos: Todo[]) => {
        setTodos(reorderedTodos);
        // Optionally send to backend
    }, []);

    /**
     * Refresh todos
     */
    const refreshTodos = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await fetchTodos();
        } finally {
            setIsRefreshing(false);
        }
    }, [fetchTodos]);

    /**
     * Clear error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Initial load
    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    return {
        todos: filteredAndSortedTodos,
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
        clearError
    };
}

/**
 * ✅ KEY IMPROVEMENTS:
 *
 * 1. Removed unnecessary try-catch blocks in CRUD operations
 *    - apiClient already handles errors
 *    - Parent components can catch if they need to
 *
 * 2. Added production-safe logger
 *    - Only logs in development
 *    - Formatted output with timestamps
 *
 * 3. Cleaner code
 *    - Less boilerplate
 *    - More readable
 *    - Same functionality
 *
 * 4. Centralized error handling
 *    - Only fetchTodos has try-catch for loading state
 *    - Others let errors bubble up naturally
 */