import React from 'react';
import CodeBlock from '../components/blog_pages/CodeBlock';
import { H1, H2, H3, H4, H5, H6, H7 } from '../components/blog_pages/ContentHeaders';
import Category from '../components/blog_pages/components/category/Category';
import PageTree from '../components/blog_pages/components/pagetree/PageTree';

function htmlToElement(html) {
  if (typeof html !== 'string') {
    console.error('htmlToElement received non-string input:', html);
    return document.createElement('div'); // Return an empty div if input is not a string
  }
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content;
}

function getLanguage(codeContent) {
  // Common Python syntax patterns
  const pythonPatterns = [
    /\bdef\s+\w+\s*\(/,      // function definitions
    /\bclass\s+\w+[:(]/,     // class definitions
    /\bimport\s+\w+/,        // import statements
    /\bfrom\s+\w+\s+import/, // from imports
    /__\w+__/,               // dunder methods
    /\bself\b/,              // self parameter
    /\bpass\b/,              // pass statement
    /\bprint\b/,              // pass statement
  ];

  // Common YAML syntax patterns
  const yamlPatterns = [
    /^---(?:\s|$)/m,         // Document start marker
    /^\s*[\w-]+:\s*(?:\S|$)/m, // Key-value pairs
    /^\s*-\s+\w+/m,         // List items
    /^\s*-?\s*[\w-]+:\s*>[^\S\r\n]*$/m, // Multiline string indicators
    /^\s*-?\s*[\w-]+:\s*\|[^\S\r\n]*$/m, // Literal block indicators
    /^\s*&\w+\s/m,          // Anchors
    /^\s*\*\w+\s/m,         // Aliases
    /^[^\s#].*:(?:\s+\S.*|\s*)$/m, // Key with optional value
  ];

  const isPython = pythonPatterns.some(pattern => pattern.test(codeContent));
  // If neither match, return plaintext
  if (isPython) return 'python';
  // Check for YAML patterns
  const isYaml = yamlPatterns.some(pattern => pattern.test(codeContent));
  if (isYaml) return 'yaml';
  // Check for Python patterns
  return 'plaintext';
}

export function styleMap(style){

  return style.split(';').reduce((styleObj, style) => {
    const [property, value] = style.split(':').map(s => s.trim());
    if (property && value) {
      styleObj[property.replace(/-([a-z])/g, g => g[1].toUpperCase())] = value; // Convert to camelCase
    }
    return styleObj;
  }, {});
}

function processNode(node, currentRoute) {
  if (!node) return null;

  if (typeof node === 'string') {
    return node;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const tagName = node.tagName.toLowerCase();
    const classList = node.classList ? Array.from(node.classList) : [];
    
    // Check both tag name AND class for more reliable identification
    if (tagName === 'category' || classList.includes('category-widget')) {
      return <Category key={Math.random()} />;
    }

    if (tagName === 'pagetree' || classList.includes('pagetree-widget')) {
      return <PageTree key={Math.random()} />;
    }

    if (tagName === 'pre' && node.firstChild && node.firstChild.tagName?.toLowerCase() === 'code') {
      const code = node.firstChild;
      const language = getLanguage(code.textContent);
      return <CodeBlock key={Math.random()} code={code.textContent} language={language} />;
    }
    if (tagName === 'pre') {
      // Create new code element
      const codeElement = document.createElement('code');
      // Copy content from pre to code element
      codeElement.textContent = node.textContent;
      // Copy any class names that might contain language info
      codeElement.className = node.className;
      
      const language = getLanguage(codeElement.textContent);
      return <CodeBlock 
        key={Math.random()} 
        code={codeElement.textContent} 
        language={language} 
      />;
    }

    if (tagName === 'code') {
      const language = getLanguage(node.textContent);
      return <CodeBlock key={Math.random()} code={node.textContent} language={language} inline />;
    }

    if (tagName === 'img') {
      const src = node.getAttribute('src');
      const alt = node.getAttribute('alt') || '';
      const style = styleMap(node.getAttribute('style') || '');
      return <img 
        key={Math.random()} 
        src={src} 
        alt={alt} 
        style={{
          ...style,
          maxWidth: '100%',
          height: 'auto'
        }}
      />;
    }

    if (tagName === 'a') {
      const href = node.getAttribute('href');
      const text = node.textContent;
      const style = styleMap(node.getAttribute('style') || '')
      return <a key={Math.random()} href={href} target='_blank' rel="noreferrer"  style={style}>{text}</a>;
    }

    const HeaderComponents = { h1: H1, h2: H2, h3: H3, h4: H4, h5: H5, h6: H6, h7: H7 };
    if (HeaderComponents[tagName]) {
      const HeaderComponent = HeaderComponents[tagName];
      return <HeaderComponent key={Math.random()} currentRoute={currentRoute}>{node.textContent}</HeaderComponent>;
    }

    const childElements = Array.from(node.childNodes).map(child => processNode(child, currentRoute));

    const attributes = {};
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      attributes[attr.name] = attr.value;
    }

    if (attributes.style ) {
      attributes.style = styleMap(attributes.style)
    } else if (attributes.style === ''){
      attributes.style = undefined
    }

    return React.createElement(
      tagName,
      { key: Math.random(), ...attributes },
      ...childElements
    );
  }

  return null;
}

export function parseContent(htmlContent, currentRoute) {
  if (typeof htmlContent !== 'string') {
    console.error('parseContent received non-string input:', htmlContent);
    return null;
  }

  const domElement = htmlToElement(htmlContent);
  return Array.from(domElement.childNodes).map(node => processNode(node, currentRoute));
}