// src/components/AdvancedFilters/AdvancedFiltersModal.tsx
import { useState, useEffect } from 'react';
import {
    Filter,
    Calendar,
    Search,
    X,
    Save,
    Upload,
    Download,
    RotateCcw,
    Eye,
    Sliders,
    CheckSquare
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import type { AdvancedFilterOptions, DateRange } from '../../types/advancedFilters';
import { AdvancedFilterEngine } from '../../utils/advancedFiltering';

/**
 * Component props interface
 */
interface AdvancedFiltersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyFilters: (filters: AdvancedFilterOptions) => void;
    currentFilters: AdvancedFilterOptions;
    categories: string[];
    darkMode?: boolean;
}

/**
 * Date range input component props
 */
interface DateRangeInputProps {
    label: string;
    value: DateRange;
    onChange: (range: DateRange) => void;
    placeholder?: string;
    darkMode?: boolean;
}

/**
 * DateRangeInput Component
 * Allows users to select a date range with start and end dates
 */
function DateRangeInput({ label, value, onChange, placeholder, darkMode = false }: DateRangeInputProps) {
    const formatDate = (date: Date | null): string => {
        return date ? date.toISOString().split('T')[0] : '';
    };

    const parseDate = (dateStr: string): Date | null => {
        return dateStr ? new Date(dateStr) : null;
    };

    const inputClasses = darkMode
        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400'
        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500';

    return (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4" />
                {label}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                    type="date"
                    placeholder="Start date"
                    value={formatDate(value.start)}
                    onChange={(e) => onChange({
                        ...value,
                        start: parseDate(e.target.value)
                    })}
                    className={inputClasses}
                />
                <Input
                    type="date"
                    placeholder="End date"
                    value={formatDate(value.end)}
                    onChange={(e) => onChange({
                        ...value,
                        end: parseDate(e.target.value)
                    })}
                    className={inputClasses}
                />
            </div>
            {placeholder && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{placeholder}</p>
            )}
        </div>
    );
}

/**
 * AdvancedFiltersModal Component
 * Provides comprehensive filtering options for todos
 */
export function AdvancedFiltersModal({
                                         isOpen,
                                         onClose,
                                         onApplyFilters,
                                         currentFilters,
                                         categories,
                                         darkMode = false
                                     }: AdvancedFiltersModalProps) {
    // State
    const [filters, setFilters] = useState<AdvancedFilterOptions>(currentFilters);
    const [activeTab, setActiveTab] = useState<'basic' | 'dates' | 'advanced'>('basic');

    /**
     * Sync filters when modal opens or currentFilters change
     */
    useEffect(() => {
        setFilters(currentFilters);
    }, [currentFilters]);

    /**
     * Update a single filter value
     */
    const updateFilter = <K extends keyof AdvancedFilterOptions>(
        key: K,
        value: AdvancedFilterOptions[K]
    ) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    /**
     * Toggle an item in an array filter
     */
    const toggleArrayItem = <T extends string>(
        array: T[],
        item: T,
        setArray: (newArray: T[]) => void
    ) => {
        if (array.includes(item)) {
            setArray(array.filter(i => i !== item));
        } else {
            setArray([...array, item]);
        }
    };

    /**
     * Apply filters and close modal
     */
    const handleApply = () => {
        onApplyFilters(filters);
        onClose();
    };

    /**
     * Reset all filters to default
     */
    const handleReset = () => {
        const defaultFilters: AdvancedFilterOptions = {
            // Text filters
            titleContains: '',
            descriptionContains: '',
            excludeText: '',

            // Multi-select filters
            priorities: [],
            categories: [],
            tags: [],

            // Date range filters
            dateRange: { start: null, end: null },
            createdRange: { start: null, end: null },
            updatedRange: { start: null, end: null },
            completedInRange: { start: null, end: null },

            // Status filters
            completionStatus: 'all',

            // Boolean filters
            hasDescription: null,
            hasDueDate: null,
            hasCategory: null,
            isOverdue: null,
            isDueSoon: null,

            // Sorting and display
            sortBy: 'created',
            sortOrder: 'desc',
            groupBy: 'none',
            maxResults: 100,
            showArchived: false,
        };
        setFilters(defaultFilters);
    };

    /**
     * Save current filters as a preset
     */
    const handleSavePreset = () => {
        const presetName = prompt('Enter a name for this filter preset:');
        if (presetName) {
            const presets = JSON.parse(localStorage.getItem('filter-presets') || '{}');
            presets[presetName] = filters;
            localStorage.setItem('filter-presets', JSON.stringify(presets));
            alert('Filter preset saved!');
        }
    };

    /**
     * Load a saved preset
     */
    const handleLoadPreset = () => {
        const presets = JSON.parse(localStorage.getItem('filter-presets') || '{}');
        const presetNames = Object.keys(presets);

        if (presetNames.length === 0) {
            alert('No saved presets found');
            return;
        }

        const selected = prompt(`Select a preset:\n${presetNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}`);
        const index = parseInt(selected || '0') - 1;

        if (index >= 0 && index < presetNames.length) {
            setFilters(presets[presetNames[index]]);
        }
    };

    /**
     * Export filters to clipboard
     */
    const handleExport = () => {
        const exported = AdvancedFilterEngine.exportFilters(filters);
        navigator.clipboard.writeText(exported).then(() => {
            alert('Filters copied to clipboard!');
        });
    };

    /**
     * Import filters from clipboard
     */
    const handleImport = () => {
        const imported = prompt('Paste filter configuration:');
        if (imported) {
            const parsedFilters = AdvancedFilterEngine.importFilters(imported);
            if (parsedFilters) {
                setFilters(parsedFilters);
                alert('Filters imported successfully!');
            } else {
                alert('Invalid filter configuration');
            }
        }
    };

    // Calculate filter status
    const hasActiveFilters = AdvancedFilterEngine.hasActiveFilters(filters);
    const filterSummary = AdvancedFilterEngine.getFilterSummary(filters);

    // Tab configuration
    const tabs = [
        { id: 'basic', label: 'Basic', icon: Search },
        { id: 'dates', label: 'Dates', icon: Calendar },
        { id: 'advanced', label: 'Advanced', icon: Sliders }
    ];

    // Styling classes
    const inputClasses = darkMode
        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400'
        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500';

    const selectClasses = darkMode
        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400'
        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="🔍 Advanced Filters"
            size="xl"
        >
            <div className="space-y-4 sm:space-y-6">
                {/* Tabs Navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto pb-px">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 animate-fade-in">
                        <div className="flex items-start gap-2 sm:gap-3">
                            <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                                    Active Filters ({filterSummary.length})
                                </h4>
                                <div className="space-y-0.5 text-xs sm:text-sm text-blue-700 dark:text-blue-400">
                                    {filterSummary.slice(0, 3).map((summary, index) => (
                                        <div key={index} className="truncate">• {summary}</div>
                                    ))}
                                    {filterSummary.length > 3 && (
                                        <div>• And {filterSummary.length - 3} more...</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content */}
                <div className="max-h-[60vh] overflow-y-auto px-1">
                    {/* Basic Filters Tab */}
                    {activeTab === 'basic' && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Text Search */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Title Contains
                                    </label>
                                    <Input
                                        value={filters.titleContains}
                                        onChange={(e) => updateFilter('titleContains', e.target.value)}
                                        placeholder="Search in titles..."
                                        leftIcon={<Search className="w-4 h-4" />}
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Description Contains
                                    </label>
                                    <Input
                                        value={filters.descriptionContains}
                                        onChange={(e) => updateFilter('descriptionContains', e.target.value)}
                                        placeholder="Search in descriptions..."
                                        leftIcon={<Search className="w-4 h-4" />}
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Exclude Text
                                    </label>
                                    <Input
                                        value={filters.excludeText}
                                        onChange={(e) => updateFilter('excludeText', e.target.value)}
                                        placeholder="Exclude if contains..."
                                        leftIcon={<X className="w-4 h-4" />}
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            {/* Priority Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Priorities
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {(['HIGH', 'MEDIUM', 'LOW'] as const).map((priority) => (
                                        <button
                                            key={priority}
                                            onClick={() => toggleArrayItem(
                                                filters.priorities,
                                                priority,
                                                (newPriorities) => updateFilter('priorities', newPriorities)
                                            )}
                                            className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                                                filters.priorities.includes(priority)
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                            }`}
                                        >
                                            {priority === 'HIGH' && '🔴'} {priority === 'MEDIUM' && '🟡'} {priority === 'LOW' && '🟢'} {priority}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Categories
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => toggleArrayItem(
                                                filters.categories,
                                                category,
                                                (newCategories) => updateFilter('categories', newCategories)
                                            )}
                                            className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                                                filters.categories.includes(category)
                                                    ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                            }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                    {categories.length === 0 && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No categories available</p>
                                    )}
                                </div>
                            </div>

                            {/* Completion Status */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Completion Status
                                </label>
                                <select
                                    value={filters.completionStatus}
                                    onChange={(e) => updateFilter('completionStatus', e.target.value as any)}
                                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectClasses}`}
                                >
                                    <option value="all">All Tasks</option>
                                    <option value="completed">Completed Only</option>
                                    <option value="active">Active Only</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Date Filters Tab */}
                    {activeTab === 'dates' && (
                        <div className="space-y-4 sm:space-y-6">
                            <DateRangeInput
                                label="Due Date Range"
                                value={filters.dateRange}
                                onChange={(range) => updateFilter('dateRange', range)}
                                placeholder="Filter by when todos are due"
                                darkMode={darkMode}
                            />

                            <DateRangeInput
                                label="Created Date Range"
                                value={filters.createdRange}
                                onChange={(range) => updateFilter('createdRange', range)}
                                placeholder="Filter by when todos were created"
                                darkMode={darkMode}
                            />

                            <DateRangeInput
                                label="Updated Date Range"
                                value={filters.updatedRange}
                                onChange={(range) => updateFilter('updatedRange', range)}
                                placeholder="Filter by when todos were last updated"
                                darkMode={darkMode}
                            />

                            <DateRangeInput
                                label="Completed Date Range"
                                value={filters.completedInRange}
                                onChange={(range) => updateFilter('completedInRange', range)}
                                placeholder="Filter by when todos were completed"
                                darkMode={darkMode}
                            />
                        </div>
                    )}

                    {/* Advanced Filters Tab */}
                    {activeTab === 'advanced' && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Boolean Filters */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Content Filters
                                </label>
                                <div className="space-y-3">
                                    {([
                                        { key: 'hasDescription', trueLabel: 'With description', falseLabel: 'Without description' },
                                        { key: 'hasDueDate', trueLabel: 'With due date', falseLabel: 'Without due date' },
                                        { key: 'hasCategory', trueLabel: 'With category', falseLabel: 'Without category' },
                                        { key: 'isOverdue', trueLabel: 'Overdue only', falseLabel: 'Not overdue' },
                                        { key: 'isDueSoon', trueLabel: 'Due soon (7 days)', falseLabel: 'Not due soon' },
                                    ] as const).map((filter) => (
                                        <div key={filter.key} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <CheckSquare className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <div className="flex-1 flex flex-wrap gap-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={filter.key}
                                                        checked={filters[filter.key] === null}
                                                        onChange={() => updateFilter(filter.key, null)}
                                                        className="text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm">Any</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={filter.key}
                                                        checked={filters[filter.key] === true}
                                                        onChange={() => updateFilter(filter.key, true)}
                                                        className="text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm">{filter.trueLabel}</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={filter.key}
                                                        checked={filters[filter.key] === false}
                                                        onChange={() => updateFilter(filter.key, false)}
                                                        className="text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm">{filter.falseLabel}</span>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sorting and Display */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Sort By
                                    </label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => updateFilter('sortBy', e.target.value as any)}
                                        className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectClasses}`}
                                    >
                                        <option value="created">Date Created</option>
                                        <option value="updated">Date Updated</option>
                                        <option value="title">Title</option>
                                        <option value="priority">Priority</option>
                                        <option value="dueDate">Due Date</option>
                                        <option value="category">Category</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Sort Order
                                    </label>
                                    <select
                                        value={filters.sortOrder}
                                        onChange={(e) => updateFilter('sortOrder', e.target.value as any)}
                                        className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectClasses}`}
                                    >
                                        <option value="asc">Ascending</option>
                                        <option value="desc">Descending</option>
                                    </select>
                                </div>
                            </div>

                            {/* Max Results */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Max Results
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="1000"
                                    value={filters.maxResults.toString()}
                                    onChange={(e) => updateFilter('maxResults', parseInt(e.target.value) || 100)}
                                    placeholder="100"
                                    className={inputClasses}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview Badge */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                            {hasActiveFilters ? `${filterSummary.length} filters active` : 'No filters active'}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {/* Left side - Preset Management */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSavePreset}
                            icon={<Save className="w-4 h-4" />}
                            disabled={!hasActiveFilters}
                        >
                            Save
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLoadPreset}
                            icon={<Upload className="w-4 h-4" />}
                        >
                            Load
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleExport}
                            icon={<Download className="w-4 h-4" />}
                            disabled={!hasActiveFilters}
                        >
                            Export
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleImport}
                            icon={<Upload className="w-4 h-4" />}
                        >
                            Import
                        </Button>
                    </div>

                    {/* Right side - Main Actions */}
                    <div className="flex gap-2 sm:ml-auto">
                        <Button
                            variant="ghost"
                            onClick={handleReset}
                            icon={<RotateCcw className="w-4 h-4" />}
                            disabled={!hasActiveFilters}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleApply}
                            className="shadow-lg hover:shadow-xl"
                        >
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}