export interface Todo {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    priority: Priority;
    category?: string;
    createdAt: string;
    updatedAt: string;
    dueDate?: string;
    favorite?: boolean;
    archived?: boolean;
}

export interface CreateTodoRequest {
    title: string;
    description?: string;
    priority?: Priority;
    category?: string;
    dueDate?: string;
    favorite?: boolean;
}

export interface UpdateTodoRequest {
    title?: string;
    description?: string;
    completed?: boolean;
    priority?: Priority;
    category?: string;
    dueDate?: string;
    favorite?: boolean;
    archived?: boolean;
}

export type Priority = 'low' | 'medium' | 'high';

export type FilterType = 'all' | 'active' | 'completed';

export type SortType = 'created' | 'updated' | 'priority' | 'title' | 'dueDate';

export interface TodoStats {
    total: number;
    completed: number;
    active: number;
    byPriority: {
        low: number;
        medium: number;
        high: number;
    };
}

export interface TodoFilter {
    type: FilterType;
    category?: string;
    priority?: Priority;
    search?: string;
}

export interface TodoSort {
    field: SortType;
    direction: 'asc' | 'desc';
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

export interface ApiError {
    message: string;
    code: string;
    details?: Record<string, any>;
}

export interface UseTodosReturn {
    todos: Todo[];
    loading: boolean;
    error: string | null;
    stats: TodoStats;
    addTodo: (todo: CreateTodoRequest) => Promise<void>;
    updateTodo: (id: string, updates: UpdateTodoRequest) => Promise<void>;
    deleteTodo: (id: string) => Promise<void>;
    toggleTodo: (id: string) => Promise<void>;
    clearCompleted: () => Promise<void>;
    refreshTodos: () => Promise<void>;
}