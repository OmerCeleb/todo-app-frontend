// src/components/TodoFilters/TodoFilters.tsx
import { useState } from 'react';
import { Filter, ChevronUp, ChevronDown, X, SortAsc, SortDesc, Calendar, Tag, Flag } from 'lucide-react';
import { Button } from '../ui/Button';

export interface FilterOptions {
    status: 'all' | 'active' | 'completed';
    priority: 'all' | 'LOW' | 'MEDIUM' | 'HIGH';
    category: string;
    dateFilter: 'all' | 'today' | 'tomorrow' | 'this-week' | 'overdue' | 'no-date';
    sortBy: 'created' | 'updated' | 'title' | 'priority' | 'dueDate';
    sortOrder: 'asc' | 'desc';
}

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
    { value: 'high', label: 'High', icon: '🔴', color: 'text-red-600 dark:text-red-400' },
    { value: 'medium', label: 'Medium', icon: '🟡', color: 'text-yellow-600 dark:text-yellow-400' },
    { value: 'low', label: 'Low', icon: '🟢', color: 'text-green-600 dark:text-green-400' },
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

    const selectClasses = darkMode
        ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500 focus:border-blue-400 focus:bg-gray-600'
        : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 focus:border-blue-500';

    return (
        <div className={`rounded-xl border shadow-sm transition-all duration-300 ${cardClasses}`}>
            {/* Header - Always Visible */}
            <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                    {/* Toggle Button */}
                    <button
                        onClick={toggleExpanded}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100  flex-1 sm:flex-none ${
                            isExpanded ? 'bg-gray-50 dark:bg-gray-700' : ''
                        }`}
                    >
                        <Filter className="w-5 h-5 flex-shrink-0" />
                        <span className="font-semibold text-sm sm:text-base">Filters & Sorting</span>
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4 transition-transform duration-200" />
                        ) : (
                            <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                        )}
                    </button>

                    {/* Active Filters Badge & Clear Button */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {hasActiveFilters && (
                            <>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 animate-fade-in">
                                    {activeFilterCount}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="transition-all duration-200 hover:scale-105 p-2"
                                    aria-label="Clear all filters"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Quick Filter Pills (Mobile) */}
                {!isExpanded && hasActiveFilters && (
                    <div className="mt-3 flex flex-wrap gap-2 animate-fade-in">
                        {filters.status !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                                Status: {statusOptions.find(o => o.value === filters.status)?.label}
                            </span>
                        )}
                        {filters.priority !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                                Priority: {priorityOptions.find(o => o.value === filters.priority)?.label}
                            </span>
                        )}
                        {filters.category !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                                Category: {filters.category}
                            </span>
                        )}
                        {filters.dateFilter !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                Date: {dateFilterOptions.find(o => o.value === filters.dateFilter)?.label}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Expandable Content */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="px-4 pb-4 space-y-4">
                    {/* Filters Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <span className="text-lg">📋</span>
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
                                <option value="all">All Categories</option>
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

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-gray-700" />

                    {/* Sorting Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Sort By */}
                        <div className="space-y-2 sm:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Sort By
                            </label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => updateFilter('sortBy', e.target.value)}
                                className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-200 ${selectClasses}`}
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Order */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Order
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant={filters.sortOrder === 'asc' ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => updateFilter('sortOrder', 'asc')}
                                    className="transition-all duration-200 hover:scale-105 justify-center"
                                    icon={<SortAsc className="w-4 h-4" />}
                                >
                                    <span className="hidden sm:inline">Asc</span>
                                </Button>
                                <Button
                                    variant={filters.sortOrder === 'desc' ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => updateFilter('sortOrder', 'desc')}
                                    className="transition-all duration-200 hover:scale-105 justify-center"
                                    icon={<SortDesc className="w-4 h-4" />}
                                >
                                    <span className="hidden sm:inline">Desc</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {hasActiveFilters && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                        Active Filters ({activeFilterCount})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {filters.status !== 'all' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400" />
                                                Status: {statusOptions.find(o => o.value === filters.status)?.label}
                                            </span>
                                        )}
                                        {filters.priority !== 'all' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                                                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-orange-400" />
                                                Priority: {priorityOptions.find(o => o.value === filters.priority)?.label}
                                            </span>
                                        )}
                                        {filters.category !== 'all' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400" />
                                                Category: {filters.category}
                                            </span>
                                        )}
                                        {filters.dateFilter !== 'all' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                                                Date: {dateFilterOptions.find(o => o.value === filters.dateFilter)?.label}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                    Clear All
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}