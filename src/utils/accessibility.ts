// src/utils/accessibility.ts

/**
 * Accessibility utilities for better a11y support
 */

/**
 * Generate unique ID for form elements
 */
export function generateId(prefix: string = 'element'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement is made
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * Focus trap for modals
 */
export class FocusTrap {
    private container: HTMLElement;
    private focusableElements: HTMLElement[];
    private firstFocusable: HTMLElement | null;
    private lastFocusable: HTMLElement | null;
    private previousActiveElement: HTMLElement | null;

    constructor(container: HTMLElement) {
        this.container = container;
        this.focusableElements = [];
        this.firstFocusable = null;
        this.lastFocusable = null;
        this.previousActiveElement = document.activeElement as HTMLElement;
        this.updateFocusableElements();
    }

    private updateFocusableElements() {
        const selector = [
            'a[href]',
            'button:not([disabled])',
            'textarea:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(', ');

        this.focusableElements = Array.from(
            this.container.querySelectorAll<HTMLElement>(selector)
        );

        this.firstFocusable = this.focusableElements[0] || null;
        this.lastFocusable = this.focusableElements[this.focusableElements.length - 1] || null;
    }

    activate() {
        this.updateFocusableElements();
        this.firstFocusable?.focus();
        document.addEventListener('keydown', this.handleKeyDown);
    }

    deactivate() {
        document.removeEventListener('keydown', this.handleKeyDown);
        this.previousActiveElement?.focus();
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === this.firstFocusable) {
                e.preventDefault();
                this.lastFocusable?.focus();
            }
        } else {
            // Tab
            if (document.activeElement === this.lastFocusable) {
                e.preventDefault();
                this.firstFocusable?.focus();
            }
        }
    };
}

/**
 * Keyboard navigation helper
 */
export const KeyboardKeys = {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    TAB: 'Tab',
    HOME: 'Home',
    END: 'End'
} as const;

/**
 * Check if keyboard event is an activation key (Enter or Space)
 */
export function isActivationKey(event: React.KeyboardEvent): boolean {
    return event.key === KeyboardKeys.ENTER || event.key === KeyboardKeys.SPACE;
}

/**
 * Scroll element into view with smooth behavior
 */
export function scrollIntoViewIfNeeded(element: HTMLElement, options?: ScrollIntoViewOptions) {
    const rect = element.getBoundingClientRect();
    const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;

    if (!isInView) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            ...options
        });
    }
}

/**
 * Get accessible label for element
 */
export function getAccessibleLabel(element: HTMLElement): string {
    return (
        element.getAttribute('aria-label') ||
        element.getAttribute('aria-labelledby') ||
        element.getAttribute('title') ||
        element.textContent ||
        ''
    ).trim();
}

/**
 * ARIA attributes builder
 */
export class AriaAttributes {
    private attributes: Record<string, string | boolean> = {};

    label(text: string): this {
        this.attributes['aria-label'] = text;
        return this;
    }

    labelledBy(id: string): this {
        this.attributes['aria-labelledby'] = id;
        return this;
    }

    describedBy(id: string): this {
        this.attributes['aria-describedby'] = id;
        return this;
    }

    expanded(isExpanded: boolean): this {
        this.attributes['aria-expanded'] = isExpanded;
        return this;
    }

    selected(isSelected: boolean): this {
        this.attributes['aria-selected'] = isSelected;
        return this;
    }

    checked(isChecked: boolean): this {
        this.attributes['aria-checked'] = isChecked;
        return this;
    }

    disabled(isDisabled: boolean): this {
        this.attributes['aria-disabled'] = isDisabled;
        return this;
    }

    hidden(isHidden: boolean): this {
        this.attributes['aria-hidden'] = isHidden;
        return this;
    }

    live(value: 'polite' | 'assertive' | 'off'): this {
        this.attributes['aria-live'] = value;
        return this;
    }

    atomic(isAtomic: boolean): this {
        this.attributes['aria-atomic'] = isAtomic;
        return this;
    }

    role(roleName: string): this {
        this.attributes['role'] = roleName;
        return this;
    }

    build(): Record<string, string | boolean> {
        return { ...this.attributes };
    }
}

/**
 * Screen reader only CSS class utility
 */
export const srOnlyClass = 'sr-only';

/**
 * Generate SR-only class styles (add to your global CSS)
 */
export const srOnlyStyles = `
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}

.sr-only-focusable:focus,
.sr-only-focusable:active {
    position: static;
    width: auto;
    height: auto;
    overflow: visible;
    clip: auto;
    white-space: normal;
}
`;

/**
 * Color contrast checker (WCAG AA/AAA)
 */
export function checkColorContrast(
    foreground: string,
    background: string
): { ratio: number; aa: boolean; aaa: boolean } {
    const getLuminance = (hex: string): number => {
        const rgb = parseInt(hex.slice(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;

        const rsRGB = r / 255;
        const gsRGB = g / 255;
        const bsRGB = b / 255;

        const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
        const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
        const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

        return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    const ratio = (lighter + 0.05) / (darker + 0.05);

    return {
        ratio: Math.round(ratio * 100) / 100,
        aa: ratio >= 4.5, // WCAG AA for normal text
        aaa: ratio >= 7 // WCAG AAA for normal text
    };
}

/**
 * Focus management utilities
 */
export const FocusManager = {
    /**
     * Store current focus before navigation
     */
    storeFocus(): HTMLElement | null {
        return document.activeElement as HTMLElement;
    },

    /**
     * Restore previously stored focus
     */
    restoreFocus(element: HTMLElement | null): void {
        if (element && typeof element.focus === 'function') {
            element.focus();
        }
    },

    /**
     * Focus first error in form
     */
    focusFirstError(containerSelector: string = 'form'): boolean {
        const container = document.querySelector(containerSelector);
        if (!container) return false;

        const errorElement = container.querySelector<HTMLElement>(
            '[aria-invalid="true"], .error, [data-error]'
        );

        if (errorElement) {
            errorElement.focus();
            return true;
        }

        return false;
    }
};

export default {
    generateId,
    announceToScreenReader,
    FocusTrap,
    KeyboardKeys,
    isActivationKey,
    scrollIntoViewIfNeeded,
    getAccessibleLabel,
    AriaAttributes,
    srOnlyClass,
    checkColorContrast,
    FocusManager
};