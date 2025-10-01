// src/App.tsx - Updated with AuthContext integration (keeping existing structure)
import { useState, useCallback, useEffect } from 'react';
import { Settings as SettingsIcon, BarChart3, CheckSquare, LogOut } from 'lucide-react';

// Component imports
import { Header } from './components/Header';
import { TodoForm } from './components/TodoForm';
import { TodoItem } from './components/TodoItem';
import { TodoFilters } from './components/TodoFilters';
import { NotificationContainer, useNotifications } from './components/Notification';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { EmptyState } from './components/EmptyState';
import { ConfirmDialog } from './components/ConfirmDialog';
import { BulkActions } from './components/BulkActions';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { Button } from './components/ui/Button';

// Drag & Drop imports
import { DragDropContext } from './components/DragDropContext';
import { SortableTodoItem } from './components/SortableTodoItem';

// Auth imports - NEW
import LoginPage from './components/Auth/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Hook imports
import { useTheme } from './hooks/useTheme';
import { useTodosAPI } from './hooks/useTodosAPI';
import { useDebounce } from './hooks/useDebounce';
import { useOfflineSync } from './hooks/useOfflineSync';

// Type imports
import type { Todo, TodoFormData } from './components/TodoForm';

// App Settings Type Definition
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

// Auth Guard Component - NEW
const AuthGuard: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return isAuthenticated ? <MainApp /> : <LoginPage />;
};

// Main App Component (renamed from original App function)
function MainApp() {
    // Get auth info from context - NEW
    const { user, logout } = useAuth();

    // App Settings State
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

    // Theme management
    const { theme, isDarkMode, setTheme } = useTheme();

    // Offline sync
    const { isOnline, isSyncing } = useOfflineSync();

    // Enhanced todo management with API integration
    const {
        todos,
        categories,
        filters,
        loading,
        error,
        createTodo: apiCreateTodo,
        updateTodo: apiUpdateTodo,
        deleteTodo: apiDeleteTodo,
        toggleTodo: apiToggleTodo,
        bulkDelete: apiBulkDelete,
        reorderTodos: apiReorderTodos,
        setFilters,
        refreshTodos,
        stats,
    } = useTodosAPI();

    // Notifications
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

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'list' | 'dashboard'>('list');
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

    // Drag & Drop State
    const [dragEnabled] = useState(true);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [deletingTodos, setDeletingTodos] = useState<string[]>([]);

    // Debounced search
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Load app settings on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('app-settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setAppSettings((prev: AppSettings) => ({ ...prev, ...parsed }));

                if (parsed.theme) {
                    setTheme(parsed.theme);
                }
            } catch (error) {
                console.error('Failed to parse settings:', error);
            }
        }
    }, [setTheme]);

    // Handle logout - UPDATED to use AuthContext
    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
            // AuthContext will handle clearing tokens
        }
    };

    // Handle settings change from Settings component
    const handleSettingsChange = useCallback((newSettings: AppSettings) => {
        setAppSettings(newSettings);

        if (newSettings.theme !== theme) {
            setTheme(newSettings.theme);
        }

        if (newSettings.autoSave) {
            localStorage.setItem('app-settings', JSON.stringify(newSettings));
        }
    }, [theme, setTheme]);

    // Enhanced CRUD operations with settings integration
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

            if (appSettings.soundEffects) {
                // Play notification sound
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
                    showComplete(`"${todo.title}" completed! 🎉`, 2000);
                }
            }
        } catch (error) {
            console.error('Failed to toggle todo:', error);
            if (appSettings.notifications) {
                showError('Failed to update todo status. Please try again.', 5000);
            }
        }
    };

    const handleBulkMarkCompleted = async () => {
        if (selectedTodos.size === 0) return;

        setBulkActionLoading(true);
        try {
            // Mark all selected todos as completed
            for (const todoId of selectedTodos) {
                const todo = todos.find(t => t.id === todoId);
                if (todo && !todo.completed) {
                    await apiToggleTodo(todoId);
                }
            }

            if (appSettings.notifications) {
                showComplete(`${selectedTodos.size} todos marked as completed!`, 3000);
            }

            setSelectedTodos(new Set());
        } catch (error) {
            console.error('Failed to mark todos as completed:', error);
            if (appSettings.notifications) {
                showError('Failed to mark todos as completed. Please try again.', 5000);
            }
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleBulkMarkIncomplete = async () => {
        if (selectedTodos.size === 0) return;

        setBulkActionLoading(true);
        try {
            // Mark all selected todos as incomplete
            for (const todoId of selectedTodos) {
                const todo = todos.find(t => t.id === todoId);
                if (todo && todo.completed) {
                    await apiToggleTodo(todoId);
                }
            }

            if (appSettings.notifications) {
                showIncomplete(`${selectedTodos.size} todos marked as incomplete!`, 3000);
            }

            setSelectedTodos(new Set());
        } catch (error) {
            console.error('Failed to mark todos as incomplete:', error);
            if (appSettings.notifications) {
                showError('Failed to mark todos as incomplete. Please try again.', 5000);
            }
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleBulkClear = () => {
        setSelectedTodos(new Set());
    };

    const handleBulkDelete = async () => {
        if (selectedTodos.size === 0) return;

        setBulkActionLoading(true);
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
        } finally {
            setBulkActionLoading(false);
        }
    };

    // WORKING: Drag & Drop Handler with Real State Update
    const handleTodoReorder = async (reorderedTodos: Todo[]) => {
        try {
            console.log('📋 Reordering todos:', reorderedTodos.map((t, i) => `${i + 1}. ${t.title}`));

            await apiReorderTodos(reorderedTodos);

            if (appSettings.notifications) {
                showSuccess('Todo order updated! ↕️', 1500);
            }

            if (appSettings.soundEffects) {
                // Play notification sound
            }

        } catch (error) {
            console.error('❌ Failed to reorder todos:', error);
            if (appSettings.notifications) {
                showError('Failed to reorder todos. Please try again.', 3000);
            }
        }
    };

    // Handle todo selection
    const handleTodoSelect = (id: string, selected: boolean) => {
        const newSelected = new Set(selectedTodos);
        if (selected) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedTodos(newSelected);
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            isDarkMode
                ? 'bg-gray-900 text-white'
                : 'bg-gray-50 text-gray-900'
        }`}>
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Enhanced Header with Auth Info */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Header
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            theme={theme}
                            isDarkMode={isDarkMode}
                            onThemeChange={setTheme}
                            onAddTodo={() => setIsAddModalOpen(true)}
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Welcome back, {user?.name}! {/* UPDATED to use AuthContext user */}
                        </p>
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center gap-3">
                        {/* Online Status */}
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                            isOnline
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}>
                            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                            {isOnline ? 'Online' : 'Offline'}
                            {isSyncing && <span className="ml-1">🔄</span>}
                        </div>

                        {/* View Toggle */}
                        <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                    viewMode === 'list'
                                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-300'
                                }`}
                            >
                                <CheckSquare className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('dashboard')}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                    viewMode === 'dashboard'
                                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-300'
                                }`}
                            >
                                <BarChart3 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Settings */}
                        <Button
                            variant="outline"
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2"
                        >
                            <SettingsIcon className="w-4 h-4" />
                        </Button>

                        {/* Logout - UPDATED to use AuthContext */}
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="p-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900 dark:hover:border-red-700"
                        >
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Dashboard View */}
                {viewMode === 'dashboard' && (
                    <Dashboard stats={stats}
                               todos={todos} />

                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <>
                        {/* TodoFilters component */}
                        <TodoFilters
                            filters={filters}
                            onFiltersChange={setFilters}
                            categories={categories}
                        />

                        {/* Bulk Actions */}
                        {selectedTodos.size > 0 && (
                            <BulkActions
                                selectedCount={selectedTodos.size}
                                onMarkCompleted={handleBulkMarkCompleted}
                                onMarkIncomplete={handleBulkMarkIncomplete}
                                onDelete={handleBulkDelete}
                                onClear={handleBulkClear}
                                loading={bulkActionLoading}
                            />
                        )}

                        {/* Todo List Content */}
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
                            <DragDropContext
                                todos={todos}
                                onReorder={handleTodoReorder}
                            >
                                <div className="space-y-3">
                                    {todos.map((todo) => (
                                        dragEnabled ? (
                                            <SortableTodoItem
                                                key={todo.id}
                                                todo={todo}
                                                onToggle={toggleTodo}
                                                onEdit={(todo) => {
                                                    setEditingTodo(todo);
                                                    setIsEditModalOpen(true);
                                                }}
                                                onDelete={(id) => {
                                                    setDeletingTodos([id]);
                                                    setIsDeleteConfirmOpen(true);
                                                }}
                                                isSelected={selectedTodos.has(todo.id)}
                                                onSelect={handleTodoSelect}
                                                darkMode={isDarkMode}
                                            />
                                        ) : (
                                            <TodoItem
                                                key={todo.id}
                                                todo={todo}
                                                onToggle={toggleTodo}
                                                onEdit={(todo) => {
                                                    setEditingTodo(todo);
                                                    setIsEditModalOpen(true);
                                                }}
                                                onDelete={(id) => {
                                                    setDeletingTodos([id]);
                                                    setIsDeleteConfirmOpen(true);
                                                }}
                                                darkMode={isDarkMode}
                                            />
                                        )
                                    ))}
                                </div>
                            </DragDropContext>
                        )}
                    </>
                )}

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
        </div>
    );
}

// Root App Component with AuthProvider - NEW
function App() {
    return (
        <AuthProvider>
            <AuthGuard />
        </AuthProvider>
    );
}

export default App;