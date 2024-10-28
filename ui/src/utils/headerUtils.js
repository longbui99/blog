import React from 'react';

export function generateHeaderLinks(children) {
  const headerLinks = [];
  
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (typeof child.type === 'string' && /^h[1-6]$/.test(child.type.toLowerCase())) {
        const text = child.props.children;
        const id = text.toLowerCase().replace(/\s+/g, '-');
        headerLinks.push({
          id,
          text,
          level: parseInt(child.type.charAt(1))
        });
      } else if (child.props && child.props.children) {
        headerLinks.push(...generateHeaderLinks(child.props.children));
      }
    }
  });
  
  return headerLinks;
}
