import React, { useState, useEffect, useRef } from 'react';
import SearchPopup from './SearchPopup';

function SidebarSearch({ onSearch, initialSearchTerm = '' }) {
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [showPopup, setShowPopup] = useState(false);
    const sidebarSearchInputRef = useRef(null);

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.shiftKey && event.key === '?') {
                event.preventDefault();
                sidebarSearchInputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, []);

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        onSearch(value);
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
                    placeholder="Search... (Shift+?)"
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
