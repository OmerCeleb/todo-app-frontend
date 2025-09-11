// src/App.tsx - Complete App with Working Drag & Drop
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Settings as SettingsIcon, BarChart3, Trash2, CheckSquare } from 'lucide-react';

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

function App() {
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

    // Enhanced todo management with API integration including REORDER
    const {
        todos,
        categories,
        filters,
        loading,
        error,
        isRefreshing,
        createTodo: apiCreateTodo,
        updateTodo: apiUpdateTodo,
        deleteTodo: apiDeleteTodo,
        toggleTodo: apiToggleTodo,
        bulkDelete: apiBulkDelete,
        reorderTodos: apiReorderTodos,
        setFilters,
        searchTodos,
        refreshTodos,
        getStats,
        clearError
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
        showWarning,
        showSuccess
    } = useNotifications();

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'list' | 'dashboard'>('list');
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

    // Drag & Drop State
    const [dragEnabled, setDragEnabled] = useState(true);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [deletingTodos, setDeletingTodos] = useState<string[]>([]);

    // Refs
    const searchInputRef = useRef<HTMLInputElement>(null);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


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

    // WORKING: Drag & Drop Handler with Real State Update
    const handleTodoReorder = async (reorderedTodos: Todo[]) => {
        try {

            // Use the API reorder function which updates state
            await apiReorderTodos(reorderedTodos);

            if (appSettings.notifications) {
                showSuccess('Todo order updated! ↕️', 1500);
            }

            if (appSettings.soundEffects) {
                playNotificationSound('update');
            }

        } catch (error) {
            console.error('❌ Failed to reorder todos:', error);
            if (appSettings.notifications) {
                showError('Failed to reorder todos. Please try again.', 3000);
            }
        }
    };

    // Enhanced CRUD operations with settings integration
    const createTodo = async (formData: TodoFormData) => {
        try {
            const todoData = {
                ...formData,
                priority: formData.priority || appSettings.defaultPriority
            };

            await apiCreateTodo(todoData);

            if (appSettings.notifications) {
                showCreate(`"${formData.title}" created successfully! 📝`);
            }

            if (appSettings.soundEffects) {
                playNotificationSound('create');
            }

            setIsAddModalOpen(false);
        } catch (error) {
            if (appSettings.notifications) {
                showError('Failed to create todo. Please try again.', 4000);
            }
            console.error('Create todo error:', error);
        }
    };

    const updateTodo = async (formData: TodoFormData, id?: string) => {
        if (!id) return;

        try {
            await apiUpdateTodo(id, formData);

            if (appSettings.notifications) {
                showUpdate(`"${formData.title}" updated successfully! ✏️`);
            }

            if (appSettings.soundEffects) {
                playNotificationSound('update');
            }

            setIsEditModalOpen(false);
            setEditingTodo(null);
        } catch (error) {
            if (appSettings.notifications) {
                showError('Failed to update todo. Please try again.', 4000);
            }
            console.error('Update todo error:', error);
        }
    };

    const toggleTodo = async (id: string) => {
        try {
            const todo = todos.find(t => t.id === id);
            await apiToggleTodo(id);

            if (todo && appSettings.notifications) {
                if (todo.completed) {
                    showIncomplete(`"${todo.title}" marked as incomplete! 🔄`);
                } else {
                    showComplete(`"${todo.title}" completed! 🎉`, 3000);
                }
            }

            if (appSettings.soundEffects) {
                playNotificationSound(todo?.completed ? 'incomplete' : 'complete');
            }
        } catch (error) {
            if (appSettings.notifications) {
                showError('Failed to update todo status. Please try again.', 4000);
            }
            console.error('Toggle todo error:', error);
        }
    };

    const deleteTodo = async (id: string) => {
        try {
            const todo = todos.find(t => t.id === id);
            await apiDeleteTodo(id);

            if (todo && appSettings.notifications) {
                showDelete(`"${todo.title}" deleted successfully! 🗑️`);
            }

            if (appSettings.soundEffects) {
                playNotificationSound('delete');
            }
        } catch (error) {
            if (appSettings.notifications) {
                showError('Failed to delete todo. Please try again.', 4000);
            }
            console.error('Delete todo error:', error);
        }
    };

    // Sound effects function
    const playNotificationSound = useCallback((type: 'create' | 'update' | 'delete' | 'complete' | 'incomplete') => {
        if (!appSettings.soundEffects) return;

        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            const frequencies = {
                create: 800,
                update: 600,
                delete: 400,
                complete: 1000,
                incomplete: 500
            };

            oscillator.frequency.value = frequencies[type];
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.log('Sound not supported or disabled');
        }
    }, [appSettings.soundEffects]);


    // Import todos function
    const handleImportTodos = async (importedTodos: TodoFormData[]) => {
        try {
            let successCount = 0;
            let errorCount = 0;

            for (const todoData of importedTodos) {
                try {
                    const finalTodoData = {
                        ...todoData,
                        priority: todoData.priority || appSettings.defaultPriority
                    };
                    await apiCreateTodo(finalTodoData);
                    successCount++;
                } catch (error) {
                    console.error('Failed to import todo:', todoData.title, error);
                    errorCount++;
                }
            }

            if (successCount > 0 && appSettings.notifications) {
                showSuccess(`Successfully imported ${successCount} todos! 🎉`, 4000);
            }

            if (errorCount > 0 && appSettings.notifications) {
                showError(`Failed to import ${errorCount} todos.`, 4000);
            }

            await refreshTodos();

        } catch (error) {
            console.error('Import process failed:', error);
            if (appSettings.notifications) {
                showError('Import process failed. Please try again.', 4000);
            }
        }
    };

    // Auto-mark overdue todos
    useEffect(() => {
        if (!appSettings.autoMarkOverdue) return;

        const checkOverdueTodos = () => {
            const now = new Date();
            todos.forEach(todo => {
                if (todo.dueDate && !todo.completed) {
                    const dueDate = new Date(todo.dueDate);
                    if (dueDate < now) {
                        console.log(`Todo "${todo.title}" is overdue`);
                    }
                }
            });
        };

        const interval = setInterval(checkOverdueTodos, 60000);
        checkOverdueTodos();

        return () => clearInterval(interval);
    }, [todos, appSettings.autoMarkOverdue]);

    // Bulk operations
    const handleBulkDelete = useCallback(async () => {
        if (selectedTodos.size === 0) return;

        setDeletingTodos(Array.from(selectedTodos));
        setIsDeleteConfirmOpen(true);
    }, [selectedTodos]);

    const confirmBulkDelete = async () => {
        setBulkActionLoading(true);
        try {
            await apiBulkDelete(deletingTodos);

            if (appSettings.notifications) {
                showDelete(`${deletingTodos.length} todos deleted successfully! 🗑️`);
            }

            if (appSettings.soundEffects) {
                playNotificationSound('delete');
            }

            setSelectedTodos(new Set());
        } catch (error) {
            if (appSettings.notifications) {
                showError('Failed to delete todos. Please try again.', 4000);
            }
        } finally {
            setBulkActionLoading(false);
            setIsDeleteConfirmOpen(false);
            setDeletingTodos([]);
        }
    };

    const handleBulkToggle = async (completed: boolean) => {
        setBulkActionLoading(true);
        try {
            const promises = Array.from(selectedTodos).map(id => apiToggleTodo(id));
            await Promise.all(promises);

            const action = completed ? 'completed' : 'marked as incomplete';

            if (appSettings.notifications) {
                showUpdate(`${selectedTodos.size} todos ${action}! ${completed ? '✅' : '🔄'}`);
            }

            if (appSettings.soundEffects) {
                playNotificationSound(completed ? 'complete' : 'incomplete');
            }

            setSelectedTodos(new Set());
        } catch (error) {
            if (appSettings.notifications) {
                showError('Failed to update todos. Please try again.', 4000);
            }
        } finally {
            setBulkActionLoading(false);
        }
    };

    // Modal handlers
    const handleOpenAddModal = useCallback(() => {
        setIsAddModalOpen(true);
        if (searchInputRef.current) {
            searchInputRef.current.blur();
        }
    }, []);

    const handleCloseAddModal = () => setIsAddModalOpen(false);

    const handleOpenEditModal = (todo: Todo) => {
        setEditingTodo(todo);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingTodo(null);
    };

    // Focus search input
    const focusSearchInput = useCallback(() => {
        searchInputRef.current?.focus();
    }, []);

    // Handle search shortcut
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey && event.key === 'f') || event.key === '/') {
                event.preventDefault();
                focusSearchInput();
            }
            if (event.key === 'Escape') {
                setSelectedTodos(new Set());
                setSearchQuery('');
            }
            if (event.ctrlKey && event.key === 'n') {
                event.preventDefault();
                handleOpenAddModal();
            }
            if (event.ctrlKey && event.key === 'd') {
                event.preventDefault();
                setDragEnabled(!dragEnabled);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [focusSearchInput, handleOpenAddModal, dragEnabled]);

    // Listen for settings saved event
    React.useEffect(() => {
        const handleSettingsSaved = () => {
            if (appSettings.notifications) {
                showSuccess('Settings saved successfully! ⚙️', 2000);
            }
            if (appSettings.soundEffects) {
                playNotificationSound('update');
            }
        };

        window.addEventListener('settings-saved', handleSettingsSaved);
        return () => window.removeEventListener('settings-saved', handleSettingsSaved);
    }, [showSuccess, appSettings.notifications, appSettings.soundEffects]);

    // Get final todos (filtered + searched)
    let finalTodos = searchTodos(debouncedSearchQuery);

    // Apply showCompletedTasks setting
    if (!appSettings.showCompletedTasks) {
        finalTodos = finalTodos.filter(todo => !todo.completed);
    }

    const stats = getStats();

    // Selection handlers
    const handleTodoSelect = (id: string, selected: boolean) => {
        setSelectedTodos(prev => {
            const newSet = new Set(prev);
            if (selected) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedTodos.size === finalTodos.length) {
            setSelectedTodos(new Set());
        } else {
            setSelectedTodos(new Set(finalTodos.map(todo => todo.id)));
        }
    };

    // Theme classes with compact view support
    const themeClasses = isDarkMode
        ? 'bg-gray-900 text-white'
        : 'bg-gray-50 text-gray-900';

    const cardClasses = isDarkMode
        ? 'bg-gray-800 border-gray-700 text-white'
        : 'bg-white border-gray-200';

    const spacing = appSettings.compactView ? 'space-y-2' : 'space-y-3 sm:space-y-4';
    const padding = appSettings.compactView ? 'py-2 sm:py-4 lg:py-6' : 'py-4 sm:py-6 lg:py-8';

    // Show offline warning
    React.useEffect(() => {
        if (!isOnline && appSettings.notifications) {
            showWarning('You are offline. Changes will be synced when connection is restored.', 5000);
        }
    }, [isOnline, showWarning, appSettings.notifications]);

    // Loading state
    if (loading && todos.length === 0) {
        return (
            <div className={`min-h-screen ${themeClasses}`}>
                <LoadingState message="Loading your todos..." fullScreen />
            </div>
        );
    }

    // Error state
    if (error && todos.length === 0) {
        return (
            <div className={`min-h-screen ${themeClasses}`}>
                <ErrorState
                    message={error}
                    onRetry={() => {
                        clearError();
                        refreshTodos();
                    }}
                    fullScreen
                />
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
            {/* Notifications */}
            {appSettings.notifications && (
                <NotificationContainer
                    notifications={notifications}
                    onRemove={removeNotification}
                />
            )}

            {/* Offline indicator */}
            {!isOnline && (
                <div className="bg-yellow-500 text-white text-center py-2 text-sm">
                    ⚠️ You are offline. {isSyncing && 'Syncing...'}
                </div>
            )}

            {/* Header */}
            <Header
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                theme={theme}
                isDarkMode={isDarkMode}
                onThemeChange={setTheme}
                onAddTodo={handleOpenAddModal}
            />

            {/* Hidden input for focus */}
            <input
                ref={searchInputRef}
                type="hidden"
                onFocus={() => {
                    const headerSearchInput = document.querySelector('input[placeholder="Search todos..."]') as HTMLInputElement;
                    headerSearchInput?.focus();
                }}
            />

            {/* Main Content */}
            <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${padding}`}>
                {/* Top Actions */}
                <div className={`flex items-center justify-between ${appSettings.compactView ? 'mb-4' : 'mb-6'}`}>
                    <div className="flex items-center gap-3">
                        <Button
                            variant={viewMode === 'list' ? 'primary' : 'ghost'}
                            onClick={() => setViewMode('list')}
                            size="sm"
                        >
                            List View
                        </Button>
                        <Button
                            variant={viewMode === 'dashboard' ? 'primary' : 'ghost'}
                            onClick={() => setViewMode('dashboard')}
                            icon={<BarChart3 className="w-4 h-4" />}
                            size="sm"
                        >
                            Dashboard
                        </Button>

                        {/* Drag Toggle Button */}
                        {viewMode === 'list' && (
                            <Button
                                variant={dragEnabled ? 'primary' : 'ghost'}
                                onClick={() => setDragEnabled(!dragEnabled)}
                                size="sm"
                                title={dragEnabled ? 'Disable drag & drop (Ctrl+D)' : 'Enable drag & drop (Ctrl+D)'}
                            >
                                🔄 {dragEnabled ? 'Drag ON' : 'Drag OFF'}
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={refreshTodos}
                            loading={isRefreshing}
                            size="sm"
                        >
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => setIsSettingsOpen(true)}
                            icon={<SettingsIcon className="w-4 h-4" />}
                            size="sm"
                        >
                            Settings
                        </Button>
                    </div>
                </div>

                {/* Dashboard View */}
                {viewMode === 'dashboard' && (
                    <div className={appSettings.compactView ? 'mb-6' : 'mb-8'}>
                        <Dashboard
                            stats={stats}
                            todos={todos}
                            darkMode={isDarkMode}
                        />
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <>
                        {/* Stats Cards */}
                        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 ${appSettings.compactView ? 'mb-4 lg:mb-6' : 'mb-6 lg:mb-8'}`}>
                            <div className={`rounded-lg border ${appSettings.compactView ? 'p-2 sm:p-3' : 'p-3 sm:p-4'} transition-all duration-300 hover:shadow-lg ${cardClasses}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
                                        <p className={`${appSettings.compactView ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-bold`}>{stats.total}</p>
                                    </div>
                                    <div className={`${appSettings.compactView ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-6 h-6 sm:w-8 sm:h-8'} bg-blue-100 rounded-lg flex items-center justify-center`}>
                                        <span className={`text-blue-600 ${appSettings.compactView ? 'text-xs sm:text-sm' : 'text-sm sm:text-lg'}`}>📝</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`rounded-lg border ${appSettings.compactView ? 'p-2 sm:p-3' : 'p-3 sm:p-4'} transition-all duration-300 hover:shadow-lg ${cardClasses}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active</p>
                                        <p className={`${appSettings.compactView ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-bold text-orange-600`}>{stats.active}</p>
                                    </div>
                                    <div className={`${appSettings.compactView ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-6 h-6 sm:w-8 sm:h-8'} bg-orange-100 rounded-lg flex items-center justify-center`}>
                                        <span className={`text-orange-600 ${appSettings.compactView ? 'text-xs sm:text-sm' : 'text-sm sm:text-lg'}`}>🔥</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`rounded-lg border ${appSettings.compactView ? 'p-2 sm:p-3' : 'p-3 sm:p-4'} transition-all duration-300 hover:shadow-lg ${cardClasses}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                                        <p className={`${appSettings.compactView ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-bold text-green-600`}>{stats.completed}</p>
                                    </div>
                                    <div className={`${appSettings.compactView ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-6 h-6 sm:w-8 sm:h-8'} bg-green-100 rounded-lg flex items-center justify-center`}>
                                        <span className={`text-green-600 ${appSettings.compactView ? 'text-xs sm:text-sm' : 'text-sm sm:text-lg'}`}>✅</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`rounded-lg border ${appSettings.compactView ? 'p-2 sm:p-3' : 'p-3 sm:p-4'} transition-all duration-300 hover:shadow-lg ${cardClasses}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Overdue</p>
                                        <p className={`${appSettings.compactView ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-bold text-red-600`}>{stats.overdue}</p>
                                    </div>
                                    <div className={`${appSettings.compactView ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-6 h-6 sm:w-8 sm:h-8'} bg-red-100 rounded-lg flex items-center justify-center`}>
                                        <span className={`text-red-600 ${appSettings.compactView ? 'text-xs sm:text-sm' : 'text-sm sm:text-lg'}`}>⚠️</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className={appSettings.compactView ? 'mb-4 lg:mb-6' : 'mb-6 lg:mb-8'}>
                            <TodoFilters
                                filters={filters}
                                onFiltersChange={setFilters}
                                categories={categories}
                                darkMode={isDarkMode}
                            />
                        </div>

                        {/* Bulk Selection Header */}
                        {finalTodos.length > 0 && (
                            <div className={`flex items-center justify-between ${appSettings.compactView ? 'mb-3' : 'mb-4'}`}>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedTodos.size === finalTodos.length && finalTodos.length > 0}
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Select all ({finalTodos.length})
                                        </span>
                                    </label>

                                    {/* Drag & Drop Status Indicator */}
                                    {dragEnabled && selectedTodos.size === 0 && (
                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                            🔄 Drag & Drop Active
                                        </span>
                                    )}
                                </div>

                                {selectedTodos.size > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleBulkToggle(true)}
                                            icon={<CheckSquare className="w-4 h-4" />}
                                            disabled={bulkActionLoading}
                                        >
                                            Complete
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleBulkDelete}
                                            icon={<Trash2 className="w-4 h-4" />}
                                            disabled={bulkActionLoading}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Todo List */}
                        <div className={spacing}>
                            {finalTodos.length === 0 ? (
                                <EmptyState
                                    type={
                                        debouncedSearchQuery ? 'no-search-results' :
                                            (filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all' || filters.dateFilter !== 'all') ? 'no-filter-results' :
                                                'no-todos'
                                    }
                                    searchQuery={debouncedSearchQuery}
                                    hasFilters={filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all' || filters.dateFilter !== 'all'}
                                    onCreateTodo={handleOpenAddModal}
                                    onClearFilters={() => setFilters({
                                        status: 'all',
                                        priority: 'all',
                                        category: 'all',
                                        dateFilter: 'all',
                                        sortBy: 'created',
                                        sortOrder: 'desc',
                                    })}
                                />
                            ) : (
                                <>
                                    {/* Results summary */}
                                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ${appSettings.compactView ? 'mb-2' : 'mb-4'} px-1`}>
                                        Showing <span className="font-medium">{finalTodos.length}</span> of <span className="font-medium">{stats.total}</span> todos
                                        {debouncedSearchQuery && (
                                            <span> matching "<span className="font-medium">{debouncedSearchQuery}</span>"</span>
                                        )}
                                        {!appSettings.showCompletedTasks && stats.completed > 0 && (
                                            <span className="text-orange-600"> (hiding {stats.completed} completed)</span>
                                        )}
                                        {dragEnabled && selectedTodos.size === 0 && (
                                            <span className="text-blue-600 dark:text-blue-400 ml-2">
                                                • Drag todos by grip handle to reorder
                                            </span>
                                        )}
                                    </div>

                                    {/* Todo Items with Drag & Drop */}
                                    {dragEnabled && selectedTodos.size === 0 ? (
                                        <DragDropContext
                                            todos={finalTodos}
                                            onReorder={handleTodoReorder}
                                            disabled={false}
                                            isDarkMode={isDarkMode}
                                        >
                                            {finalTodos.map((todo) => (
                                                <SortableTodoItem
                                                    key={todo.id}
                                                    todo={todo}
                                                    onToggle={toggleTodo}
                                                    onEdit={handleOpenEditModal}
                                                    onDelete={deleteTodo}
                                                    darkMode={isDarkMode}
                                                    dragDisabled={false}
                                                    showDragHandle={true}
                                                    isSelected={selectedTodos.has(todo.id)}
                                                    onSelect={handleTodoSelect}
                                                />
                                            ))}
                                        </DragDropContext>
                                    ) : (
                                        /* Regular Todo Items without Drag & Drop */
                                        finalTodos.map((todo) => (
                                            <div key={todo.id} className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTodos.has(todo.id)}
                                                    onChange={(e) => handleTodoSelect(todo.id, e.target.checked)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div className="flex-1">
                                                    <TodoItem
                                                        todo={todo}
                                                        onToggle={toggleTodo}
                                                        onEdit={handleOpenEditModal}
                                                        onDelete={deleteTodo}
                                                        darkMode={isDarkMode}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* Bulk Actions Floating Bar */}
            <BulkActions
                selectedCount={selectedTodos.size}
                onMarkCompleted={() => handleBulkToggle(true)}
                onMarkIncomplete={() => handleBulkToggle(false)}
                onDelete={handleBulkDelete}
                onClear={() => setSelectedTodos(new Set())}
                loading={bulkActionLoading}
            />

            {/* Modals */}
            <TodoForm
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
                onSubmit={createTodo}
                mode="add"
            />

            <TodoForm
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onSubmit={updateTodo}
                todo={editingTodo}
                mode="edit"
            />

            <Settings
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                darkMode={isDarkMode}
                onImportTodos={handleImportTodos}
                onSettingsChange={handleSettingsChange}
            />

            <ConfirmDialog
                isOpen={isDeleteConfirmOpen}
                onClose={() => {
                    setIsDeleteConfirmOpen(false);
                    setDeletingTodos([]);
                }}
                onConfirm={confirmBulkDelete}
                title="Delete Todos"
                message={`Are you sure you want to delete ${deletingTodos.length} todo(s)? This action cannot be undone.`}
                confirmText="Delete"
                loading={bulkActionLoading}
                variant="danger"
            />
        </div>
    );
}

export default App;