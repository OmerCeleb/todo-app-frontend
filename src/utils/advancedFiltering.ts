import type { Todo } from '../components/TodoForm';
import type { AdvancedFilterOptions } from '../types/advancedFilters';

export class AdvancedFilterEngine {
    static filterTodos(todos: Todo[], filters: AdvancedFilterOptions): Todo[] {
        let filtered = [...todos];

        // Date range filters
        if (filters.dateRange.start || filters.dateRange.end) {
            filtered = filtered.filter(todo => {
                if (!todo.dueDate) return false;
                const dueDate = new Date(todo.dueDate);

                if (filters.dateRange.start && dueDate < filters.dateRange.start) return false;
                if (filters.dateRange.end && dueDate > filters.dateRange.end) return false;

                return true;
            });
        }

        // Created date range
        if (filters.createdRange.start || filters.createdRange.end) {
            filtered = filtered.filter(todo => {
                const createdDate = new Date(todo.createdAt);

                if (filters.createdRange.start && createdDate < filters.createdRange.start) return false;
                if (filters.createdRange.end && createdDate > filters.createdRange.end) return false;

                return true;
            });
        }

        // Updated date range
        if (filters.updatedRange.start || filters.updatedRange.end) {
            filtered = filtered.filter(todo => {
                const updatedDate = new Date(todo.updatedAt);

                if (filters.updatedRange.start && updatedDate < filters.updatedRange.start) return false;
                if (filters.updatedRange.end && updatedDate > filters.updatedRange.end) return false;

                return true;
            });
        }

        // Text filters
        if (filters.titleContains) {
            const query = filters.titleContains.toLowerCase();
            filtered = filtered.filter(todo =>
                todo.title.toLowerCase().includes(query)
            );
        }

        if (filters.descriptionContains) {
            const query = filters.descriptionContains.toLowerCase();
            filtered = filtered.filter(todo =>
                todo.description?.toLowerCase().includes(query)
            );
        }

        if (filters.excludeText) {
            const excludeQuery = filters.excludeText.toLowerCase();
            filtered = filtered.filter(todo =>
                !todo.title.toLowerCase().includes(excludeQuery) &&
                !todo.description?.toLowerCase().includes(excludeQuery)
            );
        }

        // Multi-select filters
        if (filters.priorities.length > 0) {
            filtered = filtered.filter(todo =>
                filters.priorities.includes(todo.priority)
            );
        }

        if (filters.categories.length > 0) {
            filtered = filtered.filter(todo =>
                todo.category && filters.categories.includes(todo.category)
            );
        }

        // Completion status
        if (filters.completionStatus !== 'all') {
            filtered = filtered.filter(todo => {
                if (filters.completionStatus === 'completed') return todo.completed;
                if (filters.completionStatus === 'incomplete') return !todo.completed;
                return true;
            });
        }

        // Completed in range
        if (filters.completedInRange.start || filters.completedInRange.end) {
            filtered = filtered.filter(todo => {
                if (!todo.completed) return false;
                const completedDate = new Date(todo.updatedAt); // Assuming updatedAt is when completed

                if (filters.completedInRange.start && completedDate < filters.completedInRange.start) return false;
                if (filters.completedInRange.end && completedDate > filters.completedInRange.end) return false;

                return true;
            });
        }

        // Boolean filters
        if (filters.hasDescription !== null) {
            filtered = filtered.filter(todo => {
                const hasDesc = Boolean(todo.description?.trim());
                return filters.hasDescription ? hasDesc : !hasDesc;
            });
        }

        if (filters.hasDueDate !== null) {
            filtered = filtered.filter(todo => {
                const hasDate = Boolean(todo.dueDate);
                return filters.hasDueDate ? hasDate : !hasDate;
            });
        }

        if (filters.hasCategory !== null) {
            filtered = filtered.filter(todo => {
                const hasCat = Boolean(todo.category?.trim());
                return filters.hasCategory ? hasCat : !hasCat;
            });
        }

        if (filters.isOverdue !== null) {
            const now = new Date();
            filtered = filtered.filter(todo => {
                if (!todo.dueDate || todo.completed) return !filters.isOverdue;
                const isOverdue = new Date(todo.dueDate) < now;
                return filters.isOverdue ? isOverdue : !isOverdue;
            });
        }

        if (filters.isDueSoon !== null) {
            const now = new Date();
            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

            filtered = filtered.filter(todo => {
                if (!todo.dueDate || todo.completed) return !filters.isDueSoon;
                const dueDate = new Date(todo.dueDate);
                const isDueSoon = dueDate >= now && dueDate <= nextWeek;
                return filters.isDueSoon ? isDueSoon : !isDueSoon;
            });
        }

        // Sorting
        filtered.sort((a, b) => {
            let comparison = 0;

            switch (filters.sortBy) {
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'created':
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
                case 'updated':
                    comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                    break;
                case 'priority':
                    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                    comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
                    break;
                case 'dueDate':
                    if (!a.dueDate && !b.dueDate) comparison = 0;
                    else if (!a.dueDate) comparison = 1;
                    else if (!b.dueDate) comparison = -1;
                    else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                    break;
                case 'category':
                    const catA = a.category || '';
                    const catB = b.category || '';
                    comparison = catA.localeCompare(catB);
                    break;
                default:
                    comparison = 0;
            }

            return filters.sortOrder === 'asc' ? comparison : -comparison;
        });

        // Limit results
        if (filters.maxResults > 0) {
            filtered = filtered.slice(0, filters.maxResults);
        }

        return filtered;
    }

    static groupTodos(todos: Todo[], groupBy: AdvancedFilterOptions['groupBy']): Record<string, Todo[]> {
        if (groupBy === 'none') {
            return { 'All Todos': todos };
        }

        const grouped: Record<string, Todo[]> = {};

        todos.forEach(todo => {
            let groupKey = '';

            switch (groupBy) {
                case 'category':
                    groupKey = todo.category || 'Uncategorized';
                    break;
                case 'priority':
                    groupKey = `${todo.priority.charAt(0).toUpperCase()}${todo.priority.slice(1)} Priority`;
                    break;
                case 'status':
                    groupKey = todo.completed ? 'Completed' : 'Active';
                    break;
                case 'dueDate':
                    if (!todo.dueDate) {
                        groupKey = 'No Due Date';
                    } else {
                        const dueDate = new Date(todo.dueDate);
                        const now = new Date();
                        const diffTime = dueDate.getTime() - now.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays < 0) groupKey = 'Overdue';
                        else if (diffDays === 0) groupKey = 'Due Today';
                        else if (diffDays === 1) groupKey = 'Due Tomorrow';
                        else if (diffDays <= 7) groupKey = 'Due This Week';
                        else if (diffDays <= 30) groupKey = 'Due This Month';
                        else groupKey = 'Due Later';
                    }
                    break;
                default:
                    groupKey = 'All Todos';
            }

            if (!grouped[groupKey]) {
                grouped[groupKey] = [];
            }
            grouped[groupKey].push(todo);
        });

        return grouped;
    }

    static getFilterSummary(filters: AdvancedFilterOptions): string[] {
        const summary: string[] = [];

        if (filters.titleContains) {
            summary.push(`Title contains "${filters.titleContains}"`);
        }

        if (filters.descriptionContains) {
            summary.push(`Description contains "${filters.descriptionContains}"`);
        }

        if (filters.excludeText) {
            summary.push(`Excluding "${filters.excludeText}"`);
        }

        if (filters.priorities.length > 0) {
            summary.push(`Priority: ${filters.priorities.join(', ')}`);
        }

        if (filters.categories.length > 0) {
            summary.push(`Categories: ${filters.categories.join(', ')}`);
        }

        if (filters.completionStatus !== 'all') {
            summary.push(`Status: ${filters.completionStatus}`);
        }

        if (filters.dateRange.start || filters.dateRange.end) {
            const start = filters.dateRange.start?.toLocaleDateString() || 'any';
            const end = filters.dateRange.end?.toLocaleDateString() || 'any';
            summary.push(`Due: ${start} - ${end}`);
        }

        if (filters.hasDescription !== null) {
            summary.push(filters.hasDescription ? 'Has description' : 'No description');
        }

        if (filters.hasDueDate !== null) {
            summary.push(filters.hasDueDate ? 'Has due date' : 'No due date');
        }

        if (filters.hasCategory !== null) {
            summary.push(filters.hasCategory ? 'Has category' : 'No category');
        }

        if (filters.isOverdue !== null) {
            summary.push(filters.isOverdue ? 'Overdue only' : 'Not overdue');
        }

        if (filters.isDueSoon !== null) {
            summary.push(filters.isDueSoon ? 'Due soon (7 days)' : 'Not due soon');
        }

        if (filters.groupBy !== 'none') {
            summary.push(`Grouped by ${filters.groupBy}`);
        }

        return summary;
    }

    static hasActiveFilters(filters: AdvancedFilterOptions): boolean {
        return (
            Boolean(filters.titleContains) ||
            Boolean(filters.descriptionContains) ||
            Boolean(filters.excludeText) ||
            filters.priorities.length > 0 ||
            filters.categories.length > 0 ||
            filters.completionStatus !== 'all' ||
            Boolean(filters.dateRange.start || filters.dateRange.end) ||
            Boolean(filters.createdRange.start || filters.createdRange.end) ||
            Boolean(filters.updatedRange.start || filters.updatedRange.end) ||
            Boolean(filters.completedInRange.start || filters.completedInRange.end) ||
            filters.hasDescription !== null ||
            filters.hasDueDate !== null ||
            filters.hasCategory !== null ||
            filters.isOverdue !== null ||
            filters.isDueSoon !== null ||
            filters.groupBy !== 'none' ||
            filters.maxResults !== 100
        );
    }

    static exportFilters(filters: AdvancedFilterOptions): string {
        return JSON.stringify({
            ...filters,
            dateRange: {
                start: filters.dateRange.start?.toISOString(),
                end: filters.dateRange.end?.toISOString()
            },
            createdRange: {
                start: filters.createdRange.start?.toISOString(),
                end: filters.createdRange.end?.toISOString()
            },
            updatedRange: {
                start: filters.updatedRange.start?.toISOString(),
                end: filters.updatedRange.end?.toISOString()
            },
            completedInRange: {
                start: filters.completedInRange.start?.toISOString(),
                end: filters.completedInRange.end?.toISOString()
            }
        }, null, 2);
    }

    static importFilters(filtersJson: string): AdvancedFilterOptions | null {
        try {
            const parsed = JSON.parse(filtersJson);

            return {
                ...parsed,
                dateRange: {
                    start: parsed.dateRange.start ? new Date(parsed.dateRange.start) : null,
                    end: parsed.dateRange.end ? new Date(parsed.dateRange.end) : null
                },
                createdRange: {
                    start: parsed.createdRange.start ? new Date(parsed.createdRange.start) : null,
                    end: parsed.createdRange.end ? new Date(parsed.createdRange.end) : null
                },
                updatedRange: {
                    start: parsed.updatedRange.start ? new Date(parsed.updatedRange.start) : null,
                    end: parsed.updatedRange.end ? new Date(parsed.updatedRange.end) : null
                },
                completedInRange: {
                    start: parsed.completedInRange.start ? new Date(parsed.completedInRange.start) : null,
                    end: parsed.completedInRange.end ? new Date(parsed.completedInRange.end) : null
                }
            };
        } catch (error) {
            console.error('Failed to import filters:', error);
            return null;
        }
    }
}