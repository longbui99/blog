import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Load the script
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-9D92KEY0LM';
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-9D92KEY0LM');

    // Clean up
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-9D92KEY0LM', { page_path: location.pathname });
    }
  }, [location]);

  return null;
};

export default GoogleAnalytics;
