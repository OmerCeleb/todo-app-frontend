// src/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';

interface ShortcutConfig {
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    action: () => void;
    description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignore shortcuts when user is typing in input fields
            const target = event.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.contentEditable === 'true'
            ) {
                // Allow some shortcuts even in input fields (like Escape)
                if (event.key !== 'Escape') {
                    return;
                }
            }

            for (const shortcut of shortcuts) {
                const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
                const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
                const altMatch = shortcut.altKey ? event.altKey : !event.altKey;

                if (
                    event.key.toLowerCase() === shortcut.key.toLowerCase() &&
                    ctrlMatch &&
                    shiftMatch &&
                    altMatch
                ) {
                    event.preventDefault();
                    shortcut.action();
                    break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);

    return shortcuts;
}

// Helper hook for displaying shortcuts in UI
export function useShortcutDisplay(shortcuts: ShortcutConfig[]) {
    const formatShortcut = (shortcut: ShortcutConfig): string => {
        const parts: string[] = [];

        if (shortcut.ctrlKey) {
            parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
        }
        if (shortcut.shiftKey) {
            parts.push('Shift');
        }
        if (shortcut.altKey) {
            parts.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt');
        }

        parts.push(shortcut.key.toUpperCase());

        return parts.join('+');
    };

    return shortcuts.map(shortcut => ({
        ...shortcut,
        displayKey: formatShortcut(shortcut)
    }));
}