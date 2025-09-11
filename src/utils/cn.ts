type ClassValue = string | number | boolean | undefined | null;
type ClassArray = ClassValue[];
type ClassDictionary = Record<string, any>;
type ClassnameArg = ClassValue | ClassArray | ClassDictionary;

/**
 * A simple utility for constructing className strings conditionally.
 * Similar to clsx but lightweight.
 */
export function cn(...args: ClassnameArg[]): string {
    const classes: string[] = [];

    for (const arg of args) {
        if (!arg) continue;

        const argType = typeof arg;

        if (argType === 'string' || argType === 'number') {
            classes.push(String(arg));
        } else if (Array.isArray(arg)) {
            const inner = cn(...arg);
            if (inner) {
                classes.push(inner);
            }
        } else if (argType === 'object') {
            for (const key in arg as ClassDictionary) {
                if ((arg as ClassDictionary)[key]) {
                    classes.push(key);
                }
            }
        }
    }

    return classes.join(' ');
}

/**
 * Format date to locale string
 */
export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Generate unique ID
 */
export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
    switch (priority) {
        case 'low':
            return 'text-green-600 bg-green-50 border-green-200';
        case 'medium':
            return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        case 'high':
            return 'text-red-600 bg-red-50 border-red-200';
        default:
            return 'text-gray-600 bg-gray-50 border-gray-200';
    }
}

/**
 * Check if date is overdue
 */
export function isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
}