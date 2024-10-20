import React from 'react';
import { parseContent } from '../utils/contentParser';

function Posts() {
  const content = `
    <h1>Blog Posts</h1>
    <p>Welcome to our blog! Here you can find all our posts.</p>
    <h2>Featured Posts</h2>
    <ul>
      <li><a href="/popular">Popular Posts</a></li>
      <li><a href="/recent">Recent Posts</a></li>
    </ul>
    <h2>Categories</h2>
    <p>Browse posts by category:</p>
    <ul>
      <li><a href="/categories">All Categories</a></li>
    </ul>
    <!-- Add more content here as needed -->
  `;

  return <div className="content-wrapper">{parseContent(content)}</div>;
}

export default Posts;

