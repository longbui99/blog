import React from 'react';
import { parseContent } from '../utils/contentParser';

function PopularPosts() {
  const content = `
    <h1>Popular Posts</h1>
    <p>Check out our most-read articles.</p>
    <!-- Add more content here -->
  `;

  return <div className="content-wrapper">{parseContent(content)}</div>;
}

export default PopularPosts;
