import React from 'react';

/**
 * Container component for consistent max-width and padding across pages
 * Based on the PRD design system
 */
const Container = ({ children, className = '', size = 'default', noPadding = false }) => {
    const sizeClasses = {
        sm: 'max-w-4xl',
        default: 'max-w-7xl',
        lg: 'max-w-[1440px]',
        xl: 'max-w-[1600px]',
        full: 'max-w-full',
    };

    const paddingClasses = noPadding ? '' : 'px-3 sm:px-4 md:px-6 lg:px-8';

    return (
        <div className={`${sizeClasses[size]} mx-auto ${paddingClasses} ${className}`}>
            {children}
        </div>
    );
};

export default Container;
