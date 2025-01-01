import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUser, faClock } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { blogMenuProcessor } from '../processor/blogMenuProcessor';
import '../styles/SearchPopup.css';

function SearchPopup({ isOpen, onClose, searchTerm, onSearchChange }) {
  const [searchResults, setSearchResults] = useState([]);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();

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

  // Debounce search function
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchTerm.length > 1) {
        try {
          const results = await blogMenuProcessor.searchContent(searchTerm);
          setSearchResults(results);
        } catch (error) {
          console.error('Search failed:', error);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleResultClick = (path) => {
    navigate(path);
    handleClose();
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    onSearchChange(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const highlightKeywords = (text, searchQuery) => {
    if (!text || !searchQuery) return text;
    
    // Escape special characters in the search query
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Split into words and create regex pattern
    const keywords = escapedQuery.split(/\s+/).filter(word => word.length > 0);
    const pattern = new RegExp(`(${keywords.join('|')})`, 'gi');
    
    // Split the text into parts that match/don't match the keywords
    const parts = text.split(pattern);
    
    return parts.map((part, i) => {
      // Check if this part matches any of the keywords
      if (keywords.some(keyword => part.toLowerCase() === keyword.toLowerCase())) {
        return <span key={i} className="highlight">{part}</span>;
      }
      return part;
    });
  };

  if (!isOpen) return null;

  return (
    <div className={`search-popup-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className="search-popup-container" onClick={e => e.stopPropagation()}>
        <div className="search-popup-header">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
              autoFocus
            />
          </div>
          <button className="close-button" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="search-results">
          {searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <div
                key={index}
                className="search-result-item"
                onClick={() => handleResultClick(result.path)}
              >
                <div className="result-main">
                  <span className="result-title">
                    {highlightKeywords(result.title, searchTerm)}
                  </span>
                  {result.content_preview && (
                    <p className="result-preview">
                      {highlightKeywords(result.content_preview, searchTerm)}
                    </p>
                  )}
                </div>
                <div className="result-meta">
                  {result.author && (
                    <span className="result-author">
                      <FontAwesomeIcon icon={faUser} />
                      {result.author}
                    </span>
                  )}
                  {result.updated_at && (
                    <span className="result-date">
                      <FontAwesomeIcon icon={faClock} />
                      {formatDate(result.updated_at)}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              {searchTerm.length > 1 ? 'No results found' : 'Type to search...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPopup; 