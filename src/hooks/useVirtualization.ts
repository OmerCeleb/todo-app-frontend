import { useMemo } from 'react';

interface VirtualizationOptions {
    itemHeight: number;
    containerHeight: number;
    overscan?: number;
}

export function useVirtualization<T>(
    items: T[],
    options: VirtualizationOptions
) {
    const { itemHeight, containerHeight, overscan = 5 } = options;

    return useMemo(() => {
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        const totalHeight = items.length * itemHeight;

        const getVisibleItems = (scrollTop: number) => {
            const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
            const endIndex = Math.min(
                items.length - 1,
                startIndex + visibleCount + overscan * 2
            );

            return {
                startIndex,
                endIndex,
                items: items.slice(startIndex, endIndex + 1),
                offsetY: startIndex * itemHeight,
            };
        };

        return {
            totalHeight,
            visibleCount,
            getVisibleItems,
        };
    }, [items, itemHeight, containerHeight, overscan]);
}