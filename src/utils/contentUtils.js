import React from 'react';

export function generateTOC(contentRef) {
  if (!contentRef.current) return [];

  const headers = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6, h7');
  const items = Array.from(headers).map(header => ({
    id: header.id || header.innerText.toLowerCase().replace(/\s+/g, '-'),
    text: header.innerText,
    level: parseInt(header.tagName.charAt(1))
  }));

  // Add ids to headers if they don't have one
  headers.forEach(header => {
    if (!header.id) {
      header.id = header.innerText.toLowerCase().replace(/\s+/g, '-');
    }
  });

  return items;
}

export function renderChildren(children) {
  if (React.isValidElement(children)) {
    return children;
  } else if (Array.isArray(children)) {
    return children.map((child, index) => 
      React.isValidElement(child) ? React.cloneElement(child, { key: index }) : null
    );
  } else {
    console.warn('Invalid children passed to MainContent');
    return null;
  }
}
