import { useState } from 'react';
import { Filter, SortAsc, SortDesc, X, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { getDateFilters } from '../../utils/dateUtils';

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
    categories: string[];
    darkMode?: boolean;
}

const priorityOptions = [
    { value: 'all', label: 'All Priorities', color: 'text-gray-600' },
    { value: 'low', label: 'Low Priority', color: 'text-green-600' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600' },
    { value: 'high', label: 'High Priority', color: 'text-red-600' },
];

const statusOptions = [
    { value: 'all', label: 'All Todos', icon: '📝' },
    { value: 'active', label: 'Active', icon: '🔥' },
    { value: 'completed', label: 'Completed', icon: '✅' },
];

const sortOptions = [
    { value: 'created', label: 'Date Created' },
    { value: 'updated', label: 'Last Updated' },
    { value: 'title', label: 'Title (A-Z)' },
    { value: 'priority', label: 'Priority' },
    { value: 'dueDate', label: 'Due Date' },
];

export function TodoFilters({ filters, onFiltersChange, categories, darkMode = false }: TodoFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);

    const dateFilters = getDateFilters();

    const updateFilter = (key: keyof FilterOptions, value: any) => {
        onFiltersChange({
            ...filters,
            [key]: value,
        });
    };

    const clearFilters = () => {
        setIsAnimating(true);
        setTimeout(() => {
            onFiltersChange({
                status: 'all',
                priority: 'all',
                category: 'all',
                dateFilter: 'all',
                sortBy: 'created',
                sortOrder: 'desc',
            });
            setIsAnimating(false);
        }, 150);
    };

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const hasActiveFilters =
        filters.status !== 'all' ||
        filters.priority !== 'all' ||
        filters.category !== 'all' ||
        filters.dateFilter !== 'all';

    const cardClasses = darkMode
        ? 'bg-gray-800 border-gray-700 text-white'
        : 'bg-white border-gray-200';

    const selectClasses = darkMode
        ? 'bg-gray-800 border-gray-600 text-white hover:border-gray-500 focus:border-blue-400'
        : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 focus:border-blue-500';

    return (
        <div className={`rounded-lg border transition-all duration-300 ease-in-out transform hover:shadow-lg ${cardClasses} ${isAnimating ? 'scale-95' : 'scale-100'}`}>
            {/* Header - Always Visible */}
            <div className="p-4 pb-0">
                <div className="flex items-center justify-between">
                    <button
                        onClick={toggleExpanded}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200"
                    >
                        <Filter className="w-5 h-5" />
                        <h3 className="font-medium">Filters & Sorting</h3>
                        {isExpanded ?
                            <ChevronUp className="w-4 h-4 transition-transform duration-200" /> :
                            <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                        }
                    </button>

                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
                                {Object.values(filters).filter(f => f !== 'all' && f !== 'created' && f !== 'desc').length} active
                            </span>
                        )}

                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                icon={<X className="w-4 h-4" />}
                                className="transition-transform duration-200 hover:scale-105"
                            >
                                <span className="hidden sm:inline">Clear</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Collapsible Content */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
                <div className="p-4">
                    {/* Mobile-First Grid Layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => updateFilter('status', e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-200 ${selectClasses}`}
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
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Priority
                            </label>
                            <select
                                value={filters.priority}
                                onChange={(e) => updateFilter('priority', e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-200 ${selectClasses}`}
                            >
                                {priorityOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div className="space-y-2">
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Category
                            </label>
                            <select
                                value={filters.category}
                                onChange={(e) => updateFilter('category', e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-200 ${selectClasses}`}
                            >
                                <option value="all">📁 All Categories</option>
                                {categories.filter(cat => cat).map(category => (
                                    <option key={category} value={category}>
                                        📁 {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filter - NEW! */}
                        <div className="space-y-2">
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Due Date
                            </label>
                            <select
                                value={filters.dateFilter}
                                onChange={(e) => updateFilter('dateFilter', e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-200 ${selectClasses}`}
                            >
                                <option value="all">📅 All Dates</option>
                                {dateFilters.map(filter => (
                                    <option key={filter.key} value={filter.key}>
                                        {filter.icon} {filter.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort By */}
                        <div className="space-y-2">
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Sort By
                            </label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => updateFilter('sortBy', e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-200 ${selectClasses}`}
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Order - Mobile Responsive */}
                        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Order
                            </label>
                            <div className="flex gap-2">
                                <Button
                                    variant={filters.sortOrder === 'asc' ? 'primary' : 'ghost'}
                                    size="sm"
                                    onClick={() => updateFilter('sortOrder', 'asc')}
                                    icon={<SortAsc className="w-4 h-4" />}
                                    className="flex-1 transition-all duration-200 hover:scale-105"
                                >
                                    <span className="hidden sm:inline">Asc</span>
                                </Button>
                                <Button
                                    variant={filters.sortOrder === 'desc' ? 'primary' : 'ghost'}
                                    size="sm"
                                    onClick={() => updateFilter('sortOrder', 'desc')}
                                    icon={<SortDesc className="w-4 h-4" />}
                                    className="flex-1 transition-all duration-200 hover:scale-105"
                                >
                                    <span className="hidden sm:inline">Desc</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Active Filters Summary - Enhanced Mobile View */}
                    {hasActiveFilters && (
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600 animate-fade-in">
                            <div className="flex items-start gap-2 flex-wrap">
                                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2 w-full sm:w-auto`}>
                                    Active filters:
                                </span>

                                <div className="flex flex-wrap gap-2">
                                    {filters.status !== 'all' && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-slide-in">
                                            Status: {statusOptions.find(s => s.value === filters.status)?.label}
                                        </span>
                                    )}

                                    {filters.priority !== 'all' && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 animate-slide-in" style={{ animationDelay: '0.1s' }}>
                                            Priority: {priorityOptions.find(p => p.value === filters.priority)?.label}
                                        </span>
                                    )}

                                    {filters.category !== 'all' && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-slide-in" style={{ animationDelay: '0.2s' }}>
                                            Category: {filters.category}
                                        </span>
                                    )}

                                    {filters.dateFilter !== 'all' && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 animate-slide-in" style={{ animationDelay: '0.3s' }}>
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {dateFilters.find(d => d.key === filters.dateFilter)?.label}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}