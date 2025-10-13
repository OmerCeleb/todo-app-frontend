// src/utils/dateUtils.ts

export interface DateSuggestion {
    label: string;
    value: string;
    icon: string;
    description: string;
}

export interface DateFilter {
    key: string;
    label: string;
    icon: string;
    filter: (todos: any[]) => any[];
}

// ✅ FIXED: Normalize date to ignore time
function normalizeDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// ✅ FIXED: Parse date string properly
function parseDate(dateString: string): Date {
    return new Date(dateString);
}

// Check if date is today
export function isToday(dateString: string): boolean {
    const date = parseDate(dateString);
    const now = new Date();

    const dateOnly = normalizeDate(date);
    const nowOnly = normalizeDate(now);

    return dateOnly.getTime() === nowOnly.getTime();
}

// Check if date is tomorrow
export function isTomorrow(dateString: string): boolean {
    const date = parseDate(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateOnly = normalizeDate(date);
    const tomorrowOnly = normalizeDate(tomorrow);

    return dateOnly.getTime() === tomorrowOnly.getTime();
}

// Check if date is this week
export function isThisWeek(dateString: string): boolean {
    const date = parseDate(dateString);
    const now = new Date();

    // Get start of week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfWeekOnly = normalizeDate(startOfWeek);

    // Get end of week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const endOfWeekOnly = normalizeDate(endOfWeek);
    endOfWeekOnly.setHours(23, 59, 59, 999);

    const dateOnly = normalizeDate(date);

    return dateOnly >= startOfWeekOnly && dateOnly <= endOfWeekOnly;
}

// Check if date is overdue
export function isOverdue(dateString: string): boolean {
    const date = parseDate(dateString);
    const now = new Date();

    const dateOnly = normalizeDate(date);
    const nowOnly = normalizeDate(now);

    return dateOnly < nowOnly;
}

// Check if date is next week
export function isNextWeek(dateString: string): boolean {
    const date = parseDate(dateString);
    const now = new Date();

    const nextWeekStart = new Date(now);
    nextWeekStart.setDate(now.getDate() + (7 - now.getDay()));
    const nextWeekStartOnly = normalizeDate(nextWeekStart);

    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
    const nextWeekEndOnly = normalizeDate(nextWeekEnd);
    nextWeekEndOnly.setHours(23, 59, 59, 999);

    const dateOnly = normalizeDate(date);

    return dateOnly >= nextWeekStartOnly && dateOnly <= nextWeekEndOnly;
}

// Get smart date filters for TodoFilters
export function getDateFilters(): DateFilter[] {
    return [
        {
            key: 'today',
            label: 'Today',
            icon: '📅',
            filter: (todos) => {
                console.log('🔍 Filtering for TODAY');
                const filtered = todos.filter(todo => {
                    const hasDate = todo.dueDate && isToday(todo.dueDate);
                    const notCompleted = !todo.completed;
                    if (hasDate) {
                        console.log(`  ✓ Todo "${todo.title}": dueDate=${todo.dueDate}, isToday=${hasDate}, completed=${todo.completed}`);
                    }
                    return hasDate && notCompleted;
                });
                console.log(`  → Found ${filtered.length} todos for today`);
                return filtered;
            }
        },
        {
            key: 'tomorrow',
            label: 'Tomorrow',
            icon: '⏰',
            filter: (todos) => {
                console.log('🔍 Filtering for TOMORROW');
                const filtered = todos.filter(todo => {
                    const hasDate = todo.dueDate && isTomorrow(todo.dueDate);
                    const notCompleted = !todo.completed;
                    if (hasDate) {
                        console.log(`  ✓ Todo "${todo.title}": dueDate=${todo.dueDate}, isTomorrow=${hasDate}, completed=${todo.completed}`);
                    }
                    return hasDate && notCompleted;
                });
                console.log(`  → Found ${filtered.length} todos for tomorrow`);
                return filtered;
            }
        },
        {
            key: 'this-week',
            label: 'This Week',
            icon: '📆',
            filter: (todos) => {
                console.log('🔍 Filtering for THIS WEEK');
                const filtered = todos.filter(todo => {
                    const hasDate = todo.dueDate && isThisWeek(todo.dueDate);
                    const notCompleted = !todo.completed;
                    if (hasDate) {
                        console.log(`  ✓ Todo "${todo.title}": dueDate=${todo.dueDate}, isThisWeek=${hasDate}, completed=${todo.completed}`);
                    }
                    return hasDate && notCompleted;
                });
                console.log(`  → Found ${filtered.length} todos for this week`);
                return filtered;
            }
        },
        {
            key: 'overdue',
            label: 'Overdue',
            icon: '⚠️',
            filter: (todos) => {
                console.log('🔍 Filtering for OVERDUE');
                const filtered = todos.filter(todo => {
                    const hasDate = todo.dueDate && isOverdue(todo.dueDate);
                    const notCompleted = !todo.completed;
                    if (hasDate) {
                        console.log(`  ✓ Todo "${todo.title}": dueDate=${todo.dueDate}, isOverdue=${hasDate}, completed=${todo.completed}`);
                    }
                    return hasDate && notCompleted;
                });
                console.log(`  → Found ${filtered.length} overdue todos`);
                return filtered;
            }
        },
        {
            key: 'no-date',
            label: 'No Due Date',
            icon: '📝',
            filter: (todos) => {
                console.log('🔍 Filtering for NO DUE DATE');
                const filtered = todos.filter(todo => !todo.dueDate);
                console.log(`  → Found ${filtered.length} todos without due date`);
                return filtered;
            }
        }
    ];
}

// Get relative time description
export function getRelativeTime(dateString: string): string {
    const date = parseDate(dateString);
    const now = new Date();

    const dateOnly = normalizeDate(date);
    const nowOnly = normalizeDate(now);

    const diffTime = dateOnly.getTime() - nowOnly.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
    if (diffDays > 7 && diffDays <= 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
    if (diffDays < -7 && diffDays >= -30) return `${Math.ceil(Math.abs(diffDays) / 7)} weeks ago`;

    return date.toLocaleDateString();
}

// Get date urgency level
export function getDateUrgency(dateString: string, isCompleted: boolean = false): 'none' | 'low' | 'medium' | 'high' | 'overdue' {
    if (isCompleted) return 'none';
    if (!dateString) return 'none';

    const date = parseDate(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'high';
    if (diffDays === 1) return 'high';
    if (diffDays <= 3) return 'medium';
    if (diffDays <= 7) return 'low';

    return 'none';
}

// Get urgency color classes
export function getUrgencyClasses(urgency: ReturnType<typeof getDateUrgency>, darkMode = false): string {
    switch (urgency) {
        case 'overdue':
            return darkMode
                ? 'text-red-400 bg-red-900/20 border-red-800'
                : 'text-red-600 bg-red-50 border-red-200';
        case 'high':
            return darkMode
                ? 'text-orange-400 bg-orange-900/20 border-orange-800'
                : 'text-orange-600 bg-orange-50 border-orange-200';
        case 'medium':
            return darkMode
                ? 'text-yellow-400 bg-yellow-900/20 border-yellow-800'
                : 'text-yellow-600 bg-yellow-50 border-yellow-200';
        case 'low':
            return darkMode
                ? 'text-blue-400 bg-blue-900/20 border-blue-800'
                : 'text-blue-600 bg-blue-50 border-blue-200';
        default:
            return '';
    }
}

// Format date with smart context
export function formatSmartDate(dateString: string, showTime = false): string {
    const date = parseDate(dateString);
    const relativeTime = getRelativeTime(dateString);

    // For very recent dates, show relative time
    if (['Today', 'Tomorrow', 'Yesterday'].includes(relativeTime)) {
        if (showTime) {
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `${relativeTime} at ${timeString}`;
        }
        return relativeTime;
    }

    // For dates within this week, show day name
    if (relativeTime.includes('days')) {
        const dayName = date.toLocaleDateString([], { weekday: 'long' });
        return dayName;
    }

    // For other dates, show formatted date
    return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
}

// Get date suggestions for quick selection
export function getDateSuggestions(): DateSuggestion[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    return [
        {
            label: 'Today',
            value: formatDateForInput(today),
            icon: '📅',
            description: 'Due today'
        },
        {
            label: 'Tomorrow',
            value: formatDateForInput(tomorrow),
            icon: '⏰',
            description: 'Due tomorrow'
        },
        {
            label: 'Next Week',
            value: formatDateForInput(nextWeek),
            icon: '📆',
            description: 'Due in a week'
        },
        {
            label: 'Next Month',
            value: formatDateForInput(nextMonth),
            icon: '🗓️',
            description: 'Due in a month'
        }
    ];
}

// Format date for input field (YYYY-MM-DD)
export function formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
}

// Get date range for filtering
export function getDateRange(range: 'today' | 'tomorrow' | 'this-week' | 'next-week' | 'this-month'): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    switch (range) {
        case 'today':
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            break;

        case 'tomorrow':
            start.setDate(now.getDate() + 1);
            start.setHours(0, 0, 0, 0);
            end.setDate(now.getDate() + 1);
            end.setHours(23, 59, 59, 999);
            break;

        case 'this-week':
            start.setDate(now.getDate() - now.getDay());
            start.setHours(0, 0, 0, 0);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
            break;

        case 'next-week':
            start.setDate(now.getDate() + (7 - now.getDay()));
            start.setHours(0, 0, 0, 0);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
            break;

        case 'this-month':
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            end.setMonth(now.getMonth() + 1, 0);
            end.setHours(23, 59, 59, 999);
            break;
    }

    return { start, end };
}