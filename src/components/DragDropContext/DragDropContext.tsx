// components/DragDropContext/DragDropContext.tsx - COMPLETELY FIXED
import React from 'react';
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
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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
    const [activeId, setActiveId] = React.useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const activeItem = activeId ? todos.find(todo => todo.id === activeId) : null;

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);
        console.log('🎯 Drag started:', active.id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        console.log('🏁 Drag ended:', {
            activeId: active.id,
            overId: over?.id,
            hasOver: !!over,
            sameId: active.id === over?.id
        });

        setActiveId(null);

        if (!over) {
            console.log('❌ No drop target');
            return;
        }

        if (active.id !== over.id) {
            const oldIndex = todos.findIndex(todo => todo.id === active.id);
            const newIndex = todos.findIndex(todo => todo.id === over.id);

            console.log('🔄 Reordering:', {
                oldIndex,
                newIndex,
                fromTodo: todos[oldIndex]?.title,
                toTodo: todos[newIndex]?.title
            });

            if (oldIndex !== -1 && newIndex !== -1) {
                const reorderedTodos = arrayMove(todos, oldIndex, newIndex);
                onReorder(reorderedTodos);
            }
        } else {
            console.log('⚪ Same position, no reorder needed');
        }
    };

    const handleDragCancel = () => {
        console.log('🚫 Drag cancelled');
        setActiveId(null);
    };

    if (disabled) {
        return <>{children}</>;
    }

    const todoIds = todos.map(todo => String(todo.id)).filter(id => id && id !== 'undefined');

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <SortableContext
                items={todoIds}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-3">
                    {children}
                </div>
            </SortableContext>

            <DragOverlay>
                {activeItem ? (
                    <DragPreview todo={activeItem} isDarkMode={isDarkMode} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function DragPreview({ todo, isDarkMode }: { todo: Todo; isDarkMode: boolean }) {
    const cardClasses = isDarkMode
        ? 'bg-gray-800 border-gray-700 text-white shadow-2xl'
        : 'bg-white border-gray-200 shadow-2xl';

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return isDarkMode ? 'text-red-400 bg-red-900/20 border-red-800' : 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return isDarkMode ? 'text-yellow-400 bg-yellow-900/20 border-yellow-800' : 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low': return isDarkMode ? 'text-green-400 bg-green-900/20 border-green-800' : 'text-green-600 bg-green-50 border-green-200';
            default: return isDarkMode ? 'text-gray-400 bg-gray-700 border-gray-600' : 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className={`border rounded-lg p-4 max-w-md transform rotate-2 scale-105 opacity-95 ${cardClasses}`}>
            <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-blue-400 flex-shrink-0 animate-pulse" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {todo.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${getPriorityColor(todo.priority)}`}>
                            {todo.priority}
                        </span>
                    </div>
                    {todo.description && (
                        <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {todo.description}
                        </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        {todo.category && <span>📁 {todo.category}</span>}
                        {todo.dueDate && <span>📅 {new Date(todo.dueDate).toLocaleDateString()}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}