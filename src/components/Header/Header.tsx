import { Plus, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ThemeSelector } from '../ThemeSelector';
import type { ThemeMode } from '../../hooks/useTheme';

interface HeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    theme: ThemeMode;
    isDarkMode: boolean;
    onThemeChange: (theme: ThemeMode) => void;
    onAddTodo: () => void;
}

export function Header({
                           searchQuery,
                           onSearchChange,
                           theme,
                           isDarkMode,
                           onThemeChange,
                           onAddTodo,
                       }: HeaderProps) {
    const cardClasses = isDarkMode
        ? 'bg-gray-800 border-gray-700 text-white'
        : 'bg-white border-gray-200';

    return (
        <header className={`border-b sticky top-0 z-40 transition-all duration-300 backdrop-blur-sm ${cardClasses} safe-area-top`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110">
                            <span className="text-white font-bold text-lg">T</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className={`text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text transition-colors duration-300 ${
                                isDarkMode ? 'text-transparent' : 'text-transparent'
                            }`}>
                                Modular Todo
                            </h1>
                            <p className={`text-xs transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                                Smart task management
                            </p>
                        </div>
                    </div>

                    {/* Search - Responsive */}
                    <div className="flex-1 max-w-md mx-4">
                        <Input
                            placeholder="Search todos..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            leftIcon={<Search className="w-4 h-4" />}
                            className="transition-all duration-200 focus:scale-105"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Theme Selector */}
                        <ThemeSelector
                            theme={theme}
                            isDarkMode={isDarkMode}
                            onThemeChange={onThemeChange}
                        />

                        {/* Add Todo Button */}
                        <Button
                            variant="primary"
                            onClick={onAddTodo}
                            icon={<Plus className="w-4 h-4" />}
                            className="transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        >
                            <span className="hidden sm:inline">Add Todo</span>
                        </Button>
                    </div>
                </div>

                {/* Mobile Search - Collapsible */}
                <div className="sm:hidden mt-3">
                    <Input
                        placeholder="Search todos..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        leftIcon={<Search className="w-4 h-4" />}
                    />
                </div>
            </div>
        </header>
    );
}