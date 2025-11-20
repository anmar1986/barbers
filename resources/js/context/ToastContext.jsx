import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '../components/Toast';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showSuccess = useCallback((message) => addToast(message, 'success'), [addToast]);
    const showError = useCallback((message) => addToast(message, 'error'), [addToast]);
    const showWarning = useCallback((message) => addToast(message, 'warning'), [addToast]);
    const showInfo = useCallback((message) => addToast(message, 'info'), [addToast]);

    const value = {
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        // Aliases for backward compatibility
        success: showSuccess,
        error: showError,
        warning: showWarning,
        info: showInfo,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};
