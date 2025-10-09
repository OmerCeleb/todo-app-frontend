// src/hooks/usePerformance.ts
import { useEffect, useRef, useCallback } from 'react';

/**
 * Performance monitoring hook
 * Tracks component render times and performance metrics
 */
export function usePerformance(componentName: string, enabled = process.env.NODE_ENV === 'development') {
    const renderCount = useRef(0);
    const lastRenderTime = useRef(Date.now());

    useEffect(() => {
        if (!enabled) return;

        renderCount.current += 1;
        const currentTime = Date.now();
        const timeSinceLastRender = currentTime - lastRenderTime.current;
        lastRenderTime.current = currentTime;

        console.log(`[Performance] ${componentName}:`, {
            renderCount: renderCount.current,
            timeSinceLastRender: `${timeSinceLastRender}ms`
        });
    });

    return {
        renderCount: renderCount.current
    };
}

/**
 * Debounced callback hook with performance optimization
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): T {
    const timeoutRef = useRef<NodeJS.Timeout>();
    const callbackRef = useRef(callback);

    // Update callback ref when callback changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const debouncedCallback = useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        },
        [delay]
    ) as T;

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedCallback;
}

/**
 * Throttled callback hook for performance-critical operations
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): T {
    const lastRun = useRef(Date.now());
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const throttledCallback = useCallback(
        (...args: Parameters<T>) => {
            const now = Date.now();
            if (now - lastRun.current >= delay) {
                lastRun.current = now;
                callbackRef.current(...args);
            }
        },
        [delay]
    ) as T;

    return throttledCallback;
}

/**
 * Virtual scrolling hook for large lists
 */
export function useVirtualScroll<T>(
    items: T[],
    itemHeight: number,
    containerHeight: number,
    overscan = 3
) {
    const scrollTop = useRef(0);

    const visibleRange = useCallback(() => {
        const start = Math.floor(scrollTop.current / itemHeight);
        const end = Math.ceil((scrollTop.current + containerHeight) / itemHeight);

        return {
            start: Math.max(0, start - overscan),
            end: Math.min(items.length, end + overscan)
        };
    }, [items.length, itemHeight, containerHeight, overscan]);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        scrollTop.current = e.currentTarget.scrollTop;
    }, []);

    const range = visibleRange();
    const visibleItems = items.slice(range.start, range.end);

    return {
        visibleItems,
        handleScroll,
        totalHeight: items.length * itemHeight,
        offsetY: range.start * itemHeight
    };
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
    options: IntersectionObserverInit = {}
) {
    const ref = useRef<HTMLElement | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const observe = useCallback((callback: IntersectionObserverCallback) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(callback, {
            threshold: 0.1,
            ...options
        });

        if (ref.current) {
            observerRef.current.observe(ref.current);
        }
    }, [options]);

    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return { ref, observe };
}

/**
 * Memory leak prevention hook
 */
export function useUnmountEffect(effect: () => void) {
    const effectRef = useRef(effect);

    useEffect(() => {
        effectRef.current = effect;
    }, [effect]);

    useEffect(() => {
        return () => {
            effectRef.current();
        };
    }, []);
}

/**
 * Network status hook for offline detection
 */
export function useNetworkStatus() {
    const [isOnline, setIsOnline] = React.useState(navigator.onLine);

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

    return isOnline;
}

// Import React for useNetworkStatus
import * as React from 'react';