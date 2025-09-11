export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: Map<string, number> = new Map();

    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    startMeasure(name: string): void {
        this.metrics.set(name, performance.now());
    }

    endMeasure(name: string): number {
        const startTime = this.metrics.get(name);
        if (startTime === undefined) {
            console.warn(`No start time found for metric: ${name}`);
            return 0;
        }

        const duration = performance.now() - startTime;
        this.metrics.delete(name);

        if (process.env.NODE_ENV === 'development') {
            console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
        }

        return duration;
    }

    measureRender<T>(name: string, fn: () => T): T {
        this.startMeasure(name);
        const result = fn();
        this.endMeasure(name);
        return result;
    }
}