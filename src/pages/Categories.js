import React from 'react';
import { parseContent } from '../utils/contentParser';

function Categories() {
  const content = `
    <h1>Categories</h1>
    <p>Explore our various content categories.</p>
    <!-- Add more content here -->
  `;

  return <div className="content-wrapper">{parseContent(content)}</div>;
}

export default Categories;
