import { useId, forwardRef } from 'react';
/**
 * Select/Dropdown component
 */
const Select = forwardRef(({ 
    label,
    error,
    helper,
    options = [],
    placeholder = 'Select an option',
    className = '',
    fullWidth = true,
    size = 'md',
    id: providedId,
    name,
    ...props 
}, ref) => {
    const autoId = useId();
    const selectId = providedId || `select-${name || autoId}`;
    
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-3 text-lg',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    const selectClasses = `
        ${sizes[size]}
        ${widthClass}
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
                <label htmlFor={selectId} className="block text-sm font-medium text-primary mb-1">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                id={selectId}
                name={name}
                className={selectClasses}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option 
                        key={option.value} 
                        value={option.value}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-sm text-error-600">{error}</p>
            )}
            {helper && !error && (
                <p className="mt-1 text-sm text-secondary">{helper}</p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export default Select;
