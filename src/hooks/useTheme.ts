// src/hooks/useTheme.ts

import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface UseThemeReturn {
    theme: ThemeMode;
    isDarkMode: boolean;
    setTheme: (theme: ThemeMode) => void;
    toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'todo-app-theme';

// System theme detection with better error handling
const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';

    try {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        return mediaQuery.matches ? 'dark' : 'light';
    } catch (error) {
        console.warn('Failed to detect system theme:', error);
        return 'light';
    }
};

// Get stored theme or default to system
const getStoredTheme = (): ThemeMode => {
    if (typeof window === 'undefined') return 'system';

    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored && ['light', 'dark', 'system'].includes(stored)) {
            return stored as ThemeMode;
        }
    } catch (error) {
        console.warn('Failed to read theme from localStorage:', error);
    }

    return 'system';
};

// Store theme preference
const storeTheme = (theme: ThemeMode): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
        console.warn('Failed to store theme in localStorage:', error);
    }
};

// Apply theme to document with improved logic
const applyTheme = (isDark: boolean): void => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Force reflow to ensure changes are applied
    requestAnimationFrame(() => {
        if (isDark) {
            root.classList.add('dark');
            root.style.colorScheme = 'dark';

            // Also set meta theme-color for mobile browsers
            let metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (!metaThemeColor) {
                metaThemeColor = document.createElement('meta');
                metaThemeColor.setAttribute('name', 'theme-color');
                document.head.appendChild(metaThemeColor);
            }
            metaThemeColor.setAttribute('content', '#1f2937'); // dark gray
        } else {
            root.classList.remove('dark');
            root.style.colorScheme = 'light';

            let metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (!metaThemeColor) {
                metaThemeColor = document.createElement('meta');
                metaThemeColor.setAttribute('name', 'theme-color');
                document.head.appendChild(metaThemeColor);
            }
            metaThemeColor.setAttribute('content', '#ffffff'); // white
        }
    });
};

export function useTheme(): UseThemeReturn {
    // Initialize states
    const [theme, setThemeState] = useState<ThemeMode>(() => getStoredTheme());
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => getSystemTheme());

    // Calculate effective dark mode
    const isDarkMode = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

    // Initialize and listen to system theme changes
    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        // Set initial system theme
        setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
            const newSystemTheme = e.matches ? 'dark' : 'light';
            setSystemTheme(newSystemTheme);
        };

        // Listen for changes
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleSystemThemeChange);
            return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
        } else if (mediaQuery.addListener) {
            // Fallback for older browsers
            mediaQuery.addListener(handleSystemThemeChange);
            return () => mediaQuery.removeListener(handleSystemThemeChange);
        }

        // Return undefined if no cleanup needed
        return undefined;
    }, []); // Bu useEffect sadece mount'ta çalışmalı

    // Apply theme whenever isDarkMode changes
    useEffect(() => {
        applyTheme(isDarkMode);
    }, [isDarkMode]);

    // Set theme function with improved logic
    const setTheme = (newTheme: ThemeMode): void => {
        console.log('Setting theme to:', newTheme);
        setThemeState(newTheme);
        storeTheme(newTheme);
    };

    // Toggle between light and dark (skip system)
    const toggleTheme = (): void => {
        const newTheme = isDarkMode ? 'light' : 'dark';
        setTheme(newTheme);
    };

    return {
        theme,
        isDarkMode,
        setTheme,
        toggleTheme,
    };
}