// src/components/Header/Header.tsx
import { useState } from 'react';
import { Plus, Search, Menu, X, LogOut, BarChart3, Settings as SettingsIcon, CheckSquare, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
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
                           userName,
                           onLogout,
                           onDashboardClick,
                           onSettingsClick,
                           showDashboard = false,
                       }: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const cardClasses = isDarkMode
        ? 'bg-gray-800/95 border-gray-700'
        : 'bg-white/95 border-gray-200';

    const getThemeIcon = () => {
        switch (theme) {
            case 'light': return <Sun className="w-4 h-4" />;
            case 'dark': return <Moon className="w-4 h-4" />;
            default: return <Monitor className="w-4 h-4" />;
        }
    };

    const toggleTheme = () => {
        const themes: ThemeMode[] = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        onThemeChange(nextTheme);
    };

    return (
        <header className={`sticky top-0 z-50 ${cardClasses} backdrop-blur-md border-b shadow-sm transition-all duration-300`}>
            <div className="max-w-7xl mx-auto">
                {/* Main Header */}
                <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    {/* Left: Logo & Brand */}
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-target"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>

                        {/* Logo */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95">
                                <CheckSquare className="w-5 h-5 text-white" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Todo App
                                </h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Smart task management
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Center: Search (Desktop) */}
                    <div className="hidden lg:flex flex-1 max-w-md mx-6">
                        <Input
                            placeholder="Search todos..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            leftIcon={<Search className="w-4 h-4" />}
                            className="w-full"
                        />
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        {/* Mobile Search Toggle */}
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-target"
                            aria-label="Toggle search"
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="hidden sm:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-target"
                            aria-label="Toggle theme"
                            title={`Theme: ${theme}`}
                        >
                            {getThemeIcon()}
                        </button>

                        {/* Dashboard Button (Desktop) */}
                        {onDashboardClick && (
                            <Button
                                variant={showDashboard ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={onDashboardClick}
                                icon={<BarChart3 className="w-4 h-4" />}
                                className="hidden lg:flex"
                            >
                                Dashboard
                            </Button>
                        )}

                        {/* Settings Button (Desktop) */}
                        {onSettingsClick && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onSettingsClick}
                                icon={<SettingsIcon className="w-4 h-4" />}
                                className="hidden lg:flex"
                            />
                        )}

                        {/* Add Todo Button */}
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={onAddTodo}
                            icon={<Plus className="w-4 h-4" />}
                            className="shadow-md hover:shadow-lg transition-all touch-target"
                        >
                            <span className="hidden sm:inline">Add Task</span>
                        </Button>

                        {/* User Menu (Desktop) */}
                        {userName && onLogout && (
                            <div className="hidden lg:flex items-center gap-3 pl-3 ml-3 border-l border-gray-300 dark:border-gray-600">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium hidden xl:inline">
                                        {userName}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onLogout}
                                    icon={<LogOut className="w-4 h-4" />}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {isSearchOpen && (
                    <div className="lg:hidden px-4 pb-3 animate-slideDown">
                        <Input
                            placeholder="Search todos..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            leftIcon={<Search className="w-4 h-4" />}
                            className="w-full"
                            autoFocus
                        />
                    </div>
                )}

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 animate-slideDown">
                        <div className="px-4 py-3 space-y-2">
                            {/* Dashboard Button */}
                            {onDashboardClick && (
                                <button
                                    onClick={() => {
                                        onDashboardClick();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left touch-target"
                                >
                                    <BarChart3 className="w-5 h-5" />
                                    <span className="font-medium">Dashboard</span>
                                </button>
                            )}

                            {/* Settings Button */}
                            {onSettingsClick && (
                                <button
                                    onClick={() => {
                                        onSettingsClick();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left touch-target"
                                >
                                    <SettingsIcon className="w-5 h-5" />
                                    <span className="font-medium">Settings</span>
                                </button>
                            )}

                            {/* Theme Selector */}
                            <button
                                onClick={() => {
                                    toggleTheme();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left touch-target"
                            >
                                {getThemeIcon()}
                                <span className="font-medium">
                                    Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
                                </span>
                            </button>

                            {/* User Info & Logout */}
                            {userName && onLogout && (
                                <>
                                    <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700 mt-2 pt-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                                            {userName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{userName}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Signed in
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            onLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left touch-target"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span className="font-medium">Logout</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}