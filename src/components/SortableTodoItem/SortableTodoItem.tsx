import {
    useSortable,
} from '@dnd-kit/sortable';
import {
    CSS,
} from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { TodoItem } from '../TodoItem';
import type { Todo } from '../TodoForm';
import React from "react";

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

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1000 : 'auto',
    };

    const dragHandleClasses = darkMode
        ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100';

    React.useEffect(() => {
        console.log(`🔧 SortableTodoItem ${todo.id}:`, {
            isDragging,
            isOver,
            dragDisabled,
            showDragHandle,
            todoTitle: todo.title
        });
    }, [isDragging, isOver, dragDisabled, showDragHandle, todo.id, todo.title]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group transition-all duration-200 ${
                isDragging ? 'opacity-50 scale-105 z-50' : ''
            } ${
                isOver && !isDragging ? 'transform scale-102 bg-blue-50 dark:bg-blue-900/10 rounded-lg' : ''
            }`}
        >
            <div className="flex items-start gap-3">
                {showDragHandle && !dragDisabled && (
                    <div className="flex flex-col items-center pt-4">
                        <button
                            ref={setActivatorNodeRef}
                            {...attributes}
                            {...listeners}
                            className={`p-2 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 touch-none ${dragHandleClasses}`}
                            aria-label={`Drag to reorder ${todo.title}`}
                            title="Drag to reorder"
                            tabIndex={0}
                            onMouseDown={() => {
                                console.log('🖱️ Drag handle mouse down for:', todo.title);
                            }}
                            onTouchStart={() => {
                                console.log('👆 Drag handle touch start for:', todo.title);
                            }}
                        >
                            <GripVertical className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {onSelect && (
                    <div className="pt-4">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                                e.stopPropagation();
                                onSelect(todo.id, e.target.checked);
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                        />
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <div className={isDragging ? 'pointer-events-none' : ''}>
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

            {isDragging && (
                <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600 rounded-lg pointer-events-none animate-pulse -z-10" />
            )}

            {isOver && !isDragging && (
                <div className="absolute -top-1 left-0 right-0 h-1 bg-blue-500 rounded-full animate-pulse" />
            )}
        </div>
    );
}