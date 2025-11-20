/**
 * Badge component for status indicators, tags, etc.
 */
const Badge = ({ 
    children, 
    variant = 'default',
    size = 'md',
    className = '' 
}) => {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-primary-100 text-primary-800',
        secondary: 'bg-secondary-100 text-secondary-800',
        accent: 'bg-accent-100 text-accent-800',
        success: 'bg-success-100 text-success-800',
        error: 'bg-error-100 text-error-800',
        warning: 'bg-warning-100 text-warning-800',
        info: 'bg-info-100 text-info-800',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
    };

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
