import React from 'react';
import { parseContent } from '../utils/contentParser';

function Mission() {
  const content = `
    <h1>Our Mission</h1>
    <p>Learn about our goals and values.</p>
    <!-- Add more content here -->
  `;

  return <div className="content-wrapper">{parseContent(content)}</div>;
}

export default Mission;
