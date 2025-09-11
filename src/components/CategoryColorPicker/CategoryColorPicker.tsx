// src/components/CategoryColorPicker/CategoryColorPicker.tsx
import { useState } from 'react';
import { Palette, Check, Plus, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import {
    predefinedCategoryColors,
    useCategoryColors,
    CategoryColorsManager
} from '../../utils/categoryColors';

interface CategoryColorPickerProps {
    isOpen: boolean;
    onClose: () => void;
    categories: string[];
    darkMode?: boolean;
}

export function CategoryColorPicker({
                                        isOpen,
                                        onClose,
                                        categories,
                                        darkMode = false
                                    }: CategoryColorPickerProps) {
    const {
        categoryColors,
        updateCategoryColor,
        getCategoryColor,
        getColorClasses,
        autoAssignColor
    } = useCategoryColors();

    const [newCategory, setNewCategory] = useState('');
    const [editingCategory, setEditingCategory] = useState<string | null>(null);

    const handleColorSelect = (category: string, colorId: string) => {
        updateCategoryColor(category, colorId);
        setEditingCategory(null);
    };

    const handleAddCategory = () => {
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            const colorId = autoAssignColor(newCategory.trim());
            setNewCategory('');

            // Trigger event to notify parent about new category
            const event = new CustomEvent('categoryAdded', {
                detail: {
                    category: newCategory.trim(),
                    color: colorId
                }
            });
            window.dispatchEvent(event);
        }
    };

    const handleResetColors = () => {
        if (window.confirm('Reset all category colors to defaults?')) {
            CategoryColorsManager.resetToDefaults();
            window.location.reload(); // Simple way to refresh colors
        }
    };

    const handleExportColors = () => {
        const exported = CategoryColorsManager.exportColors();
        navigator.clipboard.writeText(exported).then(() => {
            alert('Category colors exported to clipboard!');
        });
    };

    const sortedCategories = [...categories].sort();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Category Colors"
            size="lg"
        >
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900 dark:text-white">
              Customize category colors
            </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleExportColors}
                        >
                            Export
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetColors}
                        >
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Add New Category */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Add New Category
                    </h3>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter category name..."
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                            className="flex-1"
                        />
                        <Button
                            onClick={handleAddCategory}
                            disabled={!newCategory.trim() || categories.includes(newCategory.trim())}
                            icon={<Plus className="w-4 h-4" />}
                        >
                            Add
                        </Button>
                    </div>
                </div>

                {/* Existing Categories */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Existing Categories ({sortedCategories.length})
                    </h3>

                    {sortedCategories.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No categories yet</p>
                            <p className="text-sm">Create your first todo to add categories</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {sortedCategories.map((category) => {
                                const categoryColor = getCategoryColor(category);
                                const isEditing = editingCategory === category;

                                return (
                                    <div
                                        key={category}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                                            isEditing
                                                ? 'ring-2 ring-blue-500 border-blue-300'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                        } ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                                    >
                                        {/* Category Info */}
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm ${getColorClasses(category, darkMode)}`}>
                                                {categoryColor.icon}
                                            </div>
                                            <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {category}
                        </span>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                    {categoryColor.name} theme
                                                </div>
                                            </div>
                                        </div>

                                        {/* Color Selection */}
                                        <div className="flex items-center gap-2">
                                            {isEditing ? (
                                                <div className="flex items-center gap-1">
                                                    {/* Color Options */}
                                                    {predefinedCategoryColors.map((color) => (
                                                        <button
                                                            key={color.id}
                                                            onClick={() => handleColorSelect(category, color.id)}
                                                            className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${color.bg} ${color.border} relative`}
                                                            title={color.name}
                                                        >
                                                            <span className="text-xs">{color.icon}</span>
                                                            {categoryColors[category] === color.id && (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
                                                                    <Check className="w-4 h-4 text-white" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}

                                                    {/* Cancel */}
                                                    <button
                                                        onClick={() => setEditingCategory(null)}
                                                        className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingCategory(category)}
                                                    className="text-xs"
                                                >
                                                    Change Color
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Color Legend */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Available Colors
                    </h3>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {predefinedCategoryColors.map((color) => (
                            <div key={color.id} className="text-center">
                                <div className={`w-8 h-8 mx-auto rounded-lg border ${color.bg} ${color.border} flex items-center justify-center mb-1`}>
                                    <span className="text-xs">{color.icon}</span>
                                </div>
                                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {color.name}
                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Usage Stats */}
                {sortedCategories.length > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 border-t pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-medium">Categories:</span> {sortedCategories.length}
                            </div>
                            <div>
                                <span className="font-medium">Colors used:</span>{' '}
                                {new Set(Object.values(categoryColors)).size} / {predefinedCategoryColors.length}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}