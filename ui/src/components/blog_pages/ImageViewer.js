import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './styles/ImageViewer.css';

function ImageViewer({ isOpen, onClose, imageUrl }) {
  const [isClosing, setIsClosing] = useState(false);
  const [scale, setScale] = useState(1);
  const imageRef = useRef(null);


  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setScale(1); // Reset zoom when closing
    }, 200);
  }, [onClose]);

  const handleZoom = (e, delta) => {
    e.preventDefault();
    e.stopPropagation();
    
    const container = imageRef.current.parentElement;
    const rect = imageRef.current.getBoundingClientRect();
    
    // Calculate cursor position relative to the image
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate cursor position as percentages
    const xPercent = x / rect.width;
    const yPercent = y / rect.height;
    
    const newScale = Math.min(Math.max(0.5, scale + delta), 3);
    
    // Calculate the scroll position before zoom
    const scrollXBefore = container.scrollLeft;
    const scrollYBefore = container.scrollTop;
    
    setScale(newScale);
    
    // After zoom, adjust scroll position to keep cursor point stable
    requestAnimationFrame(() => {
      const newRect = imageRef.current.getBoundingClientRect();
      const newX = newRect.width * xPercent;
      const newY = newRect.height * yPercent;
      
      container.scrollLeft = scrollXBefore + (newX - x);
      container.scrollTop = scrollYBefore + (newY - y);
    });
  };

  const handleWheel = (e) => {
    
    // Calculate angle of scroll direction
    const angle = Math.abs(Math.atan2(e.deltaY, e.deltaX) * 180 / Math.PI);
    
    // Only zoom if scroll is more vertical (>25 degrees from horizontal)
    if (angle > 60) {
      e.preventDefault();
      e.stopPropagation();
      handleZoom(e, e.deltaY * -0.01);
    }
  };

  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleZoom(e, e.ctrlKey || e.metaKey ? -0.5 : 0.5);
  };
  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div 
      className={`image-viewer-overlay ${isClosing ? 'closing' : ''}`} 
      onClick={handleClose}
    >
      <div 
        className="image-viewer-container" 
        onClick={e => e.stopPropagation()}
      >
        <button className="close-button" onClick={handleClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className="image-viewer-subcontainer">
          <img 
            ref={imageRef}
            src={imageUrl} 
            alt="Preview" 
            onWheel={handleWheel}
            onDoubleClick={handleDoubleClick}
            style={{
              maxWidth: '100%', 
              height: 'auto',
              transform: `scale(${scale})`,
              transition: 'transform 0.1s ease-out'
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ImageViewer; 