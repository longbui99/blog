import React from 'react';

function MainContent({ children }) {
  return (
    <main className="main-content">
      <div className="content-wrapper">
        {children}
      </div>
    </main>
  );
}

export default MainContent;
