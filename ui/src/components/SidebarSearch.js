import React, { useState, useEffect, useRef } from 'react';
import SearchPopup from './SearchPopup';

function SidebarSearch({ onSearch, initialSearchTerm = '' }) {
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [showPopup, setShowPopup] = useState(false);
    const sidebarSearchInputRef = useRef(null);
    const [placeholder, setPlaceholder] = useState('');

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.shiftKey && event.key === '?' || event.ctrlKey && event.key === '/' || event.metaKey && event.key === '/') {
                event.preventDefault();
                sidebarSearchInputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, []);

    useEffect(() => {
        // Detect OS
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        
        const shortcut = isMac 
            ? 'Search... (⇧/ or ⌘/)'  // Mac symbols
            : 'Search... (Shift+/ or Ctrl+/)'; // Windows/Linux
            
        setPlaceholder(shortcut);
    }, []);

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setShowPopup(value.length > 0);
        if (value.length <= 0) {
            sidebarSearchInputRef.current?.focus();
        }
    };

    return (
        <div className="sidebar-search">
            <div className="search-input-wrapper">
                <input
                    ref={sidebarSearchInputRef}
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="search-input"
                />
            </div>
            <SearchPopup 
                isOpen={showPopup} 
                onClose={() => {
                    setShowPopup(false);
                    handleSearchChange(''); // Clear search when closing popup
                }}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
            />
        </div>
    );
}

export default SidebarSearch;
