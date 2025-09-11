import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
    type: 'no-todos' | 'no-search-results' | 'no-filter-results';
    searchQuery?: string;
    hasFilters?: boolean;
    onCreateTodo?: () => void;
    onClearFilters?: () => void;
}

export function EmptyState({
                               type,
                               searchQuery,
                               hasFilters,
                               onCreateTodo,
                               onClearFilters
                           }: EmptyStateProps) {
    const getContent = () => {
        switch (type) {
            case 'no-todos':
                return {
                    icon: Plus,
                    title: 'No todos yet',
                    message: 'Get started by creating your first todo item',
                    action: onCreateTodo && (
                        <Button
                            variant="primary"
                            onClick={onCreateTodo}
                            icon={<Plus className="w-4 h-4" />}
                        >
                            Create your first todo
                        </Button>
                    )
                };

            case 'no-search-results':
                return {
                    icon: Search,
                    title: 'No results found',
                    message: `No todos match "${searchQuery}"`,
                    action: null
                };

            case 'no-filter-results':
                return {
                    icon: Filter,
                    title: 'No todos match your filters',
                    message: 'Try adjusting your filters or search criteria',
                    action: hasFilters && onClearFilters && (
                        <Button
                            variant="outline"
                            onClick={onClearFilters}
                            icon={<Filter className="w-4 h-4" />}
                        >
                            Clear filters
                        </Button>
                    )
                };

            default:
                return {
                    icon: Search,
                    title: 'No results',
                    message: 'Nothing to show here',
                    action: null
                };
        }
    };

    const content = getContent();
    const Icon = content.icon;

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {content.title}
            </h3>

            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
                {content.message}
            </p>

            {content.action}
        </div>
    );
}