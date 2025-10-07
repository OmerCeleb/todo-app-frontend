// src/App.tsx - Clean and organized version
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
//import { useOfflineSync } from './hooks/useOfflineSync';

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
                showError('Failed to update todo status. Please try again.', 5000);
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedTodos.size === 0) return;
        try {
            await apiBulkDelete(Array.from(selectedTodos));
            if (appSettings.notifications) {
                showDelete(`${selectedTodos.size} todos deleted successfully!`, 3000);
            }
            setSelectedTodos(new Set());
        } catch (error) {
            console.error('Failed to bulk delete todos:', error);
            if (appSettings.notifications) {
                showError('Failed to delete todos. Please try again.', 5000);
            }
        }
    };

    const handleTodoReorder = async (reorderedTodos: Todo[]) => {
        try {
            await apiReorderTodos(reorderedTodos);
            if (appSettings.notifications) {
                showSuccess('Todo order updated!', 1500);
            }
        } catch (error) {
            console.error('Failed to reorder todos:', error);
            if (appSettings.notifications) {
                showError('Failed to reorder todos. Please try again.', 3000);
            }
        }
    };

    const handleTodoSelect = (id: string, selected: boolean) => {
        const newSelected = new Set(selectedTodos);
        if (selected) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedTodos(newSelected);
    };

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className={`min-h-screen transition-colors duration-300 ${
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
                                title="Failed to load todos"
                                message={error}
                                onRetry={refreshTodos}
                            />
                        ) : loading ? (
                            <LoadingState message="Loading your todos..." />
                        ) : todos.length === 0 ? (
                            <EmptyState
                                type="no-todos"
                                searchQuery={debouncedSearchQuery}
                                onCreateTodo={() => setIsAddModalOpen(true)}
                                onClearFilters={() => setSearchQuery('')}
                            />
                        ) : (
                            <TodoListView
                                todos={todos}
                                onToggle={toggleTodo}
                                onEdit={(todo: Todo) => {
                                    setEditingTodo(todo);
                                    setIsEditModalOpen(true);
                                }}
                                onDelete={(id: string) => {
                                    setDeletingTodos([id]);
                                    setIsDeleteConfirmOpen(true);
                                }}
                                onReorder={handleTodoReorder}
                                onSelect={handleTodoSelect}
                                selectedTodos={selectedTodos}
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
                    onSubmit={createTodo}
                    onClose={() => setIsAddModalOpen(false)}
                />
            )}

            {isEditModalOpen && editingTodo && (
                <TodoForm
                    isOpen={isEditModalOpen}
                    todo={editingTodo}
                    onSubmit={(formData) => updateTodo(editingTodo.id, formData)}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingTodo(null);
                    }}
                />
            )}

            {isSettingsOpen && (
                <Settings
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    onSettingsChange={handleSettingsChange}
                    onImportTodos={(todos) => {
                        todos.forEach(todo => createTodo(todo));
                    }}
                />
            )}

            {isDeleteConfirmOpen && (
                <ConfirmDialog
                    isOpen={isDeleteConfirmOpen}
                    title="Delete Todo"
                    message={`Are you sure you want to delete ${deletingTodos.length} todo(s)? This action cannot be undone.`}
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