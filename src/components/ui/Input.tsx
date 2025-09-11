import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    variant?: 'default' | 'filled';
    inputSize?: 'sm' | 'md' | 'lg';
}

const inputSizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({
         label,
         error,
         helperText,
         leftIcon,
         rightIcon,
         variant = 'default',
         inputSize = 'md',
         className,
         id,
         ...props
     }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="w-full">
                {/* Label */}
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        {label}
                    </label>
                )}

                {/* Input container */}
                <div className="relative">
                    {/* Left icon */}
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">
                {leftIcon}
              </span>
                        </div>
                    )}

                    {/* Input field */}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            // Base styles
                            'block w-full border rounded-lg transition-colors duration-200',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                            'placeholder:text-gray-400',

                            // Variants
                            variant === 'default' && 'bg-white border-gray-300',
                            variant === 'filled' && 'bg-gray-50 border-gray-200',

                            // Sizes
                            inputSizes[inputSize],

                            // Icon spacing
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',

                            // Error state
                            error && 'border-red-300 focus:ring-red-500',

                            className
                        )}
                        {...props}
                    />

                    {/* Right icon */}
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className={cn(
                  'text-gray-400',
                  error && 'text-red-400'
              )}>
                {rightIcon}
              </span>
                        </div>
                    )}
                </div>

                {/* Helper text or error */}
                {(error || helperText) && (
                    <p className={cn(
                        'mt-1 text-sm',
                        error ? 'text-red-600' : 'text-gray-500'
                    )}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';