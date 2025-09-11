import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

export function ConfirmDialog({
                                  isOpen,
                                  onClose,
                                  onConfirm,
                                  title,
                                  message,
                                  confirmText = 'Confirm',
                                  cancelText = 'Cancel',
                                  variant = 'danger',
                                  loading = false
                              }: ConfirmDialogProps) {
    const getIcon = () => {
        switch (variant) {
            case 'danger':
                return <Trash2 className="w-6 h-6 text-red-600" />;
            case 'warning':
                return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
            default:
                return <AlertTriangle className="w-6 h-6 text-blue-600" />;
        }
    };

    const getVariantClasses = () => {
        switch (variant) {
            case 'danger':
                return 'bg-red-50 dark:bg-red-900/20';
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900/20';
            default:
                return 'bg-blue-50 dark:bg-blue-900/20';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getVariantClasses()}`}>
                    {getIcon()}
                </div>

                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {message}
                    </p>

                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            disabled={loading}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant={variant === 'danger' ? 'danger' : 'primary'}
                            onClick={onConfirm}
                            loading={loading}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}