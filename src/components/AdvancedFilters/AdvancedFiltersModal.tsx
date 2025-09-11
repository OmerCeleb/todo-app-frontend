// src/components/AdvancedFilters/AdvancedFiltersModal.tsx
import { useState, useEffect } from 'react';
import {
    Filter,
    Calendar,
    Search,
    Clock,
    X,
    Save,
    Upload,
    Download,
    RotateCcw,
    Check,
    Eye,
    Hash
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import type { AdvancedFilterOptions, DateRange } from '../../types/advancedFilters';
import {  AdvancedFilterEngine } from '../../utils/advancedFiltering';

interface AdvancedFiltersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyFilters: (filters: AdvancedFilterOptions) => void;
    currentFilters: AdvancedFilterOptions;
    categories: string[];
    darkMode?: boolean;
}

interface DateRangeInputProps {
    label: string;
    value: DateRange;
    onChange: (range: DateRange) => void;
    placeholder?: string;
}

function DateRangeInput({ label, value, onChange, placeholder }: DateRangeInputProps) {
    const formatDate = (date: Date | null): string => {
        return date ? date.toISOString().split('T')[0] : '';
    };

    const parseDate = (dateStr: string): Date | null => {
        return dateStr ? new Date(dateStr) : null;
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {label}
            </label>
            <div className="grid grid-cols-2 gap-2">
                <Input
                    type="date"
                    placeholder="Start date"
                    value={formatDate(value.start)}
                    onChange={(e) => onChange({
                        ...value,
                        start: parseDate(e.target.value)
                    })}
                />
                <Input
                    type="date"
                    placeholder="End date"
                    value={formatDate(value.end)}
                    onChange={(e) => onChange({
                        ...value,
                        end: parseDate(e.target.value)
                    })}
                />
            </div>
            {placeholder && (
                <p className="text-xs text-gray-500 mt-1">{placeholder}</p>
            )}
        </div>
    );
}

export function AdvancedFiltersModal({
                                         isOpen,
                                         onClose,
                                         onApplyFilters,
                                         currentFilters,
                                         categories,
                                     }: AdvancedFiltersModalProps) {
    const [filters, setFilters] = useState<AdvancedFilterOptions>(currentFilters);
    const [activeTab, setActiveTab] = useState<'basic' | 'dates' | 'advanced'>('basic');

    useEffect(() => {
        setFilters(currentFilters);
    }, [currentFilters]);

    const updateFilter = <K extends keyof AdvancedFilterOptions>(
        key: K,
        value: AdvancedFilterOptions[K]
    ) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

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

    const handleApply = () => {
        onApplyFilters(filters);
        onClose();
    };



    const handleSavePreset = () => {
        const presetName = prompt('Enter a name for this filter preset:');
        if (presetName) {
            const presets = JSON.parse(localStorage.getItem('filter-presets') || '{}');
            presets[presetName] = filters;
            localStorage.setItem('filter-presets', JSON.stringify(presets));
            alert('Filter preset saved!');
        }
    };

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

    const handleExport = () => {
        const exported = AdvancedFilterEngine.exportFilters(filters);
        navigator.clipboard.writeText(exported).then(() => {
            alert('Filters copied to clipboard!');
        });
    };

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

    const hasActiveFilters = AdvancedFilterEngine.hasActiveFilters(filters);
    const filterSummary = AdvancedFilterEngine.getFilterSummary(filters);

    const tabs = [
        { id: 'basic', label: 'Basic Filters', icon: Search },
        { id: 'dates', label: 'Date Filters', icon: Calendar },
        { id: 'advanced', label: 'Advanced', icon: Filter }
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Advanced Filters"
            size="xl"
        >
            <div className="space-y-6">
                {/* Header with tabs */}
                <div className="border-b border-gray-200 dark:border-gray-600">
                    <nav className="flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Filter summary */}
                {hasActiveFilters && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                                    Active Filters ({filterSummary.length})
                                </h4>
                                <div className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                                    {filterSummary.slice(0, 3).map((summary, index) => (
                                        <div key={index}>• {summary}</div>
                                    ))}
                                    {filterSummary.length > 3 && (
                                        <div>• And {filterSummary.length - 3} more filters...</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Basic Filters Tab */}
                {activeTab === 'basic' && (
                    <div className="space-y-6">
                        {/* Text Search */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Title Contains"
                                value={filters.titleContains}
                                onChange={(e) => updateFilter('titleContains', e.target.value)}
                                placeholder="Search in titles..."
                                leftIcon={<Search className="w-4 h-4" />}
                            />
                            <Input
                                label="Description Contains"
                                value={filters.descriptionContains}
                                onChange={(e) => updateFilter('descriptionContains', e.target.value)}
                                placeholder="Search in descriptions..."
                                leftIcon={<Search className="w-4 h-4" />}
                            />
                            <Input
                                label="Exclude Text"
                                value={filters.excludeText}
                                onChange={(e) => updateFilter('excludeText', e.target.value)}
                                placeholder="Exclude if contains..."
                                leftIcon={<X className="w-4 h-4" />}
                            />
                        </div>

                        {/* Priority Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Priority Levels
                            </label>
                            <div className="flex gap-3">
                                {(['low', 'medium', 'high'] as const).map((priority) => (
                                    <label key={priority} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filters.priorities.includes(priority)}
                                            onChange={() =>
                                                toggleArrayItem(
                                                    filters.priorities,
                                                    priority,
                                                    (newArray) => updateFilter('priorities', newArray)
                                                )
                                            }
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                                            priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                                                priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                                    'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                        }`}>
                      {priority}
                    </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Categories Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Categories
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                                {categories.map((category) => (
                                    <label key={category} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={filters.categories.includes(category)}
                                            onChange={() =>
                                                toggleArrayItem(
                                                    filters.categories,
                                                    category,
                                                    (newArray) => updateFilter('categories', newArray)
                                                )
                                            }
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm truncate">{category}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Completion Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Completion Status
                            </label>
                            <div className="flex gap-3">
                                {([
                                    { value: 'all', label: 'All Todos', icon: Hash },
                                    { value: 'completed', label: 'Completed', icon: Check },
                                    { value: 'incomplete', label: 'Incomplete', icon: Clock }
                                ] as const).map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="completionStatus"
                                                value={option.value}
                                                checked={filters.completionStatus === option.value}
                                                onChange={(e) => updateFilter('completionStatus', e.target.value as any)}
                                                className="text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="flex items-center gap-1 text-sm">
                        <Icon className="w-4 h-4" />
                                                {option.label}
                      </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Date Filters Tab */}
                {activeTab === 'dates' && (
                    <div className="space-y-6">
                        <DateRangeInput
                            label="Due Date Range"
                            value={filters.dateRange}
                            onChange={(range) => updateFilter('dateRange', range)}
                            placeholder="Filter by when todos are due"
                        />

                        <DateRangeInput
                            label="Created Date Range"
                            value={filters.createdRange}
                            onChange={(range) => updateFilter('createdRange', range)}
                            placeholder="Filter by when todos were created"
                        />

                        <DateRangeInput
                            label="Updated Date Range"
                            value={filters.updatedRange}
                            onChange={(range) => updateFilter('updatedRange', range)}
                            placeholder="Filter by when todos were last updated"
                        />

                        <DateRangeInput
                            label="Completed Date Range"
                            value={filters.completedInRange}
                            onChange={(range) => updateFilter('completedInRange', range)}
                            placeholder="Filter by when todos were completed"
                        />
                    </div>
                )}

                {/* Advanced Filters Tab */}
                {activeTab === 'advanced' && (
                    <div className="space-y-6">
                        {/* Boolean Filters */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Content Filters
                            </label>
                            <div className="space-y-3">
                                {([
                                    { key: 'hasDescription', label: 'Has Description', trueLabel: 'With description', falseLabel: 'Without description' },
                                    { key: 'hasDueDate', label: 'Has Due Date', trueLabel: 'With due date', falseLabel: 'Without due date' },
                                    { key: 'hasCategory', label: 'Has Category', trueLabel: 'With category', falseLabel: 'Without category' },
                                    { key: 'isOverdue', label: 'Overdue Status', trueLabel: 'Overdue only', falseLabel: 'Not overdue' },
                                    { key: 'isDueSoon', label: 'Due Soon (7 days)', trueLabel: 'Due soon only', falseLabel: 'Not due soon' }
                                ] as const).map((filter) => (
                                    <div key={filter.key} className="flex items-center gap-4">
                                        <span className="text-sm font-medium w-32">{filter.label}:</span>
                                        <div className="flex gap-3">
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

                        {/* Sorting and Grouping */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Sort By
                                </label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => updateFilter('sortBy', e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Sort Order
                                </label>
                                <select
                                    value={filters.sortOrder}
                                    onChange={(e) => updateFilter('sortOrder', e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="asc">Ascending</option>
                                    <option value="desc">Descending</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Group By
                                </label>
                                <select
                                    value={filters.groupBy}
                                    onChange={(e) => updateFilter('groupBy', e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="none">No Grouping</option>
                                    <option value="category">Category</option>
                                    <option value="priority">Priority</option>
                                    <option value="status">Status</option>
                                    <option value="dueDate">Due Date</option>
                                </select>
                            </div>
                        </div>

                        {/* Max Results */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Maximum Results
                            </label>
                            <Input
                                type="number"
                                min="1"
                                max="1000"
                                value={filters.maxResults.toString()}
                                onChange={(e) => updateFilter('maxResults', parseInt(e.target.value) || 100)}
                                placeholder="100"
                            />
                        </div>

                        {/* Additional Options */}
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.showArchived}
                                    onChange={(e) => updateFilter('showArchived', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Include archived todos
                </span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Preview */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Eye className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700 dark:text-gray-300">
              Ready to apply filters
            </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                    {/* Preset Management */}
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSavePreset}
                            icon={<Save className="w-4 h-4" />}
                            disabled={!hasActiveFilters}
                        >
                            Save Preset
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLoadPreset}
                            icon={<Upload className="w-4 h-4" />}
                        >
                            Load Preset
                        </Button>
                    </div>

                    {/* Import/Export */}
                    <div className="flex gap-2">
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

                    {/* Main Actions */}
                    <div className="flex gap-2 sm:ml-auto">
                        <Button
                            variant="ghost"
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
                            icon={<Filter className="w-4 h-4" />}
                        >
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}