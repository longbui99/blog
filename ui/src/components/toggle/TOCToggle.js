import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTOC } from '../../redux/slices/tocSlice';
import './styles/ToCToggle.css';

function TOCToggle() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.toc.isOpen);

  return (
    <button 
      className={`toc-toggle ${isOpen ? 'open' : ''}`} 
      onClick={() => dispatch(toggleTOC())} 
      title={isOpen ? "Hide Table of Contents" : "Show Table of Contents"}
    >
      <span className="text">
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
      </span>
    </button>
  );
}

export default TOCToggle;
