// src/components/SortableTodoItem/SortableTodoItem.tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Check } from 'lucide-react';
import { TodoItem } from '../TodoItem';
import type { Todo } from '../TodoForm';

interface SortableTodoItemProps {
    todo: Todo;
    onToggle: (id: string) => void;
    onEdit: (todo: Todo) => void;
    onDelete: (id: string) => void;
    darkMode?: boolean;
    dragDisabled?: boolean;
    showDragHandle?: boolean;
    isSelected?: boolean;
    onSelect?: (id: string, selected: boolean) => void;
}

export function SortableTodoItem({
                                     todo,
                                     onToggle,
                                     onEdit,
                                     onDelete,
                                     darkMode = false,
                                     dragDisabled = false,
                                     showDragHandle = true,
                                     isSelected = false,
                                     onSelect,
                                 }: SortableTodoItemProps) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isOver,
        setActivatorNodeRef,
    } = useSortable({
        id: String(todo.id),
        disabled: dragDisabled,
        data: {
            type: 'todo',
            todo: todo,
        },
    });

    // Enhanced style with smooth transitions
    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: isDragging ? 1000 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    // Enhanced drag handle classes
    const dragHandleClasses = darkMode
        ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50 active:bg-gray-600/50 transform hover:scale-110 active:scale-95'
        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200 transform hover:scale-110 active:scale-95';

    // Container classes with enhanced effects
    const containerClasses = `group relative transition-all duration-200 rounded-lg ${
        isDragging ? 'scale-[1.02] shadow-2xl ring-2 ring-blue-500 dark:ring-blue-400' : 'hover:shadow-md'
    } ${
        isOver && !isDragging ? 'scale-[1.01] bg-blue-50/50 dark:bg-blue-900/20 ring-2 ring-blue-300 dark:ring-blue-600' : ''
    } ${
        isSelected ? 'ring-2 ring-purple-500 dark:ring-purple-400 bg-purple-50/30 dark:bg-purple-900/10' : ''
    }`;

    // Haptic feedback for mobile
    const handleDragStart = () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={containerClasses}
            role="listitem"
            aria-label={`Todo: ${todo.title}${isSelected ? ' (selected)' : ''}`}
        >
            {/* Drop indicator - Top */}
            {isOver && !isDragging && (
                <div
                    className="absolute -top-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full animate-pulse"
                    aria-hidden="true"
                />
            )}

            <div className="flex items-start gap-2 sm:gap-3 p-1">
                {/* Enhanced Drag Handle */}
                {showDragHandle && !dragDisabled && (
                    <div className="flex items-center pt-3 sm:pt-4">
                        <button
                            ref={setActivatorNodeRef}
                            {...attributes}
                            {...listeners}
                            className={`p-2 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 touch-none opacity-0 group-hover:opacity-100 focus:opacity-100 ${dragHandleClasses}`}
                            aria-label={`Drag to reorder ${todo.title}`}
                            title="Drag to reorder"
                            tabIndex={0}
                            onMouseDown={handleDragStart}
                            onTouchStart={handleDragStart}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleDragStart();
                                }
                            }}
                        >
                            <GripVertical
                                className="w-4 h-4 sm:w-5 sm:h-5"
                                aria-hidden="true"
                            />
                        </button>
                    </div>
                )}

                {/* Enhanced Selection Checkbox */}
                {onSelect && (
                    <div className="flex items-center pt-3 sm:pt-4">
                        <label
                            className="relative flex items-center cursor-pointer group/checkbox"
                            aria-label={`Select ${todo.title}`}
                        >
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    onSelect(todo.id, e.target.checked);
                                }}
                                className="sr-only peer"
                                aria-label={`Select todo: ${todo.title}`}
                            />
                            <div className={`
                                w-5 h-5 rounded border-2 transition-all duration-200
                                flex items-center justify-center
                                peer-checked:bg-purple-500 peer-checked:border-purple-500
                                peer-focus:ring-2 peer-focus:ring-purple-500 peer-focus:ring-offset-2
                                group-hover/checkbox:border-purple-400 group-hover/checkbox:scale-110
                                active:scale-95
                                ${darkMode
                                ? 'border-gray-600 bg-gray-800 peer-checked:bg-purple-600'
                                : 'border-gray-300 bg-white'
                            }
                            `}>
                                {isSelected && (
                                    <Check
                                        className="w-3 h-3 text-white animate-scale-in"
                                        strokeWidth={3}
                                        aria-hidden="true"
                                    />
                                )}
                            </div>
                        </label>
                    </div>
                )}

                {/* Todo Content */}
                <div className="flex-1 min-w-0">
                    <div className={isDragging ? 'pointer-events-none select-none' : ''}>
                        <TodoItem
                            todo={todo}
                            onToggle={onToggle}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            darkMode={darkMode}
                        />
                    </div>
                </div>
            </div>

            {/* Dragging Overlay */}
            {isDragging && (
                <div
                    className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-blue-200/50 dark:from-blue-900/30 dark:to-blue-800/30 border-2 border-blue-400 dark:border-blue-500 rounded-lg pointer-events-none -z-10 animate-pulse backdrop-blur-sm"
                    aria-hidden="true"
                />
            )}

            {/* Drop indicator - Bottom */}
            {isOver && !isDragging && (
                <div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full animate-pulse"
                    aria-hidden="true"
                />
            )}

            {/* Selection Indicator */}
            {isSelected && (
                <div
                    className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-purple-600 rounded-l-lg"
                    aria-hidden="true"
                />
            )}
        </div>
    );
}