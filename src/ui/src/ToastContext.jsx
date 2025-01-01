import { createContext, useContext, useState, useCallback } from 'react';
import './Toast.css';

const ToastContext = createContext(null);

// Unique ID generator for toasts
let toastCount = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = `toast-${toastCount++}`;

        setToasts(currentToasts => [
            ...currentToasts,
            { id, message, type, duration }
        ]);

        // Automatically remove the toast after duration
        setTimeout(() => {
            setToasts(currentToasts =>
                currentToasts.filter(toast => toast.id !== id)
            );
        }, duration);
    }, []);

    return (
        <ToastContext.Provider value={addToast}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`toast-message ${toast.type}`}
                        style={{
                            '--duration': `${toast.duration}ms`,
                            '--remove-delay': `${toast.duration - 300}ms`
                        }}
                    >
                        {toast.type === 'success' && <span className="toast-icon">✓</span>}
                        {toast.type === 'error' && <span className="toast-icon">✕</span>}
                        {toast.type === 'info' && <span className="toast-icon">i</span>}
                        <span className="toast-text">{toast.message}</span>
                        <div className="toast-progress" />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === null) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
