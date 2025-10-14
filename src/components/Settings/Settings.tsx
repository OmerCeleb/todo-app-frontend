// src/components/Settings/Settings.tsx
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
    Monitor,
    Sparkles,
    Shield,
    Zap
} from 'lucide-react';
import type { TodoFormData } from '../TodoForm';

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    darkMode?: boolean;
    onImportTodos?: (todos: TodoFormData[]) => void;
    onSettingsChange?: (settings: AppSettings) => void;
    onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
    currentTheme?: 'light' | 'dark' | 'system';
}

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

export function Settings({
                             isOpen,
                             onClose,
                             onImportTodos,
                             onSettingsChange,
                             onThemeChange,
                             currentTheme = 'system',
                             darkMode = false
                         }: SettingsProps) {
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [hasChanges, setHasChanges] = useState(false);
    const [importing, setImporting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [importStatus, setImportStatus] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            const savedSettings = localStorage.getItem('app-settings');
            if (savedSettings) {
                try {
                    const parsed = JSON.parse(savedSettings);
                    const synced = { ...defaultSettings, ...parsed, theme: currentTheme };
                    setSettings(synced);
                } catch (error) {
                    console.error('Failed to parse settings:', error);
                    setSettings({ ...defaultSettings, theme: currentTheme });
                }
            } else {
                setSettings({ ...defaultSettings, theme: currentTheme });
            }
            setHasChanges(false);
            setImportStatus('');
        }
    }, [isOpen, currentTheme]);

    const handleSettingChange = (key: keyof AppSettings, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        setHasChanges(true);

        if (key === 'theme') {
            onThemeChange?.(value as 'light' | 'dark' | 'system');
            const currentSettings = JSON.parse(localStorage.getItem('app-settings') || '{}');
            localStorage.setItem('app-settings', JSON.stringify({ ...currentSettings, theme: value }));
            return;
        }
    };

    const handleSaveSettings = () => {
        try {
            localStorage.setItem('app-settings', JSON.stringify(settings));
            setHasChanges(false);
            onSettingsChange?.(settings);
            onThemeChange?.(settings.theme);
            setImportStatus('✅ Settings saved successfully!');

            setTimeout(() => {
                setImportStatus('');
                onClose();
            }, 1000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setImportStatus('❌ Failed to save settings');
        }
    };

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

    const handleResetSettings = () => {
        if (window.confirm('Are you sure you want to reset all settings to default?')) {
            setSettings(defaultSettings);
            setHasChanges(true);
            setImportStatus('⚠️ Settings reset. Click Save to apply.');
        }
    };

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
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative rounded-2xl shadow-2xl w-full max-w-4xl my-8 animate-scale-in border-2 ${
                darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${
                    darkMode ? 'border-gray-800' : 'border-gray-200'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-md opacity-50"></div>
                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <SettingsIcon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <h2 className={`text-2xl font-bold ${
                                darkMode ? 'text-white' : 'text-gray-900'
                            }`}>Settings</h2>
                            <p className={`text-sm ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>Customize your TaskMaster experience</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-xl transition-all ${
                            darkMode
                                ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                        }`}
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Status Message */}
                    {importStatus && (
                        <div className={`p-4 rounded-xl border-2 text-sm font-semibold animate-slideDown ${
                            importStatus.includes('✅')
                                ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                : importStatus.includes('❌')
                                    ? 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                                    : 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
                        }`}>
                            {importStatus}
                        </div>
                    )}

                    {/* Theme Switcher */}
                    <div className={`p-6 rounded-xl border-2 ${
                        darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                    }`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                darkMode ? 'bg-blue-900/30' : 'bg-white shadow-md'
                            }`}>
                                <Sparkles className={`w-6 h-6 ${
                                    darkMode ? 'text-blue-400' : 'text-blue-600'
                                }`} />
                            </div>
                            <div>
                                <h3 className={`text-lg font-bold ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                }`}>Appearance</h3>
                                <p className={`text-sm ${
                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>Choose your preferred theme</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: 'light', label: 'Light', icon: Sun, color: 'from-yellow-400 to-orange-400' },
                                { value: 'dark', label: 'Dark', icon: Moon, color: 'from-blue-500 to-indigo-600' },
                                { value: 'system', label: 'Auto', icon: Monitor, color: 'from-purple-500 to-pink-500' }
                            ].map(({ value, label, icon: Icon, color }) => (
                                <button
                                    key={value}
                                    onClick={() => handleSettingChange('theme', value)}
                                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                                        settings.theme === value
                                            ? `border-blue-500 ring-4 ring-blue-500/20 ${
                                                darkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                                            }`
                                            : `${
                                                darkMode
                                                    ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`
                                    }`}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <span className={`text-sm font-semibold ${
                                            settings.theme === value
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : darkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>{label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* General Settings */}
                    <div className={`p-6 rounded-xl border-2 ${
                        darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                darkMode ? 'bg-purple-900/30' : 'bg-gradient-to-br from-purple-100 to-purple-200 shadow-md'
                            }`}>
                                <Zap className={`w-6 h-6 ${
                                    darkMode ? 'text-purple-400' : 'text-purple-600'
                                }`} />
                            </div>
                            <div>
                                <h3 className={`text-lg font-bold ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                }`}>General Settings</h3>
                                <p className={`text-sm ${
                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>Configure app behavior</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Default Priority */}
                            <div>
                                <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${
                                    darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <CheckCircle className="w-4 h-4" />
                                    Default Priority for New Tasks
                                </label>
                                <select
                                    value={settings.defaultPriority}
                                    onChange={(e) => handleSettingChange('defaultPriority', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium ${
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
                                    { key: 'autoMarkOverdue', label: 'Auto-mark overdue tasks', icon: AlertTriangle, description: 'Automatically highlight overdue tasks' },
                                    { key: 'notifications', label: 'Enable notifications', icon: Bell, description: 'Show browser notifications' },
                                    { key: 'soundEffects', label: 'Sound effects', icon: Volume2, description: 'Play sounds for actions' },
                                    { key: 'compactView', label: 'Compact view', icon: Eye, description: 'Use compact layout' },
                                    { key: 'showCompletedTasks', label: 'Show completed tasks', icon: CheckCircle, description: 'Display completed tasks' },
                                    { key: 'autoSave', label: 'Auto-save settings', icon: Save, description: 'Save changes automatically' },
                                ].map(({ key, label, icon: Icon, description }) => (
                                    <label
                                        key={key}
                                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            settings[key as keyof AppSettings]
                                                ? `border-blue-500 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`
                                                : darkMode
                                                    ? 'border-gray-700 hover:border-gray-600 bg-gray-800/30'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={settings[key as keyof AppSettings] as boolean}
                                            onChange={(e) => handleSettingChange(key as keyof AppSettings, e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="flex-shrink-0">
                                            <Icon className={`w-5 h-5 ${
                                                settings[key as keyof AppSettings]
                                                    ? 'text-blue-600 dark:text-blue-400'
                                                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-semibold ${
                                                darkMode ? 'text-white' : 'text-gray-900'
                                            }`}>{label}</div>
                                            <div className={`text-xs mt-1 ${
                                                darkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}>{description}</div>
                                        </div>
                                        <div className={`flex-shrink-0 w-12 h-6 rounded-full transition-all ${
                                            settings[key as keyof AppSettings]
                                                ? 'bg-blue-600'
                                                : darkMode ? 'bg-gray-700' : 'bg-gray-300'
                                        }`}>
                                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 mt-0.5 ${
                                                settings[key as keyof AppSettings]
                                                    ? 'translate-x-6'
                                                    : 'translate-x-0.5'
                                            }`}></div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className={`p-6 rounded-xl border-2 ${
                        darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                darkMode ? 'bg-green-900/30' : 'bg-gradient-to-br from-green-100 to-green-200 shadow-md'
                            }`}>
                                <Shield className={`w-6 h-6 ${
                                    darkMode ? 'text-green-400' : 'text-green-600'
                                }`} />
                            </div>
                            <div>
                                <h3 className={`text-lg font-bold ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                }`}>Data Management</h3>
                                <p className={`text-sm ${
                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>Backup and restore your data</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                onClick={handleExportData}
                                disabled={exporting}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold transition-all ${
                                    exporting
                                        ? 'opacity-50 cursor-not-allowed'
                                        : darkMode
                                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                }`}
                            >
                                <Download className="w-5 h-5" />
                                {exporting ? 'Exporting...' : 'Export Data'}
                            </button>

                            <label className="relative">
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImportData}
                                    disabled={importing}
                                    className="hidden"
                                />
                                <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold cursor-pointer transition-all ${
                                    importing
                                        ? 'opacity-50 cursor-not-allowed'
                                        : darkMode
                                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                }`}>
                                    <Upload className="w-5 h-5" />
                                    {importing ? 'Importing...' : 'Import Data'}
                                </div>
                            </label>
                        </div>

                        {/* Danger Zone */}
                        <div className={`pt-6 mt-6 border-t-2 ${
                            darkMode ? 'border-gray-700' : 'border-gray-300'
                        }`}>
                            <label className="flex items-center gap-2 text-sm font-bold mb-4 text-red-600 dark:text-red-400">
                                <AlertTriangle className="w-5 h-5" />
                                Danger Zone
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    onClick={handleResetSettings}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 font-semibold hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
                                >
                                    <SettingsIcon className="w-5 h-5" />
                                    Reset Settings
                                </button>
                                <button
                                    onClick={handleClearData}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    Clear All Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`flex flex-col sm:flex-row gap-3 p-6 border-t-2 ${
                    darkMode ? 'border-gray-800' : 'border-gray-200'
                }`}>
                    <button
                        onClick={onClose}
                        className={`flex-1 sm:flex-none sm:px-8 py-3 rounded-xl font-semibold transition-all ${
                            darkMode
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveSettings}
                        disabled={!hasChanges}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all ${
                            hasChanges
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:scale-[1.02] active:scale-[0.98]'
                                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <Save className="w-5 h-5" />
                        {hasChanges ? 'Save Changes' : 'No Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}