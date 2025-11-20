import { Link } from 'react-router-dom';

/**
 * Button component with multiple variants based on PRD design system
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    to,
    href,
    type = 'button',
    disabled = false,
    loading = false,
    fullWidth = false,
    className = '',
    onClick,
    ...props
}) => {
    // Base styles
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    // Variant styles
    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
        accent: 'bg-accent-600 text-white hover:bg-accent-700 focus:ring-accent-500',
        outline: 'bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
        ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
        danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
        success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
    };

    // Size styles
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
        xl: 'px-8 py-4 text-xl',
    };

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : '';

    // Combined classes
    const buttonClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyles} ${className}`;

    // Loading spinner
    const LoadingSpinner = () => (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    // Render as Link
    if (to) {
        return (
            <Link to={to} className={buttonClasses} {...props}>
                {loading && <LoadingSpinner />}
                {children}
            </Link>
        );
    }

    // Render as anchor
    if (href) {
        return (
            <a href={href} className={buttonClasses} {...props}>
                {loading && <LoadingSpinner />}
                {children}
            </a>
        );
    }

    // Render as button
    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={buttonClasses}
            {...props}
        >
            {loading && <LoadingSpinner />}
            {children}
        </button>
    );
};

export default Button;
