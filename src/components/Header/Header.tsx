// src/components/Header/Header.tsx
import { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Search,
    Menu,
    X,
    LogOut,
    BarChart3,
    Settings as SettingsIcon,
    Sun,
    Moon,
    Monitor,
    CheckSquare,
    User,
    ChevronDown,
    Bell,
    HelpCircle
} from 'lucide-react';
import type { ThemeMode } from '../../hooks/useTheme';

interface HeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    theme: ThemeMode;
    isDarkMode: boolean;
    onThemeChange: (theme: ThemeMode) => void;
    onAddTodo: () => void;
    userName?: string;
    onLogout?: () => void;
    onDashboardClick?: () => void;
    onSettingsClick?: () => void;
    showDashboard?: boolean;
}

export function Header({
                           searchQuery,
                           onSearchChange,
                           theme,
                           isDarkMode,
                           onThemeChange,
                           onAddTodo,
                           userName = 'User',
                           onLogout,
                           onDashboardClick,
                           onSettingsClick,
                       }: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        if (isUserMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isUserMenuOpen]);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getThemeIcon = () => {
        switch (theme) {
            case 'light': return <Sun className="w-4 h-4" />;
            case 'dark': return <Moon className="w-4 h-4" />;
            default: return <Monitor className="w-4 h-4" />;
        }
    };

    const getThemeLabel = () => {
        switch (theme) {
            case 'light': return 'Light';
            case 'dark': return 'Dark';
            default: return 'System';
        }
    };

    const toggleTheme = () => {
        const themes: ThemeMode[] = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        onThemeChange(nextTheme);
    };

    const getUserInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <>
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left Section - Logo & Brand */}
                        <div className="flex items-center gap-8">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                                aria-label="Toggle menu"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-5 h-5" />
                                ) : (
                                    <Menu className="w-5 h-5" />
                                )}
                            </button>

                            {/* Logo & Brand */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur-md opacity-50"></div>
                                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                        <CheckSquare className="w-5 h-5 text-white" strokeWidth={2.5} />
                                    </div>
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                                        TaskMaster
                                    </h1>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Professional Task Management</p>
                                </div>
                            </div>
                        </div>

                        {/* Center Section - Search */}
                        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                            <div className="relative w-full group">
                                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                                    isSearchFocused
                                        ? 'text-blue-500 dark:text-blue-400'
                                        : 'text-gray-400 dark:text-gray-500'
                                }`} />
                                <input
                                    type="text"
                                    placeholder="Search todos by title, description, or category..."
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                    className="w-full pl-12 pr-4 py-3 text-sm bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => onSearchChange('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right Section - Actions & User */}
                        <div className="flex items-center gap-2">
                            {/* Add Todo Button */}
                            <button
                                onClick={onAddTodo}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:scale-105 active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden lg:inline">Add Task</span>
                            </button>

                            {/* Mobile Add Button */}
                            <button
                                onClick={onAddTodo}
                                className="sm:hidden p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg"
                            >
                                <Plus className="w-5 h-5" />
                            </button>

                            {/* Navigation Buttons - Desktop */}
                            <div className="hidden md:flex items-center gap-1">
                                {onDashboardClick && (
                                    <button
                                        onClick={onDashboardClick}
                                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                                        title="Dashboard"
                                    >
                                        <BarChart3 className="w-5 h-5" />
                                    </button>
                                )}

                                {onSettingsClick && (
                                    <button
                                        onClick={onSettingsClick}
                                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                                        title="Settings"
                                    >
                                        <SettingsIcon className="w-5 h-5" />
                                    </button>
                                )}

                                {/* Theme Toggle */}
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                                    title={`Theme: ${getThemeLabel()}`}
                                >
                                    {getThemeIcon()}
                                </button>
                            </div>

                            {/* User Menu */}
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md text-sm">
                                        {getUserInitials(userName)}
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 hidden sm:block ${
                                        isUserMenuOpen ? 'rotate-180' : ''
                                    }`} />
                                </button>

                                {/* User Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-slideDown">
                                        {/* User Info */}
                                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                                                    {getUserInitials(userName)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                        {userName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Free Plan
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-2">
                                            {onDashboardClick && (
                                                <button
                                                    onClick={() => {
                                                        onDashboardClick();
                                                        setIsUserMenuOpen(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                >
                                                    <BarChart3 className="w-4 h-4" />
                                                    <span>Dashboard</span>
                                                </button>
                                            )}

                                            {onSettingsClick && (
                                                <button
                                                    onClick={() => {
                                                        onSettingsClick();
                                                        setIsUserMenuOpen(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                >
                                                    <SettingsIcon className="w-4 h-4" />
                                                    <span>Settings</span>
                                                </button>
                                            )}

                                            {/* Theme Submenu */}
                                            <div className="px-4 py-2">
                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                                    Theme
                                                </p>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => {
                                                            onThemeChange('light');
                                                            setIsUserMenuOpen(false);
                                                        }}
                                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                                            theme === 'light'
                                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                                        }`}
                                                    >
                                                        <Sun className="w-3.5 h-3.5" />
                                                        Light
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            onThemeChange('dark');
                                                            setIsUserMenuOpen(false);
                                                        }}
                                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                                            theme === 'dark'
                                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                                        }`}
                                                    >
                                                        <Moon className="w-3.5 h-3.5" />
                                                        Dark
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            onThemeChange('system');
                                                            setIsUserMenuOpen(false);
                                                        }}
                                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                                            theme === 'system'
                                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                                        }`}
                                                    >
                                                        <Monitor className="w-3.5 h-3.5" />
                                                        Auto
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Help */}
                                            <button
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                            >
                                                <HelpCircle className="w-4 h-4" />
                                                <span>Help & Support</span>
                                            </button>
                                        </div>

                                        {/* Logout */}
                                        {onLogout && (
                                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                                <button
                                                    onClick={() => {
                                                        onLogout();
                                                        setIsUserMenuOpen(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span>Sign Out</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    <div className="md:hidden pb-3">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search todos..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Menu Panel */}
                    <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-900 shadow-2xl animate-slideInLeft">
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                        <CheckSquare className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">TaskMaster</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Menu</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Menu Items */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {onDashboardClick && (
                                    <button
                                        onClick={() => {
                                            onDashboardClick();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                    >
                                        <BarChart3 className="w-5 h-5" />
                                        <span className="font-medium">Dashboard</span>
                                    </button>
                                )}

                                {onSettingsClick && (
                                    <button
                                        onClick={() => {
                                            onSettingsClick();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                    >
                                        <SettingsIcon className="w-5 h-5" />
                                        <span className="font-medium">Settings</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                >
                                    <HelpCircle className="w-5 h-5" />
                                    <span className="font-medium">Help & Support</span>
                                </button>
                            </div>

                            {/* User Section */}
                            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                        {getUserInitials(userName)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {userName}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Free Plan
                                        </p>
                                    </div>
                                </div>
                                {onLogout && (
                                    <button
                                        onClick={() => {
                                            onLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}