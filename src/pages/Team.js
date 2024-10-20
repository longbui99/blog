import React from 'react';
import { parseContent } from '../utils/contentParser';

function Team() {
  const content = `
    <h1>Our Team</h1>
    <p>Meet the people behind our success.</p>
    <!-- Add more content here -->
  `;

  return <div className="content-wrapper">{parseContent(content)}</div>;
}

export default Team;
