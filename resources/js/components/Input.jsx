import React, { forwardRef, useId } from 'react';

/**
 * Input component with consistent styling
 */
const Input = forwardRef(({ 
    label,
    error,
    helper,
    type = 'text',
    className = '',
    fullWidth = true,
    size = 'md',
    leftIcon,
    rightIcon,
    id: providedId,
    name,
    ...props 
}, ref) => {
    const autoId = useId();
    const inputId = providedId || `input-${name || autoId}`;
    
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-3 text-lg',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    const inputClasses = `
        ${sizes[size]}
        ${widthClass}
        ${leftIcon ? 'pl-10' : ''}
        ${rightIcon ? 'pr-10' : ''}
        ${error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : 'border-border focus:ring-primary-500 focus:border-primary-500'}
        block rounded-lg border bg-white shadow-sm
        focus:outline-none focus:ring-2
        disabled:bg-gray-100 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
    `;

    return (
        <div className={fullWidth ? 'w-full' : ''}>
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-primary mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {leftIcon}
                    </div>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    name={name}
                    type={type}
                    className={inputClasses}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {rightIcon}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-error-600">{error}</p>
            )}
            {helper && !error && (
                <p className="mt-1 text-sm text-secondary">{helper}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
