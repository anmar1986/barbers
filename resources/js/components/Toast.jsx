import React from 'react';

/**
 * Toast Notification component
 */
const Toast = ({ 
    message, 
    type = 'info',
    onClose,
    autoClose = true,
    duration = 3000,
}) => {
    React.useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                onClose?.();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, onClose]);

    const types = {
        success: {
            bg: 'bg-success-50',
            border: 'border-success-500',
            text: 'text-success-800',
            icon: (
                <svg className="h-5 w-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        error: {
            bg: 'bg-error-50',
            border: 'border-error-500',
            text: 'text-error-800',
            icon: (
                <svg className="h-5 w-5 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        warning: {
            bg: 'bg-warning-50',
            border: 'border-warning-500',
            text: 'text-warning-800',
            icon: (
                <svg className="h-5 w-5 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
        },
        info: {
            bg: 'bg-info-50',
            border: 'border-info-500',
            text: 'text-info-800',
            icon: (
                <svg className="h-5 w-5 text-info-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    };

    const config = types[type];

    return (
        <div className={`flex items-center p-4 rounded-lg border-l-4 ${config.bg} ${config.border} shadow-lg`}>
            <div className="shrink-0">
                {config.icon}
            </div>
            <div className={`ml-3 flex-1 ${config.text}`}>
                <p className="text-sm font-medium">{message}</p>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className={`ml-4 shrink-0 inline-flex ${config.text} hover:opacity-75`}
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};

/**
 * Toast Container for managing multiple toasts
 */
export const ToastContainer = ({ toasts = [], removeToast }) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};

export default Toast;
