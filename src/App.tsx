// src/App.tsx - Complete Fixed Version
import { useState, useCallback, useEffect } from 'react';

// Component imports
import { Header } from './components/Header';
import { TodoForm } from './components/TodoForm';
import { TodoFilters } from './components/TodoFilters';
import { NotificationContainer, useNotifications } from './components/Notification';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { EmptyState } from './components/EmptyState';
import { ConfirmDialog } from './components/ConfirmDialog';
import { BulkActions } from './components/BulkActions';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { TodoListView } from './components/TodoListView';

// Auth imports
import LoginPage from './components/Auth/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Hook imports
import { useTheme } from './hooks/useTheme';
import { useTodosAPI } from './hooks/useTodosAPI';
import { useDebounce } from './hooks/useDebounce';

// Type imports
import type { Todo, TodoFormData } from './components/TodoForm';

// App Settings Type
interface AppSettings {
    defaultPriority: 'low' | 'medium' | 'high';
    autoMarkOverdue: boolean;
    notifications: boolean;
    soundEffects: boolean;
    compactView: boolean;
    showCompletedTasks: boolean;
    autoSave: boolean;
    theme: 'light' | 'dark' | 'system';
}

// ============================================
// AUTH GUARD
// ============================================
const AuthGuard: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return isAuthenticated ? <MainApp /> : <LoginPage />;
};

// ============================================
// MAIN APP
// ============================================
function MainApp() {
    // ========== Auth & Theme ==========
    const { user, logout } = useAuth();
    const { theme, isDarkMode, setTheme } = useTheme();

    // ========== App Settings ==========
    const [appSettings, setAppSettings] = useState<AppSettings>({
        defaultPriority: 'medium',
        autoMarkOverdue: true,
        notifications: true,
        soundEffects: false,
        compactView: false,
        showCompletedTasks: true,
        autoSave: true,
        theme: 'system',
    });

    // ========== Todo State ==========
    const {
        todos,
        categories,
        filters,
        loading,
        error,
        stats,
        createTodo: apiCreateTodo,
        updateTodo: apiUpdateTodo,
        deleteTodo: apiDeleteTodo,
        toggleTodo: apiToggleTodo,
        bulkDelete: apiBulkDelete,
        reorderTodos: apiReorderTodos,
        setFilters,
        refreshTodos,
    } = useTodosAPI();

    // ========== Notifications ==========
    const {
        notifications,
        removeNotification,
        showCreate,
        showUpdate,
        showDelete,
        showComplete,
        showIncomplete,
        showError,
        showSuccess
    } = useNotifications();

    // ========== UI State ==========
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'list' | 'dashboard'>('list');

    // ========== Modal State ==========
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [deletingTodos, setDeletingTodos] = useState<string[]>([]);

    // ========== Debounced Search ==========
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // ========== Load Settings ==========
    useEffect(() => {
        const savedSettings = localStorage.getItem('app-settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setAppSettings(prev => ({ ...prev, ...parsed }));
            } catch (error) {
                console.error('Failed to parse settings:', error);
            }
        }
    }, []);

    // ============================================
    // HANDLERS
    // ============================================

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleSettingsChange = useCallback((newSettings: AppSettings) => {
        setAppSettings(newSettings);
        if (newSettings.theme !== theme) setTheme(newSettings.theme);
        if (newSettings.autoSave) {
            localStorage.setItem('app-settings', JSON.stringify(newSettings));
        }
    }, [theme, setTheme]);

    const handleImportTodos = useCallback(async (importedTodos: TodoFormData[]) => {
        try {
            for (const todoData of importedTodos) {
                await apiCreateTodo(todoData);
            }
            if (appSettings.notifications) {
                showSuccess(`Successfully imported ${importedTodos.length} todos!`, 3000);
            }
            await refreshTodos();
        } catch (error) {
            console.error('Failed to import todos:', error);
            if (appSettings.notifications) {
                showError('Failed to import some todos. Please try again.', 5000);
            }
        }
    }, [apiCreateTodo, appSettings.notifications, showSuccess, showError, refreshTodos]);

    const createTodo = async (formData: TodoFormData) => {
        try {
            const todoData = {
                ...formData,
                priority: formData.priority || appSettings.defaultPriority
            };
            await apiCreateTodo(todoData);
            if (appSettings.notifications) {
                showCreate(`"${formData.title}" created successfully!`, 3000);
            }
            setIsAddModalOpen(false);
        } catch (error) {
            console.error('Failed to create todo:', error);
            if (appSettings.notifications) {
                showError('Failed to create todo. Please try again.', 5000);
            }
        }
    };

    const updateTodo = async (id: string, formData: TodoFormData) => {
        try {
            await apiUpdateTodo(id, formData);
            if (appSettings.notifications) {
                showUpdate(`"${formData.title}" updated successfully!`, 3000);
            }
            setIsEditModalOpen(false);
            setEditingTodo(null);
        } catch (error) {
            console.error('Failed to update todo:', error);
            if (appSettings.notifications) {
                showError('Failed to update todo. Please try again.', 5000);
            }
        }
    };

    const deleteTodo = async (id: string) => {
        try {
            const todo = todos.find(t => t.id === id);
            await apiDeleteTodo(id);
            if (appSettings.notifications && todo) {
                showDelete(`"${todo.title}" deleted successfully!`, 3000);
            }
            setIsDeleteConfirmOpen(false);
            setDeletingTodos([]);
        } catch (error) {
            console.error('Failed to delete todo:', error);
            if (appSettings.notifications) {
                showError('Failed to delete todo. Please try again.', 5000);
            }
        }
    };

    const toggleTodo = async (id: string) => {
        try {
            const todo = todos.find(t => t.id === id);
            await apiToggleTodo(id);
            if (appSettings.notifications && todo) {
                if (todo.completed) {
                    showIncomplete(`"${todo.title}" marked as incomplete`, 2000);
                } else {
                    showComplete(`"${todo.title}" completed!`, 2000);
                }
            }
        } catch (error) {
            console.error('Failed to toggle todo:', error);
            if (appSettings.notifications) {
                showError('Failed to update todo status.', 3000);
            }
        }
    };

    const handleBulkDelete = async () => {
        try {
            await apiBulkDelete(Array.from(selectedTodos));
            if (appSettings.notifications) {
                showDelete(`${selectedTodos.size} todos deleted successfully!`, 3000);
            }
            setSelectedTodos(new Set());
            setIsDeleteConfirmOpen(false);
            setDeletingTodos([]);
        } catch (error) {
            console.error('Failed to bulk delete:', error);
            if (appSettings.notifications) {
                showError('Failed to delete todos. Please try again.', 5000);
            }
        }
    };

    const handleEdit = (todo: Todo) => {
        setEditingTodo(todo);
        setIsEditModalOpen(true);
    };

    const handleDeleteSingle = (id: string) => {
        setDeletingTodos([id]);
        setIsDeleteConfirmOpen(true);
    };

    // ========== Filtered Todos ==========
    const filteredTodos = todos.filter(todo => {
        // Search filter
        if (debouncedSearchQuery) {
            const query = debouncedSearchQuery.toLowerCase();
            const matchesSearch =
                todo.title.toLowerCase().includes(query) ||
                (todo.description && todo.description.toLowerCase().includes(query)) ||
                (todo.category && todo.category.toLowerCase().includes(query));
            if (!matchesSearch) return false;
        }

        // Status filter
        if (filters.status === 'active' && todo.completed) return false;
        if (filters.status === 'completed' && !todo.completed) return false;

        // Priority filter
        if (filters.priority && filters.priority !== 'all' && todo.priority !== filters.priority.toUpperCase()) {
            return false;
        }

        // Category filter
        if (filters.category && filters.category !== 'all' && todo.category !== filters.category) {
            return false;
        }

        return true;
    });

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className={`min-h-screen transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
        }`}>
            {/* Modern Header */}
            <Header
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                theme={theme}
                isDarkMode={isDarkMode}
                onThemeChange={setTheme}
                onAddTodo={() => setIsAddModalOpen(true)}
                userName={user?.name}
                onLogout={handleLogout}
                onDashboardClick={() => setViewMode(viewMode === 'dashboard' ? 'list' : 'dashboard')}
                onSettingsClick={() => setIsSettingsOpen(true)}
                showDashboard={viewMode === 'dashboard'}
            />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Dashboard View */}
                {viewMode === 'dashboard' && (
                    <Dashboard
                        stats={stats}
                        todos={todos}
                        darkMode={isDarkMode}
                    />
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <>
                        {/* Filters */}
                        <TodoFilters
                            filters={filters}
                            onFiltersChange={setFilters}
                            categories={categories}
                            darkMode={isDarkMode}
                        />

                        {/* Bulk Actions */}
                        {selectedTodos.size > 0 && (
                            <BulkActions
                                selectedCount={selectedTodos.size}
                                onMarkCompleted={async () => {
                                    for (const todoId of selectedTodos) {
                                        const todo = todos.find(t => t.id === todoId);
                                        if (todo && !todo.completed) await apiToggleTodo(todoId);
                                    }
                                    setSelectedTodos(new Set());
                                }}
                                onMarkIncomplete={async () => {
                                    for (const todoId of selectedTodos) {
                                        const todo = todos.find(t => t.id === todoId);
                                        if (todo && todo.completed) await apiToggleTodo(todoId);
                                    }
                                    setSelectedTodos(new Set());
                                }}
                                onDelete={handleBulkDelete}
                                onClear={() => setSelectedTodos(new Set())}
                                loading={false}
                            />
                        )}

                        {/* Content */}
                        {error ? (
                            <ErrorState
                                message={error}
                                onRetry={refreshTodos}
                            />
                        ) : loading ? (
                            <LoadingState />
                        ) : filteredTodos.length === 0 ? (
                            <EmptyState
                                type={debouncedSearchQuery ? 'no-search-results' : 'no-todos'}
                                searchQuery={debouncedSearchQuery}
                                onCreateTodo={() => setIsAddModalOpen(true)}
                            />
                        ) : (
                            <TodoListView
                                todos={filteredTodos}
                                selectedTodos={selectedTodos}
                                onToggle={toggleTodo}
                                onEdit={handleEdit}
                                onDelete={handleDeleteSingle}
                                onReorder={apiReorderTodos}
                                onSelect={(id: string, selected: boolean) => {
                                    const newSelected = new Set(selectedTodos);
                                    if (selected) {
                                        newSelected.add(id);
                                    } else {
                                        newSelected.delete(id);
                                    }
                                    setSelectedTodos(newSelected);
                                }}
                                isDarkMode={isDarkMode}
                            />
                        )}
                    </>
                )}
            </main>

            {/* Modals */}
            {isAddModalOpen && (
                <TodoForm
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={(data) => createTodo(data)}
                    mode="add"
                    darkMode={isDarkMode}
                />
            )}

            {isEditModalOpen && editingTodo && (
                <TodoForm
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingTodo(null);
                    }}
                    onSubmit={(data) => updateTodo(editingTodo.id, data)}
                    todo={editingTodo}
                    mode="edit"
                    darkMode={isDarkMode}
                />
            )}

            {isSettingsOpen && (
                <Settings
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    darkMode={isDarkMode}
                    onThemeChange={setTheme}
                    currentTheme={theme}
                    onImportTodos={handleImportTodos}
                    onSettingsChange={handleSettingsChange}
                />
            )}

            {isDeleteConfirmOpen && (
                <ConfirmDialog
                    isOpen={isDeleteConfirmOpen}
                    title={deletingTodos.length === 1 ? 'Delete Todo?' : `Delete ${deletingTodos.length} Todos?`}
                    message={`Are you sure you want to delete ${
                        deletingTodos.length === 1 ? 'this todo' : 'these todos'
                    }? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    onConfirm={() => {
                        if (deletingTodos.length === 1) {
                            deleteTodo(deletingTodos[0]);
                        } else {
                            handleBulkDelete();
                        }
                    }}
                    onClose={() => {
                        setIsDeleteConfirmOpen(false);
                        setDeletingTodos([]);
                    }}
                    variant="danger"
                />
            )}

            {/* Notifications */}
            <NotificationContainer
                notifications={notifications}
                onRemove={removeNotification}
            />
        </div>
    );
}

// ============================================
// ROOT APP WITH AUTH PROVIDER
// ============================================
function App() {
    return (
        <AuthProvider>
            <AuthGuard />
        </AuthProvider>
    );
}

export default App;