import React, { useState, useContext } from 'react';
import { FaCopy } from 'react-icons/fa';
import '../styles/CodeBlock.css';

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (inline || !isMultiLine) {
    return (
      <code className={`inline-code language-${language} ${isDarkMode ? 'dark-mode' : ''}`}>
        {code}
      </code>
    );
  }

  return (
    <div className={`code-block-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
      <button className="copy-button" onClick={copyToClipboard}>
        {copied ? 'Copied!' : <FaCopy />}
      </button>
      <pre className={`language-${language}`}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default CodeBlock;
