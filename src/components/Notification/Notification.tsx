import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// Types
export type NotificationType =
    | 'success'
    | 'error'
    | 'info'
    | 'warning'
    | 'create'
    | 'update'
    | 'delete'
    | 'complete'
    | 'incomplete';

export interface NotificationProps {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
    onRemove: (id: string) => void;
}

// Single Notification Component
function NotificationItem({ id, type, message, duration = 2000, onRemove }: NotificationProps) {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (duration > 0) {
            // Progress bar animation
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    const decrement = 100 / (duration / 50);
                    return Math.max(0, prev - decrement);
                });
            }, 50);

            // Auto remove timer
            const timer = setTimeout(() => {
                onRemove(id);
            }, duration);

            return () => {
                clearTimeout(timer);
                clearInterval(progressInterval);
            };
        }

        return undefined;
    }, [id, duration, onRemove]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-600" />;
            case 'info':
                return <Info className="w-5 h-5 text-blue-600" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            case 'create':
                return <CheckCircle className="w-5 h-5 text-emerald-600" />;
            case 'update':
                return <CheckCircle className="w-5 h-5 text-blue-600" />;
            case 'delete':
                return <CheckCircle className="w-5 h-5 text-purple-600" />;
            case 'complete':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'incomplete':
                return <Info className="w-5 h-5 text-orange-600" />;
            default:
                return <Info className="w-5 h-5 text-blue-600" />;
        }
    };

    const getStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'create':
                return 'bg-emerald-50 border-emerald-200 text-emerald-800';
            case 'update':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'delete':
                return 'bg-purple-50 border-purple-200 text-purple-800';
            case 'complete':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'incomplete':
                return 'bg-orange-50 border-orange-200 text-orange-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const getProgressColor = () => {
        switch (type) {
            case 'success':
            case 'complete':
                return 'bg-green-500';
            case 'error':
                return 'bg-red-500';
            case 'info':
            case 'update':
                return 'bg-blue-500';
            case 'warning':
                return 'bg-yellow-500';
            case 'create':
                return 'bg-emerald-500';
            case 'delete':
                return 'bg-purple-500';
            case 'incomplete':
                return 'bg-orange-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div
            className={`relative flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ease-in-out transform translate-x-0 overflow-hidden ${getStyles()}`}
            style={{
                animation: 'slideIn 0.3s ease-out',
            }}
        >
            {/* Progress bar */}
            {duration > 0 && (
                <div className="absolute bottom-0 left-0 h-1 bg-gray-200 w-full">
                    <div
                        className={`h-full transition-all duration-75 ease-linear ${getProgressColor()}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Icon */}
            <div className="flex-shrink-0">
                {getIcon()}
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{message}</p>
            </div>

            {/* Close Button */}
            <button
                onClick={() => onRemove(id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// Notification Container
interface NotificationContainerProps {
    notifications: Array<{
        id: string;
        type: NotificationType;
        message: string;
    }>;
    onRemove: (id: string) => void;
}

export function NotificationContainer({ notifications, onRemove }: NotificationContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    {...notification}
                    onRemove={onRemove}
                />
            ))}
        </div>
    );
}

// Custom Hook for Notifications
export function useNotifications() {
    const [notifications, setNotifications] = useState<Array<{
        id: string;
        type: NotificationType;
        message: string;
    }>>([]);

    const addNotification = (message: string, type: NotificationType = 'info', duration: number = 2000) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2);

        setNotifications(prev => [
            ...prev,
            { id, message, type }
        ]);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    // Generic methods with optional duration parameter
    const showSuccess = (message: string, duration: number = 2000) => addNotification(message, 'success', duration);
    const showError = (message: string, duration: number = 2000) => addNotification(message, 'error', duration);
    const showInfo = (message: string, duration: number = 2000) => addNotification(message, 'info', duration);
    const showWarning = (message: string, duration: number = 2000) => addNotification(message, 'warning', duration);

    // Action-specific methods with optional duration parameter
    const showCreate = (message: string, duration: number = 2000) => addNotification(message, 'create', duration);
    const showUpdate = (message: string, duration: number = 2000) => addNotification(message, 'update', duration);
    const showDelete = (message: string, duration: number = 2000) => addNotification(message, 'delete', duration);
    const showComplete = (message: string, duration: number = 2000) => addNotification(message, 'complete', duration);
    const showIncomplete = (message: string, duration: number = 2000) => addNotification(message, 'incomplete', duration);

    return {
        notifications,
        addNotification,
        removeNotification,
        // Generic methods
        showSuccess,
        showError,
        showInfo,
        showWarning,
        // Action-specific methods
        showCreate,
        showUpdate,
        showDelete,
        showComplete,
        showIncomplete,
    };
}