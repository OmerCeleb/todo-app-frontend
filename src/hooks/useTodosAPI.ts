// src/hooks/useTodosAPI.ts - COMPLETE WITH REORDER
import { useState, useCallback } from 'react';
// import { todoService } from '../services/todoService'; // Commented out for now
import type { Todo, TodoFormData } from '../components/TodoForm';
import type { FilterOptions } from './useTodos';

interface UseTodosAPIReturn {
    // Data
    todos: Todo[];
    categories: string[];
    filters: FilterOptions;

    // State
    loading: boolean;
    error: string | null;
    isRefreshing: boolean;

    // Operations
    createTodo: (data: TodoFormData) => Promise<void>;
    updateTodo: (id: string, data: TodoFormData) => Promise<void>;
    deleteTodo: (id: string) => Promise<void>;
    toggleTodo: (id: string) => Promise<void>;
    bulkDelete: (ids: string[]) => Promise<void>;
    reorderTodos: (reorderedTodos: Todo[]) => Promise<void>; // ← EKLENDI!

    // Filtering & Sorting
    setFilters: (filters: FilterOptions) => void;
    searchTodos: (query: string) => Todo[];

    // Utilities
    refreshTodos: () => Promise<void>;
    getStats: () => { total: number; completed: number; active: number; overdue: number };
    clearError: () => void;
}

export function useTodosAPI(): UseTodosAPIReturn {
    // For now, we'll use the existing useTodos as fallback
    // When backend is ready, we'll implement the actual API calls
    const useTodosModule = require('./useTodos');
    const useTodosDefault = useTodosModule.default || useTodosModule.useTodos;

    const {
        todos,
        categories,
        filters,
        addTodo,
        updateTodo: baseUpdateTodo,
        deleteTodo: baseDeleteTodo,
        toggleTodo: baseToggleTodo,
        setFilters,
        searchTodos,
        getStats,
        setTodos // ← BU GEREKLİ! useTodos hook'undan setTodos'u al
    } = useTodosDefault();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const createTodo = useCallback(async (data: TodoFormData) => {
        setLoading(true);
        try {
            addTodo(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create todo');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [addTodo]);

    const updateTodo = useCallback(async (id: string, data: TodoFormData) => {
        setLoading(true);
        try {
            baseUpdateTodo(data, id);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update todo');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [baseUpdateTodo]);

    const deleteTodo = useCallback(async (id: string) => {
        setLoading(true);
        try {
            baseDeleteTodo(id);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete todo');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [baseDeleteTodo]);

    const toggleTodo = useCallback(async (id: string) => {
        setLoading(true);
        try {
            baseToggleTodo(id);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle todo');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [baseToggleTodo]);

    const bulkDelete = useCallback(async (ids: string[]) => {
        setLoading(true);
        try {
            for (const id of ids) {
                baseDeleteTodo(id);
            }
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete todos');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [baseDeleteTodo]);

    // ← YENİ: reorderTodos fonksiyonu
    const reorderTodos = useCallback(async (reorderedTodos: Todo[]) => {
        setLoading(true);
        try {
            // State'i hemen güncelle (optimistic update)
            if (setTodos) {
                setTodos(reorderedTodos);
            }

            // Backend hazır olduğunda uncomment et:
            // await todoService.reorderTodos(reorderedTodos.map((todo, index) => ({ 
            //     id: todo.id, 
            //     order: index 
            // })));

            setError(null);
            console.log('✅ Todos reordered successfully');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reorder todos');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setTodos]);

    const refreshTodos = useCallback(async () => {
        setIsRefreshing(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsRefreshing(false);
    }, []);

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