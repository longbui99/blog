import React, { useState, useEffect } from 'react';
import '../styles/NotificationBanner.css';

const NotificationBanner = ({ duration = 3, type = 'info', title, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration * 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  if (!isVisible) {
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
