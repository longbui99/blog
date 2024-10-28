import React, { useState, useEffect } from 'react';
import '../styles/NotificationBanner.css';

const NotificationBanner = ({ duration = 3, type = 'info', title, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    console.log('NotificationBanner mounted:', { type, title, message }); // Debug log
    
    const timer = setTimeout(() => {
      console.log('NotificationBanner timeout triggered'); // Debug log
      setIsVisible(false);
      onClose();
    }, duration * 1000);

    return () => {
      console.log('NotificationBanner cleanup'); // Debug log
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  if (!isVisible) {
    console.log('NotificationBanner not visible'); // Debug log
    return null;
  }

  return (
    <div className={`notification-banner ${type}`}>
      <div className="notification-content">
        <p className="notification-title">{title}</p>
        <p className="notification-message">{message}</p>
      </div>
      <button 
        className="close-button" 
        onClick={() => {
          console.log('NotificationBanner close clicked'); // Debug log
          setIsVisible(false);
          onClose();
        }}
      >
        ×
      </button>
    </div>
  );
};

export default NotificationBanner;
