import React, { createContext, useContext, useState } from 'react';
import './styles/Confirmation.css';

const ConfirmationContext = createContext();

export function ConfirmationProvider({ children }) {
    const [confirmationState, setConfirmationState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'default' // 'default', 'danger', 'warning'
    });

    const showConfirmation = ({
        title,
        message,
        onConfirm,
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        type = 'default'
    }) => {
        setConfirmationState({
            isOpen: true,
            title,
            message,
            onConfirm,
            confirmText,
            cancelText,
            type
        });
    };

    const hideConfirmation = () => {
        setConfirmationState(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <ConfirmationContext.Provider value={{ showConfirmation, hideConfirmation }}>
            {children}
            {confirmationState.isOpen && (
                <div className="confirmation-overlay">
                    <div className="confirmation-modal">
                        <h3>{confirmationState.title}</h3>
                        <p>{confirmationState.message}</p>
                        <div className="confirmation-actions">
                            <button 
                                onClick={hideConfirmation}
                                className="cancel-button"
                            >
                                {confirmationState.cancelText}
                            </button>
                            <button 
                                onClick={() => {
                                    confirmationState.onConfirm();
                                    hideConfirmation();
                                }}
                                className={`confirm-button ${confirmationState.type}`}
                            >
                                {confirmationState.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmationContext.Provider>
    );
}

export const useConfirmation = () => {
    const context = useContext(ConfirmationContext);
    if (!context) {
        throw new Error('useConfirmation must be used within a ConfirmationProvider');
    }
    return context;
};
