// src/components/TodoItem/TodoItem.optimized.tsx
import React, { memo, useCallback, useMemo } from 'react';
import { CheckCircle2, Circle, Trash2, Edit, Calendar, Flag } from 'lucide-react';
import type { Todo } from '../TodoForm';

interface TodoItemProps {
    todo: Todo;
    onToggle: (id: string) => void;
    onEdit: (todo: Todo) => void;
    onDelete: (id: string) => void;
    isSelected?: boolean;
    onSelect?: (id: string, selected: boolean) => void;
}

/**
 * Optimized TodoItem Component with React.memo
 * Only re-renders when props actually change
 */
export const TodoItem = memo<TodoItemProps>(({
                                                 todo,
                                                 onToggle,
                                                 onEdit,
                                                 onDelete,
                                                 isSelected = false,
                                                 onSelect
                                             }) => {
    // Memoized handlers to prevent unnecessary re-renders
    const handleToggle = useCallback(() => {
        onToggle(todo.id);
    }, [todo.id, onToggle]);

    const handleEdit = useCallback(() => {
        onEdit(todo);
    }, [todo, onEdit]);

    const handleDelete = useCallback(() => {
        onDelete(todo.id);
    }, [todo.id, onDelete]);

    const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onSelect?.(todo.id, e.target.checked);
    }, [todo.id, onSelect]);

    // Memoized computed values
    const isOverdue = useMemo(() => {
        if (!todo.dueDate || todo.completed) return false;
        return new Date(todo.dueDate) < new Date();
    }, [todo.dueDate, todo.completed]);

    const priorityColor = useMemo(() => {
        switch (todo.priority) {
            case 'HIGH': return 'text-red-600 dark:text-red-400';
            case 'MEDIUM': return 'text-yellow-600 dark:text-yellow-400';
            case 'LOW': return 'text-green-600 dark:text-green-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    }, [todo.priority]);

    const formattedDate = useMemo(() => {
        if (!todo.dueDate) return null;
        return new Date(todo.dueDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }, [todo.dueDate]);

    return (
        <div
            className={`
                group relative p-4 bg-white dark:bg-gray-800 rounded-lg border 
                ${isSelected ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900' : 'border-gray-200 dark:border-gray-700'}
                ${isOverdue ? 'bg-red-50 dark:bg-red-900/10' : ''}
                hover:shadow-md transition-all duration-200
            `}
            role="listitem"
            aria-label={`Todo: ${todo.title}`}
        >
            <div className="flex items-start gap-3">
                {/* Checkbox for selection */}
                {onSelect && (
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={handleSelect}
                        className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        aria-label={`Select ${todo.title}`}
                    />
                )}

                {/* Toggle completion */}
                <button
                    onClick={handleToggle}
                    className="mt-1 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                    aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                >
                    {todo.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                        <Circle className="w-5 h-5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
                    )}
                </button>

                {/* Todo content */}
                <div className="flex-1 min-w-0">
                    {/* Title and Category */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3
                            className={`
                                font-medium text-gray-900 dark:text-white truncate
                                ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}
                            `}
                        >
                            {todo.title}
                        </h3>

                        {todo.category && (
                            <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                                {todo.category}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {todo.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {todo.description}
                        </p>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {/* Priority */}
                        <div className="flex items-center gap-1">
                            <Flag className={`w-3 h-3 ${priorityColor}`} />
                            <span className={priorityColor}>{todo.priority}</span>
                        </div>

                        {/* Due date */}
                        {formattedDate && (
                            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}`}>
                                <Calendar className="w-3 h-3" />
                                <span>{formattedDate}</span>
                                {isOverdue && <span className="font-bold">⚠️</span>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleEdit}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        aria-label="Edit todo"
                    >
                        <Edit className="w-4 h-4" />
                    </button>

                    <button
                        onClick={handleDelete}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        aria-label="Delete todo"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function for memo
    // Only re-render if these specific props change
    return (
        prevProps.todo.id === nextProps.todo.id &&
        prevProps.todo.title === nextProps.todo.title &&
        prevProps.todo.description === nextProps.todo.description &&
        prevProps.todo.completed === nextProps.todo.completed &&
        prevProps.todo.priority === nextProps.todo.priority &&
        prevProps.todo.category === nextProps.todo.category &&
        prevProps.todo.dueDate === nextProps.todo.dueDate &&
        prevProps.isSelected === nextProps.isSelected
    );
});

TodoItem.displayName = 'TodoItem';

export default TodoItem;