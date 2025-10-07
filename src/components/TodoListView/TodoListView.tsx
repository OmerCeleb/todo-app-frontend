// src/components/TodoListView/TodoListView.tsx
import { DragDropContext } from '../DragDropContext';
import { SortableTodoItem } from '../SortableTodoItem';
import { TodoItem } from '../TodoItem';
import type { Todo } from '../TodoForm';

interface TodoListViewProps {
    todos: Todo[];
    onToggle: (id: string) => void;
    onEdit: (todo: Todo) => void;
    onDelete: (id: string) => void;
    onReorder: (todos: Todo[]) => void;
    onSelect: (id: string, selected: boolean) => void;
    selectedTodos: Set<string>;
    isDarkMode: boolean;
    dragEnabled?: boolean;
}

export function TodoListView({
                                 todos,
                                 onToggle,
                                 onEdit,
                                 onDelete,
                                 onReorder,
                                 onSelect,
                                 selectedTodos,
                                 isDarkMode,
                                 dragEnabled = true,
                             }: TodoListViewProps) {
    return (
        <DragDropContext todos={todos} onReorder={onReorder}>
            <div className="space-y-3">
                {todos.map((todo) => (
                    dragEnabled ? (
                        <SortableTodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={onToggle}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            isSelected={selectedTodos.has(todo.id)}
                            onSelect={onSelect}
                            darkMode={isDarkMode}
                        />
                    ) : (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={onToggle}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            darkMode={isDarkMode}
                        />
                    )
                ))}
            </div>
        </DragDropContext>
    );
}