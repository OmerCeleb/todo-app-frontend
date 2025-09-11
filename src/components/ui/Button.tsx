import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children?: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
}

const buttonVariants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm',
    ghost: 'hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-700',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-700',
};

const buttonSizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};

export function Button({
                           children,
                           variant = 'primary',
                           size = 'md',
                           loading = false,
                           icon,
                           iconPosition = 'left',
                           className,
                           disabled,
                           ...props
                       }: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <button
            className={cn(
                // Base styles
                'inline-flex items-center justify-center gap-2 font-medium rounded-lg',
                'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',

                // Variants with dark mode support
                buttonVariants[variant],

                // Sizes
                buttonSizes[size],

                // Focus ring color based on variant with dark mode
                variant === 'primary' && 'focus:ring-blue-500',
                variant === 'secondary' && 'focus:ring-gray-500 dark:focus:ring-gray-400',
                variant === 'danger' && 'focus:ring-red-500',
                (variant === 'ghost' || variant === 'outline') && 'focus:ring-gray-500 dark:focus:ring-purple-500',

                // Dark mode focus ring offset
                'dark:focus:ring-offset-gray-800',

                className
            )}
            disabled={isDisabled}
            {...props}
        >
            {/* Loading spinner */}
            {loading && (
                <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}

            {/* Left icon */}
            {!loading && icon && iconPosition === 'left' && (
                <span className="flex items-center">
          {icon}
        </span>
            )}

            {/* Button text */}
            {children && <span>{children}</span>}

            {/* Right icon */}
            {!loading && icon && iconPosition === 'right' && (
                <span className="flex items-center">
          {icon}
        </span>
            )}
        </button>
    );
}