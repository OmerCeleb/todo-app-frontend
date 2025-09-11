import { Trash2, Check, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface BulkActionsProps {
    selectedCount: number;
    onMarkCompleted: () => void;
    onMarkIncomplete: () => void;
    onDelete: () => void;
    onClear: () => void;
    loading?: boolean;
}

export function BulkActions({
                                selectedCount,
                                onMarkCompleted,
                                onMarkIncomplete,
                                onDelete,
                                onClear,
                                loading = false
                            }: BulkActionsProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-4 py-3">
                <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedCount} selected
          </span>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onMarkCompleted}
                            disabled={loading}
                            icon={<Check className="w-4 h-4" />}
                        >
                            Complete
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onMarkIncomplete}
                            disabled={loading}
                            icon={<X className="w-4 h-4" />}
                        >
                            Incomplete
                        </Button>

                        <Button
                            variant="danger"
                            size="sm"
                            onClick={onDelete}
                            disabled={loading}
                            icon={<Trash2 className="w-4 h-4" />}
                        >
                            Delete
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClear}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}