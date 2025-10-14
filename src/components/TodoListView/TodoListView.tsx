// src/components/TodoListView/TodoListView.tsx
import { TodoItem } from '../TodoItem';
import type { Todo } from '../TodoForm';

interface TodoListViewProps {
    todos: Todo[];
    onToggle: (id: string) => void;
    onEdit: (todo: Todo) => void;
    onDelete: (id: string) => void;
    onSelect?: (id: string, selected: boolean) => void;
    selectedTodos?: Set<string>;
    isDarkMode: boolean;
}

export function TodoListView({
                                 todos,
                                 onToggle,
                                 onEdit,
                                 onDelete,
                                 onSelect,
                                 selectedTodos = new Set(),
                                 isDarkMode,
                             }: TodoListViewProps) {
    // Group todos by completion status
    const activeTodos = todos.filter(todo => !todo.completed);
    const completedTodos = todos.filter(todo => todo.completed);

    return (
        <div className="space-y-6">
            {/* Active Tasks Section */}
            {activeTodos.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
                        <h2 className={`text-sm font-semibold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            Active Tasks ({activeTodos.length})
                        </h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
                    </div>
                    <div className="grid gap-3">
                        {activeTodos.map((todo) => (
                            <TodoItem
                                key={todo.id}
                                todo={todo}
                                onToggle={onToggle}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onSelect={onSelect}
                                isSelected={selectedTodos.has(todo.id)}
                                darkMode={isDarkMode}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Completed Tasks Section */}
            {completedTodos.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-300 dark:via-green-700 to-transparent" />
                        <h2 className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${
                            isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`}>
                            <span>✓</span>
                            <span>Completed ({completedTodos.length})</span>
                        </h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-300 dark:via-green-700 to-transparent" />
                    </div>
                    <div className="grid gap-3">
                        {completedTodos.map((todo) => (
                            <TodoItem
                                key={todo.id}
                                todo={todo}
                                onToggle={onToggle}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onSelect={onSelect}
                                isSelected={selectedTodos.has(todo.id)}
                                darkMode={isDarkMode}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}