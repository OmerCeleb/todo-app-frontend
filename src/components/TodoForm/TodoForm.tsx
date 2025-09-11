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
    priority: 'low' | 'medium' | 'high';
    category?: string;
    createdAt: string;
    updatedAt: string;
    dueDate?: string;
}

export interface TodoFormData {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    category: string;
    dueDate: string;
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
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
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
        priority: 'medium',
        category: '',
        dueDate: '',
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
                });
            } else {
                setFormData({
                    title: '',
                    description: '',
                    priority: 'medium',
                    category: '',
                    dueDate: '',
                });
            }
        }
    }, [isOpen, todo, mode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        onSubmit(formData, todo?.id);
        onClose();
    };

    const handleChange = (field: keyof TodoFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'edit' ? 'Edit Todo' : 'Add Todo'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter todo title..."
                    required
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Enter description (optional)..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Priority
                        </label>
                        <select
                            value={formData.priority}
                            onChange={(e) => handleChange('priority', e.target.value as 'low' | 'medium' | 'high')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {priorityOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select category...</option>
                            {categoryOptions.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <Input
                    label="Due Date"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    helperText="Optional due date"
                />

                {/* Preview */}
                {formData.title && (
                    <div className="bg-gray-50 rounded-lg p-3 border">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
                        <div className="bg-white border rounded p-2">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="font-medium text-gray-900">{formData.title}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                                    getPriorityColor(formData.priority)
                                }`}>
                  {formData.priority}
                </span>
                            </div>
                            {formData.description && (
                                <p className="text-sm text-gray-600 mb-2">{formData.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                {formData.category && <span>📁 {formData.category}</span>}
                                {formData.dueDate && <span>📅 Due: {new Date(formData.dueDate).toLocaleDateString()}</span>}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="secondary"
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
                        {mode === 'edit' ? 'Update Todo' : 'Create Todo'}
                    </Button>
                </div>
            </form>
        </SimpleModal>
    );
}