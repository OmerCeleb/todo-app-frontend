// src/components/Settings/Settings.tsx
// Bu dosyayı TAMAMEN değiştir

import React, { useState, useEffect } from 'react';
import {
    Save,
    Download,
    Upload,
    Trash2,
    Settings as SettingsIcon,
    Bell,
    Volume2,
    Eye,
    CheckCircle,
    X,
    AlertTriangle,
    Sun,
    Moon,
    Monitor
} from 'lucide-react';
import { Button } from '../ui/Button';
import type { TodoFormData } from '../TodoForm';

/**
 * Settings component props
 */
interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    darkMode?: boolean;
    onImportTodos?: (todos: TodoFormData[]) => void;
    onSettingsChange?: (settings: AppSettings) => void;
    onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
    currentTheme?: 'light' | 'dark' | 'system';
}

/**
 * Application settings interface
 */
export interface AppSettings {
    defaultPriority: 'low' | 'medium' | 'high';
    autoMarkOverdue: boolean;
    notifications: boolean;
    soundEffects: boolean;
    compactView: boolean;
    showCompletedTasks: boolean;
    autoSave: boolean;
    theme: 'light' | 'dark' | 'system';
}

/**
 * Default settings configuration
 */
const defaultSettings: AppSettings = {
    defaultPriority: 'medium',
    autoMarkOverdue: true,
    notifications: true,
    soundEffects: false,
    compactView: false,
    showCompletedTasks: true,
    autoSave: true,
    theme: 'system',
};

/**
 * Settings Component
 * Manages application preferences and data import/export
 */
export function Settings({
                             isOpen,
                             onClose,
                             onImportTodos,
                             onSettingsChange,
                             onThemeChange,
                             currentTheme = 'system',
                             darkMode = false
                         }: SettingsProps) {
    // State
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [hasChanges, setHasChanges] = useState(false);
    const [importing, setImporting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [importStatus, setImportStatus] = useState<string>('');

    /**
     * Load settings from localStorage when modal opens
     */
    useEffect(() => {
        if (isOpen) {
            const savedSettings = localStorage.getItem('app-settings');
            if (savedSettings) {
                try {
                    const parsed = JSON.parse(savedSettings);
                    setSettings({ ...defaultSettings, ...parsed });
                } catch (error) {
                    console.error('Failed to parse settings:', error);
                    setSettings(defaultSettings);
                }
            }
            setHasChanges(false);
            setImportStatus('');
        }
    }, [isOpen]);

    /**
     * Handle individual setting changes
     */
    const handleSettingChange = (key: keyof AppSettings, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        setHasChanges(true);

        // Apply settings immediately if auto-save is enabled
        if (settings.autoSave) {
            localStorage.setItem('app-settings', JSON.stringify(newSettings));
            onSettingsChange?.(newSettings);
        }
    };

    /**
     * Save settings to localStorage
     */
    const handleSaveSettings = () => {
        try {
            localStorage.setItem('app-settings', JSON.stringify(settings));
            setHasChanges(false);
            onSettingsChange?.(settings);
            setImportStatus('✅ Settings saved successfully!');
            setTimeout(() => setImportStatus(''), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setImportStatus('❌ Failed to save settings');
        }
    };

    /**
     * Export todos to JSON file
     */
    const handleExportData = async () => {
        setExporting(true);
        try {
            const todosData = localStorage.getItem('todos');
            const todos = todosData ? JSON.parse(todosData) : [];

            const dataStr = JSON.stringify(todos, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `todos-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setImportStatus('✅ Data exported successfully!');
            setTimeout(() => setImportStatus(''), 3000);
        } catch (error) {
            console.error('Error exporting data:', error);
            setImportStatus('❌ Failed to export data');
        } finally {
            setExporting(false);
        }
    };

    /**
     * Import todos from JSON file
     */
    const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const importedTodos = JSON.parse(content);

                if (Array.isArray(importedTodos)) {
                    onImportTodos?.(importedTodos);
                    setImportStatus(`✅ Successfully imported ${importedTodos.length} todos!`);
                    setTimeout(() => setImportStatus(''), 3000);
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                console.error('Error importing data:', error);
                setImportStatus('❌ Failed to import data. Please check file format.');
            } finally {
                setImporting(false);
                event.target.value = '';
            }
        };

        reader.readAsText(file);
    };

    /**
     * Reset settings to defaults
     */
    const handleResetSettings = () => {
        if (window.confirm('Are you sure you want to reset all settings to default?')) {
            setSettings(defaultSettings);
            setHasChanges(true);
            setImportStatus('⚠️ Settings reset. Click Save to apply.');
        }
    };

    /**
     * Clear all data
     */
    const handleClearData = () => {
        if (window.confirm('⚠️ This will delete ALL your todos and settings. This action cannot be undone!')) {
            localStorage.clear();
            setSettings(defaultSettings);
            setHasChanges(false);
            setImportStatus('✅ All data cleared!');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    };

    /**
     * Get theme icon
     */
    const getThemeIcon = (theme: string) => {
        switch (theme) {
            case 'light': return <Sun className="w-4 h-4" />;
            case 'dark': return <Moon className="w-4 h-4" />;
            default: return <Monitor className="w-4 h-4" />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative rounded-2xl shadow-2xl w-full max-w-4xl my-8 animate-scale-in border ${
                darkMode
                    ? 'bg-gray-900 border-gray-800'
                    : 'bg-white border-gray-200'
            }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-4 sm:p-6 border-b ${
                    darkMode ? 'border-gray-800' : 'border-gray-200'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <SettingsIcon className="w-5 h-5 text-white" />
                        </div>
                        <h2 className={`text-xl sm:text-2xl font-bold ${
                            darkMode ? 'text-white' : 'text-gray-900'
                        }`}>Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${
                            darkMode
                                ? 'hover:bg-gray-800 text-gray-400'
                                : 'hover:bg-gray-100 text-gray-500'
                        }`}
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Status Message */}
                    {importStatus && (
                        <div className={`p-3 sm:p-4 rounded-lg border text-sm font-medium ${
                            importStatus.includes('✅')
                                ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                : importStatus.includes('❌')
                                    ? 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                                    : 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
                        }`}>
                            {importStatus}
                        </div>
                    )}

                    {/* Theme Switcher Section */}
                    <div className={`p-4 sm:p-6 rounded-xl border ${
                        darkMode
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-gray-50 border-gray-200'
                    }`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                darkMode
                                    ? 'bg-purple-900/30'
                                    : 'bg-gradient-to-br from-purple-100 to-purple-200'
                            }`}>
                                {getThemeIcon(currentTheme)}
                            </div>
                            <h3 className={`text-lg font-bold ${
                                darkMode ? 'text-white' : 'text-gray-900'
                            }`}>Appearance</h3>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: 'light', label: 'Light', icon: Sun },
                                { value: 'dark', label: 'Dark', icon: Moon },
                                { value: 'system', label: 'System', icon: Monitor },
                            ].map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => onThemeChange?.(value as any)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                                        currentTheme === value
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : darkMode
                                                ? 'border-gray-700 bg-gray-700/50 hover:border-gray-600'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 ${
                                        currentTheme === value
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : darkMode
                                                ? 'text-gray-400'
                                                : 'text-gray-600'
                                    }`} />
                                    <span className={`text-sm font-medium ${
                                        currentTheme === value
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : darkMode
                                                ? 'text-gray-300'
                                                : 'text-gray-700'
                                    }`}>{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* General Settings */}
                    <div className={`p-4 sm:p-6 rounded-xl border ${
                        darkMode
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-gray-50 border-gray-200'
                    }`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                darkMode
                                    ? 'bg-blue-900/30'
                                    : 'bg-gradient-to-br from-blue-100 to-blue-200'
                            }`}>
                                <SettingsIcon className={`w-5 h-5 ${
                                    darkMode ? 'text-blue-400' : 'text-blue-600'
                                }`} />
                            </div>
                            <h3 className={`text-lg font-bold ${
                                darkMode ? 'text-white' : 'text-gray-900'
                            }`}>General Settings</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Default Priority */}
                            <div>
                                <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${
                                    darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <CheckCircle className="w-4 h-4" />
                                    Default Priority
                                </label>
                                <select
                                    value={settings.defaultPriority}
                                    onChange={(e) => handleSettingChange('defaultPriority', e.target.value)}
                                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                                        darkMode
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                >
                                    <option value="low">🟢 Low Priority</option>
                                    <option value="medium">🟡 Medium Priority</option>
                                    <option value="high">🔴 High Priority</option>
                                </select>
                            </div>

                            {/* Toggle Settings */}
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { key: 'autoMarkOverdue', label: 'Auto-mark overdue tasks', icon: AlertTriangle, description: 'Automatically mark tasks as overdue when due date passes' },
                                    { key: 'notifications', label: 'Enable notifications', icon: Bell, description: 'Show browser notifications for important events' },
                                    { key: 'soundEffects', label: 'Sound effects', icon: Volume2, description: 'Play sounds for task completion and other actions' },
                                    { key: 'compactView', label: 'Compact view', icon: Eye, description: 'Use a more compact layout to fit more items on screen' },
                                    { key: 'showCompletedTasks', label: 'Show completed tasks', icon: CheckCircle, description: 'Display completed tasks in the list' },
                                    { key: 'autoSave', label: 'Auto-save settings', icon: Save, description: 'Automatically save changes without clicking Save' },
                                ].map(({ key, label, icon: Icon, description }) => (
                                    <label
                                        key={key}
                                        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                                            settings[key as keyof AppSettings]
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : darkMode
                                                    ? 'border-gray-700 hover:border-gray-600 bg-gray-700/50'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={settings[key as keyof AppSettings] as boolean}
                                            onChange={(e) => handleSettingChange(key as keyof AppSettings, e.target.checked)}
                                            className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Icon className={`w-4 h-4 flex-shrink-0 ${
                                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                                }`} />
                                                <span className={`text-sm font-semibold ${
                                                    darkMode ? 'text-white' : 'text-gray-900'
                                                }`}>{label}</span>
                                            </div>
                                            <p className={`text-xs ${
                                                darkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}>{description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className={`p-4 sm:p-6 rounded-xl border ${
                        darkMode
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-gray-50 border-gray-200'
                    }`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                darkMode
                                    ? 'bg-green-900/30'
                                    : 'bg-gradient-to-br from-green-100 to-green-200'
                            }`}>
                                <Download className={`w-5 h-5 ${
                                    darkMode ? 'text-green-400' : 'text-green-600'
                                }`} />
                            </div>
                            <h3 className={`text-lg font-bold ${
                                darkMode ? 'text-white' : 'text-gray-900'
                            }`}>Data Management</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Export/Import Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleExportData}
                                    disabled={exporting}
                                    icon={<Download className="w-4 h-4" />}
                                    className="justify-center"
                                >
                                    {exporting ? 'Exporting...' : 'Export Data'}
                                </Button>

                                <label className="w-full cursor-pointer">
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleImportData}
                                        disabled={importing}
                                        className="hidden"
                                    />
                                    <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 font-medium text-sm ${
                                        importing
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'cursor-pointer'
                                    } ${
                                        darkMode
                                            ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600'
                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    }`}>
                                        <Upload className="w-4 h-4" />
                                        <span>{importing ? 'Importing...' : 'Import Data'}</span>
                                    </div>
                                </label>
                            </div>

                            {/* Danger Zone */}
                            <div className={`pt-4 border-t ${
                                darkMode ? 'border-gray-600' : 'border-gray-300'
                            }`}>
                                <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-red-600 dark:text-red-400">
                                    <AlertTriangle className="w-4 h-4" />
                                    Danger Zone
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={handleResetSettings}
                                        icon={<SettingsIcon className="w-4 h-4" />}
                                        className="justify-center border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20"
                                    >
                                        Reset Settings
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleClearData}
                                        icon={<Trash2 className="w-4 h-4" />}
                                        className="justify-center border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                    >
                                        Clear All Data
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t ${
                    darkMode ? 'border-gray-800' : 'border-gray-200'
                }`}>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 sm:flex-none sm:w-32"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSaveSettings}
                        disabled={!hasChanges}
                        icon={<Save className="w-4 h-4" />}
                        className="flex-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {hasChanges ? 'Save Changes' : 'No Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
}