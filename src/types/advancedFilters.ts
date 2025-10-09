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
    priorities: ('LOW' | 'MEDIUM' | 'HIGH')[];
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

};