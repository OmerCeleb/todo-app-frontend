// src/components/Header/Header.tsx
import { useState } from 'react';
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
    CheckSquare
} from 'lucide-react';
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
                       }: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const cardClasses = isDarkMode
        ? 'bg-gray-800/95 border-gray-700'
        : 'bg-white/95 border-gray-200';

    const getThemeIcon = () => {
        switch (theme) {
            case 'light': return <Sun className="w-5 h-5" />;
            case 'dark': return <Moon className="w-5 h-5" />;
            default: return <Monitor className="w-5 h-5" />;
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
                <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8 gap-3">
                    {/* Left: Logo & Brand */}
                    <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-target"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        {/* Logo & Title */}
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                                <CheckSquare className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent hidden sm:block truncate">
                                TaskMaster
                            </h1>
                        </div>
                    </div>

                    {/* Center: Search Bar (Desktop) */}
                    <div className="hidden lg:flex flex-1 max-w-2xl mx-4">
                        <Input
                            placeholder="Search todos..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            leftIcon={<Search className="w-4 h-4" />}
                            className="w-full"
                        />
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Mobile Search Toggle */}
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-target"
                            aria-label="Toggle search"
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        {/* Theme Toggle - İYİLEŞTİRİLDİ */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110 flex items-center justify-center touch-target"
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} mode`}
                            title={`Current: ${theme}`}
                        >
                            <div className="relative w-5 h-5 flex items-center justify-center">
                                {getThemeIcon()}
                            </div>
                        </button>

                        {/* Dashboard Button */}
                        {onDashboardClick && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDashboardClick}
                                icon={<BarChart3 className="w-4 h-4" />}
                                className="hidden lg:inline-flex"
                            >
                                <span className="hidden xl:inline">Dashboard</span>
                            </Button>
                        )}

                        {/* Settings Button */}
                        {onSettingsClick && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onSettingsClick}
                                icon={<SettingsIcon className="w-4 h-4" />}
                                className="hidden lg:inline-flex"
                            >
                                <span className="hidden xl:inline">Settings</span>
                            </Button>
                        )}

                        {/* Add Todo Button */}
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={onAddTodo}
                            icon={<Plus className="w-4 h-4" />}
                            className="shadow-lg hover:shadow-xl"
                        >
                            <span className="hidden sm:inline">Add Todo</span>
                        </Button>

                        {/* User Menu */}
                        {userName && onLogout && (
                            <div className="hidden md:flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm flex-shrink-0">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium hidden xl:inline truncate max-w-[120px]">
                                        {userName}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onLogout}
                                    icon={<LogOut className="w-4 h-4" />}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                    aria-label="Logout"
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
                                onClick={toggleTheme}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left touch-target"
                            >
                                {getThemeIcon()}
                                <span className="font-medium">
                                    Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
                                </span>
                            </button>

                            {/* User Info & Logout (Mobile) */}
                            {userName && onLogout && (
                                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
                                    <div className="flex items-center gap-3 px-4 py-2">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-sm">
                                            {userName.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium">{userName}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            onLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors text-left touch-target"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span className="font-medium">Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}