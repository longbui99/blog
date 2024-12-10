import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSearch, faUser, faClock } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { blogMenuProcessor } from '../processor/blogMenuProcessor';
import '../styles/SearchPopup.css';

function SearchPopup({ isOpen, onClose, searchTerm, onSearchChange }) {
  const [searchResults, setSearchResults] = useState([]);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();

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
    onSearchChange(value); // This will update both popup and sidebar search
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
                  <span className="result-title">{result.title}</span>
                  {result.content_preview && (
                    <p className="result-preview">{result.content_preview}</p>
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