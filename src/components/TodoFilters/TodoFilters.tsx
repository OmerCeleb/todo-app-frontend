// src/components/TodoFilters/TodoFilters.tsx
import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Calendar, Flag, Tag } from 'lucide-react';
import type { FilterOptions } from '../../hooks/useTodosAPI';

interface TodoFiltersProps {
    filters: FilterOptions;
    onFiltersChange: (filters: FilterOptions) => void;
    categories?: string[];
    darkMode?: boolean;
}

const statusOptions = [
    { value: 'all', label: 'All Tasks', icon: '📋' },
    { value: 'active', label: 'Active', icon: '⚡' },
    { value: 'completed', label: 'Completed', icon: '✅' },
];

// ✅ FIXED: Changed to uppercase to match backend enum values
const priorityOptions = [
    { value: 'all', label: 'All Priorities', icon: '🏷️' },
    { value: 'HIGH', label: 'High', icon: '🔴', color: 'text-red-600 dark:text-red-400' },
    { value: 'MEDIUM', label: 'Medium', icon: '🟡', color: 'text-yellow-600 dark:text-yellow-400' },
    { value: 'LOW', label: 'Low', icon: '🟢', color: 'text-green-600 dark:text-green-400' },
];

const sortOptions = [
    { value: 'created', label: 'Date Created', icon: Calendar },
    { value: 'updated', label: 'Last Updated', icon: Calendar },
    { value: 'priority', label: 'Priority', icon: Flag },
    { value: 'title', label: 'Title (A-Z)', icon: Tag },
    { value: 'dueDate', label: 'Due Date', icon: Calendar },
];

const dateFilterOptions = [
    { value: 'all', label: 'All Dates', icon: '📅' },
    { value: 'today', label: 'Due Today', icon: '📍' },
    { value: 'tomorrow', label: 'Due Tomorrow', icon: '➡️' },
    { value: 'this-week', label: 'This Week', icon: '📆' },
    { value: 'overdue', label: 'Overdue', icon: '⚠️' },
    { value: 'no-date', label: 'No Due Date', icon: '❌' },
];

export function TodoFilters({ filters, onFiltersChange, categories = [], darkMode = false }: TodoFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const updateFilter = (key: keyof FilterOptions, value: string) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        onFiltersChange({
            status: 'all',
            priority: 'all',
            category: 'all',
            dateFilter: 'all',
            sortBy: 'created',
            sortOrder: 'desc',
        });
    };

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const hasActiveFilters =
        filters.status !== 'all' ||
        filters.priority !== 'all' ||
        filters.category !== 'all' ||
        filters.dateFilter !== 'all';

    const activeFilterCount = [
        filters.status !== 'all',
        filters.priority !== 'all',
        filters.category !== 'all',
        filters.dateFilter !== 'all',
    ].filter(Boolean).length;

    const cardClasses = darkMode
        ? 'bg-gray-800/50 border-gray-700 backdrop-blur-sm'
        : 'bg-white/50 border-gray-200 backdrop-blur-sm';

    // ✅ FIXED: Added proper text color classes for dark mode visibility
    const selectClasses = darkMode
        ? 'bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600'
        : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50';

    const buttonClasses = darkMode
        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600'
        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300';

    const textClasses = darkMode ? 'text-gray-200' : 'text-gray-900';
    const subtextClasses = darkMode ? 'text-gray-400' : 'text-gray-600';

    return (
        <div className={`border rounded-xl shadow-sm overflow-hidden transition-all duration-300 ${cardClasses}`}>
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={toggleExpanded}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <Filter className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className={`text-lg font-semibold ${textClasses}`}>
                            Filters & Sorting
                        </h3>
                        {hasActiveFilters && (
                            <p className={`text-sm ${subtextClasses}`}>
                                {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                clearFilters();
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all hover:scale-105 ${buttonClasses}`}
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </button>
                    )}
                    {isExpanded ? (
                        <ChevronUp className={`w-5 h-5 ${textClasses}`} />
                    ) : (
                        <ChevronDown className={`w-5 h-5 ${textClasses}`} />
                    )}
                </div>
            </div>

            {/* Filter Options */}
            {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4 animate-slideDown">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-white">
                                <Flag className="w-4 h-4" />
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => updateFilter('status', e.target.value)}
                                className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-200 ${selectClasses}`}
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.icon} {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Priority Filter */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Flag className="w-4 h-4" />
                                Priority
                            </label>
                            <select
                                value={filters.priority}
                                onChange={(e) => updateFilter('priority', e.target.value)}
                                className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-200 ${selectClasses}`}
                            >
                                {priorityOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.icon} {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Tag className="w-4 h-4" />
                                Category
                            </label>
                            <select
                                value={filters.category}
                                onChange={(e) => updateFilter('category', e.target.value)}
                                className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-200 ${selectClasses}`}
                            >
                                <option value="all">📁 All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Calendar className="w-4 h-4" />
                                Due Date
                            </label>
                            <select
                                value={filters.dateFilter}
                                onChange={(e) => updateFilter('dateFilter', e.target.value)}
                                className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-200 ${selectClasses}`}
                            >
                                {dateFilterOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.icon} {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Sorting Options */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Sort By
                            </label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => updateFilter('sortBy', e.target.value)}
                                className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-200 ${selectClasses}`}
                            >
                                {sortOptions.map(option => {
                                    const Icon = option.icon;
                                    return (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="w-full sm:w-auto space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Order
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateFilter('sortOrder', 'asc')}
                                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${filters.sortOrder === 'asc'
                                        ? 'bg-blue-500 text-white border-blue-500'
                                        : buttonClasses
                                    }`}
                                >
                                    ↑ Asc
                                </button>
                                <button
                                    onClick={() => updateFilter('sortOrder', 'desc')}
                                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${filters.sortOrder === 'desc'
                                        ? 'bg-blue-500 text-white border-blue-500'
                                        : buttonClasses
                                    }`}
                                >
                                    ↓ Desc
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}