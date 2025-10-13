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
        ? 'bg-gray-800 border-gray-700 text-gray-100'
        : 'bg-white border-gray-200 text-gray-900';

    const selectClasses = darkMode
        ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500'
        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500';

    const buttonClasses = darkMode
        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'
        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300';

    return (
        <div className={`rounded-xl border shadow-sm ${cardClasses} transition-all duration-300`}>
            {/* Mobile-Optimized Header */}
            <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <Filter className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold truncate">
                                Filters
                            </h3>
                            {hasActiveFilters && (
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all duration-200 ${buttonClasses}`}
                                aria-label="Clear all filters"
                            >
                                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">Clear</span>
                            </button>
                        )}
                        <button
                            onClick={toggleExpanded}
                            className={`p-2 sm:p-2.5 rounded-lg border transition-all duration-200 ${buttonClasses}`}
                            aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
                            aria-expanded={isExpanded}
                        >
                            {isExpanded ? (
                                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded Filters - Mobil Optimized */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="p-3 sm:p-4 pt-0 space-y-4 sm:space-y-5">
                    {/* Filter Grid - Tek sütun mobilde */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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

                    {/* Sorting Section */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            {/* Sort By */}
                            <div className="flex-1 space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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

                            {/* Sort Order */}
                            <div className="w-full sm:w-auto space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Order
                                </label>
                                <select
                                    value={filters.sortOrder}
                                    onChange={(e) => updateFilter('sortOrder', e.target.value)}
                                    className={`w-full sm:w-32 px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-200 ${selectClasses}`}
                                >
                                    <option value="desc">↓ Newest</option>
                                    <option value="asc">↑ Oldest</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}