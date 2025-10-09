// src/hooks/useTodos.ts
import { useState, useMemo } from 'react';
import type { Todo, TodoFormData } from '../components/TodoForm';
import { getDateFilters, type DateFilter } from '../utils/dateUtils';

// FilterOptions interface - MUST match TodoFilters
export interface FilterOptions {
    status: 'all' | 'active' | 'completed';
    priority: 'all' | 'LOW' | 'MEDIUM' | 'HIGH';
    category: string;
    dateFilter: 'all' | 'today' | 'tomorrow' | 'this-week' | 'overdue' | 'no-date';
    sortBy: 'created' | 'updated' | 'title' | 'priority' | 'dueDate';
    sortOrder: 'asc' | 'desc';
}

// Mock data - enhanced with more examples
const initialTodos: Todo[] = [
    {
        id: '1',
        title: 'Build Modular Todo App',
        description: 'Create a professional todo application with clean architecture',
        completed: false,
        priority: 'HIGH',
        category: 'Development',
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z',
        dueDate: '2025-01-20T23:59:59Z',
    },
    {
        id: '2',
        title: 'Add Dark Mode',
        description: 'Implement theme switching functionality',
        completed: false,
        priority: 'MEDIUM',
        category: 'Design',
        createdAt: '2025-01-14T09:00:00Z',
        updatedAt: '2025-01-15T14:30:00Z',
    },
    {
        id: '3',
        title: 'Component Separation',
        description: 'Break down App.tsx into modular components',
        completed: true,
        priority: 'HIGH',
        category: 'Architecture',
        createdAt: '2025-01-13T15:00:00Z',
        updatedAt: '2025-01-13T15:00:00Z',
    },
    {
        id: '4',
        title: 'Setup Backend API',
        description: 'Create Spring Boot backend with PostgreSQL',
        completed: false,
        priority: 'HIGH',
        category: 'Backend',
        createdAt: '2025-01-12T11:00:00Z',
        updatedAt: '2025-01-12T11:00:00Z',
        dueDate: '2025-01-18T23:59:59Z',
    },
    {
        id: '5',
        title: 'Write Documentation',
        description: 'Add README and API documentation',
        completed: false,
        priority: 'LOW',
        category: 'Documentation',
        createdAt: '2025-01-11T16:00:00Z',
        updatedAt: '2025-01-11T16:00:00Z',
    },
    {
        id: '6',
        title: 'Deploy to Production',
        description: 'Deploy app to cloud platform',
        completed: false,
        priority: 'MEDIUM',
        category: 'DevOps',
        createdAt: '2025-01-10T08:00:00Z',
        updatedAt: '2025-01-10T08:00:00Z',
        dueDate: '2025-01-25T23:59:59Z',
    },
    {
        id: '7',
        title: 'Setup Testing',
        description: 'Add unit and integration tests',
        completed: false,
        priority: 'MEDIUM',
        category: 'Testing',
        createdAt: '2025-01-09T14:00:00Z',
        updatedAt: '2025-01-09T14:00:00Z',
    },
    {
        id: '8',
        title: 'Performance Optimization',
        description: 'Optimize bundle size and loading speed',
        completed: true,
        priority: 'LOW',
        category: 'Performance',
        createdAt: '2025-01-08T12:00:00Z',
        updatedAt: '2025-01-08T12:00:00Z',
    },
    {
        id: '9',
        title: 'Meeting with Client',
        description: 'Discuss project requirements and timeline',
        completed: false,
        priority: 'HIGH',
        category: 'Business',
        createdAt: '2025-01-07T10:00:00Z',
        updatedAt: '2025-01-07T10:00:00Z',
        dueDate: new Date().toISOString(), // Today
    },
    {
        id: '10',
        title: 'Review Pull Requests',
        description: 'Review and merge pending pull requests',
        completed: false,
        priority: 'MEDIUM',
        category: 'Development',
        createdAt: '2025-01-06T16:00:00Z',
        updatedAt: '2025-01-06T16:00:00Z',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    },
];

export function useTodos() {
    // State
    const [todos, setTodos] = useState<Todo[]>(initialTodos);
    const [filters, setFilters] = useState<FilterOptions>({
        status: 'all',
        priority: 'all',
        category: 'all',
        dateFilter: 'all',
        sortBy: 'created',
        sortOrder: 'desc',
    });

    // Utility functions
    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

    // Get unique categories from todos
    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(todos.map(todo => todo.category).filter(Boolean))];
        return uniqueCategories as string[];
    }, [todos]);

    // Apply filters and sorting
    const filteredAndSortedTodos = useMemo(() => {
        let filtered = [...todos];

        // Apply status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter(todo => {
                if (filters.status === 'completed') return todo.completed;
                if (filters.status === 'active') return !todo.completed;
                return true;
            });
        }

        // Apply priority filter
        if (filters.priority !== 'all') {
            filtered = filtered.filter(todo => todo.priority === filters.priority);
        }

        // Apply category filter
        if (filters.category !== 'all') {
            filtered = filtered.filter(todo => todo.category === filters.category);
        }

        // Apply date filter
        if (filters.dateFilter !== 'all') {
            const dateFilterFunctions = getDateFilters();
            const selectedDateFilter = dateFilterFunctions.find((df: DateFilter) => df.key === filters.dateFilter);
            if (selectedDateFilter) {
                filtered = selectedDateFilter.filter(filtered);
            }
        }

        // Apply sorting
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

    // Search function (separate from filters)
    const searchTodos = (searchQuery: string): Todo[] => {
        if (!searchQuery) return filteredAndSortedTodos;

        const query = searchQuery.toLowerCase();
        return filteredAndSortedTodos.filter(todo =>
            todo.title.toLowerCase().includes(query) ||
            todo.description?.toLowerCase().includes(query) ||
            todo.category?.toLowerCase().includes(query)
        );
    };

    // Legacy filterTodos function for backward compatibility
    const filterTodos = (searchQuery: string): Todo[] => {
        return searchTodos(searchQuery);
    };

    // CRUD Operations
    const addTodo = (formData: TodoFormData) => {
        const newTodo: Todo = {
            id: generateId(),
            title: formData.title,
            description: formData.description || undefined,
            completed: false,
            priority: formData.priority,
            category: formData.category || undefined,
            dueDate: formData.dueDate ? `${formData.dueDate}T23:59:59Z` : undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setTodos(prev => [newTodo, ...prev]);
    };

    const updateTodo = (formData: TodoFormData, id?: string) => {
        if (!id) return;

        setTodos(prev => prev.map(todo =>
            todo.id === id
                ? {
                    ...todo,
                    title: formData.title,
                    description: formData.description || undefined,
                    priority: formData.priority,
                    category: formData.category || undefined,
                    dueDate: formData.dueDate ? `${formData.dueDate}T23:59:59Z` : undefined,
                    updatedAt: new Date().toISOString(),
                }
                : todo
        ));
    };

    const toggleTodo = (id: string) => {
        setTodos(prev => prev.map(todo =>
            todo.id === id
                ? { ...todo, completed: !todo.completed, updatedAt: new Date().toISOString() }
                : todo
        ));
    };

    const deleteTodo = (id: string) => {
        setTodos(prev => prev.filter(todo => todo.id !== id));
    };

    // Calculate statistics (based on all todos)
    const getStats = () => {
        const allTodos = todos; // Stats should be based on all todos, not filtered
        return {
            total: allTodos.length,
            completed: allTodos.filter(t => t.completed).length,
            active: allTodos.filter(t => !t.completed).length,
            overdue: allTodos.filter(t =>
                t.dueDate &&
                new Date(t.dueDate) < new Date() &&
                !t.completed
            ).length,
        };
    };

    // Get filtered stats (for display purposes)
    const getFilteredStats = () => {
        return {
            total: filteredAndSortedTodos.length,
            completed: filteredAndSortedTodos.filter(t => t.completed).length,
            active: filteredAndSortedTodos.filter(t => !t.completed).length,
            overdue: filteredAndSortedTodos.filter(t =>
                t.dueDate &&
                new Date(t.dueDate) < new Date() &&
                !t.completed
            ).length,
        };
    };

    return {
        // Data
        todos: filteredAndSortedTodos,
        allTodos: todos,
        categories,
        filters,

        // Operations
        addTodo,
        updateTodo,
        toggleTodo,
        deleteTodo,
        setTodos, // ←

        // Filtering & Sorting
        setFilters,
        searchTodos,
        filterTodos,

        // Utilities
        getStats,
        getFilteredStats,
    };
}

// Export for module recognition
export default useTodos;