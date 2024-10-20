import React, { useState, useEffect } from 'react';

function SidebarSearch({ onSearch, initialSearchTerm }) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  return (
    <div className="sidebar-search">
      <input
        type="text"
        placeholder="Search menu..."
        value={searchTerm}
        onChange={handleSearch}
      />
    </div>
  );
}

export default SidebarSearch;
