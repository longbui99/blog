import React from 'react';

function MainContent({ children }) {
  return (
    <main className="main-content" id="main-content">
      {children}
    </main>
  );
}

export default MainContent;
