import React from 'react';
import CodeBlock from '../components/CodeBlock';

// Function to convert HTML string to DOM elements
function htmlToElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content;
}

// Function to get language from class attribute
function getLanguage(classString) {
  const match = classString.match(/language-(\w+)/);
  return match ? match[1] : 'plaintext';
}

// Recursive function to process nodes and replace code blocks
function processNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    if (node.tagName.toLowerCase() === 'pre' && node.firstChild && node.firstChild.tagName.toLowerCase() === 'code') {
      const code = node.firstChild;
      const language = getLanguage(code.className);
      return <CodeBlock key={Math.random()} code={code.textContent.trim()} language={language} />;
    }

    if (node.tagName.toLowerCase() === 'code') {
      const language = getLanguage(node.className);
      return <CodeBlock key={Math.random()} code={node.textContent.trim()} language={language} inline />;
    }

    const childElements = Array.from(node.childNodes).map(processNode);

    return React.createElement(
      node.tagName.toLowerCase(),
      { key: Math.random() },
      ...childElements
    );
  }

  return null;
}

export function parseCodeBlocks(htmlContent) {
  const domElement = htmlToElement(htmlContent);
  return Array.from(domElement.childNodes).map(processNode);
}
