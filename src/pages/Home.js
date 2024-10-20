import React from 'react';
import { parseContent } from '../utils/contentParser';

function Home() {
  const content = `
    <h1>Welcome to Our Website</h1>
    <p>Discover our latest updates and features.</p>
    <!-- Add more content here -->
  `;

  return <div className="content-wrapper">{parseContent(content)}</div>;
}

export default Home;
