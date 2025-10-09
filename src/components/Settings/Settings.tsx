// src/components/Settings/Settings.tsx
import React, { useState, useEffect } from 'react';
import {
    Save,
    Download,
    Upload,
    Trash2,
    FileText,
    FileDown,
    Settings as SettingsIcon,
    Palette,
    Bell,
    Volume2,
    Eye,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import type { TodoFormData, Todo } from '../TodoForm';

/**
 * Settings component props
 */
interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    darkMode?: boolean;
    onImportTodos?: (todos: TodoFormData[]) => void;
    onSettingsChange?: (settings: AppSettings) => void;
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

            // Show success message
            setImportStatus('✅ Settings saved successfully!');

            // Auto-close after save
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Failed to save settings:', error);
            setImportStatus('❌ Failed to save settings');
        }
    };

    /**
     * Reset settings to defaults
     */
    const handleResetSettings = () => {
        // eslint-disable-next-line no-restricted-globals
        if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
            setSettings(defaultSettings);
            setHasChanges(true);
            setImportStatus('🔄 Settings reset to defaults. Click Save to apply.');
        }
    };

    /**
     * Export todos as JSON
     */
    const handleExportJSON = () => {
        try {
            setExporting(true);
            const todosJson = localStorage.getItem('todos') || '[]';
            const todos = JSON.parse(todosJson);

            const dataStr = JSON.stringify({ todos, settings }, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `todos-export-${new Date().toISOString().split('T')[0]}.json`;
            link.click();

            URL.revokeObjectURL(url);
            setImportStatus('✅ Data exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            setImportStatus('❌ Export failed');
        } finally {
            setExporting(false);
        }
    };

    /**
     * Export todos as CSV
     */
    const handleExportCSV = () => {
        try {
            setExporting(true);
            const todosJson = localStorage.getItem('todos') || '[]';
            const todos: Todo[] = JSON.parse(todosJson);

            // CSV Headers
            const headers = ['Title', 'Description', 'Priority', 'Category', 'Status', 'Due Date', 'Created', 'Updated'];

            // CSV Rows
            const rows = todos.map(todo => [
                todo.title,
                todo.description || '',
                todo.priority,
                todo.category || '',
                todo.completed ? 'Completed' : 'Active',
                todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : '',
                new Date(todo.createdAt).toLocaleDateString(),
                new Date(todo.updatedAt).toLocaleDateString()
            ]);

            const csvContent = [headers, ...rows]
                .map(row => row.map(cell => `"${cell}"`).join(','))
                .join('\n');

            const dataBlob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `todos-export-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();

            URL.revokeObjectURL(url);
            setImportStatus('✅ CSV exported successfully!');
        } catch (error) {
            console.error('CSV export failed:', error);
            setImportStatus('❌ CSV export failed');
        } finally {
            setExporting(false);
        }
    };

    /**
     * Import todos from JSON file
     */
    const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);

                if (data.todos && Array.isArray(data.todos)) {
                    onImportTodos?.(data.todos);

                    if (data.settings) {
                        setSettings({ ...defaultSettings, ...data.settings });
                        localStorage.setItem('app-settings', JSON.stringify(data.settings));
                    }

                    setImportStatus(`✅ Successfully imported ${data.todos.length} todos!`);
                } else {
                    setImportStatus('❌ Invalid file format');
                }
            } catch (error) {
                console.error('Import failed:', error);
                setImportStatus('❌ Failed to import data');
            } finally {
                setImporting(false);
            }
        };

        reader.readAsText(file);
        event.target.value = ''; // Reset input
    };

    /**
     * Clear all data
     */
    const handleClearData = () => {
        // eslint-disable-next-line no-restricted-globals
        if (window.confirm('⚠️ This will delete ALL todos and settings. Are you sure?')) {
            // eslint-disable-next-line no-restricted-globals
            if (window.confirm('⚠️ FINAL WARNING: This action cannot be undone!')) {
                localStorage.clear();
                setSettings(defaultSettings);
                setImportStatus('🗑️ All data cleared');

                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        }
    };

    // Styling classes
    const cardClasses = darkMode
        ? 'bg-gray-700/50 border-gray-600'
        : 'bg-gray-50 border-gray-200';

    const inputClasses = darkMode
        ? 'bg-gray-700 border-gray-600 text-white'
        : 'bg-white border-gray-300 text-gray-900';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="⚙️ Settings"
            size="xl"
        >
            <div className="space-y-6">
                {/* Status Message */}
                {importStatus && (
                    <div className={`p-3 rounded-lg border text-sm font-medium animate-fade-in ${
                        importStatus.includes('✅')
                            ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                            : importStatus.includes('❌')
                                ? 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                                : 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                    }`}>
                        {importStatus}
                    </div>
                )}

                {/* General Settings Section */}
                <div className={`p-4 sm:p-5 rounded-xl border ${cardClasses}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg flex items-center justify-center">
                            <SettingsIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-bold">General Settings</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Priority and Theme */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Default Priority
                                </label>
                                <select
                                    value={settings.defaultPriority}
                                    onChange={(e) => handleSettingChange('defaultPriority', e.target.value)}
                                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${inputClasses}`}
                                >
                                    <option value="low">🟢 Low Priority</option>
                                    <option value="medium">🟡 Medium Priority</option>
                                    <option value="high">🔴 High Priority</option>
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                                    <Palette className="w-4 h-4" />
                                    Theme
                                </label>
                                <select
                                    value={settings.theme}
                                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${inputClasses}`}
                                >
                                    <option value="light">☀️ Light</option>
                                    <option value="dark">🌙 Dark</option>
                                    <option value="system">💻 System</option>
                                </select>
                            </div>
                        </div>

                        {/* Toggle Settings */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                {
                                    key: 'autoMarkOverdue',
                                    label: 'Auto-mark Overdue',
                                    description: 'Automatically mark past-due tasks',
                                    icon: AlertCircle
                                },
                                {
                                    key: 'notifications',
                                    label: 'Notifications',
                                    description: 'Show notification messages',
                                    icon: Bell
                                },
                                {
                                    key: 'soundEffects',
                                    label: 'Sound Effects',
                                    description: 'Play sounds for actions',
                                    icon: Volume2
                                },
                                {
                                    key: 'compactView',
                                    label: 'Compact View',
                                    description: 'Use smaller spacing',
                                    icon: Eye
                                },
                                {
                                    key: 'showCompletedTasks',
                                    label: 'Show Completed',
                                    description: 'Display completed todos',
                                    icon: CheckCircle
                                },
                                {
                                    key: 'autoSave',
                                    label: 'Auto-save',
                                    description: 'Save changes automatically',
                                    icon: Save
                                },
                            ].map(({ key, label, description, icon: Icon }) => (
                                <label
                                    key={key}
                                    className={`flex items-start gap-3 p-3 sm:p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                                        settings[key as keyof AppSettings]
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={settings[key as keyof AppSettings] as boolean}
                                        onChange={(e) => handleSettingChange(key as keyof AppSettings, e.target.checked)}
                                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon className="w-4 h-4 flex-shrink-0" />
                                            <span className="text-sm font-semibold">{label}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Data Management Section */}
                <div className={`p-4 sm:p-5 rounded-xl border ${cardClasses}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-lg font-bold">Data Management</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Export Options */}
                        <div>
                            <label className="block text-sm font-semibold mb-3">
                                Export Data
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleExportJSON}
                                    disabled={exporting}
                                    icon={<Download className="w-4 h-4" />}
                                    className="justify-center"
                                >
                                    Export as JSON
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleExportCSV}
                                    disabled={exporting}
                                    icon={<FileDown className="w-4 h-4" />}
                                    className="justify-center"
                                >
                                    Export as CSV
                                </Button>
                            </div>
                        </div>

                        {/* Import Option */}
                        <div>
                            <label className="block text-sm font-semibold mb-3">
                                Import Data
                            </label>
                            <label className="block">
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImportJSON}
                                    disabled={importing}
                                    className="hidden"
                                    id="import-file"
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => document.getElementById('import-file')?.click()}
                                    disabled={importing}
                                    icon={<Upload className="w-4 h-4" />}
                                    className="w-full justify-center"
                                >
                                    {importing ? 'Importing...' : 'Import from JSON'}
                                </Button>
                            </label>
                        </div>

                        {/* Danger Zone */}
                        <div className="pt-4 border-t border-gray-300 dark:border-gray-600">
                            <label className="block text-sm font-semibold mb-3 text-red-600 dark:text-red-400">
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

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 sm:flex-none"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSaveSettings}
                        disabled={!hasChanges}
                        icon={<Save className="w-4 h-4" />}
                        className="flex-1 shadow-lg hover:shadow-xl"
                    >
                        {hasChanges ? 'Save Changes' : 'No Changes'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}