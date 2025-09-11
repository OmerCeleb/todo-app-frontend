// src/utils/categoryColors.ts
import { useState, useEffect } from 'react';

export interface CategoryColor {
    id: string;
    name: string;
    bg: string;
    text: string;
    border: string;
    darkBg: string;
    darkText: string;
    darkBorder: string;
    icon: string;
}

export const predefinedCategoryColors: CategoryColor[] = [
    {
        id: 'blue',
        name: 'Blue',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        darkBg: 'bg-blue-900/20',
        darkText: 'text-blue-400',
        darkBorder: 'border-blue-800',
        icon: '🔵'
    },
    {
        id: 'purple',
        name: 'Purple',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        darkBg: 'bg-purple-900/20',
        darkText: 'text-purple-400',
        darkBorder: 'border-purple-800',
        icon: '🟣'
    },
    {
        id: 'green',
        name: 'Green',
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        darkBg: 'bg-green-900/20',
        darkText: 'text-green-400',
        darkBorder: 'border-green-800',
        icon: '🟢'
    },
    {
        id: 'yellow',
        name: 'Yellow',
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        darkBg: 'bg-yellow-900/20',
        darkText: 'text-yellow-400',
        darkBorder: 'border-yellow-800',
        icon: '🟡'
    },
    {
        id: 'red',
        name: 'Red',
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        darkBg: 'bg-red-900/20',
        darkText: 'text-red-400',
        darkBorder: 'border-red-800',
        icon: '🔴'
    },
    {
        id: 'orange',
        name: 'Orange',
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        darkBg: 'bg-orange-900/20',
        darkText: 'text-orange-400',
        darkBorder: 'border-orange-800',
        icon: '🟠'
    },
    {
        id: 'pink',
        name: 'Pink',
        bg: 'bg-pink-50',
        text: 'text-pink-700',
        border: 'border-pink-200',
        darkBg: 'bg-pink-900/20',
        darkText: 'text-pink-400',
        darkBorder: 'border-pink-800',
        icon: '🌸'
    },
    {
        id: 'gray',
        name: 'Gray',
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        darkBg: 'bg-gray-900/20',
        darkText: 'text-gray-400',
        darkBorder: 'border-gray-800',
        icon: '⚫'
    }
];

// Default category to color mapping
export const defaultCategoryColors: Record<string, string> = {
    'Development': 'blue',
    'Design': 'purple',
    'Backend': 'green',
    'Testing': 'yellow',
    'Documentation': 'orange',
    'Personal': 'pink',
    'Business': 'red',
    'DevOps': 'gray',
    'Architecture': 'purple',
    'Performance': 'blue',
    'Meeting': 'orange',
    'Research': 'purple',
    'Bug Fix': 'red',
    'Feature': 'green',
    'Maintenance': 'gray',
    'Planning': 'yellow'
};

// Category colors management
export class CategoryColorsManager {
    private static STORAGE_KEY = 'category-colors';

    static getCategoryColors(): Record<string, string> {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                return { ...defaultCategoryColors, ...JSON.parse(stored) };
            }
        } catch (error) {
            console.warn('Failed to load category colors:', error);
        }
        return defaultCategoryColors;
    }

    static setCategoryColor(category: string, colorId: string): void {
        try {
            const current = this.getCategoryColors();
            const updated = { ...current, [category]: colorId };

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.warn('Failed to save category color:', error);
        }
    }

    static getCategoryColor(category: string): CategoryColor {
        const colors = this.getCategoryColors();
        const colorId = colors[category] || 'gray';
        return predefinedCategoryColors.find(c => c.id === colorId) || predefinedCategoryColors[7]; // fallback to gray
    }

    static getColorClasses(category: string, darkMode: boolean = false): string {
        const color = this.getCategoryColor(category);
        if (darkMode) {
            return `${color.darkBg} ${color.darkText} ${color.darkBorder}`;
        }
        return `${color.bg} ${color.text} ${color.border}`;
    }

    static resetToDefaults(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    static exportColors(): string {
        return JSON.stringify(this.getCategoryColors(), null, 2);
    }

    static importColors(colorsJson: string): boolean {
        try {
            const colors = JSON.parse(colorsJson);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(colors));
            return true;
        } catch (error) {
            console.error('Failed to import colors:', error);
            return false;
        }
    }

    // Auto-assign color to new categories
    static autoAssignColor(category: string): string {
        const existingColors = this.getCategoryColors();

        // If already has a color, return it
        if (existingColors[category]) {
            return existingColors[category];
        }

        // Get used colors
        const usedColors = new Set(Object.values(existingColors));

        // Find first unused color
        const availableColor = predefinedCategoryColors.find(
            color => !usedColors.has(color.id)
        );

        const assignedColor = availableColor?.id || 'gray';
        this.setCategoryColor(category, assignedColor);

        return assignedColor;
    }
}

// React hook for category colors
export function useCategoryColors() {
    const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});

    useEffect(() => {
        setCategoryColors(CategoryColorsManager.getCategoryColors());
    }, []);

    const updateCategoryColor = (category: string, colorId: string) => {
        CategoryColorsManager.setCategoryColor(category, colorId);
        setCategoryColors(CategoryColorsManager.getCategoryColors());
    };

    const getCategoryColor = (category: string) => {
        return CategoryColorsManager.getCategoryColor(category);
    };

    const getColorClasses = (category: string, darkMode: boolean = false) => {
        return CategoryColorsManager.getColorClasses(category, darkMode);
    };

    const autoAssignColor = (category: string) => {
        const colorId = CategoryColorsManager.autoAssignColor(category);
        setCategoryColors(CategoryColorsManager.getCategoryColors());
        return colorId;
    };

    return {
        categoryColors,
        updateCategoryColor,
        getCategoryColor,
        getColorClasses,
        autoAssignColor,
        predefinedColors: predefinedCategoryColors,
    };
}