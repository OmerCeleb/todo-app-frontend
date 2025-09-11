import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Todo, TodoFilter, TodoSort, TodoStats } from '@/types';

interface TodoState {
    // State
    todos: Todo[];
    loading: boolean;
    error: string | null;
    filter: TodoFilter;
    sort: TodoSort;

    // Computed
    filteredTodos: Todo[];
    stats: TodoStats;

    // Actions
    setTodos: (todos: Todo[]) => void;
    addTodo: (todo: Todo) => void;
    updateTodo: (id: string, updates: Partial<Todo>) => void;
    deleteTodo: (id: string) => void;
    toggleTodo: (id: string) => void;
    clearCompleted: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setFilter: (filter: Partial<TodoFilter>) => void;
    setSort: (sort: TodoSort) => void;
    reset: () => void;
}

const initialState = {
    todos: [],
    loading: false,
    error: null,
    filter: {
        type: 'all' as const,
        category: undefined,
        priority: undefined,
        search: undefined,
    },
    sort: {
        field: 'created' as const,
        direction: 'desc' as const,
    },
};

// Helper functions
const calculateStats = (todos: Todo[]): TodoStats => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const active = total - completed;

    const byPriority = todos.reduce(
        (acc, todo) => {
            acc[todo.priority] = (acc[todo.priority] || 0) + 1;
            return acc;
        },
        { low: 0, medium: 0, high: 0 }
    );

    return { total, completed, active, byPriority };
};

const filterTodos = (todos: Todo[], filter: TodoFilter): Todo[] => {
    return todos.filter(todo => {
        // Filter by completion status
        if (filter.type === 'active' && todo.completed) return false;
        if (filter.type === 'completed' && !todo.completed) return false;

        // Filter by category
        if (filter.category && todo.category !== filter.category) return false;

        // Filter by priority
        if (filter.priority && todo.priority !== filter.priority) return false;

        // Filter by search
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            const titleMatch = todo.title.toLowerCase().includes(searchLower);
            const descriptionMatch = todo.description?.toLowerCase().includes(searchLower);
            if (!titleMatch && !descriptionMatch) return false;
        }

        return true;
    });
};

const sortTodos = (todos: Todo[], sort: TodoSort): Todo[] => {
    return [...todos].sort((a, b) => {
        let comparison = 0;

        switch (sort.field) {
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
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
                break;
            case 'dueDate':
                if (!a.dueDate && !b.dueDate) comparison = 0;
                else if (!a.dueDate) comparison = 1;
                else if (!b.dueDate) comparison = -1;
                else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                break;
        }

        return sort.direction === 'asc' ? comparison : -comparison;
    });
};

export const useTodoStore = create<TodoState>()(
    devtools(
        (set, get) => ({
            ...initialState,

            // Computed properties
            get filteredTodos() {
                const { todos, filter, sort } = get();
                const filtered = filterTodos(todos, filter);
                return sortTodos(filtered, sort);
            },

            get stats() {
                const { todos } = get();
                return calculateStats(todos);
            },

            // Actions
            setTodos: (todos) =>
                set({ todos }, false, 'setTodos'),

            addTodo: (todo) =>
                set(
                    (state) => ({ todos: [...state.todos, todo] }),
                    false,
                    'addTodo'
                ),

            updateTodo: (id, updates) =>
                set(
                    (state) => ({
                        todos: state.todos.map(todo =>
                            todo.id === id
                                ? { ...todo, ...updates, updatedAt: new Date().toISOString() }
                                : todo
                        ),
                    }),
                    false,
                    'updateTodo'
                ),

            deleteTodo: (id) =>
                set(
                    (state) => ({ todos: state.todos.filter(todo => todo.id !== id) }),
                    false,
                    'deleteTodo'
                ),

            toggleTodo: (id) =>
                set(
                    (state) => ({
                        todos: state.todos.map(todo =>
                            todo.id === id
                                ? {
                                    ...todo,
                                    completed: !todo.completed,
                                    updatedAt: new Date().toISOString()
                                }
                                : todo
                        ),
                    }),
                    false,
                    'toggleTodo'
                ),

            clearCompleted: () =>
                set(
                    (state) => ({ todos: state.todos.filter(todo => !todo.completed) }),
                    false,
                    'clearCompleted'
                ),

            setLoading: (loading) =>
                set({ loading }, false, 'setLoading'),

            setError: (error) =>
                set({ error }, false, 'setError'),

            setFilter: (filterUpdates) =>
                set(
                    (state) => ({ filter: { ...state.filter, ...filterUpdates } }),
                    false,
                    'setFilter'
                ),

            setSort: (sort) =>
                set({ sort }, false, 'setSort'),

            reset: () =>
                set(initialState, false, 'reset'),
        }),
        {
            name: 'todo-store',
        }
    )
);