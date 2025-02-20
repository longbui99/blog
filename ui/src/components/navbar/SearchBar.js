import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faAtom } from '@fortawesome/free-solid-svg-icons';
import SearchPopup from './SearchPopup';
import ChatPopup from './ChatPopup';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchOpen, setChatOpen, setSearchTerm } from '../../redux/slices/searchSlice';

function SearchBar() {
    const dispatch = useDispatch();
    const { isSearchOpen, isChatOpen, searchTerm } = useSelector(state => state.search);

    useEffect(() => {
        const handleKeyPress = (event) => {
            if ((event.ctrlKey && event.key === '/') || (event.metaKey && event.key === '/')) {
                event.preventDefault();
                dispatch(setSearchOpen(true));
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [dispatch]);

    const handleSearchClick = () => {
        dispatch(setSearchOpen(true));
    };

    const handleChatClick = () => {
        dispatch(setChatOpen(true));
    };

    return (
        <div className="search-bar">
            <button 
                className="search-button" 
                onClick={handleSearchClick}
                title="Search (Ctrl+/)"
            >
                <FontAwesomeIcon icon={faSearch} />
            </button>
            <button 
                className="chat-button" 
                onClick={handleChatClick}
                title="Open Chat"
            >
                <FontAwesomeIcon icon={faAtom} />
            </button>
            <SearchPopup 
                isOpen={isSearchOpen} 
                onClose={() => {
                    dispatch(setSearchOpen(false));
                    dispatch(setSearchTerm(''));
                }}
                searchTerm={searchTerm}
                onSearchChange={(value) => dispatch(setSearchTerm(value))}
            />
            <ChatPopup 
                isOpen={isChatOpen} 
                onClose={() => dispatch(setChatOpen(false))} 
            />
        </div>
    );
}

export default SearchBar;
