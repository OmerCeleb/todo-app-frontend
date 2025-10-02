// src/components/TodoForm/TodoForm.tsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

// Types
export interface Todo {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    category?: string;
    createdAt: string;
    updatedAt: string;
    dueDate?: string;
}

export interface TodoFormData {
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    category: string;
    dueDate: string;
    completed?: boolean; // EKLENDI
}

interface TodoFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TodoFormData, id?: string) => void;
    todo?: Todo | null;
    mode?: 'add' | 'edit';
}

// Simple Modal Component
function SimpleModal({ isOpen, onClose, title, children }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}

const priorityOptions = [
    { value: 'LOW', label: 'Low Priority' },
    { value: 'MEDIUM', label: 'Medium Priority' },
    { value: 'HIGH', label: 'High Priority' },
];

const categoryOptions = [
    'Development',
    'Design',
    'Backend',
    'Testing',
    'Documentation',
    'Personal',
    'Other',
];

export function TodoForm({ isOpen, onClose, onSubmit, todo, mode = 'add' }: TodoFormProps) {
    const [formData, setFormData] = useState<TodoFormData>({
        title: '',
        description: '',
        priority: 'MEDIUM',
        category: '',
        dueDate: '',
        completed: false, // EKLENDI
    });

    // Reset form when modal opens/closes or todo changes
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && todo) {
                setFormData({
                    title: todo.title,
                    description: todo.description || '',
                    priority: todo.priority,
                    category: todo.category || '',
                    dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : '',
                    completed: todo.completed, // EKLENDI
                });
            } else {
                // Reset form for add mode
                setFormData({
                    title: '',
                    description: '',
                    priority: 'MEDIUM',
                    category: '',
                    dueDate: '',
                    completed: false, // EKLENDI
                });
            }
        }
    }, [isOpen, mode, todo]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        onSubmit(formData, mode === 'edit' && todo ? todo.id : undefined);
        onClose();
    };

    const handleInputChange = (field: keyof TodoFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'edit' ? 'Edit Todo' : 'Add New Todo'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                    </label>
                    <Input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter todo title"
                        required
                        autoFocus
                    />
                </div>

                {/* Description Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter description (optional)"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Priority Select */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                    </label>
                    <select
                        value={formData.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {priorityOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Category Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                    </label>
                    <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select a category</option>
                        {categoryOptions.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Due Date Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date
                    </label>
                    <Input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    />
                </div>

                {/* Form Actions */}
                <div className="flex gap-2 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={!formData.title.trim()}
                        className="flex-1"
                    >
                        {mode === 'edit' ? 'Update' : 'Add'} Todo
                    </Button>
                </div>
            </form>
        </SimpleModal>
    );
}