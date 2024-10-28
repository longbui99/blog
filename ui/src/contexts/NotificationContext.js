import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationBanner from '../components/NotificationBanner';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((notification) => {
        console.log('Showing notification:', notification); // Debug log
        const id = Date.now();
        setNotifications(prev => {
            const newNotifications = [...prev, { ...notification, id }];
            console.log('Updated notifications:', newNotifications); // Debug log
            return newNotifications;
        });
    }, []);

    const removeNotification = useCallback((id) => {
        console.log('Removing notification:', id); // Debug log
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    console.log('Current notifications:', notifications); // Debug log

    return (
        <NotificationContext.Provider value={{ showNotification, removeNotification }}>
            {notifications.length > 0 && (
                <div className="notifications-container">
                    {notifications.map(notification => (
                        console.log('Rendering notification:', notification),
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
