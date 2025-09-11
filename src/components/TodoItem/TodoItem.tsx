// src/components/TodoItem/TodoItem.tsx - Updated with category colors
import { useState, useRef } from 'react';
import { Check, Edit3, Trash2, Calendar, Tag, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Todo } from '../TodoForm';
import { useCategoryColors } from '../../utils/categoryColors';

// Import date utilities with relative path
import {
    getRelativeTime,
    getDateUrgency,
    getUrgencyClasses,
    formatSmartDate
} from '../../utils/dateUtils';

interface TodoItemProps {
    todo: Todo;
    onToggle: (id: string) => void;
    onEdit: (todo: Todo) => void;
    onDelete: (id: string) => void;
    darkMode?: boolean;
}

export function TodoItem({ todo, onToggle, onEdit, onDelete, darkMode = false }: TodoItemProps) {
    const [isPressed, setIsPressed] = useState(false);
    const [swipeX, setSwipeX] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const startX = useRef(0);
    const isDragging = useRef(false);

    // Category colors hook
    const { getColorClasses } = useCategoryColors();

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
            case 'low': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
            default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600';
        }
    };

    const isOverdue = (dueDate: string) => {
        const date = new Date(dueDate);
        const now = new Date();
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return dateOnly < nowOnly;
    };

    const urgency = todo.dueDate ? getDateUrgency(todo.dueDate, todo.completed) : 'none';
    const urgencyClasses = getUrgencyClasses(urgency, darkMode);

    // Touch/Mouse event handlers for swipe gestures
    const handleStart = (clientX: number) => {
        startX.current = clientX;
        isDragging.current = false;
        setIsPressed(true);
    };

    const handleMove = (clientX: number) => {
        if (!startX.current) return;

        const diff = clientX - startX.current;
        if (Math.abs(diff) > 10) {
            isDragging.current = true;
            setSwipeX(Math.max(-100, Math.min(100, diff * 0.5)));
        }
    };

    const handleEnd = () => {
        setIsPressed(false);

        if (isDragging.current) {
            if (swipeX > 50) {
                // Swipe right - mark as complete
                onToggle(todo.id);
            } else if (swipeX < -50) {
                // Swipe left - delete
                onDelete(todo.id);
            }
        }

        setSwipeX(0);
        startX.current = 0;
        isDragging.current = false;
    };

    const handleToggle = () => {
        setIsAnimating(true);
        setTimeout(() => {
            onToggle(todo.id);
            setIsAnimating(false);
        }, 150);
    };

    const handleEdit = () => {
        setIsAnimating(true);
        setTimeout(() => {
            onEdit(todo);
            setIsAnimating(false);
        }, 100);
    };

    const handleDelete = () => {
        setIsAnimating(true);
        setTimeout(() => {
            onDelete(todo.id);
            setIsAnimating(false);
        }, 100);
    };

    const cardClasses = darkMode
        ? 'bg-gray-800 border-gray-700 text-white'
        : 'bg-white border-gray-200';

    const overdueClasses = urgency === 'overdue'
        ? urgencyClasses
        : '';

    return (
        <div className="relative">
            {/* Swipe Action Background */}
            <div className="absolute inset-0 flex items-center justify-between px-4 rounded-lg overflow-hidden">
                <div className={`flex items-center gap-2 text-green-600 transition-opacity duration-200 ${swipeX > 20 ? 'opacity-100' : 'opacity-0'}`}>
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-medium">Complete</span>
                </div>
                <div className={`flex items-center gap-2 text-red-600 transition-opacity duration-200 ${swipeX < -20 ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="text-sm font-medium">Delete</span>
                    <Trash2 className="w-5 h-5" />
                </div>
            </div>

            {/* Main Todo Item */}
            <div
                className={`border rounded-lg p-4 transition-all duration-300 ease-out transform hover:shadow-lg active:scale-98 ${cardClasses} ${overdueClasses} ${
                    todo.completed ? 'opacity-75' : ''
                } ${
                    isPressed ? 'scale-98 shadow-lg' : ''
                } ${
                    isAnimating ? 'scale-95' : ''
                }`}
                style={{
                    transform: `translateX(${swipeX}px) ${isPressed ? 'scale(0.98)' : ''} ${isAnimating ? 'scale(0.95)' : ''}`,
                }}
                onMouseDown={(e) => handleStart(e.clientX)}
                onMouseMove={(e) => e.buttons === 1 && handleMove(e.clientX)}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={(e) => handleStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleMove(e.touches[0].clientX)}
                onTouchEnd={handleEnd}
            >
                <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                        onClick={handleToggle}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300 mt-0.5 flex items-center justify-center transform hover:scale-110 ${
                            todo.completed
                                ? 'bg-blue-500 border-blue-500 text-white scale-110'
                                : `border-gray-300 hover:border-blue-500 hover:bg-blue-50 ${darkMode ? 'border-gray-600 hover:border-blue-400' : ''}`
                        }`}
                    >
                        {todo.completed && <Check className="w-4 h-4 animate-fade-in" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Title and Priority */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className={`font-medium text-base leading-tight transition-all duration-300 ${
                                todo.completed
                                    ? `line-through ${darkMode ? 'text-gray-500' : 'text-gray-500'}`
                                    : ''
                            }`}>
                                {todo.title}
                            </h3>

                            {/* Priority Badge */}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 transition-all duration-200 hover:scale-105 ${
                                getPriorityColor(todo.priority)
                            }`}>
                                {todo.priority}
                            </span>
                        </div>

                        {/* Description */}
                        {todo.description && (
                            <p className={`text-sm mb-3 leading-relaxed transition-all duration-300 ${
                                todo.completed
                                    ? `line-through ${darkMode ? 'text-gray-500' : 'text-gray-500'}`
                                    : darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                {todo.description}
                            </p>
                        )}

                        {/* Meta Information - Responsive Stack */}
                        <div className={`flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {todo.category && (
                                <div className="flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getColorClasses(todo.category, darkMode)}`}>
                                        {todo.category}
                                    </span>
                                </div>
                            )}

                            {todo.dueDate && (
                                <div className={`flex items-center gap-1 ${
                                    urgency === 'overdue' ? 'text-red-600 font-medium' :
                                        urgency === 'high' ? 'text-orange-600 font-medium' :
                                            urgency === 'medium' ? 'text-yellow-600 font-medium' :
                                                ''
                                }`}>
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        Due: {getRelativeTime(todo.dueDate)}
                                        {urgency === 'overdue' && ' (Overdue)'}
                                        {urgency === 'high' && !isOverdue(todo.dueDate) && ' (Urgent)'}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Created: {formatSmartDate(todo.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Hidden on Mobile */}
                    <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleEdit}
                            icon={<Edit3 className="w-4 h-4" />}
                            className="transition-all duration-200 hover:scale-110"
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                            icon={<Trash2 className="w-4 h-4" />}
                            className="transition-all duration-200 hover:scale-110 hover:text-red-600"
                        />
                    </div>
                </div>

                {/* Mobile Action Buttons - Bottom Row */}
                <div className="sm:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEdit}
                        icon={<Edit3 className="w-4 h-4" />}
                        className="transition-all duration-200 hover:scale-105"
                    >
                        Edit
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        icon={<Trash2 className="w-4 h-4" />}
                        className="transition-all duration-200 hover:scale-105 hover:text-red-600"
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
}