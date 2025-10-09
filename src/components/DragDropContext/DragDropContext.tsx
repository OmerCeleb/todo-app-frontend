// components/DragDropContext/DragDropContext.tsx
import React, { useState, useCallback } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { GripVertical, Check, Calendar, Tag } from 'lucide-react';
import type { Todo } from '../TodoForm';

interface DragDropContextProps {
    children: React.ReactNode;
    todos: Todo[];
    onReorder: (todos: Todo[]) => void;
    disabled?: boolean;
    isDarkMode?: boolean;
}

export function DragDropContext({
                                    children,
                                    todos,
                                    onReorder,
                                    disabled = false,
                                    isDarkMode = false
                                }: DragDropContextProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);
    const [dragStartTime, setDragStartTime] = useState<number>(0);

    // Enhanced sensors with better touch support
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Slightly larger distance for better mobile experience
                tolerance: 5,
                delay: 100,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const activeItem = activeId ? todos.find(todo => String(todo.id) === String(activeId)) : null;

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);
        setDragStartTime(Date.now());

        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }

        console.log('🎯 Drag started:', active.id);
    }, []);

    const handleDragOver = useCallback((event: DragOverEvent) => {
        const { over } = event;
        setOverId(over?.id as string || null);
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        const dragDuration = Date.now() - dragStartTime;

        console.log('🏁 Drag ended:', {
            activeId: active.id,
            overId: over?.id,
            duration: `${dragDuration}ms`,
            hasOver: !!over,
            sameId: active.id === over?.id
        });

        setActiveId(null);
        setOverId(null);

        if (!over) {
            console.log('❌ No drop target');
            // Haptic feedback for failed drop
            if ('vibrate' in navigator) {
                navigator.vibrate([50, 50, 50]);
            }
            return;
        }

        if (active.id !== over.id) {
            const oldIndex = todos.findIndex(todo => String(todo.id) === String(active.id));
            const newIndex = todos.findIndex(todo => String(todo.id) === String(over.id));

            console.log('🔄 Reordering:', {
                oldIndex,
                newIndex,
                fromTodo: todos[oldIndex]?.title,
                toTodo: todos[newIndex]?.title
            });

            if (oldIndex !== -1 && newIndex !== -1) {
                const reorderedTodos = arrayMove(todos, oldIndex, newIndex);
                onReorder(reorderedTodos);

                // Success haptic feedback
                if ('vibrate' in navigator) {
                    navigator.vibrate(100);
                }
            }
        } else {
            console.log('⚪ Same position, no reorder needed');
        }
    }, [todos, onReorder, dragStartTime]);

    const handleDragCancel = useCallback(() => {
        console.log('🚫 Drag cancelled');
        setActiveId(null);
        setOverId(null);

        // Cancel haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate([30, 30, 30]);
        }
    }, []);

    if (disabled) {
        return <>{children}</>;
    }

    const todoIds = todos.map(todo => String(todo.id)).filter(id => id && id !== 'undefined');

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <SortableContext
                items={todoIds}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-3 relative">
                    {children}

                    {/* Active drag indicator overlay */}
                    {activeId && (
                        <div className="fixed inset-0 bg-black/5 dark:bg-black/20 pointer-events-none z-40 animate-fade-in backdrop-blur-[1px]" />
                    )}
                </div>
            </SortableContext>

            {/* Enhanced Drag Overlay */}
            <DragOverlay
                dropAnimation={{
                    duration: 300,
                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                }}
                className="cursor-grabbing"
            >
                {activeItem ? (
                    <EnhancedDragPreview
                        todo={activeItem}
                        isDarkMode={isDarkMode}
                        isOver={!!overId}
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

// Enhanced Drag Preview Component
interface DragPreviewProps {
    todo: Todo;
    isDarkMode: boolean;
    isOver: boolean;
}

function EnhancedDragPreview({ todo, isDarkMode, isOver }: DragPreviewProps) {
    const cardClasses = isDarkMode
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 text-white'
        : 'bg-gradient-to-br from-white to-gray-50 border-gray-300';

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return isDarkMode
                    ? 'text-red-300 bg-red-900/30 border-red-700 shadow-red-500/20'
                    : 'text-red-700 bg-red-100 border-red-300 shadow-red-500/20';
            case 'medium':
                return isDarkMode
                    ? 'text-yellow-300 bg-yellow-900/30 border-yellow-700 shadow-yellow-500/20'
                    : 'text-yellow-700 bg-yellow-100 border-yellow-300 shadow-yellow-500/20';
            case 'low':
                return isDarkMode
                    ? 'text-green-300 bg-green-900/30 border-green-700 shadow-green-500/20'
                    : 'text-green-700 bg-green-100 border-green-300 shadow-green-500/20';
            default:
                return isDarkMode
                    ? 'text-gray-400 bg-gray-700/50 border-gray-600'
                    : 'text-gray-600 bg-gray-100 border-gray-300';
        }
    };

    return (
        <div
            className={`
                relative border-2 rounded-xl p-4 max-w-md min-w-[320px]
                transform transition-all duration-300
                shadow-2xl
                ${isOver ? 'rotate-3 scale-110' : 'rotate-2 scale-105'}
                ${cardClasses}
                animate-pulse-subtle
            `}
            style={{
                boxShadow: isOver
                    ? '0 25px 50px -12px rgba(59, 130, 246, 0.4)'
                    : '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            }}
        >
            {/* Glow effect on corners */}
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full blur-sm animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full blur-sm animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-500 rounded-full blur-sm animate-pulse" style={{ animationDelay: '0.4s' }} />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full blur-sm animate-pulse" style={{ animationDelay: '0.6s' }} />

            {/* Drag handle indicator */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 bg-blue-500 dark:bg-blue-400 rounded-full p-1.5 shadow-lg animate-bounce">
                <GripVertical className="w-3 h-3 text-white" />
            </div>

            <div className="flex items-start gap-3">
                {/* Animated checkbox */}
                <div className={`
                    mt-1 w-6 h-6 rounded-md border-2 flex-shrink-0 
                    flex items-center justify-center
                    transition-all duration-300
                    ${todo.completed
                    ? 'bg-blue-500 border-blue-500 scale-110'
                    : 'border-blue-400 bg-transparent scale-100'
                }
                    ${isOver ? 'animate-pulse' : 'animate-bounce'}
                `}>
                    {todo.completed && (
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Title and Priority */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className={`
                            font-semibold text-base leading-tight
                            ${isDarkMode ? 'text-white' : 'text-gray-900'}
                            ${isOver ? 'animate-pulse' : ''}
                        `}>
                            {todo.title}
                        </h3>
                        <span className={`
                            px-2.5 py-1 rounded-full text-xs font-bold 
                            border-2 flex-shrink-0 uppercase tracking-wide
                            transition-all duration-300
                            ${getPriorityColor(todo.priority)}
                            ${isOver ? 'scale-110 shadow-lg' : 'scale-100'}
                        `}>
                            {todo.priority}
                        </span>
                    </div>

                    {/* Description */}
                    {todo.description && (
                        <p className={`
                            text-sm mb-3 line-clamp-2
                            ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                        `}>
                            {todo.description}
                        </p>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs">
                        {todo.category && (
                            <div className={`
                                flex items-center gap-1.5 px-2 py-1 rounded-lg
                                ${isDarkMode
                                ? 'bg-gray-700/50 text-gray-300'
                                : 'bg-gray-100 text-gray-700'
                            }
                            `}>
                                <Tag className="w-3 h-3" />
                                <span className="font-medium">{todo.category}</span>
                            </div>
                        )}
                        {todo.dueDate && (
                            <div className={`
                                flex items-center gap-1.5 px-2 py-1 rounded-lg
                                ${isDarkMode
                                ? 'bg-gray-700/50 text-gray-300'
                                : 'bg-gray-100 text-gray-700'
                            }
                            `}>
                                <Calendar className="w-3 h-3" />
                                <span className="font-medium">
                                    {new Date(todo.dueDate).toLocaleDateString('tr-TR', {
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom glow indicator */}
            <div className={`
                absolute -bottom-2 left-1/2 -translate-x-1/2 
                w-3/4 h-1 rounded-full
                transition-all duration-300
                ${isOver
                ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-100 blur-sm'
                : 'bg-blue-500/50 opacity-50'
            }
            `} />
        </div>
    );
}