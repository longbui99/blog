import React from 'react';
import { parseContent } from '../utils/contentParser';

function Contact() {
  const content = `
    <h1>Contact Us</h1>
    <p>Get in touch with our team.</p>
    <!-- Add more content here -->
  `;

  return <div className="content-wrapper">{parseContent(content)}</div>;
}

export default Contact;
