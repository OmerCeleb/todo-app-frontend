// src/store/todoStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Todo, TodoFilter, TodoSort, TodoStats } from '../types';


interface TodoState {
    todos: Todo[];
    filter: TodoFilter;
    sort: TodoSort;

    // Actions
    addTodo: (todo: Todo) => void;
    updateTodo: (id: string, updates: Partial<Todo>) => void;
    deleteTodo: (id: string) => void;
    toggleTodo: (id: string) => void;
    setFilter: (filter: Partial<TodoFilter>) => void;
    setSort: (sort: Partial<TodoSort>) => void;

    // Computed
    getFilteredTodos: () => Todo[];
    getStats: () => TodoStats;
}

const defaultFilter: TodoFilter = {
    status: 'all',
    priority: 'all',
    category: 'all',
    dateFilter: 'all',
    searchQuery: '',
};

const defaultSort: TodoSort = {
    sortBy: 'created',
    sortOrder: 'desc',
};

const priorityOrder: Record<'HIGH' | 'MEDIUM' | 'LOW', number> = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
};

export const useTodoStore = create<TodoState>()(
    persist(
        (set, get) => ({
            todos: [],
            filter: defaultFilter,
            sort: defaultSort,

            addTodo: (todo) => set((state) => ({
                todos: [...state.todos, todo],
            })),

            updateTodo: (id, updates) => set((state) => ({
                todos: state.todos.map((todo) =>
                    todo.id === id ? { ...todo, ...updates } : todo
                ),
            })),

            deleteTodo: (id) => set((state) => ({
                todos: state.todos.filter((todo) => todo.id !== id),
            })),

            toggleTodo: (id) => set((state) => ({
                todos: state.todos.map((todo) =>
                    todo.id === id
                        ? { ...todo, completed: !todo.completed }
                        : todo
                ),
            })),

            setFilter: (filter) => set((state) => ({
                filter: { ...state.filter, ...filter },
            })),

            setSort: (sort) => set((state) => ({
                sort: { ...state.sort, ...sort },
            })),

            getFilteredTodos: () => {
                const { todos, filter, sort } = get();
                let filtered = [...todos];

                // Filter by status
                if (filter.status !== 'all') {
                    filtered = filtered.filter((todo) =>
                        filter.status === 'completed' ? todo.completed : !todo.completed
                    );
                }

                // Filter by priority
                if (filter.priority !== 'all') {
                    filtered = filtered.filter((todo) => todo.priority === filter.priority);
                }

                // Filter by category
                if (filter.category !== 'all') {
                    filtered = filtered.filter((todo) => todo.category === filter.category);
                }

                // Filter by search query
                if (filter.searchQuery && filter.searchQuery.trim() !== '') {
                    const query = filter.searchQuery.toLowerCase();
                    filtered = filtered.filter((todo) =>
                        todo.title.toLowerCase().includes(query) ||
                        todo.description?.toLowerCase().includes(query)
                    );
                }

                // Sort
                filtered.sort((a, b) => {
                    let comparison = 0;

                    switch (sort.sortBy) {
                        case 'priority':
                            comparison = priorityOrder[a.priority as 'HIGH' | 'MEDIUM' | 'LOW'] -
                                priorityOrder[b.priority as 'HIGH' | 'MEDIUM' | 'LOW'];
                            break;
                        case 'title':
                            comparison = a.title.localeCompare(b.title);
                            break;
                        case 'created':
                            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                            break;
                        case 'updated':
                            comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                            break;
                        case 'dueDate':
                            if (!a.dueDate && !b.dueDate) {
                                comparison = 0;
                            } else if (!a.dueDate) {
                                comparison = 1;
                            } else if (!b.dueDate) {
                                comparison = -1;
                            } else {
                                comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                            }
                            break;
                    }

                    return sort.sortOrder === 'asc' ? comparison : -comparison;
                });

                return filtered;
            },

            getStats: () => {
                const { todos } = get();

                const stats: TodoStats = {
                    total: todos.length,
                    completed: todos.filter((todo) => todo.completed).length,
                    active: todos.filter((todo) => !todo.completed).length,
                    overdue: todos.filter((todo) => {
                        if (!todo.dueDate || todo.completed) {
                            return false;
                        }
                        return new Date(todo.dueDate) < new Date();
                    }).length,
                };

                return stats;
            },
        }),
        {
            name: 'todo-storage',
        }
    )
);