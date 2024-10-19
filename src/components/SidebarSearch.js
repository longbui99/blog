import React, { useState } from 'react';

function SidebarSearch() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement your search logic here
    console.log('Searching for:', searchTerm);
  };

  return (
    <div className="sidebar-search">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Type to Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>
    </div>
  );
}

export default SidebarSearch;
