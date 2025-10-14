// src/components/TodoListView/TodoListView.tsx
import { TodoItem } from '../TodoItem';
import type { Todo } from '../TodoForm';

interface TodoListViewProps {
    todos: Todo[];
    onToggle: (id: string) => void;
    onEdit: (todo: Todo) => void;
    onDelete: (id: string) => void;
    onSelect: (id: string, selected: boolean) => void;
    selectedTodos: Set<string>;
    isDarkMode: boolean;
}

export function TodoListView({
                                 todos,
                                 onToggle,
                                 onEdit,
                                 onDelete,
                                 onSelect,
                                 selectedTodos,
                                 isDarkMode,
                             }: TodoListViewProps) {
    return (
        <div className="space-y-3">
            {todos.map((todo) => (
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    darkMode={isDarkMode}
                />
            ))}
        </div>
    );
}