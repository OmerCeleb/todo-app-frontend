// src/utils/logger.ts
/**
 * Production-safe logging utility
 * Only logs in development mode
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LoggerConfig {
    enableInProduction: boolean;
    enabledLevels: LogLevel[];
    prefix?: string;
}

class Logger {
    private config: LoggerConfig = {
        enableInProduction: false,
        enabledLevels: ['log', 'info', 'warn', 'error', 'debug'],
        prefix: '🔷'
    };

    private isDevelopment = process.env.NODE_ENV === 'development';

    /**
     * Check if logging is enabled for the given level
     */
    private isEnabled(level: LogLevel): boolean {
        if (!this.isDevelopment && !this.config.enableInProduction) {
            // In production, only allow errors unless explicitly enabled
            return level === 'error';
        }
        return this.config.enabledLevels.includes(level);
    }

    /**
     * Format log message with timestamp and prefix
     */
    private format(level: LogLevel, ...args: any[]): any[] {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const prefix = this.config.prefix || '';

        const levelEmoji = {
            log: '📝',
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌',
            debug: '🐛'
        };

        return [`[${timestamp}] ${prefix} ${levelEmoji[level]}`, ...args];
    }

    /**
     * Standard log
     */
    log(...args: any[]): void {
        if (this.isEnabled('log')) {
            console.log(...this.format('log', ...args));
        }
    }

    /**
     * Info log
     */
    info(...args: any[]): void {
        if (this.isEnabled('info')) {
            console.info(...this.format('info', ...args));
        }
    }

    /**
     * Warning log
     */
    warn(...args: any[]): void {
        if (this.isEnabled('warn')) {
            console.warn(...this.format('warn', ...args));
        }
    }

    /**
     * Error log (always logged even in production)
     */
    error(...args: any[]): void {
        if (this.isEnabled('error')) {
            console.error(...this.format('error', ...args));
        }
    }

    /**
     * Debug log
     */
    debug(...args: any[]): void {
        if (this.isEnabled('debug')) {
            console.debug(...this.format('debug', ...args));
        }
    }

    /**
     * Group logs
     */
    group(label: string): void {
        if (this.isDevelopment) {
            console.group(label);
        }
    }

    /**
     * End group
     */
    groupEnd(): void {
        if (this.isDevelopment) {
            console.groupEnd();
        }
    }

    /**
     * Table display
     */
    table(data: any): void {
        if (this.isDevelopment) {
            console.table(data);
        }
    }

    /**
     * Performance timing
     */
    time(label: string): void {
        if (this.isDevelopment) {
            console.time(label);
        }
    }

    /**
     * End performance timing
     */
    timeEnd(label: string): void {
        if (this.isDevelopment) {
            console.timeEnd(label);
        }
    }

    /**
     * Configure logger
     */
    configure(config: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...config };
    }
}

// Export singleton instance
export const logger = new Logger();

// Usage examples:
// logger.log('User logged in', { userId: 123 });
// logger.info('Fetching todos...');
// logger.warn('API rate limit approaching');
// logger.error('Failed to create todo', error);
// logger.debug('Component rendered', { props });