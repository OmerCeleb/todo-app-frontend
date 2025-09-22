// src/config/api.ts
export const API_CONFIG = {
    BASE_URL: 'http://localhost:8080/api',
    TIMEOUT: 10000,
    ENDPOINTS: {
        AUTH: {
            REGISTER: '/auth/register',
            LOGIN: '/auth/login',
            REFRESH: '/auth/refresh',
            LOGOUT: '/auth/logout',
            ME: '/auth/me',
        },
        TODOS: {
            BASE: '/todos',
            STATS: '/todos/stats',
            OVERDUE: '/todos/overdue',
            COMPLETED: '/todos/completed',
        },
    },
} as const;