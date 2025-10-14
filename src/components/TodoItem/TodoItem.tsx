// src/components/TodoItem/TodoItem.tsx
import { memo, useCallback, useMemo } from 'react';
import {
    CheckCircle2,
    Circle,
    Trash2,
    Edit,
    Calendar,
    Flag,
    Clock,
    AlertCircle
} from 'lucide-react';
import type { Todo } from '../TodoForm';

interface TodoItemProps {
    todo: Todo;
    onToggle: (id: string) => void;
    onEdit: (todo: Todo) => void;
    onDelete: (id: string) => void;
    isSelected?: boolean;
    onSelect?: (id: string, selected: boolean) => void;
    darkMode?: boolean;
}

/**
 * Priority badge colors
 */
const getPriorityStyles = (priority: string) => {
    switch (priority) {
        case 'HIGH':
            return {
                bg: 'bg-gradient-to-r from-red-500 to-rose-600',
                text: 'text-red-700 dark:text-red-300',
                icon: 'text-red-600 dark:text-red-400',
                border: 'border-red-200 dark:border-red-900/30',
                ring: 'ring-red-500/20'
            };
        case 'MEDIUM':
            return {
                bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
                text: 'text-yellow-700 dark:text-yellow-300',
                icon: 'text-yellow-600 dark:text-yellow-400',
                border: 'border-yellow-200 dark:border-yellow-900/30',
                ring: 'ring-yellow-500/20'
            };
        case 'LOW':
            return {
                bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
                text: 'text-green-700 dark:text-green-300',
                icon: 'text-green-600 dark:text-green-400',
                border: 'border-green-200 dark:border-green-900/30',
                ring: 'ring-green-500/20'
            };
        default:
            return {
                bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
                text: 'text-gray-700 dark:text-gray-300',
                icon: 'text-gray-600 dark:text-gray-400',
                border: 'border-gray-200 dark:border-gray-700',
                ring: 'ring-gray-500/20'
            };
    }
};

/**
 * Category colors
 */
const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';

    const colors: Record<string, string> = {
        'Development': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        'Design': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
        'Backend': 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
        'Testing': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        'Documentation': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
        'Meeting': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
        'Personal': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
        'Other': 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    };

    return colors[category] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
};

/**
 * Professional TodoItem Component
 */
export const TodoItem = memo<TodoItemProps>(({
                                                 todo,
                                                 onToggle,
                                                 onEdit,
                                                 onDelete,
                                                 isSelected = false,
                                                 onSelect,
                                                 darkMode = false
                                             }) => {
    // Memoized handlers
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

    const dueIn = useMemo(() => {
        if (!todo.dueDate || todo.completed) return null;
        const now = new Date();
        const due = new Date(todo.dueDate);
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
        if (diffDays === 0) return 'Due today';
        if (diffDays === 1) return 'Due tomorrow';
        if (diffDays <= 7) return `Due in ${diffDays} days`;
        return null;
    }, [todo.dueDate, todo.completed]);

    const formattedDate = useMemo(() => {
        if (!todo.dueDate) return null;
        return new Date(todo.dueDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }, [todo.dueDate]);

    const priorityStyles = useMemo(() => getPriorityStyles(todo.priority), [todo.priority]);
    const categoryColor = useMemo(() => getCategoryColor(todo.category), [todo.category]);

    return (
        <div
            className={`
                group relative rounded-2xl border-2 transition-all duration-200
                ${darkMode ? 'bg-gray-800/50' : 'bg-white'}
                ${isSelected
                ? `border-blue-500 ring-4 ring-blue-500/20 ${darkMode ? 'bg-blue-900/10' : 'bg-blue-50/50'}`
                : `${darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`
            }
                ${isOverdue && !todo.completed
                ? `${darkMode ? 'bg-red-900/10 border-red-500/30' : 'bg-red-50/50 border-red-200'}`
                : ''
            }
                hover:shadow-xl hover:-translate-y-0.5
                ${todo.completed ? 'opacity-60' : ''}
            `}
            role="listitem"
            aria-label={`Todo: ${todo.title}`}
        >
            <div className="p-4">
                <div className="flex items-start gap-4">
                    {/* Selection Checkbox */}
                    {onSelect && (
                        <div className="flex items-center pt-1">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={handleSelect}
                                className="w-5 h-5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                                aria-label={`Select ${todo.title}`}
                            />
                        </div>
                    )}

                    {/* Completion Toggle */}
                    <button
                        onClick={handleToggle}
                        className="flex-shrink-0 mt-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-all hover:scale-110"
                        aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                        {todo.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500 dark:text-green-400 drop-shadow-lg" />
                        ) : (
                            <Circle className="w-6 h-6 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
                        )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Title Row */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <h3
                                className={`
                                    font-semibold text-base leading-tight
                                    ${todo.completed
                                    ? 'line-through text-gray-500 dark:text-gray-400'
                                    : `${darkMode ? 'text-white' : 'text-gray-900'}`
                                }
                                `}
                            >
                                {todo.title}
                            </h3>

                            {/* Priority Badge */}
                            <div className={`
                                flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold
                                ${priorityStyles.bg} text-white shadow-md
                                transform hover:scale-105 transition-transform
                            `}>
                                {todo.priority}
                            </div>
                        </div>

                        {/* Description */}
                        {todo.description && (
                            <p className={`
                                text-sm leading-relaxed mb-3 line-clamp-2
                                ${todo.completed
                                ? 'line-through text-gray-500 dark:text-gray-400'
                                : `${darkMode ? 'text-gray-300' : 'text-gray-600'}`
                            }
                            `}>
                                {todo.description}
                            </p>
                        )}

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Category Badge */}
                            {todo.category && (
                                <div className={`
                                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                    ${categoryColor}
                                    border ${darkMode ? 'border-gray-600' : 'border-gray-200'}
                                `}>
                                    <span>📁</span>
                                    <span>{todo.category}</span>
                                </div>
                            )}

                            {/* Due Date */}
                            {todo.dueDate && (
                                <div className={`
                                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                    ${isOverdue && !todo.completed
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/30'
                                    : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`
                                }
                                `}>
                                    {isOverdue && !todo.completed ? (
                                        <AlertCircle className="w-3.5 h-3.5" />
                                    ) : (
                                        <Calendar className="w-3.5 h-3.5" />
                                    )}
                                    <span>{formattedDate}</span>
                                </div>
                            )}

                            {/* Due In Badge */}
                            {dueIn && !todo.completed && (
                                <div className={`
                                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                    ${isOverdue
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                }
                                    border ${darkMode ? 'border-gray-600' : 'border-gray-200'}
                                `}>
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{dueIn}</span>
                                </div>
                            )}

                            {/* Priority Icon (Small) */}
                            <div className={`flex items-center gap-1 text-xs ${priorityStyles.icon}`}>
                                <Flag className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={handleEdit}
                            className={`
                                p-2 rounded-xl transition-all
                                ${darkMode
                                ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/20'
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                            }
                                transform hover:scale-110
                            `}
                            aria-label="Edit todo"
                        >
                            <Edit className="w-4 h-4" />
                        </button>

                        <button
                            onClick={handleDelete}
                            className={`
                                p-2 rounded-xl transition-all
                                ${darkMode
                                ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20'
                                : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                            }
                                transform hover:scale-110
                            `}
                            aria-label="Delete todo"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison for memo optimization
    return (
        prevProps.todo.id === nextProps.todo.id &&
        prevProps.todo.title === nextProps.todo.title &&
        prevProps.todo.description === nextProps.todo.description &&
        prevProps.todo.completed === nextProps.todo.completed &&
        prevProps.todo.priority === nextProps.todo.priority &&
        prevProps.todo.category === nextProps.todo.category &&
        prevProps.todo.dueDate === nextProps.todo.dueDate &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.darkMode === nextProps.darkMode
    );
});

TodoItem.displayName = 'TodoItem';