import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationBanner from '../components/wrapper/NotificationBanner';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((notification) => {
        const id = Date.now();
        setNotifications(prev => {
            const newNotifications = [...prev, { ...notification, id }];
            return newNotifications;
        });
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);


    return (
        <NotificationContext.Provider value={{ showNotification, removeNotification }}>
            {notifications.length > 0 && (
                <div className="notifications-container">
                    {notifications.map(notification => (
                        <NotificationBanner
                            key={notification.id}
                            type={notification.type || 'info'}
                            title={notification.title}
                            message={notification.message}
                            duration={notification.duration || 3}
                            onClose={() => removeNotification(notification.id)}
                        />
                    ))}
                </div>
            )}
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
