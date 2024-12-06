import React, { useState, useContext } from 'react';
import { FaCopy } from 'react-icons/fa';
import '../styles/CodeBlock.css';
import tokenizePythonCode from '../utils/syntaxHighlighter';

// Import ThemeContext if it exists, otherwise create a dummy context
let ThemeContext;
try {
  ThemeContext = require('../contexts/ThemeContext').ThemeContext;
} catch (error) {
  ThemeContext = React.createContext({ isDarkMode: false });
}

function CodeBlock({ code, language, inline }) {
  const [copied, setCopied] = useState(false);
  const theme = useContext(ThemeContext);
  const isDarkMode = theme ? theme.isDarkMode : false;
  const lines = code.split('\n');
  const isMultiLine = lines.length > 1;

  const renderLineNumbers = (lines) => {
    return (
      <div className="line-numbers">
        {lines.map((_, index) => (
          <span key={index + 1}>{index + 1}</span>
        ))}
      </div>
    );
  };

  const escapeHtml = (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const copyToClipboard = () => {
    alert("Copied")
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getHighlightedCode = () => {
    if (language === 'python') {
      return { __html: tokenizePythonCode(code) };
    }
    return { __html: escapeHtml(code) };
  };

  if (inline || !isMultiLine) {
    return (
      <code className={`inline-code language-${language} ${isDarkMode ? 'dark-mode' : ''}`}>
        {code}
      </code>
    );
  }

  return (
    <div className={`code-block-wrapper ${isDarkMode ? 'dark-mode' : ''} ${language === 'python' ? 'python-code' : ''}`}>
      <button className="copy-button" onClick={copyToClipboard}>
        {copied ? 'Copied!' : <FaCopy />}
      </button>
      <div className="code-container">
        {language === 'python' && renderLineNumbers(lines)}
        <pre className={`language-${language}`}
             dangerouslySetInnerHTML={getHighlightedCode()} />
      </div>
    </div>
  );
}

export default CodeBlock;
