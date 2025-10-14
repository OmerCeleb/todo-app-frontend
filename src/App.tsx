// ========================================
// DOSYA: src/App.tsx
// ========================================
// Bu kodu App.tsx dosyasına kopyalayın
// ========================================
import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import LoginPage from './components/Auth/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { useTheme } from './hooks/useTheme';
import { useTodosAPI } from './hooks/useTodosAPI';
import { useDebounce } from './hooks/useDebounce';
import { sounds } from './utils/sounds';
import { logger } from './utils/logger';
import type { Todo, TodoFormData } from './components/TodoForm';
import type { FilterOptions } from './hooks/useTodosAPI';

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
import { TodoListView } from './components/TodoListView';

// Code splitting for heavy components
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const Settings = lazy(() => import('./components/Settings').then(module => ({ default: module.Settings })));

// ============================================
// APP SETTINGS
// ============================================
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

const DEFAULT_SETTINGS: AppSettings = {
    defaultPriority: 'medium',
    autoMarkOverdue: true,
    notifications: true,
    soundEffects: true,
    compactView: false,
    showCompletedTasks: true,
    autoSave: true,
    theme: 'system',
};

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

    return isAuthenticated ? <TodoApp /> : <LoginPage />;
};

// ============================================
// MAIN TODO APP
// ============================================
function TodoApp() {
    // ============================================
    // HOOKS & STATE
    // ============================================
    const { theme, isDarkMode, setTheme } = useTheme();
    const { logout, user } = useAuth(); // ← user'ı da alın

    // ✅ reorderTodos REMOVED
    const {
        todos,
        categories,
        stats,
        filters,
        loading,
        error,
        isRefreshing,
        createTodo: apiCreateTodo,
        updateTodo: apiUpdateTodo,
        deleteTodo: apiDeleteTodo,
        toggleTodo: apiToggleTodo,
        bulkDelete: apiBulkDelete,
        setFilters,
        searchTodos,
        refreshTodos,
        clearError,
    } = useTodosAPI();

    const {
        notifications,
        showSuccess,
        showError,
        showWarning,
        removeNotification,
        showCreate,
        showUpdate,
        showDelete,
    } = useNotifications();

    // UI State
    const [currentView, setCurrentView] = useState<'list' | 'dashboard' | 'settings'>('list');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deletingTodos, setDeletingTodos] = useState<string[]>([]);

    // App Settings
    const [appSettings, setAppSettings] = useState<AppSettings>(() => {
        const saved = localStorage.getItem('app-settings');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    });

    // Debounced search
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Search with debounce
    const displayedTodos = searchQuery ? searchTodos(debouncedSearch) : todos;

    // ============================================
    // EFFECTS
    // ============================================

    // Auto-save settings
    useEffect(() => {
        if (appSettings.autoSave) {
            localStorage.setItem('app-settings', JSON.stringify(appSettings));
            logger.debug('Settings auto-saved', appSettings);
        }
    }, [appSettings]);

    // Apply dark mode class to document
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // ============================================
    // HANDLERS
    // ============================================

    const handleLogout = async () => {
        try {
            await logout();
            logger.info('User logged out');
        } catch (error) {
            logger.error('Logout error:', error);
        }
    };

    const handleSettingsChange = useCallback((newSettings: AppSettings) => {
        setAppSettings(newSettings);

        if (newSettings.theme !== theme) {
            setTheme(newSettings.theme);
        }

        logger.debug('Settings updated', newSettings);
    }, [theme, setTheme]);

    const createTodo = async (formData: TodoFormData) => {
        const todoData = {
            ...formData,
            priority: formData.priority || (appSettings.defaultPriority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH'),
        };

        await apiCreateTodo(todoData);

        if (appSettings.soundEffects) sounds.create();
        if (appSettings.notifications) {
            showCreate(`"${formData.title}" created successfully!`, 3000);
        }

        setIsAddModalOpen(false);
        logger.info('Todo created:', formData.title);
    };

    const updateTodo = async (id: string, formData: TodoFormData) => {
        await apiUpdateTodo(id, formData);

        if (appSettings.notifications) {
            showUpdate(`"${formData.title}" updated successfully!`, 3000);
        }

        setIsEditModalOpen(false);
        setEditingTodo(null);
        logger.info('Todo updated:', id);
    };

    const deleteTodo = async (id: string) => {
        const todo = todos.find(t => t.id === id);

        await apiDeleteTodo(id);

        if (appSettings.soundEffects) sounds.delete();
        if (appSettings.notifications && todo) {
            showDelete(`"${todo.title}" deleted successfully!`, 3000);
        }

        setIsDeleteConfirmOpen(false);
        setDeletingTodos([]);
        logger.info('Todo deleted:', id);
    };

    const toggleTodo = async (id: string) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        await apiToggleTodo(id);

        if (appSettings.soundEffects) {
            sounds.complete();
        }

        logger.info('Todo toggled:', id);
    };

    const handleEdit = useCallback((todo: Todo) => {
        setEditingTodo(todo);
        setIsEditModalOpen(true);
    }, []);

    const handleDelete = useCallback((id: string) => {
        setDeletingTodos([id]);
        setIsDeleteConfirmOpen(true);
    }, []);

    const handleBulkDelete = async () => {
        await apiBulkDelete(deletingTodos);

        if (appSettings.soundEffects) sounds.delete();
        if (appSettings.notifications) {
            showDelete(`${deletingTodos.length} todos deleted successfully!`, 3000);
        }

        setSelectedTodos(new Set());
        setDeletingTodos([]);
        setIsDeleteConfirmOpen(false);
        logger.info('Bulk delete completed:', deletingTodos.length);
    };

    const handleBulkDeleteSelected = useCallback(() => {
        if (selectedTodos.size === 0) return;
        setDeletingTodos(Array.from(selectedTodos));
        setIsDeleteConfirmOpen(true);
    }, [selectedTodos]);

    const handleImportTodos = useCallback(async (importedTodos: TodoFormData[]) => {
        let successCount = 0;
        let errorCount = 0;

        for (const todoData of importedTodos) {
            try {
                await apiCreateTodo(todoData);
                successCount++;
            } catch (error) {
                errorCount++;
                logger.error('Failed to import todo:', todoData.title, error);
            }
        }

        if (appSettings.notifications) {
            if (errorCount === 0) {
                showSuccess(`Successfully imported ${successCount} todos!`, 3000);
            } else {
                showWarning(
                    `Imported ${successCount} todos, ${errorCount} failed.`,
                    5000
                );
            }
        }

        await refreshTodos();
        logger.info('Import completed:', { successCount, errorCount });
    }, [apiCreateTodo, appSettings.notifications, showSuccess, showWarning, refreshTodos]);

    const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
        setFilters(newFilters);
        logger.debug('Filters changed:', newFilters);
    }, [setFilters]);

    const handleSelectTodo = useCallback((id: string, selected: boolean) => {
        setSelectedTodos(prev => {
            const newSet = new Set(prev);
            if (selected) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    }, []);

    // ============================================
    // RENDER
    // ============================================

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
        }`}>
            {/* Header */}
            <Header
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                theme={theme}
                isDarkMode={isDarkMode}
                onThemeChange={setTheme}
                onAddTodo={() => setIsAddModalOpen(true)}
                onLogout={handleLogout}
                userName={user?.name || user?.email || 'User'}
            />

            {/* Main Content */}
            <main className="container mx-auto px-4 pt-6 pb-20 max-w-7xl">
                {/* View Switcher */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setCurrentView('list')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            currentView === 'list'
                                ? 'bg-blue-500 text-white'
                                : isDarkMode
                                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        📝 List
                    </button>
                    <button
                        onClick={() => setCurrentView('dashboard')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            currentView === 'dashboard'
                                ? 'bg-blue-500 text-white'
                                : isDarkMode
                                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        📊 Dashboard
                    </button>
                    <button
                        onClick={() => setCurrentView('settings')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            currentView === 'settings'
                                ? 'bg-blue-500 text-white'
                                : isDarkMode
                                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        ⚙️ Settings
                    </button>
                </div>

                {/* List View */}
                {currentView === 'list' && (
                    <>
                        {/* Filters */}
                        <TodoFilters
                            filters={filters}
                            onFiltersChange={handleFiltersChange}
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
                                onDelete={handleBulkDeleteSelected}
                                onClear={() => setSelectedTodos(new Set())}
                                loading={loading}
                            />
                        )}

                        {/* Todo List */}
                        <div className="space-y-4">
                            {loading && !todos.length ? (
                                <LoadingState message="Loading your todos..." />
                            ) : error ? (
                                <ErrorState
                                    message={error}
                                    onRetry={refreshTodos}
                                />
                            ) : displayedTodos.length === 0 ? (
                                <EmptyState
                                    type={searchQuery ? 'no-search-results' : 'no-todos'}
                                />
                            ) : (
                                // ✅ onReorder REMOVED
                                <TodoListView
                                    todos={displayedTodos}
                                    onToggle={toggleTodo}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onSelect={handleSelectTodo}
                                    selectedTodos={selectedTodos}
                                    isDarkMode={isDarkMode}
                                />
                            )}
                        </div>
                    </>
                )}

                {/* Dashboard */}
                {currentView === 'dashboard' && (
                    <Suspense fallback={<LoadingState message="Loading dashboard..." />}>
                        <Dashboard
                            todos={todos}
                            stats={stats}
                            darkMode={isDarkMode}
                        />
                    </Suspense>
                )}

                {/* Settings */}
                {currentView === 'settings' && (
                    <Suspense fallback={<LoadingState message="Loading settings..." />}>
                        <Settings
                            isOpen={true}
                            onClose={() => setCurrentView('list')}
                            darkMode={isDarkMode}
                            onImportTodos={handleImportTodos}
                            onSettingsChange={handleSettingsChange}
                            onThemeChange={setTheme}
                            currentTheme={theme}
                        />
                    </Suspense>
                )}
            </main>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center z-40"
                aria-label="Add new todo"
            >
                <span className="text-3xl">+</span>
            </button>

            {/* Modals */}
            {isAddModalOpen && (
                <TodoForm
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={createTodo}
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

            {/* Delete Confirmation */}
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

            {/* Loading Overlay for Refresh */}
            {isRefreshing && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl">
                        <LoadingState message="Refreshing..." />
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// ROOT APP WITH PROVIDERS
// ============================================
function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <AuthGuard />
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;