import React from 'react';
import CodeBlock from '../components/CodeBlock';
import { H1, H2, H3, H4, H5, H6, H7 } from '../components/ContentHeaders';

function htmlToElement(html) {
  if (typeof html !== 'string') {
    console.error('htmlToElement received non-string input:', html);
    return document.createElement('div'); // Return an empty div if input is not a string
  }
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content;
}

function getLanguage(classString) {
  const match = classString && classString.match(/language-(\w+)/);
  return match ? match[1] : 'plaintext';
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

    if (tagName === 'pre' && node.firstChild && node.firstChild.tagName.toLowerCase() === 'code') {
      const code = node.firstChild;
      const language = getLanguage(code.className);
      return <CodeBlock key={Math.random()} code={code.textContent.trim()} language={language} />;
    }

    if (tagName === 'code') {
      const language = getLanguage(node.className);
      return <CodeBlock key={Math.random()} code={node.textContent.trim()} language={language} inline />;
    }

    const HeaderComponents = { h1: H1, h2: H2, h3: H3, h4: H4, h5: H5, h6: H6, h7: H7 };
    if (HeaderComponents[tagName]) {
      const HeaderComponent = HeaderComponents[tagName];
      return <HeaderComponent key={Math.random()} currentRoute={currentRoute}>{node.textContent}</HeaderComponent>;
    }

    const childElements = Array.from(node.childNodes).map(child => processNode(child, currentRoute));

    return React.createElement(
      tagName,
      { key: Math.random() },
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