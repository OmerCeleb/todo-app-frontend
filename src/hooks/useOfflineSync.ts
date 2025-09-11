import { useState, useEffect, useCallback } from 'react';

interface OfflineAction {
    id: string;
    type: 'create' | 'update' | 'delete';
    data: any;
    timestamp: number;
}

export function useOfflineSync() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    // Monitor online status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Load pending actions from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('pending-actions');
        if (stored) {
            try {
                setPendingActions(JSON.parse(stored));
            } catch (error) {
                console.error('Failed to parse pending actions:', error);
            }
        }
    }, []);

    // Save pending actions to localStorage
    useEffect(() => {
        localStorage.setItem('pending-actions', JSON.stringify(pendingActions));
    }, [pendingActions]);

    // Add action to queue
    const queueAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
        const newAction: OfflineAction = {
            ...action,
            id: Date.now().toString(),
            timestamp: Date.now(),
        };
        setPendingActions(prev => [...prev, newAction]);
    }, []);

    // Sync pending actions when online
    const syncPendingActions = useCallback(async () => {
        if (!isOnline || pendingActions.length === 0 || isSyncing) return;

        setIsSyncing(true);

        try {
            // Process actions in order
            for (const action of pendingActions) {
                // Implement sync logic based on action type
                // This would call your API service methods
                console.log('Syncing action:', action);
            }

            // Clear synced actions
            setPendingActions([]);
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
    }, [isOnline, pendingActions, isSyncing]);

    // Auto-sync when coming online
    useEffect(() => {
        if (isOnline) {
            syncPendingActions();
        }
    }, [isOnline, syncPendingActions]);

    return {
        isOnline,
        pendingActions,
        isSyncing,
        queueAction,
        syncPendingActions,
    };
}
