// src/types/advancedFilters.ts
export interface DateRange {
    start: Date | null;
    end: Date | null;
}

export interface AdvancedFilterOptions {
    // Date filters
    dateRange: DateRange;
    createdRange: DateRange;
    updatedRange: DateRange;

    // Text filters
    titleContains: string;
    descriptionContains: string;
    excludeText: string;

    // Multi-select filters
    priorities: ('low' | 'medium' | 'high')[];
    categories: string[];
    tags: string[];

    // Completion filters
    completionStatus: 'all' | 'completed' | 'incomplete';
    completedInRange: DateRange;

    // Advanced options
    hasDescription: boolean | null;
    hasDueDate: boolean | null;
    hasCategory: boolean | null;
    isOverdue: boolean | null;
    isDueSoon: boolean | null; // due within next 7 days

    // Sorting and grouping
    sortBy: 'created' | 'updated' | 'title' | 'priority' | 'dueDate' | 'category';
    sortOrder: 'asc' | 'desc';
    groupBy: 'none' | 'category' | 'priority' | 'status' | 'dueDate';

    // Display options
    showArchived: boolean;
    maxResults: number;
}

export const defaultAdvancedFilters: AdvancedFilterOptions = {
    dateRange: { start: null, end: null },
    createdRange: { start: null, end: null },
    updatedRange: { start: null, end: null },
    titleContains: '',
    descriptionContains: '',
    excludeText: '',
    priorities: [],
    categories: [],
    tags: [],
    completionStatus: 'all',
    completedInRange: { start: null, end: null },
    hasDescription: null,
    hasDueDate: null,
    hasCategory: null,
    isOverdue: null,
    isDueSoon: null,
    sortBy: 'created',
    sortOrder: 'desc',
    groupBy: 'none',
    showArchived: false,
    maxResults: 100,
};