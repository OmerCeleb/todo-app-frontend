// src/types/index.ts

export interface Todo {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    category?: string;
    createdAt: string;
    updatedAt: string;
    dueDate?: string;
}

export interface TodoFilter {
    status: 'all' | 'active' | 'completed';
    priority: 'all' | 'LOW' | 'MEDIUM' | 'HIGH';
    category: string;
    dateFilter: 'all' | 'today' | 'tomorrow' | 'this-week' | 'overdue' | 'no-date';
    searchQuery?: string;
}

export interface TodoSort {
    sortBy: 'created' | 'updated' | 'title' | 'priority' | 'dueDate';
    sortOrder: 'asc' | 'desc';
}

export interface TodoStats {
    total: number;
    completed: number;
    active: number;
    overdue: number;
    byPriority?: {
        low: number;
        medium: number;
        high: number;
    };
    byCategory?: Record<string, number>;
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
    createdAt: string;

}