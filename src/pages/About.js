import React from 'react';
import { parseContent } from '../utils/contentParser';

function About() {
  const content = `
    <h1>About Us</h1>
    <p>Learn more about our company and mission.</p>
    <!-- Add more content here -->
  `;

  return <div className="content-wrapper">{parseContent(content)}</div>;
}

export default About;
