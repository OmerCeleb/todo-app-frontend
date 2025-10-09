// src/components/TodoForm/TodoForm.tsx
import { useState, useEffect } from 'react';
import { X, Calendar, Tag, Flag, FileText, CheckSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

/**
 * Todo type definition
 */
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

/**
 * Todo form data structure
 */
export interface TodoFormData {
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    category: string;
    dueDate: string;
    completed?: boolean;
}

/**
 * TodoForm component props
 */
interface TodoFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TodoFormData, id?: string) => void;
    todo?: Todo | null;
    mode?: 'add' | 'edit';
    darkMode?: boolean;
}

/**
 * Simple Modal Component
 * A lightweight modal wrapper for the form
 */
function SimpleModal({
                         isOpen,
                         onClose,
                         title,
                         children,
                         darkMode = false
                     }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    darkMode?: boolean;
}) {
    if (!isOpen) return null;

    const modalClasses = darkMode
        ? 'bg-gray-800 border border-gray-700'
        : 'bg-white';

    const headerClasses = darkMode
        ? 'border-gray-700 text-white'
        : 'border-gray-200 text-gray-900';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative ${modalClasses} rounded-xl shadow-2xl w-full max-w-2xl animate-scale-in`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-5 border-b ${headerClasses}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <CheckSquare className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

/**
 * Priority options for the select dropdown
 */
const priorityOptions = [
    { value: 'LOW', label: 'Low Priority', icon: '🟢', color: 'text-green-600 dark:text-green-400' },
    { value: 'MEDIUM', label: 'Medium Priority', icon: '🟡', color: 'text-yellow-600 dark:text-yellow-400' },
    { value: 'HIGH', label: 'High Priority', icon: '🔴', color: 'text-red-600 dark:text-red-400' },
];

/**
 * Category options for the select dropdown
 */
const categoryOptions = [
    { value: 'Development', icon: '💻' },
    { value: 'Design', icon: '🎨' },
    { value: 'Backend', icon: '⚙️' },
    { value: 'Testing', icon: '🧪' },
    { value: 'Documentation', icon: '📚' },
    { value: 'Meeting', icon: '👥' },
    { value: 'Personal', icon: '🏠' },
    { value: 'Other', icon: '📌' },
];

/**
 * TodoForm Component
 * Handles creating and editing todos with a modern, responsive form
 */
export function TodoForm({
                             isOpen,
                             onClose,
                             onSubmit,
                             todo,
                             mode = 'add',
                             darkMode = false
                         }: TodoFormProps) {
    // Form state
    const [formData, setFormData] = useState<TodoFormData>({
        title: '',
        description: '',
        priority: 'MEDIUM',
        category: '',
        dueDate: '',
        completed: false,
    });

    // Validation state
    const [errors, setErrors] = useState<Partial<Record<keyof TodoFormData, string>>>({});

    /**
     * Reset form when modal opens/closes or todo changes
     */
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && todo) {
                // Edit mode: populate form with existing todo data
                setFormData({
                    title: todo.title,
                    description: todo.description || '',
                    priority: todo.priority,
                    category: todo.category || '',
                    dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : '',
                    completed: todo.completed,
                });
            } else {
                // Add mode: reset form to defaults
                setFormData({
                    title: '',
                    description: '',
                    priority: 'MEDIUM',
                    category: '',
                    dueDate: '',
                    completed: false,
                });
            }
            // Clear any validation errors
            setErrors({});
        }
    }, [isOpen, mode, todo]);

    /**
     * Validate form data
     * Returns true if valid, false otherwise
     */
    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof TodoFormData, string>> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length > 200) {
            newErrors.title = 'Title must be less than 200 characters';
        }

        if (formData.description && formData.description.length > 1000) {
            newErrors.description = 'Description must be less than 1000 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle form submission
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        onSubmit(formData, mode === 'edit' && todo ? todo.id : undefined);
        onClose();
    };

    /**
     * Handle input field changes
     */
    const handleInputChange = (field: keyof TodoFormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    // Styling classes
    const inputClasses = darkMode
        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400'
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500';

    const labelClasses = darkMode
        ? 'text-gray-300'
        : 'text-gray-700';

    const selectClasses = darkMode
        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400'
        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500';

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'edit' ? '✏️ Edit Todo' : '➕ Add New Todo'}
            darkMode={darkMode}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title Input */}
                <div>
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${labelClasses}`}>
                        <FileText className="w-4 h-4" />
                        Title *
                    </label>
                    <Input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter a descriptive title for your todo"
                        className={inputClasses}
                        required
                        autoFocus
                    />
                    {errors.title && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-fade-in">
                            {errors.title}
                        </p>
                    )}
                </div>

                {/* Description Input */}
                <div>
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${labelClasses}`}>
                        <FileText className="w-4 h-4" />
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Add more details about this todo (optional)"
                        rows={4}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none ${inputClasses}`}
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-fade-in">
                            {errors.description}
                        </p>
                    )}
                    <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formData.description.length}/1000 characters
                    </p>
                </div>

                {/* Grid Layout for Priority, Category, and Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Priority Select */}
                    <div>
                        <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${labelClasses}`}>
                            <Flag className="w-4 h-4" />
                            Priority
                        </label>
                        <select
                            value={formData.priority}
                            onChange={(e) => handleInputChange('priority', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${selectClasses}`}
                        >
                            {priorityOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.icon} {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category Select */}
                    <div>
                        <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${labelClasses}`}>
                            <Tag className="w-4 h-4" />
                            Category
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${selectClasses}`}
                        >
                            <option value="">Select a category</option>
                            {categoryOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.icon} {option.value}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Due Date Input */}
                <div>
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${labelClasses}`}>
                        <Calendar className="w-4 h-4" />
                        Due Date
                    </label>
                    <Input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => handleInputChange('dueDate', e.target.value)}
                        className={inputClasses}
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                        className="flex-1 shadow-lg hover:shadow-xl"
                    >
                        {mode === 'edit' ? '💾 Update Todo' : '➕ Create Todo'}
                    </Button>
                </div>
            </form>
        </SimpleModal>
    );
}