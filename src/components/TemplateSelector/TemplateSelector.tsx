// src/components/TemplateSelector/TemplateSelector.tsx
import  { useState, useMemo } from 'react';
import {
    Zap,
    Search,
    Clock,
    Star,
    Plus,
    Copy,
    Edit3,
    Trash2,
    BookOpen,
    Filter,
    X
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { useTodoTemplates, TodoTemplate } from '../../utils/todoTemplates';
import type { TodoFormData } from '../TodoForm';

interface TemplateSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (tasks: TodoFormData[]) => void;
    darkMode?: boolean;
}

interface TemplateCardProps {
    template: TodoTemplate;
    onSelect: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
    usage?: number;
    isCustom?: boolean;
    darkMode?: boolean;
}

function TemplateCard({
                          template,
                          onSelect,
                          onEdit,
                          onDelete,
                          onDuplicate,
                          usage = 0,
                          isCustom = false,
                          darkMode = false
                      }: TemplateCardProps) {
    const [showDetails, setShowDetails] = useState(false);

    const difficultyColors = {
        easy: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
        medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400',
        hard: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
    };

    const cardClasses = darkMode
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
        : 'bg-white border-gray-200 hover:border-gray-300';

    return (
        <div className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md group ${cardClasses}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-lg">
                        {template.icon}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {template.category}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isCustom && onEdit && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onEdit}
                            icon={<Edit3 className="w-3 h-3" />}
                        />
                    )}
                    {onDuplicate && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDuplicate}
                            icon={<Copy className="w-3 h-3" />}
                        />
                    )}
                    {isCustom && onDelete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDelete}
                            icon={<Trash2 className="w-3 h-3" />}
                            className="text-red-600 hover:text-red-700"
                        />
                    )}
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {template.description}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
                {template.difficulty && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[template.difficulty]}`}>
            {template.difficulty}
          </span>
                )}

                {template.estimatedTime && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            <Clock className="w-3 h-3" />
                        {template.estimatedTime}
          </span>
                )}

                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
          {template.taskTitles.length} tasks
        </span>

                {usage > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
            <Star className="w-3 h-3" />
            Used {usage}x
          </span>
                )}
            </div>

            {/* Tags */}
            {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        >
              #{tag}
            </span>
                    ))}
                    {template.tags.length > 3 && (
                        <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              +{template.tags.length - 3} more
            </span>
                    )}
                </div>
            )}

            {/* Task Preview */}
            {showDetails && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Tasks Preview:
                    </h4>
                    <ul className="space-y-1">
                        {template.taskTitles.slice(0, 5).map((title, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                                {title}
                            </li>
                        ))}
                        {template.taskTitles.length > 5 && (
                            <li className="text-sm text-gray-500 dark:text-gray-500">
                                ... and {template.taskTitles.length - 5} more tasks
                            </li>
                        )}
                    </ul>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4">
                <Button
                    variant="primary"
                    size="sm"
                    onClick={onSelect}
                    className="flex-1"
                    icon={<Plus className="w-4 h-4" />}
                >
                    Use Template
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    icon={<BookOpen className="w-4 h-4" />}
                >
                    {showDetails ? 'Less' : 'Details'}
                </Button>
            </div>
        </div>
    );
}

export function TemplateSelector({
                                     isOpen,
                                     onClose,
                                     onSelectTemplate,
                                     darkMode = false
                                 }: TemplateSelectorProps) {
    const {
        templates,
        customTemplates,
        useTemplate,
        deleteTemplate,
        getMostUsedTemplates,
    } = useTodoTemplates();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
    const [showCustomOnly, setShowCustomOnly] = useState(false);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = [...new Set(templates.map(t => t.category))];
        return cats.sort();
    }, [templates]);

    // Filter templates
    const filteredTemplates = useMemo(() => {
        let filtered = templates;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(query) ||
                template.description.toLowerCase().includes(query) ||
                template.tags.some(tag => tag.toLowerCase().includes(query)) ||
                template.taskTitles.some(title => title.toLowerCase().includes(query))
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(t => t.category === selectedCategory);
        }

        // Difficulty filter
        if (selectedDifficulty !== 'all') {
            filtered = filtered.filter(t => t.difficulty === selectedDifficulty);
        }

        // Custom templates only
        if (showCustomOnly) {
            filtered = filtered.filter(t => customTemplates.some(ct => ct.id === t.id));
        }

        return filtered;
    }, [templates, customTemplates, searchQuery, selectedCategory, selectedDifficulty, showCustomOnly]);

    const mostUsedTemplates = getMostUsedTemplates(3);

    const handleSelectTemplate = (template: TodoTemplate) => {
        const templateData = useTemplate(template.id);
        if (templateData) {
            // Convert template tasks to TodoFormData
            const todos: TodoFormData[] = template.taskTitles.map((title, index) => ({
                title,
                description: template.tasks[index]?.description || '',
                priority: template.tasks[index]?.priority || 'medium',
                category: template.tasks[index]?.category || template.category,
                dueDate: template.tasks[index]?.dueDate || '',
            }));

            onSelectTemplate(todos);
            onClose();
        }
    };

    const handleDeleteTemplate = (templateId: string) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            deleteTemplate(templateId);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setSelectedDifficulty('all');
        setShowCustomOnly(false);
    };

    const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all' || showCustomOnly;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Choose Template"
            size="xl"
        >
            <div className="space-y-6">
                {/* Search and Filters */}
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Input
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            leftIcon={<Search className="w-4 h-4" />}
                            rightIcon={
                                searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )
                            }
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>

                        {/* Difficulty Filter */}
                        <select
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">All Difficulties</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>

                        {/* Custom Templates Toggle */}
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={showCustomOnly}
                                onChange={(e) => setShowCustomOnly(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                Custom only
              </span>
                        </label>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                icon={<Filter className="w-4 h-4" />}
                            >
                                Clear filters
                            </Button>
                        )}
                    </div>
                </div>

                {/* Most Used Templates */}
                {!hasActiveFilters && mostUsedTemplates.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500" />
                            Most Used Templates
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {mostUsedTemplates.map((template) => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    onSelect={() => handleSelectTemplate(template)}
                                    isCustom={customTemplates.some(ct => ct.id === template.id)}
                                    darkMode={darkMode}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* All Templates */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-500" />
                            {hasActiveFilters ? 'Filtered Results' : 'All Templates'}
                            <span className="text-sm font-normal text-gray-500">
                ({filteredTemplates.length})
              </span>
                        </h3>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* TODO: Open template creator */}}
                            icon={<Plus className="w-4 h-4" />}
                        >
                            Create Template
                        </Button>
                    </div>

                    {/* Results */}
                    {filteredTemplates.length === 0 ? (
                        <div className="text-center py-12">
                            <Zap className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No templates found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {hasActiveFilters
                                    ? 'Try adjusting your filters or search terms'
                                    : 'Create your first custom template to get started'
                                }
                            </p>
                            {hasActiveFilters && (
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTemplates.map((template) => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    onSelect={() => handleSelectTemplate(template)}
                                    onDelete={() => handleDeleteTemplate(template.id)}
                                    isCustom={customTemplates.some(ct => ct.id === template.id)}
                                    darkMode={darkMode}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Template Stats */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <span className="font-medium">Total Templates:</span> {templates.length}
                        </div>
                        <div>
                            <span className="font-medium">Custom:</span> {customTemplates.length}
                        </div>
                        <div>
                            <span className="font-medium">Categories:</span> {categories.length}
                        </div>
                        <div>
                            <span className="font-medium">Showing:</span> {filteredTemplates.length}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}