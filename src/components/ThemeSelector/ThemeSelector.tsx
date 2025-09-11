import { useState } from 'react';
import { Monitor, Moon, Sun, Check, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import type { ThemeMode } from '../../hooks/useTheme';

interface ThemeSelectorProps {
    theme: ThemeMode;
    isDarkMode: boolean;
    onThemeChange: (theme: ThemeMode) => void;
    className?: string;
}

const themeOptions = [
    {
        value: 'light' as ThemeMode,
        label: 'Light',
        icon: Sun,
        description: 'Light theme',
    },
    {
        value: 'dark' as ThemeMode,
        label: 'Dark',
        icon: Moon,
        description: 'Dark theme',
    },
    {
        value: 'system' as ThemeMode,
        label: 'System',
        icon: Monitor,
        description: 'Follow system setting',
    },
];

export function ThemeSelector({ theme, isDarkMode, onThemeChange, className = '' }: ThemeSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const currentTheme = themeOptions.find(option => option.value === theme);
    const CurrentIcon = currentTheme?.icon || Sun;

    const handleThemeSelect = (newTheme: ThemeMode) => {
        onThemeChange(newTheme);
        setIsOpen(false);
    };

    const dropdownClasses = isDarkMode
        ? 'bg-gray-800 border-gray-600 text-white'
        : 'bg-white border-gray-200 text-gray-900';

    const itemClasses = isDarkMode
        ? 'hover:bg-gray-700 text-white'
        : 'hover:bg-gray-50 text-gray-900';

    return (
        <div className={`relative ${className}`}>
            {/* Trigger Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="transition-all duration-200 hover:scale-105"
                icon={
                    <div className="flex items-center gap-1">
                        <CurrentIcon className="w-4 h-4" />
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                }
            >
                <span className="hidden sm:inline">{currentTheme?.label}</span>
            </Button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className={`absolute right-0 top-full mt-2 w-48 rounded-lg border shadow-lg z-50 py-1 transition-all duration-200 animate-fade-in ${dropdownClasses}`}>
                        {themeOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = theme === option.value;

                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleThemeSelect(option.value)}
                                    className={`w-full px-3 py-2 text-left flex items-center gap-3 transition-all duration-150 ${itemClasses} ${
                                        isSelected ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : ''
                                    }`}
                                >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm">{option.label}</div>
                                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {option.description}
                                            {option.value === 'system' && (
                                                <span className="ml-1">
                                                    ({isDarkMode ? 'Dark' : 'Light'})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-scale-in" />
                                    )}
                                </button>
                            );
                        })}

                        {/* Theme Preview */}
                        <div className="border-t border-gray-200 dark:border-gray-600 mt-1 pt-2 px-3 pb-2">
                            <div className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">
                                Preview
                            </div>
                            <div className="flex gap-2">
                                <div className="w-4 h-4 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-gray-800"></div>
                                </div>
                                <div className="w-4 h-4 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                </div>
                                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border border-gray-300 flex items-center justify-center">
                                    <Monitor className="w-2 h-2 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// Simple toggle version for header
export function ThemeToggle({ isDarkMode, onToggle, className = '' }: {
    isDarkMode: boolean;
    onToggle: () => void;
    className?: string;
}) {
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={`transition-all duration-300 hover:scale-110 ${className}`}
            icon={
                <div className="relative">
                    <Sun className={`w-4 h-4 absolute transition-all duration-300 ${
                        isDarkMode ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                    }`} />
                    <Moon className={`w-4 h-4 transition-all duration-300 ${
                        isDarkMode ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                    }`} />
                </div>
            }
        >
            <span className="hidden sm:inline">
                {isDarkMode ? 'Dark' : 'Light'}
            </span>
        </Button>
    );
}