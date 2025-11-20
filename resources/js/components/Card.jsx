/**
 * Card component for consistent card styling
 */
const Card = ({ 
    children, 
    className = '', 
    hover = false,
    padding = 'default',
    onClick 
}) => {
    const paddingClasses = {
        none: '',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
    };

    const hoverClasses = hover 
        ? 'hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer' 
        : '';

    return (
        <div 
            className={`bg-white rounded-lg shadow-md border border-border ${paddingClasses[padding]} ${hoverClasses} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;
