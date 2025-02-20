import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchOpen } from '../../redux/slices/searchSlice';
import './styles/SearchToggle.css';
import { BiSearch } from 'react-icons/bi';

function SearchToggle() {
  const dispatch = useDispatch();
  const isOpen = useSelector(state => state.search.isSearchOpen);

  const handleSearchClick = () => {
    dispatch(setSearchOpen(!isOpen));
  };

  return (
    <button
      className="search-toggle"
      onClick={handleSearchClick}
      title={isOpen ? "Close Search" : "Open Search"}
    >
      <span className="text"><BiSearch size={20} /></span>
    </button>
  );
}

export default SearchToggle;
