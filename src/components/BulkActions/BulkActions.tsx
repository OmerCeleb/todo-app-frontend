// src/components/BulkActions/BulkActions.tsx
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
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-300  rounded-xl shadow-2xl px-6 py-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {selectedCount} selected
                    </span>

                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

                    <div className="flex items-center gap-2">
                        {/* ✅ Complete button */}
                        <button
                            onClick={onMarkCompleted}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
                        >
                            <Check className="w-4 h-4" />
                            Complete
                        </button>

                        {/* ✅ Incomplete button  */}
                        <button
                            onClick={onMarkIncomplete}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
                        >
                            <X className="w-4 h-4" />
                            Incomplete
                        </button>

                        {/* ✅ Delete button */}
                        <button
                            onClick={onDelete}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>

                        {/* ✅ Cancel button  */}
                        <button
                            onClick={onClear}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}