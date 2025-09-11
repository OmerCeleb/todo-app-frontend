// src/components/VirtualizedTodoList/VirtualizedTodoList.tsx
import { TodoItem } from '../TodoItem';
import type { Todo } from '../TodoForm';

interface VirtualizedTodoListProps {
    todos: Todo[];
    onToggle: (id: string) => void;
    onEdit: (todo: Todo) => void;
    onDelete: (id: string) => void;
    darkMode?: boolean;
    height: number;
}

// Simple implementation without react-window for now
// You can add react-window later for better performance with large lists
export function VirtualizedTodoList({
                                        todos,
                                        onToggle,
                                        onEdit,
                                        onDelete,
                                        darkMode = false,
                                        height
                                    }: VirtualizedTodoListProps) {
    return (
        <div
            className="space-y-4 overflow-y-auto"
            style={{ height: `${height}px` }}
        >
            {todos.map((todo, index) => (
                <div
                    key={todo.id}
                    className="animate-slide-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                >
                    <TodoItem
                        todo={todo}
                        onToggle={onToggle}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        darkMode={darkMode}
                    />
                </div>
            ))}
        </div>
    );
}