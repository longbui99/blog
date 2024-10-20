import React from 'react';
import { parseContent } from '../utils/contentParser';

function RecentPosts() {
  const content = `
    <h1>Recent Posts</h1>
    <p>Stay updated with our latest articles.</p>
    <!-- Add more content here -->
  `;

  return <div className="content-wrapper">{parseContent(content)}</div>;
}

export default RecentPosts;
