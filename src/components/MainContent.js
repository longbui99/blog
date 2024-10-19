import React from 'react';
import BottomNav from './BottomNav';

function MainContent({ children, className }) {
  return (
    <main className={`main-content ${className}`} id="main-content">
      <div className="content-wrapper">
        {children}
      </div>
    </main>
  );
}

export default MainContent;
