import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import '../styles/ImageViewer.css';

function ImageViewer({ isOpen, onClose, imageUrl }) {
  const [isClosing, setIsClosing] = useState(false);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className={`image-viewer-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className="image-viewer-container" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={handleClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className="image-viewer-subcontainer">
          <img src={imageUrl} alt="Preview" style={{maxWidth: '100%', height: 'auto'}}/>
        </div>
      </div>
    </div>
  );
}

export default ImageViewer; 