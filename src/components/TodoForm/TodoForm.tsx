// src/components/TodoForm/TodoForm.tsx
import { useState, useEffect } from 'react';
import { X, Calendar, Tag, Flag, FileText, CheckSquare, Sparkles, AlertCircle } from 'lucide-react';

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
 * Priority options with enhanced styling
 */
const priorityOptions = [
    {
        value: 'LOW',
        label: 'Low',
        icon: '🟢',
        color: 'from-green-500 to-emerald-600',
        hoverColor: 'hover:from-green-600 hover:to-emerald-700',
        activeRing: 'ring-green-500'
    },
    {
        value: 'MEDIUM',
        label: 'Medium',
        icon: '🟡',
        color: 'from-yellow-500 to-orange-500',
        hoverColor: 'hover:from-yellow-600 hover:to-orange-600',
        activeRing: 'ring-yellow-500'
    },
    {
        value: 'HIGH',
        label: 'High',
        icon: '🔴',
        color: 'from-red-500 to-rose-600',
        hoverColor: 'hover:from-red-600 hover:to-rose-700',
        activeRing: 'ring-red-500'
    },
];

/**
 * Category options with icons
 */
const categoryOptions = [
    { value: 'Development', icon: '💻', color: 'text-blue-600' },
    { value: 'Design', icon: '🎨', color: 'text-purple-600' },
    { value: 'Backend', icon: '⚙️', color: 'text-gray-600' },
    { value: 'Testing', icon: '🧪', color: 'text-green-600' },
    { value: 'Documentation', icon: '📚', color: 'text-indigo-600' },
    { value: 'Meeting', icon: '👥', color: 'text-orange-600' },
    { value: 'Personal', icon: '🏠', color: 'text-pink-600' },
    { value: 'Other', icon: '📌', color: 'text-gray-500' },
];

/**
 * TodoForm Component
 * Professional task creation and editing form
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
    const [touched, setTouched] = useState<Partial<Record<keyof TodoFormData, boolean>>>({});

    /**
     * Reset form when modal opens/closes or todo changes
     */
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && todo) {
                setFormData({
                    title: todo.title,
                    description: todo.description || '',
                    priority: todo.priority,
                    category: todo.category || '',
                    dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : '',
                    completed: todo.completed,
                });
            } else {
                setFormData({
                    title: '',
                    description: '',
                    priority: 'MEDIUM',
                    category: '',
                    dueDate: '',
                    completed: false,
                });
            }
            setErrors({});
            setTouched({});
        }
    }, [isOpen, mode, todo]);

    /**
     * Validate form data
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
        setTouched(prev => ({ ...prev, [field]: true }));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    /**
     * Get minimum date for due date input (today)
     */
    const getMinDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    if (!isOpen) return null;

    // Styling classes
    const inputBaseClasses = darkMode
        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400'
        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400';

    const inputFocusClasses = 'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

    const labelClasses = darkMode
        ? 'text-gray-200'
        : 'text-gray-700';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } rounded-2xl shadow-2xl w-full max-w-2xl animate-scale-in border`}>

                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-md opacity-50"></div>
                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                {mode === 'edit' ? (
                                    <Sparkles className="w-6 h-6 text-white" />
                                ) : (
                                    <CheckSquare className="w-6 h-6 text-white" />
                                )}
                            </div>
                        </div>
                        <div>
                            <h2 className={`text-2xl font-bold ${
                                darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                                {mode === 'edit' ? 'Edit Task' : 'Create New Task'}
                            </h2>
                            <p className={`text-sm ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                                {mode === 'edit' ? 'Update task details' : 'Add a new task to your list'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-xl transition-all ${
                            darkMode
                                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                        }`}
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title Input */}
                    <div>
                        <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${labelClasses}`}>
                            <FileText className="w-4 h-4" />
                            Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            placeholder="e.g., Complete project documentation"
                            className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${inputBaseClasses} ${inputFocusClasses}`}
                            autoFocus
                        />
                        {touched.title && errors.title && (
                            <div className="mt-2 flex items-center gap-1 text-sm text-red-600 dark:text-red-400 animate-slideDown">
                                <AlertCircle className="w-4 h-4" />
                                <span>{errors.title}</span>
                            </div>
                        )}
                        <p className={`mt-1.5 text-xs ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                            {formData.title.length}/200 characters
                        </p>
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
                            placeholder="Add more details about this task... (optional)"
                            rows={4}
                            className={`w-full px-4 py-3 border-2 rounded-xl transition-all resize-none ${inputBaseClasses} ${inputFocusClasses}`}
                        />
                        {touched.description && errors.description && (
                            <div className="mt-2 flex items-center gap-1 text-sm text-red-600 dark:text-red-400 animate-slideDown">
                                <AlertCircle className="w-4 h-4" />
                                <span>{errors.description}</span>
                            </div>
                        )}
                        <p className={`mt-1.5 text-xs ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                            {formData.description.length}/1000 characters
                        </p>
                    </div>

                    {/* Priority Selection */}
                    <div>
                        <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${labelClasses}`}>
                            <Flag className="w-4 h-4" />
                            Priority
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {priorityOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleInputChange('priority', option.value)}
                                    className={`relative px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                                        formData.priority === option.value
                                            ? `bg-gradient-to-r ${option.color} text-white shadow-lg ring-2 ${option.activeRing} ring-offset-2 ${
                                                darkMode ? 'ring-offset-gray-800' : 'ring-offset-white'
                                            } transform scale-105`
                                            : `${
                                                darkMode
                                                    ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            } border-2 ${
                                                darkMode ? 'border-gray-600' : 'border-gray-200'
                                            }`
                                    }`}
                                >
                                    <span className="text-xl mr-2">{option.icon}</span>
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category and Due Date Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Category Select */}
                        <div>
                            <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${labelClasses}`}>
                                <Tag className="w-4 h-4" />
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => handleInputChange('category', e.target.value)}
                                className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${inputBaseClasses} ${inputFocusClasses}`}
                            >
                                <option value="">Select category</option>
                                {categoryOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.icon} {option.value}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Due Date Input */}
                        <div>
                            <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${labelClasses}`}>
                                <Calendar className="w-4 h-4" />
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                min={getMinDate()}
                                className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${inputBaseClasses} ${inputFocusClasses}`}
                            />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className={`flex gap-3 pt-6 border-t ${
                        darkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                                darkMode
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!formData.title.trim()}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {mode === 'edit' ? '💾 Update Task' : '✨ Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}