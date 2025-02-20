import React from 'react';
import { IoReorderThreeOutline } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { toggleTOC } from '../../redux/slices/tocSlice';

function TOCToggle() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.toc.isOpen);

  return (
    <button 
      className={`toc-toggle ${isOpen ? 'open' : ''}`} 
      onClick={() => dispatch(toggleTOC())} 
      title={isOpen ? "Hide Table of Contents" : "Show Table of Contents"}
    >
      <IoReorderThreeOutline />
    </button>
  );
}

export default TOCToggle;
