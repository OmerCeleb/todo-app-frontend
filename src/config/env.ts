export const env = {
    // API
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
    API_TIMEOUT: Number(process.env.REACT_APP_API_TIMEOUT) || 10000,

    // App
    APP_NAME: process.env.REACT_APP_NAME || 'Todo App',
    APP_VERSION: process.env.REACT_APP_VERSION || '1.0.0',
    ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || 'development',

    // Features
    ENABLE_ANIMATIONS: process.env.REACT_APP_ENABLE_ANIMATIONS === 'true',
    ENABLE_TOAST_NOTIFICATIONS: process.env.REACT_APP_ENABLE_TOAST_NOTIFICATIONS === 'true',
    DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === 'true',

    // Helpers
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
} as const;

export type EnvConfig = typeof env;